import type { CustomerAccountConfig } from './types';

interface OpenIdConfiguration {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint?: string;
  jwks_uri: string;
}

interface CustomerAccountDiscovery {
  graphql_api: string;
}

interface OAuthAttempt {
  state: string;
  nonce: string;
  verifier: string;
  redirectUri: string;
}

interface TokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
}

interface IdTokenClaims {
  iss: string;
  aud: string | string[];
  azp?: string;
  exp: number;
  nonce: string;
  sub: string;
}

const ATTEMPT_KEY = 'myrkls_customer_oauth_attempt';
const LOGIN_MARKER_KEY = 'myrkls_customer_login_session';
const OAUTH_SCOPE = 'openid email customer-account-api:full';

export class CustomerAccountAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CustomerAccountAuthError';
  }
}

export interface CustomerAccountEndpoints {
  openId: OpenIdConfiguration;
  graphqlApi: string;
}

export interface CustomerAccountToken {
  accessToken: string;
  expiresAt: number;
  idTokenHint: string;
}

const requireHttpsUrl = (value: string, label: string): URL => {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new CustomerAccountAuthError(`Shopify returned an invalid ${label} URL.`);
  }
  if (url.protocol !== 'https:') {
    throw new CustomerAccountAuthError(`Shopify returned a non-HTTPS ${label} URL.`);
  }
  return url;
};

const parseJsonResponse = async <T>(response: Response, description: string): Promise<T> => {
  if (!response.ok) {
    throw new CustomerAccountAuthError(`${description} failed with HTTP ${response.status}.`);
  }
  try {
    return (await response.json()) as T;
  } catch {
    throw new CustomerAccountAuthError(`${description} returned an invalid response.`);
  }
};

const base64UrlToBytes = (value: string): Uint8Array => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

const decodeJwtPart = <T>(value: string): T => {
  const bytes = base64UrlToBytes(value);
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
};

const toBase64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
};

const sha256Base64Url = async (value: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return toBase64Url(new Uint8Array(digest));
};

const createRandomValue = (size = 32): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  return toBase64Url(bytes);
};

export const getCustomerAccountConfig = (): CustomerAccountConfig | null => {
  const shopDomain = import.meta.env.VITE_SHOPIFY_CUSTOMER_ACCOUNT_SHOP_DOMAIN?.trim()
    || import.meta.env.VITE_SHOPIFY_STORE_DOMAIN?.trim();
  const clientId = import.meta.env.VITE_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID?.trim();
  const redirectUri = import.meta.env.VITE_SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI?.trim();
  const apiVersion = import.meta.env.VITE_SHOPIFY_API_VERSION?.trim() || '2026-10';

  if (!shopDomain || !clientId || !redirectUri) return null;
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(shopDomain)) {
    throw new CustomerAccountAuthError('Customer Account shop domain must be a *.myshopify.com hostname.');
  }
  if (!/^\d{4}-\d{2}$/.test(apiVersion)) {
    throw new CustomerAccountAuthError('Shopify API version must use the YYYY-MM format.');
  }

  let callback: URL;
  try {
    callback = new URL(redirectUri);
  } catch {
    throw new CustomerAccountAuthError('Customer Account redirect URI must be a valid absolute URL.');
  }
  if (callback.protocol !== 'https:') {
    throw new CustomerAccountAuthError('Customer Account redirect URI must use HTTPS.');
  }
  if (callback.origin !== window.location.origin) {
    throw new CustomerAccountAuthError('Customer Account redirect URI must use the current storefront origin.');
  }

  return { shopDomain, clientId, redirectUri: callback.toString(), apiVersion };
};

