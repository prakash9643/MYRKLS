import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  clearCustomerAccountSessionMarker,
  completeCustomerAccountCallback,
  CustomerAccountAuthError,
  getCustomerAccountConfig,
  hasPendingCustomerAccountCallback,
  hasCustomerAccountSessionMarker,
  startCustomerAccountLogin,
  startCustomerAccountLogout,
} from '../shopify/customer-account/auth';
import {
  createCustomerAddress,
  CustomerAccountApiError,
  deleteCustomerAddress,
  getCustomerOrder,
  getCustomerOrders,
  getCustomerProfile,
  updateCustomerName,
  updateCustomerAddress,
} from '../shopify/customer-account/service';
import type {
  AddressInput,
  CustomerAccountConfig,
  CustomerAddress,
  CustomerOrder,
  CustomerProfile,
  OrderPage,
} from '../shopify/customer-account/types';
import { trackAccountEvent } from '../analytics/analytics';

const EXPLICIT_LOGIN_PENDING_KEY = 'myrkls_explicit_login_pending';

const completeExplicitLoginTracking = (): void => {
  try {
    if (window.sessionStorage.getItem(EXPLICIT_LOGIN_PENDING_KEY) !== 'true') return;
    window.sessionStorage.removeItem(EXPLICIT_LOGIN_PENDING_KEY);
    trackAccountEvent('login');
  } catch {
    return;
  }
};

type AccountStatus = 'loading' | 'unconfigured' | 'signed-out' | 'authenticated' | 'error';

interface ShopifyCustomerAccountContextValue {
  status: AccountStatus;
  config: CustomerAccountConfig | null;
  profile: CustomerProfile | null;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfileName: (firstName: string, lastName: string) => Promise<void>;
  loadOrders: (cursor?: string | null) => Promise<OrderPage>;
  loadOrder: (id: string) => Promise<CustomerOrder | null>;
  createAddress: (input: AddressInput, isDefault: boolean) => Promise<void>;
  updateAddress: (id: string, input: AddressInput, isDefault: boolean) => Promise<void>;
  removeAddress: (address: CustomerAddress) => Promise<void>;
  makeAddressDefault: (address: CustomerAddress) => Promise<void>;
}

const ShopifyCustomerAccountContext = createContext<ShopifyCustomerAccountContextValue | null>(null);

