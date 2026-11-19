export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

export interface ShopifySelectedOption {
  name: string;
  value: string;
}

export interface ShopifyProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface ShopifyVariant {
  id: string;
  title: string;
  sku: string | null;
  availableForSale: boolean;
  price: ShopifyMoney;
  compareAtPrice: ShopifyMoney | null;
  selectedOptions: ShopifySelectedOption[];
  image: ShopifyImage | null;
}

export interface ShopifyPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  vendor: string;
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  images: ShopifyImage[];
  priceRange: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
  };
  compareAtPriceRange: {
    minVariantPrice: ShopifyMoney | null;
    maxVariantPrice: ShopifyMoney | null;
  };
  options: ShopifyProductOption[];
  variants: ShopifyVariant[];
  variantsPageInfo: ShopifyPageInfo;
  seo: {
    title: string | null;
    description: string | null;
  };
}

export interface ShopifyCollectionSummary {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ShopifyImage | null;
  seo: {
    title: string | null;
    description: string | null;
  };
}

export interface ShopifyCollection extends ShopifyCollectionSummary {
  products: ShopifyConnection<ShopifyProduct>;
}

export interface ShopifyConnection<T> {
  nodes: T[];
  pageInfo: ShopifyPageInfo;
}

export interface ShopifyMetaobjectField {
  key: string;
  type: string;
  value: string | null;
  reference: ShopifyMetaobjectReference | null;
  references: ShopifyMetaobjectReference[];
  referencesPageInfo: ShopifyMetaobjectReferencePageInfo;
}

export type ShopifyMetaobjectReference =
  | {
      kind: 'image';
      id: string;
      image: ShopifyImage | null;
    }
  | {
      kind: 'file';
      id: string;
      url: string;
      mimeType: string | null;
    }
  | {
      kind: 'metaobject';
      id: string;
      type: string;
      handle: string;
    }
  | {
      kind: 'product' | 'collection' | 'page';
      id: string;
      handle: string;
      title: string;
    };

export interface ShopifyMetaobjectReferencePageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface ShopifyMetaobject {
  id: string;
  type: string;
  handle: string;
  fields: ShopifyMetaobjectField[];
}

export interface ShopifyCartLine {
  id: string;
  merchandiseId: string;
  productId: string | null;
  productTitle: string;
  productHandle: string;
  vendor: string;
  productType: string;
  variantTitle: string;
  selectedOptions: ShopifySelectedOption[];
  availableForSale: boolean;
  quantity: number;
  image: ShopifyImage | null;
  unitPrice: ShopifyMoney;
  lineTotal: ShopifyMoney;
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: ShopifyCartLine[];
  pageInfo: ShopifyPageInfo;
  cost: {
    subtotalAmount: ShopifyMoney;
    totalAmount: ShopifyMoney;
    subtotalAmountEstimated: boolean;
    totalAmountEstimated: boolean;
  };
}

export interface ShopifyCartUserError {
  code: string | null;
  field: string[];
  message: string;
}