export const discoverCustomerAccountEndpoints = async (
  config: CustomerAccountConfig
): Promise<CustomerAccountEndpoints> => {
  const shopOrigin = `https://${config.shopDomain}`;
  const [openIdResponse, accountResponse] = await Promise.all([
    fetch(`${shopOrigin}/.well-known/openid-configuration`),
    fetch(`${shopOrigin}/.well-known/customer-account-api`),
  ]);
  const [openId, account] = await Promise.all([
    parseJsonResponse<OpenIdConfiguration>(openIdResponse, 'Shopify OpenID discovery'),
    parseJsonResponse<CustomerAccountDiscovery>(accountResponse, 'Shopify Customer Account discovery'),
  ]);

  if (
    !openId.issuer ||
    !openId.authorization_endpoint ||
    !openId.token_endpoint ||
    !openId.jwks_uri ||
    !account.graphql_api
  ) {
    throw new CustomerAccountAuthError('Shopify discovery response is missing required Customer Account endpoints.');
  }
  requireHttpsUrl(openId.issuer, 'OpenID issuer');
  requireHttpsUrl(openId.authorization_endpoint, 'authorization endpoint');
  requireHttpsUrl(openId.token_endpoint, 'token endpoint');
  requireHttpsUrl(openId.jwks_uri, 'JWKS endpoint');
  requireHttpsUrl(account.graphql_api, 'Customer Account API endpoint');

  return { openId, graphqlApi: account.graphql_api };
};

const readAttempt = (): OAuthAttempt | null => {
  const raw = sessionStorage.getItem(ATTEMPT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OAuthAttempt;
  } catch {
    sessionStorage.removeItem(ATTEMPT_KEY);
    throw new CustomerAccountAuthError('The saved Shopify sign-in attempt is invalid. Please try again.');
  }
};

export const hasPendingCustomerAccountCallback = (): boolean => {
  const params = new URLSearchParams(window.location.search);
  return params.has('code') || params.has('error') || params.has('state');
};

const clearCallbackParameters = (): void => {
  const url = new URL(window.location.href);
  url.search = '';
  window.history.replaceState(null, '', `${url.pathname}${url.hash}`);
};

export const startCustomerAccountLogin = async (
  config: CustomerAccountConfig,
  silent = false
): Promise<void> => {
  const endpoints = await discoverCustomerAccountEndpoints(config);
  const verifier = createRandomValue(48);
  const [challenge, state, nonce] = await Promise.all([
    sha256Base64Url(verifier),
    Promise.resolve(createRandomValue()),
    Promise.resolve(createRandomValue()),
  ]);
  const attempt: OAuthAttempt = {
    state,
    nonce,
    verifier,
    redirectUri: config.redirectUri,
  };
  sessionStorage.setItem(ATTEMPT_KEY, JSON.stringify(attempt));

  const authorizationUrl = new URL(endpoints.openId.authorization_endpoint);
  authorizationUrl.search = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    redirect_uri: config.redirectUri,
    scope: OAUTH_SCOPE,
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    prompt: silent ? 'none' : 'login',
  }).toString();
  window.location.assign(authorizationUrl.toString());
};

const validateIdToken = async (
  idToken: string,
  clientId: string,
  nonce: string,
  openId: OpenIdConfiguration
): Promise<IdTokenClaims> => {
  const parts = idToken.split('.');
  if (parts.length !== 3) throw new CustomerAccountAuthError('Shopify returned an invalid identity token.');

  let header: { alg?: string; kid?: string };
  let claims: IdTokenClaims;
  try {
    header = decodeJwtPart(parts[0]);
    claims = decodeJwtPart(parts[1]);
  } catch {
    throw new CustomerAccountAuthError('Shopify returned an unreadable identity token.');
  }
  if (header.alg !== 'RS256' || !header.kid) {
    throw new CustomerAccountAuthError('Shopify returned an unsupported identity-token signature.');
  }

  const jwksResponse = await fetch(openId.jwks_uri);
  const jwks = await parseJsonResponse<{ keys: JsonWebKey[] }>(jwksResponse, 'Shopify signing-key discovery');
  const key = jwks.keys.find((candidate) => (candidate as JsonWebKey & { kid?: string }).kid === header.kid);
  if (!key || key.kty !== 'RSA') {
    throw new CustomerAccountAuthError('Unable to verify Shopify identity-token signing key.');
  }
  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    key,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const validSignature = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    toArrayBuffer(base64UrlToBytes(parts[2])),
    toArrayBuffer(new TextEncoder().encode(`${parts[0]}.${parts[1]}`))
  );
  const audienceMatches = Array.isArray(claims.aud)
    ? claims.aud.includes(clientId)
    : claims.aud === clientId;
  const authorizedPartyMatches =
    !Array.isArray(claims.aud) || claims.aud.length <= 1 || claims.azp === clientId;
  if (
    !validSignature ||
    claims.iss !== openId.issuer ||
    !audienceMatches ||
    !authorizedPartyMatches ||
    !Number.isFinite(claims.exp) ||
    claims.exp <= Math.floor(Date.now() / 1000) ||
    claims.nonce !== nonce ||
    typeof claims.sub !== 'string' ||
    !claims.sub
  ) {
    throw new CustomerAccountAuthError('Shopify identity-token validation failed.');
  }
  return claims;
};

