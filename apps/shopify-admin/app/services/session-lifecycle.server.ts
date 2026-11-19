import { prisma } from "../db.server";
import { sessionStorage } from "../shopify.server";

export async function pruneExpiredSessions(now = new Date()): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: {
      OR: [
        { refreshTokenExpires: { lt: now } },
        { expires: { lt: now }, refreshTokenExpires: null },
      ],
    },
  });
  return result.count;
}

export async function clearShopSessions(shop: string): Promise<void> {
  const sessions = await sessionStorage.findSessionsByShop(shop);
  if (sessions.length > 0) {
    await sessionStorage.deleteSessions(sessions.map((session) => session.id));
  }
}

export async function handleLifecycleWebhook(
  topic: string,
  shop: string
): Promise<void> {
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(shop)) {
    throw new Response("Webhook store context is invalid.", { status: 400 });
  }
  if (topic !== "APP_UNINSTALLED" && topic !== "APP_SCOPES_UPDATE") {
    throw new Response("Unsupported webhook topic.", { status: 400 });
  }

  await clearShopSessions(shop);
  await Promise.all([
    prisma.storeConnectionCheck.deleteMany({ where: { shop } }),
    prisma.rateLimitBucket.deleteMany({ where: { shop } }),
  ]);
}
