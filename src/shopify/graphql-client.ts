import { readShopifyConfig, type ShopifyConfig } from './config';
import { ShopifyApiError, type ShopifyGraphQLError } from './errors';

interface GraphQLResponse<TData> {
  data?: TData | null;
  errors?: ShopifyGraphQLError[];
}

interface GraphQLRequestOptions {
  signal?: AbortSignal;
  cacheTtlMs?: number;
  timeoutMs?: number;
  maxRetries?: number;
}

const DEFAULT_CACHE_TTL_MS = 30_000;
const DEFAULT_REQUEST_TIMEOUT_MS = 12_000;
const DEFAULT_QUERY_RETRIES = 2;
const BASE_RETRY_DELAY_MS = 250;

interface PendingRequest {
  key: string | null;
  controller: AbortController;
  promise: Promise<unknown>;
  subscribers: number;
  settled: boolean;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const parseGraphQLErrors = (value: unknown): ShopifyGraphQLError[] | null => {
  if (!Array.isArray(value)) return null;

  const errors: ShopifyGraphQLError[] = [];
  for (const entry of value) {
    if (!isRecord(entry) || typeof entry.message !== 'string') return null;
    const path = Array.isArray(entry.path)
      ? entry.path.filter(
          (part): part is string | number =>
            typeof part === 'string' || typeof part === 'number'
        )
      : undefined;
    const extensions = isRecord(entry.extensions) ? entry.extensions : undefined;
    errors.push({ message: entry.message, path, extensions });
  }
  return errors;
};

const parseGraphQLResponse = <TData>(value: unknown): GraphQLResponse<TData> => {
  if (!isRecord(value)) {
    throw new ShopifyApiError('invalid-response', 'Shopify returned an invalid response.');
  }

  const errors = value.errors === undefined ? undefined : parseGraphQLErrors(value.errors);
  if (value.errors !== undefined && errors === null) {
    throw new ShopifyApiError('invalid-response', 'Shopify returned malformed GraphQL errors.');
  }

  if (value.data !== undefined && value.data !== null && !isRecord(value.data)) {
    throw new ShopifyApiError('invalid-response', 'Shopify returned malformed GraphQL data.');
  }

  return {
    data: value.data as TData | null | undefined,
    errors: errors || undefined,
  };
};

export class ShopifyGraphQLClient {
  private readonly cache = new Map<string, { expiresAt: number; data: unknown }>();
  private readonly inFlight = new Map<string, PendingRequest>();

  constructor(
    private readonly config: ShopifyConfig,
    private readonly fetcher: typeof fetch = (input, init) => globalThis.fetch(input, init)
  ) {}

  async query<TData, TVariables extends object>(
    operationName: string,
    document: string,
    variables: TVariables,
    options: GraphQLRequestOptions = {}
  ): Promise<TData> {
    const cacheTtlMs = options.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS;
    const cacheKey = JSON.stringify([
      this.config.storeDomain,
      this.config.apiVersion,
      operationName,
      document,
      variables,
    ]);
    if (cacheTtlMs > 0) {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.data as TData;
      }
      if (cached) this.cache.delete(cacheKey);
    }

    const shouldDeduplicate = cacheTtlMs > 0;
    let pending = shouldDeduplicate ? this.inFlight.get(cacheKey) : undefined;
    if (!pending) {
      const controller = new AbortController();
      pending = {
        key: shouldDeduplicate ? cacheKey : null,
        controller,
        promise: Promise.resolve(),
        subscribers: 0,
        settled: false,
      };
      const request = this.executeRequest<TData, TVariables>(
        operationName,
        document,
        variables,
        controller.signal,
        options
      );
      pending.promise = request.then((data) => {
        if (cacheTtlMs > 0) {
          this.cache.set(cacheKey, { data, expiresAt: Date.now() + cacheTtlMs });
        }
        return data;
      }).finally(() => {
        if (pending) pending.settled = true;
        if (shouldDeduplicate && this.inFlight.get(cacheKey) === pending) {
          this.inFlight.delete(cacheKey);
        }
      });
      if (shouldDeduplicate) this.inFlight.set(cacheKey, pending);
    }

    return this.subscribeToRequest<TData>(pending, options.signal);
  }

  private async subscribeToRequest<TData>(
    pending: PendingRequest,
    signal?: AbortSignal
  ): Promise<TData> {
    if (signal?.aborted) {
      throw new DOMException('The operation was aborted.', 'AbortError');
    }

    pending.subscribers += 1;
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      pending.subscribers -= 1;
      if (pending.subscribers === 0 && !pending.settled) {
        pending.controller.abort();
        if (pending.key && this.inFlight.get(pending.key) === pending) {
          this.inFlight.delete(pending.key);
        }
      }
    };

    if (!signal) {
      try {
        return (await pending.promise) as TData;
      } finally {
        release();
      }
    }

