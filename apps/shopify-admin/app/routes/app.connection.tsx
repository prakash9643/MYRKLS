import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { requireAdmin } from "../services/auth.server";
import { enforceStoreRateLimit } from "../services/rate-limit.server";
import { checkStoreConnection } from "../services/store.server";

function configuredScopes(): string[] {
  return process.env.SCOPES?.split(",").map((scope) => scope.trim()).filter(Boolean) ?? [];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await requireAdmin(request);
  const shop = session.shop.toLowerCase();
  await enforceStoreRateLimit(shop, "connection-check");
  const connection = await checkStoreConnection(admin, shop);
  const requiredScopes = configuredScopes();
  const grantedScopes = session.scope?.split(",").map((scope) => scope.trim()).filter(Boolean) ?? [];
  return {
    connection,
    authenticated: true as const,
    requiredScopes,
    grantedScopes,
    scopesMatch: requiredScopes.length > 0 && requiredScopes.every((scope) => grantedScopes.includes(scope)),
  };
}

export default function ConnectionRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <s-section heading="CMS Connection">
      <s-paragraph>Store: {data.connection.shop}</s-paragraph>
      <s-paragraph>Authenticated session: {data.authenticated ? "Active" : "Unavailable"}</s-paragraph>
      <s-paragraph>Admin API connection: {data.connection.status}</s-paragraph>
      <s-paragraph>API version: {data.connection.apiVersion}</s-paragraph>
      <s-paragraph>
        Last successful check: {data.connection.lastSuccessfulAt ?? "Not yet verified"}
      </s-paragraph>
      {data.connection.message ? <s-paragraph>{data.connection.message}</s-paragraph> : null}
      <s-section heading="Required scopes">
        {data.requiredScopes.length ? (
          <s-unordered-list>
            {data.requiredScopes.map((scope) => <s-list-item key={scope}>{scope}</s-list-item>)}
          </s-unordered-list>
        ) : (
          <s-paragraph>Required scopes are unavailable until the Shopify app configuration is linked.</s-paragraph>
        )}
      </s-section>
      <s-section heading="Granted scopes">
        {data.grantedScopes.length ? (
          <s-unordered-list>
            {data.grantedScopes.map((scope) => <s-list-item key={scope}>{scope}</s-list-item>)}
          </s-unordered-list>
        ) : (
          <s-paragraph>No scopes were recorded in this session.</s-paragraph>
        )}
        <s-paragraph>
          {data.scopesMatch ? "Required scopes are granted." : "Required scopes are not yet confirmed."}
        </s-paragraph>
      </s-section>
    </s-section>
  );
}
