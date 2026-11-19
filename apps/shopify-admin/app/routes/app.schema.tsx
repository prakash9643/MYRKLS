import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { CMS_SCHEMA_MANIFEST } from "../generated/cms-schema/manifest";
import { compareCmsSchema } from "../generated/cms-schema/comparison";
import { SUPPORTED_SHOPIFY_FIELD_TYPES } from "../generated/cms-schema/types";
import { requireAdmin } from "../services/auth.server";
import { enforceStoreRateLimit } from "../services/rate-limit.server";
import { AdminApiError, readSchemaDefinitions } from "../services/shopify-admin.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await requireAdmin(request);
  const shop = session.shop.toLowerCase();
  await enforceStoreRateLimit(shop, "schema-status");
  try {
    const actual = await readSchemaDefinitions(admin);
    const checks = compareCmsSchema(
      CMS_SCHEMA_MANIFEST.metaobjects,
      CMS_SCHEMA_MANIFEST.metafields,
      actual.metaobjects,
      actual.metafields,
      new Set<string>(SUPPORTED_SHOPIFY_FIELD_TYPES)
    );
    return {
      status: "verified" as const,
      checkedAt: new Date().toISOString(),
      total: CMS_SCHEMA_MANIFEST.metaobjects.length + CMS_SCHEMA_MANIFEST.metafields.length,
      metaobjectCount: CMS_SCHEMA_MANIFEST.metaobjects.length,
      metafieldCount: CMS_SCHEMA_MANIFEST.metafields.length,
      checks,
      message: null,
    };
  } catch (error) {
    if (!(error instanceof AdminApiError)) throw error;
    return {
      status: "error" as const,
      checkedAt: null,
      total: CMS_SCHEMA_MANIFEST.metaobjects.length + CMS_SCHEMA_MANIFEST.metafields.length,
      metaobjectCount: CMS_SCHEMA_MANIFEST.metaobjects.length,
      metafieldCount: CMS_SCHEMA_MANIFEST.metafields.length,
      checks: [],
      message: error.message,
    };
  }
}

export default function SchemaRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <s-section heading="Schema Status">
      <s-paragraph>
        {data.status === "verified"
          ? "Live Shopify definitions were read using this authenticated session. This dashboard is read-only."
          : "Live Shopify schema has not been verified."}
      </s-paragraph>
      <s-paragraph>
        Manifest: {data.metaobjectCount} Metaobjects, {data.metafieldCount} Metafields ({data.total} total)
      </s-paragraph>
      <s-paragraph>Last verified: {data.checkedAt ?? "Not yet verified"}</s-paragraph>
      {data.message ? <s-paragraph>{data.message}</s-paragraph> : null}
      {data.status === "verified" ? (
        <s-table>
          <s-table-header-row>
            <s-table-header>Definition</s-table-header>
            <s-table-header>Classification</s-table-header>
            <s-table-header>Details</s-table-header>
          </s-table-header-row>
          <s-table-body>
            {data.checks.map((check) => (
              <s-table-row key={`${check.kind}:${check.key}`}>
                <s-table-cell>{check.key}</s-table-cell>
                <s-table-cell>{check.classification}</s-table-cell>
                <s-table-cell>{check.details.join(" ")}</s-table-cell>
              </s-table-row>
            ))}
          </s-table-body>
        </s-table>
      ) : null}
      <s-paragraph>
        This app does not create, update, or delete Shopify schema definitions. Any schema changes
        remain subject to a separate owner-approved phase.
      </s-paragraph>
    </s-section>
  );
}
