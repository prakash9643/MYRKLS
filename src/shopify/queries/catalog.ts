export const PRODUCT_FIELDS = `
  id
  handle
  title
  description
  productType
  vendor
  availableForSale
  featuredImage {
    url
    altText
    width
    height
  }
  images(first: 50) {
    nodes {
      url
      altText
      width
      height
    }
  }
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
    maxVariantPrice {
      amount
      currencyCode
    }
  }
  compareAtPriceRange {
    minVariantPrice {
      amount
      currencyCode
    }
    maxVariantPrice {
      amount
      currencyCode
    }
  }
  options {
    id
    name
    values
  }
  variants(first: 250) {
    nodes {
      id
      title
      sku
      availableForSale
      price {
        amount
        currencyCode
      }
      compareAtPrice {
        amount
        currencyCode
      }
      selectedOptions {
        name
        value
      }
      image {
        url
        altText
        width
        height
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
  seo {
    title
    description
  }
`;

export const PRODUCT_LIST_FIELDS = `
  id
  handle
  title
  productType
  vendor
  availableForSale
  featuredImage {
    url
    altText
    width
    height
  }
  priceRange {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
  compareAtPriceRange {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
  variants(first: 2) {
    nodes {
      id
      title
      sku
      availableForSale
      price { amount currencyCode }
      compareAtPrice { amount currencyCode }
      selectedOptions { name value }
      image { url altText width height }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
`;

export const PRODUCTS_QUERY = `
  query ShopifyProducts($first: Int!, $after: String) {
    products(first: $first, after: $after, sortKey: TITLE) {
      nodes {
        ${PRODUCT_LIST_FIELDS}
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  query ShopifyProductByHandle($handle: String!) {
    product(handle: $handle) {
      ${PRODUCT_FIELDS}
    }
  }
`;

export const PRODUCT_VARIANTS_QUERY = `
  query ShopifyProductVariants($id: ID!, $first: Int!, $after: String) {
    node(id: $id) {
      ... on Product {
        variants(first: $first, after: $after) {
          nodes {
            id
            title
            sku
            availableForSale
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
            image {
              url
              altText
              width
              height
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    }
  }
`;

export const COLLECTIONS_QUERY = `
  query ShopifyCollections($first: Int!, $after: String) {
    collections(first: $first, after: $after, sortKey: TITLE) {
      nodes {
        id
        handle
        title
        description
        image {
          url
          altText
          width
          height
        }
        seo {
          title
          description
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const COLLECTION_BY_HANDLE_QUERY = `
  query ShopifyCollectionByHandle(
    $handle: String!
    $first: Int!
    $after: String
  ) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        url
        altText
        width
        height
      }
      seo {
        title
        description
      }
      products(first: $first, after: $after, sortKey: TITLE) {
        nodes {
          ${PRODUCT_LIST_FIELDS}
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
`;

export const COLLECTION_SEO_BY_HANDLE_QUERY = `
  query ShopifyCollectionSeoByHandle($handle: String!) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        url
        altText
        width
        height
      }
      seo {
        title
        description
      }
    }
  }
`;

export const SEARCH_PRODUCTS_QUERY = `
  query ShopifySearchProducts($query: String!, $first: Int!, $after: String) {
    search(query: $query, first: $first, after: $after, types: [PRODUCT]) {
      nodes {
        __typename
        ... on Product {
          ${PRODUCT_LIST_FIELDS}
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;
