export const METAOBJECTS_QUERY = `
  query ShopifyMetaobjects($type: String!, $first: Int!, $after: String) {
    metaobjects(type: $type, first: $first, after: $after) {
      nodes {
        id
        type
        handle
        fields {
          key
          type
          value
          reference {
            __typename
            ... on MediaImage {
              id
              image {
                url
                altText
                width
                height
              }
            }
            ... on GenericFile {
              id
              url
              mimeType
            }
            ... on Metaobject {
              id
              type
              handle
            }
            ... on Product {
              id
              handle
              title
            }
            ... on Collection {
              id
              handle
              title
            }
            ... on Page {
              id
              handle
              title
            }
          }
          references(first: 50) {
            nodes {
              __typename
              ... on MediaImage {
                id
                image {
                  url
                  altText
                  width
                  height
                }
              }
              ... on GenericFile {
                id
                url
                mimeType
              }
              ... on Metaobject {
                id
                type
                handle
              }
              ... on Product {
                id
                handle
                title
              }
              ... on Collection {
                id
                handle
                title
              }
              ... on Page {
                id
                handle
                title
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
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

export const METAOBJECT_BY_HANDLE_QUERY = `
  query ShopifyMetaobjectByHandle($type: String!, $handle: String!) {
    metaobject(handle: $handle, type: $type) {
      id
      type
      handle
      fields {
        key
        type
        value
        reference {
          __typename
          ... on MediaImage {
            id
            image {
              url
              altText
              width
              height
            }
          }
          ... on GenericFile {
            id
            url
            mimeType
          }
          ... on Metaobject {
            id
            type
            handle
          }
          ... on Product {
            id
            handle
            title
          }
          ... on Collection {
            id
            handle
            title
          }
          ... on Page {
            id
            handle
            title
          }
        }
        references(first: 50) {
          nodes {
            __typename
            ... on MediaImage {
              id
              image {
                url
                altText
                width
                height
              }
            }
            ... on GenericFile {
              id
              url
              mimeType
            }
            ... on Metaobject {
              id
              type
              handle
            }
            ... on Product {
              id
              handle
              title
            }
            ... on Collection {
              id
              handle
              title
            }
            ... on Page {
              id
              handle
              title
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  }
`;
