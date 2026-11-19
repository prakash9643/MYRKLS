const assert = require('node:assert/strict');
const { webcrypto } = require('node:crypto');

const config = {
  shopDomain: 'accounts-test.myshopify.com',
  clientId: 'public-client-test',
  redirectUri: 'https://storefront.example/account/callback',
  apiVersion: '2026-10',
};

const storage = new Map();
const sessionStorage = {
  getItem: (key) => storage.get(key) || null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
};

const location = {
  origin: 'https://storefront.example',
  pathname: '/account/callback',
  hash: '',
  search: '',
  assignedUrl: '',
  get href() {
    return `${this.origin}${this.pathname}${this.search}${this.hash}`;
  },
  assign(url) {
    this.assignedUrl = url;
  },
};

globalThis.crypto = webcrypto;
globalThis.sessionStorage = sessionStorage;
globalThis.window = {
  location,
  history: {
    replaceState(_state, _title, url) {
      const parsed = new URL(url, location.origin);
      location.pathname = parsed.pathname;
      location.hash = parsed.hash;
      location.search = parsed.search;
    },
  },
};

const jsonResponse = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const discovery = () => {
  const calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const url = String(input);
    calls.push({ url, init });
    if (url.endsWith('/.well-known/openid-configuration')) {
      return jsonResponse({
        issuer: 'https://accounts.shopify.com',
        authorization_endpoint: 'https://accounts.shopify.com/authorize',
        token_endpoint: 'https://accounts.shopify.com/token',
        end_session_endpoint: 'https://accounts.shopify.com/logout',
        jwks_uri: 'https://accounts.shopify.com/keys',
      });
    }
    if (url.endsWith('/.well-known/customer-account-api')) {
      return jsonResponse({ graphql_api: 'https://accounts.shopify.com/customer/graphql' });
    }
    return null;
  };
  return calls;
};

const base64Url = (value) =>
  Buffer.from(typeof value === 'string' ? value : JSON.stringify(value))
    .toString('base64url');

