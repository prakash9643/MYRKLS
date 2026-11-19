const CART_LINE_FIELDS = `
  id
  quantity
  merchandise {
    ... on ProductVariant {
      id
      title
      availableForSale
      selectedOptions {
        name
        value
      }
      product {
        id
        title
        handle
        vendor
        productType
        featuredImage {
          url
          altText
          width
          height
        }
      }
    }
  }
  cost {
    amountPerQuantity {
      amount
      currencyCode
    }
    totalAmount {
      amount
      currencyCode
    }
  }
`;

export const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount {
      amount
      currencyCode
    }
    totalAmount {
      amount
      currencyCode
    }
    subtotalAmountEstimated
    totalAmountEstimated
  }
  lines(first: 250) {
    nodes {
      ${CART_LINE_FIELDS}
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
`;

export const CART_QUERY = `
  query ShopifyCart($id: ID!, $first: Int!, $after: String) {
    cart(id: $id) {
      id
      checkoutUrl
      totalQuantity
      cost {
        subtotalAmount {
          amount
          currencyCode
        }
        totalAmount {
          amount
          currencyCode
        }
        subtotalAmountEstimated
        totalAmountEstimated
      }
      lines(first: $first, after: $after) {
        nodes {
          ${CART_LINE_FIELDS}
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

export const SHOP_PRIMARY_DOMAIN_QUERY = `
  query ShopifyPrimaryDomain {
    shop {
      primaryDomain {
        host
      }
    }
  }
`;

export const CART_CREATE_MUTATION = `
  mutation ShopifyCartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        ${CART_FIELDS}
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;

export const CART_LINES_ADD_MUTATION = `
  mutation ShopifyCartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ${CART_FIELDS}
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION = `
  mutation ShopifyCartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ${CART_FIELDS}
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;

export const CART_LINES_REMOVE_MUTATION = `
  mutation ShopifyCartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ${CART_FIELDS}
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;
