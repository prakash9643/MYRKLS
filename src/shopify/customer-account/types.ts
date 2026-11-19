export interface CustomerAccountConfig {
  shopDomain: string;
  clientId: string;
  redirectUri: string;
  apiVersion: string;
}

export interface CustomerAddress {
  id: string;
  firstName: string | null;
  lastName: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  zoneCode: string | null;
  countryCode: string;
  zip: string | null;
  phoneNumber: string | null;
  isDefault: boolean;
}

export interface CustomerProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  creationDate: string;
  addresses: CustomerAddress[];
}

export interface OrderLine {
  id: string;
  name: string;
  variantTitle: string | null;
  quantity: number;
  imageUrl: string | null;
  imageAlt: string | null;
  totalAmount: string | null;
  currencyCode: string | null;
}

export interface CustomerOrder {
  id: string;
  name: string;
  processedAt: string | null;
  totalAmount: string;
  currencyCode: string;
  statusUrl: string;
  lineItems: OrderLine[];
  tracking: Array<{
    company: string | null;
    number: string | null;
    url: string | null;
  }>;
}

export interface OrderPage {
  orders: CustomerOrder[];
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface AddressInput {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  zoneCode: string;
  countryCode: string;
  zip: string;
  phoneNumber: string;
}
