import { authenticate } from "../shopify.server";
import { pruneExpiredSessions } from "./session-lifecycle.server";

const SHOP_DOMAIN_PATTERN = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i;

export class ShopContextError extends Error {
  readonly status = 403;

  constructor() {
    super("The authenticated Shopify store context is invalid or does not match this request.");
    this.name = "ShopContextError";
  }
}

export function validateShopContext(sessionShop: string, requestUrl: string): string {
  const normalizedShop = sessionShop.toLowerCase();
  if (!SHOP_DOMAIN_PATTERN.test(normalizedShop)) throw new ShopContextError();

  const requestedShop = new URL(requestUrl).searchParams.get("shop");
  if (requestedShop && requestedShop.toLowerCase() !== normalizedShop) {
    throw new ShopContextError();
  }

  return normalizedShop;
}

export async function requireAdmin(
  request: Request,
  adminAuthenticator: typeof authenticate.admin = authenticate.admin
) {
  const context = await adminAuthenticator(request);
  validateShopContext(context.session.shop, request.url);
  await pruneExpiredSessions();
  return context;
}
