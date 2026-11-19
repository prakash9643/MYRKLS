import { useCallback, useEffect, useRef, useState } from 'react';
import { readShopifyConfig } from './config';
import { ShopifyApiError } from './errors';

export type ShopifyQueryState<T> =
  | { status: 'unconfigured'; data: null; message: string }
  | { status: 'idle'; data: null; message: null }
  | { status: 'loading'; data: T | null; message: null }
  | { status: 'success'; data: T; message: null }
  | { status: 'error'; data: null; message: string };

export interface ShopifyQueryResult<T> {
  state: ShopifyQueryState<T>;
  retry: () => void;
}

const getConfigurationState = (): ShopifyQueryState<never> | null => {
  const { config, missing, error } = readShopifyConfig();
  if (error) return { status: 'error', data: null, message: error };
  if (!config) {
    return {
      status: 'unconfigured',
      data: null,
      message: `Shopify Storefront API is not configured. Set ${missing.join(', ')}.`,
    };
  }
  return null;
};

export const useShopifyQuery = <T>(
  key: string,
  load: (signal: AbortSignal) => Promise<T>,
  enabled = true
): ShopifyQueryResult<T> => {
  const configurationState = getConfigurationState();
  const [retryIndex, setRetryIndex] = useState(0);
  const [state, setState] = useState<ShopifyQueryState<T>>(
    configurationState || { status: 'idle', data: null, message: null }
  );
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    const currentConfig = getConfigurationState();
    if (currentConfig) {
      setState(currentConfig);
      return;
    }
    if (!enabled) {
      setState({ status: 'idle', data: null, message: null });
      return;
    }

    const controller = new AbortController();
    let active = true;
    setState({ status: 'loading', data: null, message: null });
    loadRef.current(controller.signal)
      .then((data) => {
        if (active) setState({ status: 'success', data, message: null });
      })
      .catch((error: unknown) => {
        if (!active || (error instanceof Error && error.name === 'AbortError')) return;
        const message =
          error instanceof ShopifyApiError || error instanceof Error
            ? error.message
            : 'Shopify data could not be loaded.';
        setState({ status: 'error', data: null, message });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [enabled, key, retryIndex]);

  const retry = useCallback(() => setRetryIndex((index) => index + 1), []);
  return { state, retry };
};

export const isShopifyConfigured = (): boolean =>
  getConfigurationState() === null;