export const completeCustomerAccountCallback = async (
  config: CustomerAccountConfig
): Promise<CustomerAccountToken> => {
  const params = new URLSearchParams(window.location.search);
  const oauthError = params.get('error');
  const oauthDescription = params.get('error_description');
  const code = params.get('code');
  const callbackState = params.get('state');
  const attempt = readAttempt();
  clearCallbackParameters();
  sessionStorage.removeItem(ATTEMPT_KEY);

  if (oauthError) {
    if (oauthError === 'login_required' || oauthError === 'interaction_required') {
      sessionStorage.removeItem(LOGIN_MARKER_KEY);
      throw new CustomerAccountAuthError('Your Shopify sign-in session has expired. Please sign in again.');
    }
    throw new CustomerAccountAuthError(oauthDescription || `Shopify sign-in failed (${oauthError}).`);
  }
  if (
    !attempt ||
    attempt.redirectUri !== config.redirectUri ||
    !code ||
    !callbackState ||
    callbackState !== attempt.state
  ) {
    throw new CustomerAccountAuthError('Shopify sign-in state could not be verified. Please try again.');
  }

  const endpoints = await discoverCustomerAccountEndpoints(config);
  const tokenResponse = await fetch(endpoints.openId.token_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.clientId,
      redirect_uri: attempt.redirectUri,
      code,
      code_verifier: attempt.verifier,
    }),
  });
  const token = await parseJsonResponse<TokenResponse>(tokenResponse, 'Shopify token exchange');
  if (
    !token.access_token ||
    !token.id_token ||
    token.token_type?.toLowerCase() !== 'bearer' ||
    !Number.isFinite(token.expires_in) ||
    token.expires_in <= 0
  ) {
    throw new CustomerAccountAuthError('Shopify returned an incomplete authentication response.');
  }
  await validateIdToken(token.id_token, config.clientId, attempt.nonce, endpoints.openId);
  sessionStorage.setItem(LOGIN_MARKER_KEY, '1');
  return {
    accessToken: token.access_token,
    expiresAt: Date.now() + token.expires_in * 1000,
    idTokenHint: token.id_token,
  };
}

export const hasCustomerAccountSessionMarker = (): boolean =>
  sessionStorage.getItem(LOGIN_MARKER_KEY) === '1';

export const clearCustomerAccountSessionMarker = (): void => {
  sessionStorage.removeItem(LOGIN_MARKER_KEY);
  sessionStorage.removeItem(ATTEMPT_KEY);
};

export const startCustomerAccountLogout = async (
  config: CustomerAccountConfig,
  idTokenHint?: string
): Promise<void> => {
  const endpoints = await discoverCustomerAccountEndpoints(config);
  clearCustomerAccountSessionMarker();
  const logoutEndpoint = endpoints.openId.end_session_endpoint;
  if (!logoutEndpoint) return;
  const logoutUrl = new URL(requireHttpsUrl(logoutEndpoint, 'logout endpoint'));
  logoutUrl.searchParams.set('client_id', config.clientId);
  logoutUrl.searchParams.set('post_logout_redirect_uri', `${window.location.origin}${window.location.pathname}#account`);
  if (idTokenHint) logoutUrl.searchParams.set('id_token_hint', idTokenHint);
  window.location.assign(logoutUrl.toString());
};

export const CUSTOMER_ACCOUNT_SESSION_MARKER_KEY = LOGIN_MARKER_KEY;
