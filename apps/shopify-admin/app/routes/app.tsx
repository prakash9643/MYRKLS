import { NavMenu } from "@shopify/app-bridge-react";
import { Outlet, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { requireAdmin } from "../services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await requireAdmin(request);
  return {
    shop: session.shop,
    scopes: session.scope?.split(",").map((scope) => scope.trim()).filter(Boolean) ?? [],
    authenticated: true as const,
    installed: true as const,
  };
}

export default function AppLayout() {
  const data = useLoaderData<typeof loader>();
  return (
    <>
      <NavMenu>
        <a href="/app">Dashboard</a>
        <a href="/app/overview">Website Overview</a>
        <a href="/app/connection">CMS Connection</a>
        <a href="/app/schema">Schema Status</a>
        <a href="/app/page-builder">Page Builder</a>
        <a href="/app/settings">Settings</a>
      </NavMenu>
      <s-page heading="MYRKLS CMS">
        <s-section>
          <s-paragraph>
            Connected store: <span className="status-value">{data.shop}</span>
          </s-paragraph>
        </s-section>
        <Outlet />
      </s-page>
    </>
  );
}
