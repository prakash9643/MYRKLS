import { beforeEach, describe, expect, it, vi } from "vitest";

const webhookMocks = vi.hoisted(() => ({
  authenticateWebhook: vi.fn(),
  handleLifecycleWebhook: vi.fn(),
}));

vi.mock("../shopify.server", () => ({
  authenticate: { webhook: webhookMocks.authenticateWebhook },
}));
vi.mock("../services/session-lifecycle.server", () => ({
  handleLifecycleWebhook: webhookMocks.handleLifecycleWebhook,
}));

import { action } from "./webhooks.app.$action";

beforeEach(() => {
  vi.clearAllMocks();
  webhookMocks.handleLifecycleWebhook.mockResolvedValue(undefined);
});

describe("lifecycle webhook route", () => {
  it("accepts a request only after the Shopify authenticator validates it", async () => {
    webhookMocks.authenticateWebhook.mockResolvedValue({
      topic: "APP_UNINSTALLED",
      shop: "myrkls.myshopify.com",
    });
    const request = new Request("https://cms.example.test/webhooks/app/uninstalled", { method: "POST" });
    const response = await action({
      request,
      params: { action: "uninstalled" },
      context: {},
      url: new URL(request.url),
      pattern: "/webhooks/app/:action",
    });

    expect(response.status).toBe(200);
    expect(webhookMocks.handleLifecycleWebhook).toHaveBeenCalledWith(
      "APP_UNINSTALLED",
      "myrkls.myshopify.com"
    );
  });

  it("propagates Shopify signature validation failures without processing", async () => {
    const invalidSignature = new Response("Unauthorized", { status: 401 });
    webhookMocks.authenticateWebhook.mockRejectedValue(invalidSignature);

    const request = new Request("https://cms.example.test/webhooks/app/uninstalled", { method: "POST" });
    await expect(action({
      request,
      params: { action: "uninstalled" },
      context: {},
      url: new URL(request.url),
      pattern: "/webhooks/app/:action",
    })).rejects.toBe(invalidSignature);
    expect(webhookMocks.handleLifecycleWebhook).not.toHaveBeenCalled();
  });
});
