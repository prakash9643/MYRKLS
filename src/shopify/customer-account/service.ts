import { discoverCustomerAccountEndpoints } from './auth';
import type {
  AddressInput,
  CustomerAccountConfig,
  CustomerAddress,
  CustomerOrder,
  CustomerProfile,
  OrderPage,
} from './types';

interface GraphqlError {
  message: string;
}

interface GraphqlResponse<T> {
  data?: T;
  errors?: GraphqlError[];
}

interface CustomerAddressNode extends Omit<CustomerAddress, 'isDefault'> {}

interface CustomerProfileResponse {
  customer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    emailAddress: { emailAddress: string } | null;
    phoneNumber: { phoneNumber: string } | null;
    creationDate: string;
    defaultAddress: { id: string } | null;
    addresses: { nodes: CustomerAddressNode[] };
  } | null;
}

interface OrderNode {
  id: string;
  name: string;
  processedAt: string | null;
  totalPrice: { amount: string; currencyCode: string };
  statusPageUrl: string;
  lineItems?: {
    nodes: Array<{
      id: string;
      name: string;
      variantTitle: string | null;
      quantity: number;
      image: { url: string; altText: string | null } | null;
      totalPrice: { amount: string; currencyCode: string } | null;
    }>;
  };
  fulfillments?: {
    nodes: Array<{
      trackingInformation: Array<{
        company: string | null;
        number: string | null;
        url: string | null;
      }>;
    }>;
  };
}

interface OrdersResponse {
  customer: {
    orders: {
      nodes: OrderNode[];
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
  } | null;
}

interface AddressMutationResponse {
  customerAddressCreate?: { userErrors: Array<{ message: string }> };
  customerAddressUpdate?: { userErrors: Array<{ message: string }> };
  customerAddressDelete?: { userErrors: Array<{ message: string }> };
}

interface CustomerUpdateResponse {
  customerUpdate?: { userErrors: Array<{ message: string }> };
}

const PROFILE_QUERY = `
  query CustomerAccountProfile {
    customer {
      id
      firstName
      lastName
      emailAddress { emailAddress }
      phoneNumber { phoneNumber }
      creationDate
      defaultAddress { id }
      addresses(first: 250) {
        nodes {
          id
          firstName
          lastName
          address1
          address2
          city
          zoneCode
          countryCode
          zip
          phoneNumber
        }
      }
    }
  }
`;

const ORDER_SUMMARY_FIELDS = `
  id
  name
  processedAt
  totalPrice { amount currencyCode }
  statusPageUrl
`;

const ORDER_DETAIL_FIELDS = `
  ${ORDER_SUMMARY_FIELDS}
  lineItems(first: 250) {
    nodes {
      id
      name
      variantTitle
      quantity
      image { url altText }
      totalPrice { amount currencyCode }
    }
  }
  fulfillments(first: 10) {
    nodes {
      trackingInformation { company number url }
    }
  }
`;

const ORDERS_QUERY = `
  query CustomerAccountOrders($first: Int!, $after: String) {
    customer {
      orders(first: $first, after: $after, sortKey: PROCESSED_AT, reverse: true) {
        nodes { ${ORDER_SUMMARY_FIELDS} }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

const ORDER_DETAIL_QUERY = `
  query CustomerAccountOrder($first: Int!, $query: String!) {
    customer {
      orders(first: $first, query: $query) {
        nodes { ${ORDER_DETAIL_FIELDS} }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

const ADDRESS_FIELDS = `
  id
  firstName
  lastName
  address1
  address2
  city
  zoneCode
  countryCode
  zip
  phoneNumber
`;

const CUSTOMER_ADDRESS_CREATE = `
  mutation CustomerAddressCreate($address: CustomerAddressInput!, $defaultAddress: Boolean) {
    customerAddressCreate(address: $address, defaultAddress: $defaultAddress) {
      customerAddress { ${ADDRESS_FIELDS} }
      userErrors { message }
    }
  }
`;

const CUSTOMER_ADDRESS_UPDATE = `
  mutation CustomerAddressUpdate($addressId: ID!, $address: CustomerAddressInput, $defaultAddress: Boolean) {
    customerAddressUpdate(addressId: $addressId, address: $address, defaultAddress: $defaultAddress) {
      customerAddress { ${ADDRESS_FIELDS} }
      userErrors { message }
    }
  }
`;

const CUSTOMER_ADDRESS_DELETE = `
  mutation CustomerAddressDelete($addressId: ID!) {
    customerAddressDelete(addressId: $addressId) {
      deletedAddressId
      userErrors { message }
    }
  }
`;

const CUSTOMER_UPDATE = `
  mutation CustomerUpdate($input: CustomerUpdateInput!) {
    customerUpdate(input: $input) {
      userErrors { message }
    }
  }
`;

const assertHttpsUrl = (value: string): string => {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:') return url.toString();
  } catch {
    // The URL is optional and handled as unavailable below.
  }
  throw new Error('Shopify returned an invalid secure URL.');
};

const mapOrder = (order: OrderNode): CustomerOrder => ({
  id: order.id,
  name: order.name,
  processedAt: order.processedAt,
  totalAmount: order.totalPrice.amount,
  currencyCode: order.totalPrice.currencyCode,
  statusUrl: assertHttpsUrl(order.statusPageUrl),
  lineItems: (order.lineItems?.nodes ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    variantTitle: item.variantTitle,
    quantity: item.quantity,
    imageUrl: item.image?.url ? assertHttpsUrl(item.image.url) : null,
    imageAlt: item.image?.altText ?? null,
    totalAmount: item.totalPrice?.amount ?? null,
    currencyCode: item.totalPrice?.currencyCode ?? null,
  })),
  tracking: (order.fulfillments?.nodes ?? []).flatMap((fulfillment) =>
    fulfillment.trackingInformation.map((tracking) => ({
      company: tracking.company,
      number: tracking.number,
      url: tracking.url ? assertHttpsUrl(tracking.url) : null,
    }))
  ),
});

export class CustomerAccountApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CustomerAccountApiError';
  }
}