export const ShopifyCustomerAccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<CustomerAccountConfig | null>(null);
  const [status, setStatus] = useState<AccountStatus>('loading');
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const tokenExpiry = useRef(0);
  const idTokenHint = useRef<string | undefined>();
  const initialized = useRef(false);

  const loadProfileWithToken = useCallback(async (activeConfig: CustomerAccountConfig, token: string) => {
    const customer = await getCustomerProfile(activeConfig, token);
    setProfile(customer);
    setStatus('authenticated');
    setError(null);
    completeExplicitLoginTracking();
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let activeConfig: CustomerAccountConfig | null;
    try {
      activeConfig = getCustomerAccountConfig();
      setConfig(activeConfig);
    } catch (configError) {
      setError(configError instanceof Error ? configError.message : 'Customer Account configuration is invalid.');
      setStatus('error');
      return;
    }

    if (!activeConfig) {
      setStatus('unconfigured');
      return;
    }

    const restoreOrCompleteSignIn = async (): Promise<void> => {
      try {
        if (hasPendingCustomerAccountCallback()) {
          const token = await completeCustomerAccountCallback(activeConfig);
          tokenExpiry.current = token.expiresAt;
          idTokenHint.current = token.idTokenHint;
          setAccessToken(token.accessToken);
          await loadProfileWithToken(activeConfig, token.accessToken);
          if (!window.location.hash.toLowerCase().includes('account')) {
            window.location.hash = '#account';
          }
        } else if (hasCustomerAccountSessionMarker()) {
          await startCustomerAccountLogin(activeConfig, true);
        } else {
          setStatus('signed-out');
        }
      } catch (authError) {
        clearCustomerAccountSessionMarker();
        tokenExpiry.current = 0;
        idTokenHint.current = undefined;
        setAccessToken(null);
        setProfile(null);
        setStatus('signed-out');
        setError(
          authError instanceof CustomerAccountAuthError || authError instanceof CustomerAccountApiError
            ? authError.message
            : 'Could not restore your Shopify account session. Please sign in again.'
        );
        if (!window.location.hash.toLowerCase().includes('account')) {
          window.location.hash = '#account';
        }
      }
    };

    void restoreOrCompleteSignIn();
  }, [loadProfileWithToken]);

  const requireAccessToken = useCallback((): { activeConfig: CustomerAccountConfig; token: string } => {
    if (!config || !accessToken || tokenExpiry.current <= Date.now()) {
      clearCustomerAccountSessionMarker();
      setAccessToken(null);
      tokenExpiry.current = 0;
      setProfile(null);
      setStatus('signed-out');
      throw new CustomerAccountApiError('Your Shopify sign-in has expired. Please sign in again.');
    }
    return { activeConfig: config, token: accessToken };
  }, [accessToken, config]);

  const withAuthenticatedRequest = useCallback(async <T,>(
    request: (activeConfig: CustomerAccountConfig, token: string) => Promise<T>
  ): Promise<T> => {
    const { activeConfig, token } = requireAccessToken();
    try {
      return await request(activeConfig, token);
    } catch (requestError) {
      if (
        requestError instanceof CustomerAccountApiError &&
        requestError.message.includes('sign-in has expired')
      ) {
        clearCustomerAccountSessionMarker();
        setAccessToken(null);
        setProfile(null);
        setStatus('signed-out');
      }
      setError(requestError instanceof Error ? requestError.message : 'Shopify account request failed.');
      throw requestError;
    }
  }, [requireAccessToken]);

  const signIn = useCallback(async (): Promise<void> => {
    if (!config) {
      setError('Configure the Shopify Customer Account client ID and redirect URI before enabling sign-in.');
      setStatus('unconfigured');
      return;
    }
    setError(null);
    setStatus('loading');
    try {
      window.sessionStorage.setItem(EXPLICIT_LOGIN_PENDING_KEY, 'true');
      await startCustomerAccountLogin(config);
    } catch (authError) {
      window.sessionStorage.removeItem(EXPLICIT_LOGIN_PENDING_KEY);
      setStatus('signed-out');
      setError(authError instanceof Error ? authError.message : 'Could not start Shopify sign-in.');
      throw authError;
    }
  }, [config]);

  const signOut = useCallback(async (): Promise<void> => {
    const activeConfig = config;
    const hint = idTokenHint.current;
    idTokenHint.current = undefined;
    setAccessToken(null);
    setProfile(null);
    setError(null);
    setStatus(activeConfig ? 'signed-out' : 'unconfigured');
    clearCustomerAccountSessionMarker();
    if (activeConfig) {
      try {
        await startCustomerAccountLogout(activeConfig, hint);
      } catch (logoutError) {
        setError(logoutError instanceof Error ? logoutError.message : 'Could not complete Shopify sign-out.');
        throw logoutError;
      }
    }
  }, [config]);

  const refreshProfile = useCallback(async (): Promise<void> => {
    await withAuthenticatedRequest(loadProfileWithToken);
  }, [loadProfileWithToken, withAuthenticatedRequest]);

  const updateProfileName = useCallback(
    async (firstName: string, lastName: string): Promise<void> => {
      await withAuthenticatedRequest(async (activeConfig, token) => {
        await updateCustomerName(activeConfig, token, firstName, lastName);
        await loadProfileWithToken(activeConfig, token);
      });
    },
    [loadProfileWithToken, withAuthenticatedRequest]
  );

  const loadOrders = useCallback(
    (cursor: string | null = null) =>
      withAuthenticatedRequest((activeConfig, token) => getCustomerOrders(activeConfig, token, cursor)),
    [withAuthenticatedRequest]
  );

  const loadOrder = useCallback(
    (id: string) => withAuthenticatedRequest((activeConfig, token) => getCustomerOrder(activeConfig, token, id)),
    [withAuthenticatedRequest]
  );

  const createAddress = useCallback(
    async (input: AddressInput, isDefault: boolean): Promise<void> => {
      await withAuthenticatedRequest(async (activeConfig, token) => {
        await createCustomerAddress(activeConfig, token, input, isDefault);
        await loadProfileWithToken(activeConfig, token);
      });
    },
    [loadProfileWithToken, withAuthenticatedRequest]
  );

  const updateAddress = useCallback(
    async (id: string, input: AddressInput, isDefault: boolean): Promise<void> => {
      await withAuthenticatedRequest(async (activeConfig, token) => {
        await updateCustomerAddress(activeConfig, token, id, input, isDefault);
        await loadProfileWithToken(activeConfig, token);
      });
    },
    [loadProfileWithToken, withAuthenticatedRequest]
  );

  const removeAddress = useCallback(
    async (address: CustomerAddress): Promise<void> => {
      if (address.isDefault) {
        throw new CustomerAccountApiError('Choose another default address before deleting this address.');
      }
      await withAuthenticatedRequest(async (activeConfig, token) => {
        await deleteCustomerAddress(activeConfig, token, address.id);
        await loadProfileWithToken(activeConfig, token);
      });
    },
    [loadProfileWithToken, withAuthenticatedRequest]
  );

  const makeAddressDefault = useCallback(
    async (address: CustomerAddress): Promise<void> => {
      const input: AddressInput = {
        firstName: address.firstName || '',
        lastName: address.lastName || '',
        address1: address.address1 || '',
        address2: address.address2 || '',
        city: address.city || '',
        zoneCode: address.zoneCode || '',
        countryCode: address.countryCode,
        zip: address.zip || '',
        phoneNumber: address.phoneNumber || '',
      };
      await updateAddress(address.id, input, true);
    },
    [updateAddress]
  );

  return (
    <ShopifyCustomerAccountContext.Provider
      value={{
        status,
        config,
        profile,
        error,
        signIn,
        signOut,
        refreshProfile,
        updateProfileName,
        loadOrders,
        loadOrder,
        createAddress,
        updateAddress,
        removeAddress,
        makeAddressDefault,
      }}
    >
      {children}
    </ShopifyCustomerAccountContext.Provider>
  );
};

export const useShopifyCustomerAccount = (): ShopifyCustomerAccountContextValue => {
  const context = useContext(ShopifyCustomerAccountContext);
  if (!context) {
    throw new Error('useShopifyCustomerAccount must be used within ShopifyCustomerAccountProvider.');
  }
  return context;
};
