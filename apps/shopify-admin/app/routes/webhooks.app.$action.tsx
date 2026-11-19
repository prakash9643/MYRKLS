import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { handleLifecycleWebhook } from "../services/session-lifecycle.server";

export async function action({ request }: ActionFunctionArgs) {
  const { topic, shop } = await authenticate.webhook(request);
  if (!shop) throw new Response("Webhook store context is missing.", { status: 400 });
  await handleLifecycleWebhook(topic, shop.toLowerCase());
  return new Response(null, { status: 200 });
}