const customerAccountRequest = async <T>(
  config: CustomerAccountConfig,
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>
): Promise<T> => {
  const { graphqlApi } = await discoverCustomerAccountEndpoints(config);
  let response: Response;
  try {
    response = await fetch(graphqlApi, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch {
    throw new CustomerAccountApiError('Could not connect to Shopify Customer Accounts. Check your connection and try again.');
  }
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new CustomerAccountApiError('Your Shopify sign-in has expired or does not have the required account permissions.');
    }
    throw new CustomerAccountApiError(`Shopify Customer Account API returned HTTP ${response.status}.`);
  }

  let payload: GraphqlResponse<T>;
  try {
    payload = (await response.json()) as GraphqlResponse<T>;
  } catch {
    throw new CustomerAccountApiError('Shopify Customer Account API returned an invalid response.');
  }
  if (payload.errors?.length) {
    throw new CustomerAccountApiError(payload.errors.map((error) => error.message).join(' '));
  }
  if (!payload.data) {
    throw new CustomerAccountApiError('Shopify Customer Account API returned no data.');
  }
  return payload.data;
};

export const getCustomerProfile = async (
  config: CustomerAccountConfig,
  accessToken: string
): Promise<CustomerProfile> => {
  const data = await customerAccountRequest<CustomerProfileResponse>(config, accessToken, PROFILE_QUERY);
  if (!data.customer) throw new CustomerAccountApiError('No Shopify customer profile is available for this account.');

  const defaultAddressId = data.customer.defaultAddress?.id;
  return {
    id: data.customer.id,
    firstName: data.customer.firstName,
    lastName: data.customer.lastName,
    email: data.customer.emailAddress?.emailAddress ?? null,
    phone: data.customer.phoneNumber?.phoneNumber ?? null,
    creationDate: data.customer.creationDate,
    addresses: data.customer.addresses.nodes.map((address) => ({
      ...address,
      isDefault: address.id === defaultAddressId,
    })),
  };
};

