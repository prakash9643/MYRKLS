import { describe, expect, it, vi } from "vitest";

vi.mock("../shopify.server", () => ({ authenticate: { admin: vi.fn() } }));

import { requireAdmin, validateShopContext } from "./auth.server";

describe("Shopify Admin authentication boundary", () => {
  it.each([
    { scenario: "missing ID token", headers: undefined },
    { scenario: "invalid ID token", headers: { Authorization: "Bearer malformed" } },
    { scenario: "expired ID token", headers: { Authorization: "Bearer expired-placeholder" } },
  ])("rejects $scenario through Shopify's authenticator", async ({ headers }) => {
    const authFailure = new Error("Shopify rejected the authentication request.");
    const adminAuth = vi.fn(async (_request: Request) => {
      throw authFailure;
    });
    const request = new Request("https://admin.example.test/app?shop=myrkls.myshopify.com", {
      headers,
    });

    await expect(requireAdmin(request, adminAuth)).rejects.toThrow(authFailure.message);
    expect(adminAuth).toHaveBeenCalledWith(request);
  });

  it("rejects an invalid authenticated shop domain", () => {
    expect(() => validateShopContext("not-a-shop.example", "https://admin.example.test/app"))
      .toThrow("authenticated Shopify store context");
  });

  it("rejects a client shop parameter that differs from the authenticated session", () => {
    expect(() =>
      validateShopContext(
        "myrkls.myshopify.com",
        "https://admin.example.test/app?shop=other-store.myshopify.com"
      )
    ).toThrow("authenticated Shopify store context");
  });

  it("uses the authenticated session domain as the store identity", () => {
    expect(
      validateShopContext(
        "MYRKLS.myshopify.com",
        "https://admin.example.test/app?embedded=1"
      )
    ).toBe("myrkls.myshopify.com");
  });
});
