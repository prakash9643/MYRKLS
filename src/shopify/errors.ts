export interface ShopifyGraphQLError {
  message: string;
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
}

export type ShopifyApiErrorKind =
  | 'configuration'
  | 'http'
  | 'graphql'
  | 'invalid-response'
  | 'network'
  | 'timeout';

export class ShopifyCartError extends Error {
  readonly code: string | null;

  constructor(message: string, options: { code?: string | null } = {}) {
    super(message);
    this.name = 'ShopifyCartError';
    this.code = options.code || null;
  }
}

export class ShopifyApiError extends Error {
  readonly kind: ShopifyApiErrorKind;
  readonly status?: number;
  readonly graphQLErrors?: ShopifyGraphQLError[];

  constructor(
    kind: ShopifyApiErrorKind,
    message: string,
    options: { status?: number; graphQLErrors?: ShopifyGraphQLError[] } = {}
  ) {
    super(message);
    this.name = 'ShopifyApiError';
    this.kind = kind;
    this.status = options.status;
    this.graphQLErrors = options.graphQLErrors;
  }
}
