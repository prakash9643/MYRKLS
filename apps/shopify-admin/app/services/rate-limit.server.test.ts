import { beforeEach, describe, expect, it, vi } from "vitest";

const rateLimitMock = vi.hoisted(() => ({ queryRaw: vi.fn() }));
vi.mock("../db.server", () => ({ prisma: { $queryRaw: rateLimitMock.queryRaw } }));

import { prisma } from "../db.server";
import { enforceStoreRateLimit } from "./rate-limit.server";

const queryRaw = vi.mocked(prisma.$queryRaw);

beforeEach(() => queryRaw.mockReset());

describe("store-isolated request rate limit", () => {
  it("allows a request within the configured window", async () => {
    queryRaw.mockResolvedValue([{ requestCount: 1 }]);
    await expect(enforceStoreRateLimit("myrkls.myshopify.com", "schema-status")).resolves.toBeUndefined();
  });

  it("returns an explicit 429 after the per-store limit is exceeded", async () => {
    queryRaw.mockResolvedValue([{ requestCount: 21 }]);
    await expect(enforceStoreRateLimit("myrkls.myshopify.com", "schema-status"))
      .rejects.toMatchObject({ status: 429 });
  });

  it("fails closed if the persistent limiter returns no count", async () => {
    queryRaw.mockResolvedValue([]);
    await expect(enforceStoreRateLimit("myrkls.myshopify.com", "connection-check"))
      .rejects.toThrow("Rate limit storage did not return a request count.");
  });
});
