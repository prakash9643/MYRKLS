import { CMS_SCHEMA_MANIFEST } from "../generated/cms-schema/manifest";
import { prisma } from "../db.server";
import {
  AdminApiError,
  readShopDetails,
  safeAdminErrorMessage,
  type AdminGraphqlClient,
} from "./shopify-admin.server";

export interface StoreConnectionStatus {
  status: "connected" | "error";
  storeName: string;
  shop: string;
  apiVersion: string;
  lastSuccessfulAt: string | null;
  message: string | null;
}

export async function checkStoreConnection(
  admin: AdminGraphqlClient,
  shop: string
): Promise<StoreConnectionStatus> {
  const apiVersion = CMS_SCHEMA_MANIFEST.apiVersion;
  const checkedAt = new Date();

  try {
    const store = await readShopDetails(admin);
    if (store.myshopifyDomain.toLowerCase() !== shop.toLowerCase()) {
      throw new AdminApiError("INVALID_RESPONSE");
    }
    const record = await prisma.storeConnectionCheck.upsert({
      where: { shop },
      create: {
        shop,
        storeName: store.name,
        myshopifyDomain: store.myshopifyDomain,
        apiVersion,
        lastAttemptAt: checkedAt,
        lastSuccessfulAt: checkedAt,
        lastError: null,
      },
      update: {
        storeName: store.name,
        myshopifyDomain: store.myshopifyDomain,
        apiVersion,
        lastAttemptAt: checkedAt,
        lastSuccessfulAt: checkedAt,
        lastError: null,
      },
    });
    return {
      status: "connected",
      storeName: record.storeName,
      shop: record.myshopifyDomain,
      apiVersion: record.apiVersion,
      lastSuccessfulAt: record.lastSuccessfulAt?.toISOString() ?? null,
      message: null,
    };
  } catch (error) {
    if (!(error instanceof AdminApiError)) throw error;

    const record = await prisma.storeConnectionCheck.upsert({
      where: { shop },
      create: {
        shop,
        storeName: shop,
        myshopifyDomain: shop,
        apiVersion,
        lastAttemptAt: checkedAt,
        lastSuccessfulAt: null,
        lastError: error.code,
      },
      update: {
        apiVersion,
        lastAttemptAt: checkedAt,
        lastError: error.code,
      },
    });
    return {
      status: "error",
      storeName: record.storeName,
      shop: record.myshopifyDomain,
      apiVersion: record.apiVersion,
      lastSuccessfulAt: record.lastSuccessfulAt?.toISOString() ?? null,
      message: safeAdminErrorMessage(error),
    };
  }
}

export async function getLastConnectionCheck(shop: string) {
  return prisma.storeConnectionCheck.findUnique({ where: { shop } });
}
