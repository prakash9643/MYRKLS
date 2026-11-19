import { describe, expect, it, vi } from "vitest";
import type { AdminGraphqlClient } from "./shopify-admin.server";
import {
  AdminApiError,
  readShopDetails,
  safeAdminErrorMessage,
} from "./shopify-admin.server";

function createAdmin(response: Response): { admin: AdminGraphqlClient; graphql: ReturnType<typeof vi.fn> } {
  const graphql = vi.fn(async () => response);
  return { admin: { graphql }, graphql };
}

describe("read-only Shopify Admin API service", () => {
  it("reads only the authenticated store identity with a fixed query", async () => {
    const { admin, graphql } = createAdmin(
      Response.json({ data: { shop: { name: "MYRKLS", myshopifyDomain: "myrkls.myshopify.com" } } })
    );

    await expect(readShopDetails(admin)).resolves.toEqual({
      name: "MYRKLS",
      myshopifyDomain: "myrkls.myshopify.com",
    });
    expect(graphql).toHaveBeenCalledWith(
      "query CmsConnectionCheck { shop { name myshopifyDomain } }",
      undefined
    );
  });

  it("classifies denied API access without exposing upstream details", async () => {
    const { admin } = createAdmin(
      Response.json({
        errors: [{ message: "shpat_sensitive_value", extensions: { code: "ACCESS_DENIED" } }],
      })
    );

    await expect(readShopDetails(admin)).rejects.toMatchObject({
      code: "PERMISSION_ERROR",
      message: "Shopify denied the read request. Confirm the app's granted scopes.",
    });
    expect(safeAdminErrorMessage(new Error("shpat_sensitive_value"))).not.toContain("shpat_");
  });

  it("rejects malformed or unsuccessful responses explicitly", async () => {
    const { admin } = createAdmin(Response.json({ data: null }));
    await expect(readShopDetails(admin)).rejects.toBeInstanceOf(AdminApiError);
  });
});