export const getCustomerOrders = async (
  config: CustomerAccountConfig,
  accessToken: string,
  cursor: string | null = null
): Promise<OrderPage> => {
  const data = await customerAccountRequest<OrdersResponse>(config, accessToken, ORDERS_QUERY, {
    first: 10,
    after: cursor,
  });
  if (!data.customer) throw new CustomerAccountApiError('No Shopify customer is available for this account.');
  return {
    orders: data.customer.orders.nodes.map(mapOrder),
    hasNextPage: data.customer.orders.pageInfo.hasNextPage,
    endCursor: data.customer.orders.pageInfo.endCursor,
  };
};

export const getCustomerOrder = async (
  config: CustomerAccountConfig,
  accessToken: string,
  orderId: string
): Promise<CustomerOrder | null> => {
  const match = /^gid:\/\/shopify\/Order\/(\d+)$/.exec(orderId);
  if (!match) throw new CustomerAccountApiError('The selected order identifier is invalid.');
  const data = await customerAccountRequest<OrdersResponse>(config, accessToken, ORDER_DETAIL_QUERY, {
    first: 1,
    query: `id:${match[1]}`,
  });
  return data.customer?.orders.nodes[0] ? mapOrder(data.customer.orders.nodes[0]) : null;
};

const addressInputVariables = (address: AddressInput) => ({
  firstName: address.firstName.trim(),
  lastName: address.lastName.trim(),
  address1: address.address1.trim(),
  address2: address.address2.trim() || null,
  city: address.city.trim(),
  zoneCode: address.zoneCode.trim() || null,
  countryCode: address.countryCode,
  zip: address.zip.trim(),
  phoneNumber: address.phoneNumber.trim() || null,
});

const assertMutationSucceeded = (payload: AddressMutationResponse): void => {
  const result = payload.customerAddressCreate || payload.customerAddressUpdate || payload.customerAddressDelete;
  if (!result) throw new CustomerAccountApiError('Shopify did not confirm the address change.');
  if (result.userErrors.length) {
    throw new CustomerAccountApiError(result.userErrors.map((error) => error.message).join(' '));
  }
};

export const createCustomerAddress = async (
  config: CustomerAccountConfig,
  accessToken: string,
  address: AddressInput,
  isDefault: boolean
): Promise<void> => {
  const result = await customerAccountRequest<AddressMutationResponse>(
    config,
    accessToken,
    CUSTOMER_ADDRESS_CREATE,
    { address: addressInputVariables(address), defaultAddress: isDefault }
  );
  assertMutationSucceeded(result);
};

export const updateCustomerAddress = async (
  config: CustomerAccountConfig,
  accessToken: string,
  addressId: string,
  address: AddressInput,
  isDefault: boolean
): Promise<void> => {
  const result = await customerAccountRequest<AddressMutationResponse>(
    config,
    accessToken,
    CUSTOMER_ADDRESS_UPDATE,
    { addressId, address: addressInputVariables(address), defaultAddress: isDefault }
  );
  assertMutationSucceeded(result);
};

export const deleteCustomerAddress = async (
  config: CustomerAccountConfig,
  accessToken: string,
  addressId: string
): Promise<void> => {
  const result = await customerAccountRequest<AddressMutationResponse>(
    config,
    accessToken,
    CUSTOMER_ADDRESS_DELETE,
    { addressId }
  );
  assertMutationSucceeded(result);
};

export const updateCustomerName = async (
  config: CustomerAccountConfig,
  accessToken: string,
  firstName: string,
  lastName: string
): Promise<void> => {
  const result = await customerAccountRequest<CustomerUpdateResponse>(
    config,
    accessToken,
    CUSTOMER_UPDATE,
    { input: { firstName: firstName.trim(), lastName: lastName.trim() } }
  );
  const mutation = result.customerUpdate;
  if (!mutation) throw new CustomerAccountApiError('Shopify did not confirm the profile change.');
  if (mutation.userErrors.length) {
    throw new CustomerAccountApiError(mutation.userErrors.map((error) => error.message).join(' '));
  }
};
