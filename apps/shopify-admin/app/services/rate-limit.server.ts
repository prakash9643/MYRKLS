import { prisma } from "../db.server";

export async function enforceStoreRateLimit(
  shop: string,
  action: "connection-check" | "schema-status",
  limit = 20,
  windowMs = 60_000
): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowMs);
  const rows = (await prisma.$queryRaw`
    INSERT INTO "RateLimitBucket" ("shop", "action", "windowStartedAt", "requestCount", "expiresAt")
    VALUES (${shop}, ${action}, ${now}, 1, ${expiresAt})
    ON CONFLICT ("shop", "action") DO UPDATE SET
      "windowStartedAt" = CASE
        WHEN "RateLimitBucket"."expiresAt" <= ${now} THEN ${now}
        ELSE "RateLimitBucket"."windowStartedAt"
      END,
      "requestCount" = CASE
        WHEN "RateLimitBucket"."expiresAt" <= ${now} THEN 1
        ELSE "RateLimitBucket"."requestCount" + 1
      END,
      "expiresAt" = CASE
        WHEN "RateLimitBucket"."expiresAt" <= ${now} THEN ${expiresAt}
        ELSE "RateLimitBucket"."expiresAt"
      END
    RETURNING "requestCount"
  `) as Array<{ requestCount: number }>;

  const requestCount = rows[0]?.requestCount;
  if (typeof requestCount !== "number") {
    throw new Error("Rate limit storage did not return a request count.");
  }
  if (requestCount > limit) {
    throw new Response("Too many requests. Try again shortly.", {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(windowMs / 1000)) },
    });
  }
}
