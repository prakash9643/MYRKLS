import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { CMS_SCHEMA_MANIFEST } from "../generated/cms-schema/manifest";
import { requireAdmin } from "../services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await requireAdmin(request);
  return {
    shop: session.shop,
    apiVersion: CMS_SCHEMA_MANIFEST.apiVersion,
    appUrl: process.env.SHOPIFY_APP_URL ? new URL(process.env.SHOPIFY_APP_URL).origin : null,
  };
}

export default function SettingsRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <s-section heading="Settings">
      <s-paragraph>Store: {data.shop}</s-paragraph>
      <s-paragraph>Shopify Admin API version: {data.apiVersion}</s-paragraph>
      <s-paragraph>Embedded app URL: {data.appUrl ?? "Not configured"}</s-paragraph>
      <s-paragraph>
        Sessions are stored server-side in PostgreSQL. App secrets and session tokens are never
        displayed in the dashboard.
      </s-paragraph>
    </s-section>
  );
}