const main = async () => {
  const { createServer } = await import('vite');
  const server = await createServer({
    configFile: false,
    root: process.cwd(),
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
    optimizeDeps: { noDiscovery: true },
  });
  try {
    const auth = await server.ssrLoadModule('/src/shopify/customer-account/auth.ts');
    const service = await server.ssrLoadModule('/src/shopify/customer-account/service.ts');

    discovery();
    await auth.startCustomerAccountLogin(config);
    const authorizationUrl = new URL(location.assignedUrl);
    const attempt = JSON.parse(sessionStorage.getItem('myrkls_customer_oauth_attempt'));
    assert.equal(authorizationUrl.searchParams.get('response_type'), 'code');
    assert.equal(authorizationUrl.searchParams.get('client_id'), config.clientId);
    assert.equal(authorizationUrl.searchParams.get('redirect_uri'), config.redirectUri);
    assert.equal(authorizationUrl.searchParams.get('code_challenge_method'), 'S256');
    assert.equal(authorizationUrl.searchParams.get('prompt'), 'login');
    assert.equal(authorizationUrl.searchParams.has('code_challenge'), true);
    assert.equal(authorizationUrl.searchParams.get('state'), attempt.state);
    assert.equal(authorizationUrl.searchParams.has('client_secret'), false);
    assert.match(authorizationUrl.searchParams.get('scope'), /customer-account-api:full/);
    const challengeDigest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(attempt.verifier));
    const expectedChallenge = Buffer.from(challengeDigest).toString('base64url');
    assert.equal(authorizationUrl.searchParams.get('code_challenge'), expectedChallenge);
    assert.equal(sessionStorage.getItem('myrkls_customer_login_session'), null);
    console.log('PASS Customer Account authorization uses public-client PKCE without a client secret');

    location.search = `?code=test-code&state=incorrect-state`;
    await assert.rejects(() => auth.completeCustomerAccountCallback(config), /state could not be verified/);
    assert.equal(sessionStorage.getItem('myrkls_customer_oauth_attempt'), null);
    assert.equal(location.search, '');
    console.log('PASS OAuth callback rejects mismatched state and clears transient callback data');

    discovery();
    await auth.startCustomerAccountLogin(config);
    const validAttempt = JSON.parse(sessionStorage.getItem('myrkls_customer_oauth_attempt'));
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSASSA-PKCS1-v1_5',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['sign', 'verify']
    );
    const publicJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
    publicJwk.kid = 'test-key';
    const jwtHeader = base64Url({ alg: 'RS256', kid: 'test-key' });
    const jwtClaims = base64Url({
      iss: 'https://accounts.shopify.com',
      aud: config.clientId,
      exp: Math.floor(Date.now() / 1000) + 600,
      nonce: validAttempt.nonce,
      sub: 'shopify-customer-subject',
    });
    const signingInput = `${jwtHeader}.${jwtClaims}`;
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      keyPair.privateKey,
      new TextEncoder().encode(signingInput)
    );
    const idToken = `${signingInput}.${Buffer.from(signature).toString('base64url')}`;
    globalThis.fetch = async (input, init = {}) => {
      const url = String(input);
      if (url.endsWith('/.well-known/openid-configuration')) {
        return jsonResponse({
          issuer: 'https://accounts.shopify.com',
          authorization_endpoint: 'https://accounts.shopify.com/authorize',
          token_endpoint: 'https://accounts.shopify.com/token',
          jwks_uri: 'https://accounts.shopify.com/keys',
        });
      }
      if (url.endsWith('/.well-known/customer-account-api')) {
        return jsonResponse({ graphql_api: 'https://accounts.shopify.com/customer/graphql' });
      }
      if (url === 'https://accounts.shopify.com/token') {
        assert.equal(new URLSearchParams(init.body).get('code_verifier'), validAttempt.verifier);
        return jsonResponse({
          access_token: 'test-access-token',
          id_token: idToken,
          expires_in: 600,
          token_type: 'Bearer',
        });
      }
      if (url === 'https://accounts.shopify.com/keys') return jsonResponse({ keys: [publicJwk] });
      throw new Error(`Unexpected authentication request: ${url}`);
    };
    location.search = `?code=valid-code&state=${validAttempt.state}`;
    const token = await auth.completeCustomerAccountCallback(config);
    assert.equal(token.accessToken, 'test-access-token');
    assert.equal(token.idTokenHint, idToken);
    assert.ok(token.expiresAt > Date.now());
    console.log('PASS OAuth code exchange verifies PKCE and the ID-token signature and claims');

    const orderCalls = [];
    globalThis.fetch = async (input, init = {}) => {
      const url = String(input);
      if (url.endsWith('/.well-known/openid-configuration')) {
        return jsonResponse({
          issuer: 'https://accounts.shopify.com',
          authorization_endpoint: 'https://accounts.shopify.com/authorize',
          token_endpoint: 'https://accounts.shopify.com/token',
          jwks_uri: 'https://accounts.shopify.com/keys',
        });
      }
      if (url.endsWith('/.well-known/customer-account-api')) {
        return jsonResponse({ graphql_api: 'https://accounts.shopify.com/customer/graphql' });
      }
      if (url === 'https://accounts.shopify.com/customer/graphql') {
        const requestBody = JSON.parse(init.body);
        orderCalls.push(requestBody);
        if (requestBody.query.includes('CustomerAccountOrder(')) {
          return jsonResponse({
            data: {
              customer: {
                orders: {
                  nodes: [{
                    id: 'gid://shopify/Order/12345',
                    name: '#1001',
                    processedAt: '2026-10-12T10:00:00Z',
                    totalPrice: { amount: '1499.00', currencyCode: 'INR' },
                    statusPageUrl: 'https://storefront.example/orders/1001',
                    lineItems: {
                      nodes: [{
                        id: 'gid://shopify/LineItem/1',
                        name: 'Serum',
                        variantTitle: '30 ml',
                        quantity: 1,
                        image: { url: 'https://cdn.shopify.com/item.webp', altText: 'Serum' },
                        totalPrice: { amount: '1499.00', currencyCode: 'INR' },
                      }],
                    },
                    fulfillments: {
                      nodes: [{
                        trackingInformation: [{
                          company: 'Carrier',
                          number: 'TRACK-1',
                          url: 'https://carrier.example/track/TRACK-1',
                        }],
                      }],
                    },
                  }],
                  pageInfo: { hasNextPage: false, endCursor: null },
                },
              },
            },
          });
        }
        return jsonResponse({
          data: {
            customer: {
              orders: {
                nodes: [{
                  id: 'gid://shopify/Order/54321',
                  name: '#1002',
                  processedAt: '2026-10-13T10:00:00Z',
                  totalPrice: { amount: '2000.00', currencyCode: 'INR' },
                  statusPageUrl: 'https://storefront.example/orders/1002',
                }],
                pageInfo: { hasNextPage: true, endCursor: 'cursor-next' },
              },
            },
          },
        });
      }
      throw new Error(`Unexpected account API request: ${url}`);
    };

    const page = await service.getCustomerOrders(config, 'temporary-test-token');
    assert.equal(page.orders[0].name, '#1002');
    assert.equal(page.orders[0].lineItems.length, 0);
    assert.equal(page.hasNextPage, true);
    assert.equal(page.endCursor, 'cursor-next');
    const detail = await service.getCustomerOrder(config, 'temporary-test-token', 'gid://shopify/Order/12345');
    assert.equal(detail.lineItems[0].imageUrl, 'https://cdn.shopify.com/item.webp');
    assert.equal(detail.tracking[0].number, 'TRACK-1');
    assert.match(orderCalls[1].variables.query, /^id:12345$/);
    await assert.rejects(() => service.getCustomerOrder(config, 'temporary-test-token', 'arbitrary-id'), /identifier is invalid/);
    console.log('PASS customer-scoped order pagination, detail lookup, image and tracking mapping');

    let profileMutation;
    globalThis.fetch = async (input, init = {}) => {
      const url = String(input);
      if (url.endsWith('/.well-known/openid-configuration')) {
        return jsonResponse({
          issuer: 'https://accounts.shopify.com',
          authorization_endpoint: 'https://accounts.shopify.com/authorize',
          token_endpoint: 'https://accounts.shopify.com/token',
          jwks_uri: 'https://accounts.shopify.com/keys',
        });
      }
      if (url.endsWith('/.well-known/customer-account-api')) {
        return jsonResponse({ graphql_api: 'https://accounts.shopify.com/customer/graphql' });
      }
      const requestBody = JSON.parse(init.body);
      profileMutation = requestBody;
      if (requestBody.query.includes('CustomerAccountProfile')) {
        return jsonResponse({
          data: {
            customer: {
              id: 'gid://shopify/Customer/99',
              firstName: 'Test',
              lastName: 'Customer',
              emailAddress: { emailAddress: 'customer@example.test' },
              phoneNumber: { phoneNumber: '+919999999999' },
              creationDate: '2026-01-01T00:00:00Z',
              defaultAddress: { id: 'gid://shopify/MailingAddress/1' },
              addresses: {
                nodes: [{
                  id: 'gid://shopify/MailingAddress/1',
                  firstName: 'Test',
                  lastName: 'Customer',
                  address1: '1 Test Street',
                  address2: null,
                  city: 'Mumbai',
                  zoneCode: 'MH',
                  countryCode: 'IN',
                  zip: '400001',
                  phoneNumber: '+919999999999',
                }],
              },
            },
          },
        });
      }
      if (requestBody.query.includes('CustomerAddressCreate')) {
        return jsonResponse({ data: { customerAddressCreate: { userErrors: [] } } });
      }
      if (requestBody.query.includes('CustomerUpdate')) {
        return jsonResponse({ data: { customerUpdate: { userErrors: [] } } });
      }
      return jsonResponse({ errors: [{ message: 'Unexpected test operation' }] });
    };
    const profile = await service.getCustomerProfile(config, 'temporary-test-token');
    assert.equal(profile.email, 'customer@example.test');
    assert.equal(profile.addresses[0].isDefault, true);
    await service.createCustomerAddress(config, 'temporary-test-token', {
      firstName: 'Test',
      lastName: 'Customer',
      address1: '2 Test Street',
      address2: '',
      city: 'Mumbai',
      zoneCode: 'MH',
      countryCode: 'IN',
      zip: '400001',
      phoneNumber: '+919999999999',
    }, true);
    assert.equal(profileMutation.variables.address.countryCode, 'IN');
    assert.equal(profileMutation.variables.defaultAddress, true);
    await service.updateCustomerName(config, 'temporary-test-token', 'New', 'Name');
    assert.deepEqual(profileMutation.variables.input, { firstName: 'New', lastName: 'Name' });
    console.log('PASS profile/default-address mapping and Shopify address/name mutations');

    globalThis.fetch = async (input) => {
      const url = String(input);
      if (url.endsWith('/.well-known/openid-configuration')) {
        return jsonResponse({
          issuer: 'https://accounts.shopify.com',
          authorization_endpoint: 'https://accounts.shopify.com/authorize',
          token_endpoint: 'https://accounts.shopify.com/token',
          jwks_uri: 'https://accounts.shopify.com/keys',
        });
      }
      if (url.endsWith('/.well-known/customer-account-api')) {
        return jsonResponse({ graphql_api: 'https://accounts.shopify.com/customer/graphql' });
      }
      return jsonResponse({ errors: [{ message: 'permission denied' }] });
    };
    await assert.rejects(
      () => service.getCustomerOrders(config, 'temporary-test-token'),
      /permission denied/
    );
    console.log('PASS Customer Account GraphQL errors are surfaced to callers');
  } finally {
    await server.close();
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
