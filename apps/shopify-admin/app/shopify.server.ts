import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { prisma } from "./db.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY ?? "",
  apiSecretKey: process.env.SHOPIFY_API_SECRET ?? "",
  appUrl: process.env.SHOPIFY_APP_URL ?? "",
  apiVersion: ApiVersion.October26,
  scopes: process.env.SCOPES?.split(",").map((scope) => scope.trim()).filter(Boolean),
  authPathPrefix: "/auth",
  distribution: AppDistribution.SingleMerchant,
  sessionStorage: new PrismaSessionStorage(prisma),
  future: {
    expiringOfflineAccessTokens: true,
  },
});

export const {
  addDocumentResponseHeaders,
  authenticate,
  login,
  sessionStorage,
} = shopify;