    return new Promise<TData>((resolve, reject) => {
      const onAbort = () => {
        signal.removeEventListener('abort', onAbort);
        release();
        reject(new DOMException('The operation was aborted.', 'AbortError'));
      };
      signal.addEventListener('abort', onAbort, { once: true });

      pending.promise.then(
        (data) => {
          signal.removeEventListener('abort', onAbort);
          release();
          resolve(data as TData);
        },
        (error: unknown) => {
          signal.removeEventListener('abort', onAbort);
          release();
          reject(error);
        }
      );
    });
  }

  private async executeRequest<TData, TVariables extends object>(
    operationName: string,
    document: string,
    variables: TVariables,
    signal: AbortSignal,
    options: GraphQLRequestOptions
  ): Promise<TData> {
    const endpoint = `https://${this.config.storeDomain}/api/${this.config.apiVersion}/graphql.json`;
    const retryableQuery = /^\s*query\b/i.test(document);
    const configuredRetries = options.maxRetries ?? DEFAULT_QUERY_RETRIES;
    const maxRetries = retryableQuery
      ? Number.isFinite(configuredRetries)
        ? Math.max(0, Math.min(configuredRetries, 3))
        : DEFAULT_QUERY_RETRIES
      : 0;

    for (let attempt = 0; ; attempt += 1) {
      try {
        return await this.executeAttempt<TData, TVariables>(
          endpoint,
          operationName,
          document,
          variables,
          signal,
          options.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS
        );
      } catch (error) {
        if (signal.aborted) throw new DOMException('The operation was aborted.', 'AbortError');
        if (!retryableQuery || attempt >= maxRetries || !this.isTransientFailure(error)) {
          throw error;
        }
        await this.waitForRetry(BASE_RETRY_DELAY_MS * 2 ** attempt, signal);
      }
    }
  }

  private async executeAttempt<TData, TVariables extends object>(
    endpoint: string,
    operationName: string,
    document: string,
    variables: TVariables,
    signal: AbortSignal,
    timeoutMs: number
  ): Promise<TData> {
    const attemptController = new AbortController();
    const forwardAbort = () => attemptController.abort();
    signal.addEventListener('abort', forwardAbort, { once: true });
    if (signal.aborted) attemptController.abort();

    let timedOut = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        timedOut = true;
        attemptController.abort();
        reject(new ShopifyApiError('timeout', 'Shopify Storefront API request timed out.'));
      }, timeoutMs);
    });

    const request = async (): Promise<TData> => {
      let response: Response;
      try {
        response = await this.fetcher(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': this.config.storefrontAccessToken,
          },
          body: JSON.stringify({ operationName, query: document, variables }),
          signal: attemptController.signal,
        });
      } catch (error) {
        if (signal.aborted) throw new DOMException('The operation was aborted.', 'AbortError');
        if (error instanceof ShopifyApiError) throw error;
        throw new ShopifyApiError('network', 'Unable to reach the Shopify Storefront API.');
      }

      if (!response.ok) {
        throw new ShopifyApiError(
          'http',
          `Shopify Storefront API request failed with HTTP ${response.status}.`,
          { status: response.status }
        );
      }

      let body: unknown;
      try {
        body = await response.json();
      } catch {
        throw new ShopifyApiError(
          'invalid-response',
          'Shopify returned a response that was not valid JSON.',
          { status: response.status }
        );
      }

      const result = parseGraphQLResponse<TData>(body);
      if (result.errors?.length) {
        throw new ShopifyApiError(
          'graphql',
          'Shopify could not complete the Storefront API request.',
          { graphQLErrors: result.errors }
        );
      }
      if (!result.data) {
        throw new ShopifyApiError(
          'invalid-response',
          'Shopify response did not contain GraphQL data.'
        );
      }
      return result.data;
    };

    try {
      return await Promise.race([request(), timeout]);
    } catch (error) {
      if (signal.aborted) throw new DOMException('The operation was aborted.', 'AbortError');
      if (timedOut) {
        throw new ShopifyApiError('timeout', 'Shopify Storefront API request timed out.');
      }
      throw error;
    } finally {
      if (timeoutId !== null) clearTimeout(timeoutId);
      signal.removeEventListener('abort', forwardAbort);
    }
  }

  private isTransientFailure(error: unknown): boolean {
    if (!(error instanceof ShopifyApiError)) return false;
    if (error.kind === 'network' || error.kind === 'timeout') return true;
    if (
      error.kind === 'graphql' &&
      error.graphQLErrors?.some((entry) =>
        ['THROTTLED', 'INTERNAL_SERVER_ERROR', 'SERVICE_UNAVAILABLE'].includes(
          typeof entry.extensions?.code === 'string' ? entry.extensions.code : ''
        )
      )
    ) {
      return true;
    }
    return error.kind === 'http' &&
      [408, 429, 500, 502, 503, 504].includes(error.status || 0);
  }

  private waitForRetry(delayMs: number, signal: AbortSignal): Promise<void> {
    if (signal.aborted) {
      return Promise.reject(new DOMException('The operation was aborted.', 'AbortError'));
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        signal.removeEventListener('abort', onAbort);
        resolve();
      }, delayMs);
      const onAbort = () => {
        clearTimeout(timeoutId);
        signal.removeEventListener('abort', onAbort);
        reject(new DOMException('The operation was aborted.', 'AbortError'));
      };
      signal.addEventListener('abort', onAbort, { once: true });
    });
  }
}

let client: ShopifyGraphQLClient | null = null;
let clientConfig: ShopifyConfig | null = null;

export const getShopifyClient = (): ShopifyGraphQLClient => {
  const { config, missing, error } = readShopifyConfig();
  if (error) {
    throw new ShopifyApiError('configuration', error);
  }
  if (!config) {
    throw new ShopifyApiError(
      'configuration',
      `Shopify Storefront API is not configured. Set: ${missing.join(', ')}.`
    );
  }

  if (
    !client ||
    !clientConfig ||
    clientConfig.storeDomain !== config.storeDomain ||
    clientConfig.storefrontAccessToken !== config.storefrontAccessToken ||
    clientConfig.apiVersion !== config.apiVersion
  ) {
    clientConfig = config;
    client = new ShopifyGraphQLClient(config);
  }
  return client;
};
