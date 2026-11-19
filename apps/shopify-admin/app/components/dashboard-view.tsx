import type { StoreConnectionStatus } from "../services/store.server";

export interface DashboardSchemaStatus {
  status: "verified" | "review" | "error";
  total: number;
  metaobjectCount: number;
  metafieldCount: number;
  createCount: number;
  incompatibleCount: number;
  reviewCount: number;
  skippedCount: number;
  checkedAt: string | null;
  message: string | null;
}

export function DashboardView({
  connection,
  schema,
  scopes,
}: {
  connection: StoreConnectionStatus;
  schema: DashboardSchemaStatus;
  scopes: string[];
}) {
  return (
    <>
      <s-section heading="Dashboard">
        <div className="status-grid">
          <s-section heading="Store">
            <s-paragraph><span className="status-value">{connection.storeName}</span></s-paragraph>
            <s-paragraph><span className="status-value">{connection.shop}</span></s-paragraph>
          </s-section>
          <s-section heading="Authentication">
            <s-paragraph>Authenticated merchant session</s-paragraph>
            <s-paragraph>App installation is active</s-paragraph>
          </s-section>
          <s-section heading="Admin API connection">
            <s-paragraph>{connection.status === "connected" ? "Connected" : "Not connected"}</s-paragraph>
            {connection.message ? <s-paragraph>{connection.message}</s-paragraph> : null}
            <s-paragraph>API version: {connection.apiVersion}</s-paragraph>
            <s-paragraph>
              Last successful check: {connection.lastSuccessfulAt ?? "Not yet verified"}
            </s-paragraph>
          </s-section>
          <s-section heading="CMS schema">
            <s-paragraph>
              {schema.status === "verified"
                ? "Live schema read completed; this app has not changed definitions."
                : schema.status === "review"
                  ? "Schema differences need review; no changes were made."
                  : "Live schema status is unavailable."}
            </s-paragraph>
            <s-paragraph>
              {schema.metaobjectCount} Metaobject and {schema.metafieldCount} Metafield definitions
              in the local manifest ({schema.total} total).
            </s-paragraph>
            {schema.message ? <s-paragraph>{schema.message}</s-paragraph> : null}
          </s-section>
        </div>
      </s-section>
      <s-section heading="Granted scopes">
        {scopes.length > 0 ? (
          <s-unordered-list>
            {scopes.map((scope) => <s-list-item key={scope}>{scope}</s-list-item>)}
          </s-unordered-list>
        ) : (
          <s-paragraph>Scope details are not present in the authenticated session.</s-paragraph>
        )}
      </s-section>
    </>
  );
}
