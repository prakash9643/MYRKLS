import { beforeEach, describe, expect, it, vi } from "vitest";

const lifecycleMocks = vi.hoisted(() => ({
  findSessionsByShop: vi.fn(),
  deleteSessions: vi.fn(),
  deleteConnectionChecks: vi.fn(),
  deleteRateLimits: vi.fn(),
  pruneSessions: vi.fn(),
}));

vi.mock("../shopify.server", () => ({
  sessionStorage: {
    findSessionsByShop: lifecycleMocks.findSessionsByShop,
    deleteSessions: lifecycleMocks.deleteSessions,
  },
}));
vi.mock("../db.server", () => ({
  prisma: {
    session: { deleteMany: lifecycleMocks.pruneSessions },
    storeConnectionCheck: { deleteMany: lifecycleMocks.deleteConnectionChecks },
    rateLimitBucket: { deleteMany: lifecycleMocks.deleteRateLimits },
  },
}));

import { handleLifecycleWebhook, pruneExpiredSessions } from "./session-lifecycle.server";

beforeEach(() => {
  vi.clearAllMocks();
  lifecycleMocks.findSessionsByShop.mockResolvedValue([{ id: "offline-session" }, { id: "online-session" }]);
  lifecycleMocks.pruneSessions.mockResolvedValue({ count: 2 });
  lifecycleMocks.deleteSessions.mockResolvedValue(undefined);
  lifecycleMocks.deleteConnectionChecks.mockResolvedValue({ count: 1 });
  lifecycleMocks.deleteRateLimits.mockResolvedValue({ count: 1 });
});

describe("Shopify app lifecycle cleanup", () => {
  it("prunes expired sessions while retaining sessions with valid refresh tokens", async () => {
    const now = new Date("2026-11-17T10:00:00.000Z");
    await expect(pruneExpiredSessions(now)).resolves.toBe(2);
    expect(lifecycleMocks.pruneSessions).toHaveBeenCalledWith({
      where: {
        OR: [
          { refreshTokenExpires: { lt: now } },
          { expires: { lt: now }, refreshTokenExpires: null },
        ],
      },
    });
  });

  it("removes every shop session and cached status on uninstall", async () => {
    await handleLifecycleWebhook("APP_UNINSTALLED", "myrkls.myshopify.com");

    expect(lifecycleMocks.findSessionsByShop).toHaveBeenCalledWith("myrkls.myshopify.com");
    expect(lifecycleMocks.deleteSessions).toHaveBeenCalledWith(["offline-session", "online-session"]);
    expect(lifecycleMocks.deleteConnectionChecks).toHaveBeenCalledWith({
      where: { shop: "myrkls.myshopify.com" },
    });
  });

  it("handles duplicate lifecycle delivery idempotently", async () => {
    await handleLifecycleWebhook("APP_UNINSTALLED", "myrkls.myshopify.com");
    await handleLifecycleWebhook("APP_UNINSTALLED", "myrkls.myshopify.com");

    expect(lifecycleMocks.deleteSessions).toHaveBeenCalledTimes(2);
    expect(lifecycleMocks.deleteRateLimits).toHaveBeenCalledTimes(2);
  });

  it("invalidates sessions after scope changes so Shopify can reauthorize them", async () => {
    await handleLifecycleWebhook("APP_SCOPES_UPDATE", "myrkls.myshopify.com");
    expect(lifecycleMocks.deleteSessions).toHaveBeenCalledWith(["offline-session", "online-session"]);
  });

  it("rejects unrelated topics", async () => {
    await expect(handleLifecycleWebhook("PRODUCTS_UPDATE", "myrkls.myshopify.com"))
      .rejects.toMatchObject({ status: 400 });
    expect(lifecycleMocks.findSessionsByShop).not.toHaveBeenCalled();
  });
});
