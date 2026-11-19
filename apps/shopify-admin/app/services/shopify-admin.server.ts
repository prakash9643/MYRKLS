import { authenticate } from "../shopify.server";
import type {
  ShopifyMetaobjectDefinitionSnapshot,
  ShopifyMetafieldDefinitionSnapshot,
} from "../generated/cms-schema/types";

export type AdminGraphqlClient = Awaited<ReturnType<typeof authenticate.admin>>["admin"];

export type AdminApiErrorCode =
  | "AUTHENTICATION_ERROR"
  | "PERMISSION_ERROR"
  | "RATE_LIMITED"
  | "SHOPIFY_GRAPHQL_ERROR"
  | "INVALID_RESPONSE"
  | "NETWORK_ERROR";

const SAFE_ERROR_MESSAGES: Record<AdminApiErrorCode, string> = {
  AUTHENTICATION_ERROR: "Shopify requires the app to be reauthorized.",
  PERMISSION_ERROR: "Shopify denied the read request. Confirm the app's granted scopes.",
  RATE_LIMITED: "Shopify is temporarily rate-limiting requests. Try again shortly.",
  SHOPIFY_GRAPHQL_ERROR: "Shopify could not complete the read request.",
  INVALID_RESPONSE: "Shopify returned an unreadable response.",
  NETWORK_ERROR: "Shopify could not be reached. Try again shortly.",
};

export class AdminApiError extends Error {
  constructor(readonly code: AdminApiErrorCode) {
    super(SAFE_ERROR_MESSAGES[code]);
    this.name = "AdminApiError";
  }
}

export function safeAdminErrorMessage(error: unknown): string {
  return error instanceof AdminApiError
    ? SAFE_ERROR_MESSAGES[error.code]
    : "The Shopify Admin API request failed.";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function graphQLErrorCode(payload: Record<string, unknown>): AdminApiErrorCode {
  const errors = payload.errors;
  if (!Array.isArray(errors)) return "SHOPIFY_GRAPHQL_ERROR";

  const firstError = errors.find(isRecord);
  const extensions = firstError && isRecord(firstError.extensions) ? firstError.extensions : null;
  const code = extensions?.code;
  if (code === "ACCESS_DENIED") return "PERMISSION_ERROR";
  if (code === "THROTTLED") return "RATE_LIMITED";
  if (code === "UNAUTHORIZED") return "AUTHENTICATION_ERROR";
  return "SHOPIFY_GRAPHQL_ERROR";
}

async function queryData<T>(
  admin: AdminGraphqlClient,
  query: string,
  variables?: Record<string, string | null>
): Promise<T> {
  let response: Response;
  try {
    response = await admin.graphql(query, variables ? { variables } : undefined);
  } catch (error) {
    if (error instanceof TypeError) throw new AdminApiError("NETWORK_ERROR");
    throw error;
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new AdminApiError(response.status === 401 ? "AUTHENTICATION_ERROR" : "PERMISSION_ERROR");
    }
    if (response.status === 429) throw new AdminApiError("RATE_LIMITED");
    throw new AdminApiError("SHOPIFY_GRAPHQL_ERROR");
  }

  const payload: unknown = await response.json();
  if (!isRecord(payload)) throw new AdminApiError("INVALID_RESPONSE");
  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    throw new AdminApiError(graphQLErrorCode(payload));
  }
  if (!isRecord(payload.data)) throw new AdminApiError("INVALID_RESPONSE");
  return payload.data as T;
}

interface ShopQueryData {
  shop: {
    name: string;
    myshopifyDomain: string;
  };
}

export interface ShopDetails {
  name: string;
  myshopifyDomain: string;
}

export async function readShopDetails(admin: AdminGraphqlClient): Promise<ShopDetails> {
  const data = await queryData<ShopQueryData>(
    admin,
    `query CmsConnectionCheck { shop { name myshopifyDomain } }`
  );
  if (!data.shop?.name || !data.shop.myshopifyDomain) {
    throw new AdminApiError("INVALID_RESPONSE");
  }
  return data.shop;
}

interface DefinitionPage<T> {
  nodes: T[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

interface MetaobjectPageData {
  metaobjectDefinitions: DefinitionPage<ShopifyMetaobjectDefinitionSnapshot>;
}

interface MetafieldPageData {
  metafieldDefinitions: DefinitionPage<ShopifyMetafieldDefinitionSnapshot>;
}

const METAOBJECTS_QUERY = `query CmsMetaobjectDefinitions($after: String) {
  metaobjectDefinitions(first: 100, after: $after) {
    nodes {
      id type displayNameKey
      access { admin storefront }
      capabilities { publishable { enabled } }
      fieldDefinitions { key name type { name } required validations { name value } }
    }
    pageInfo { hasNextPage endCursor }
  }
}`;

const metafieldsQuery = (ownerType: "PRODUCT" | "COLLECTION") => `query Cms${ownerType}MetafieldDefinitions($after: String) {
  metafieldDefinitions(first: 100, ownerType: ${ownerType}, after: $after) {
    nodes {
      id ownerType namespace key name type { name }
      access { admin storefront }
      validations { name value }
    }
    pageInfo { hasNextPage endCursor }
  }
}`;

async function readAllMetaobjectDefinitions(
  admin: AdminGraphqlClient
): Promise<ShopifyMetaobjectDefinitionSnapshot[]> {
  const definitions: ShopifyMetaobjectDefinitionSnapshot[] = [];
  let cursor: string | null = null;
  do {
    const data: MetaobjectPageData = await queryData<MetaobjectPageData>(
      admin,
      METAOBJECTS_QUERY,
      { after: cursor }
    );
    definitions.push(...data.metaobjectDefinitions.nodes);
    cursor = data.metaobjectDefinitions.pageInfo.hasNextPage
      ? data.metaobjectDefinitions.pageInfo.endCursor
      : null;
    if (data.metaobjectDefinitions.pageInfo.hasNextPage && !cursor) {
      throw new AdminApiError("INVALID_RESPONSE");
    }
  } while (cursor);
  return definitions;
}

async function readAllMetafieldDefinitions(
  admin: AdminGraphqlClient,
  ownerType: "PRODUCT" | "COLLECTION"
): Promise<ShopifyMetafieldDefinitionSnapshot[]> {
  const definitions: ShopifyMetafieldDefinitionSnapshot[] = [];
  let cursor: string | null = null;
  do {
    const data: MetafieldPageData = await queryData<MetafieldPageData>(
      admin,
      metafieldsQuery(ownerType),
      { after: cursor }
    );
    definitions.push(...data.metafieldDefinitions.nodes);
    cursor = data.metafieldDefinitions.pageInfo.hasNextPage
      ? data.metafieldDefinitions.pageInfo.endCursor
      : null;
    if (data.metafieldDefinitions.pageInfo.hasNextPage && !cursor) {
      throw new AdminApiError("INVALID_RESPONSE");
    }
  } while (cursor);
  return definitions;
}

export async function readSchemaDefinitions(admin: AdminGraphqlClient): Promise<{
  metaobjects: ShopifyMetaobjectDefinitionSnapshot[];
  metafields: ShopifyMetafieldDefinitionSnapshot[];
}> {
  const [metaobjects, productMetafields, collectionMetafields] = await Promise.all([
    readAllMetaobjectDefinitions(admin),
    readAllMetafieldDefinitions(admin, "PRODUCT"),
    readAllMetafieldDefinitions(admin, "COLLECTION"),
  ]);
  return { metaobjects, metafields: [...productMetafields, ...collectionMetafields] };
}
