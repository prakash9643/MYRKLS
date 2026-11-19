import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { CMS_SCHEMA_MANIFEST } from "../generated/cms-schema/manifest";
import { SUPPORTED_SHOPIFY_FIELD_TYPES } from "../generated/cms-schema/types";
import { requireAdmin } from "../services/auth.server";
import { enforceStoreRateLimit } from "../services/rate-limit.server";
import { compareCmsSchema } from "../generated/cms-schema/comparison";
import { AdminApiError, readSchemaDefinitions } from "../services/shopify-admin.server";
import { checkStoreConnection } from "../services/store.server";
import { DashboardView } from "../components/dashboard-view";
import type { DashboardSchemaStatus } from "../components/dashboard-view";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await requireAdmin(request);
  const shop = session.shop.toLowerCase();
  await enforceStoreRateLimit(shop, "connection-check");
  const connection = await checkStoreConnection(admin, shop);
  await enforceStoreRateLimit(shop, "schema-status");

  let schema: DashboardSchemaStatus;
  try {
    const actual = await readSchemaDefinitions(admin);
    const checks = compareCmsSchema(
      CMS_SCHEMA_MANIFEST.metaobjects,
      CMS_SCHEMA_MANIFEST.metafields,
      actual.metaobjects,
      actual.metafields,
      new Set<string>(SUPPORTED_SHOPIFY_FIELD_TYPES)
    );
    const createCount = checks.filter((check) => check.classification === "CREATE").length;
    const incompatibleCount = checks.filter((check) => check.classification === "INCOMPATIBLE").length;
    const reviewCount = checks.filter((check) => check.classification === "REQUIRES_REVIEW").length;
    const skippedCount = checks.filter((check) => check.classification === "SKIPPED").length;
    const hasDifferences = createCount + incompatibleCount + reviewCount + skippedCount > 0;
    schema = {
      status: hasDifferences ? "review" : "verified",
      total: CMS_SCHEMA_MANIFEST.metaobjects.length + CMS_SCHEMA_MANIFEST.metafields.length,
      metaobjectCount: CMS_SCHEMA_MANIFEST.metaobjects.length,
      metafieldCount: CMS_SCHEMA_MANIFEST.metafields.length,
      createCount,
      incompatibleCount,
      reviewCount,
      skippedCount,
      checkedAt: new Date().toISOString(),
      message: null,
    };
  } catch (error) {
    if (!(error instanceof AdminApiError)) throw error;
    schema = {
      status: "error",
      total: CMS_SCHEMA_MANIFEST.metaobjects.length + CMS_SCHEMA_MANIFEST.metafields.length,
      metaobjectCount: CMS_SCHEMA_MANIFEST.metaobjects.length,
      metafieldCount: CMS_SCHEMA_MANIFEST.metafields.length,
      createCount: 0,
      incompatibleCount: 0,
      reviewCount: 0,
      skippedCount: 0,
      checkedAt: null,
      message: error.message,
    };
  }

  return { connection, schema, scopes: session.scope?.split(",").map((scope) => scope.trim()).filter(Boolean) ?? [] };
}

export default function DashboardRoute() {
  const data = useLoaderData<typeof loader>();
  return <DashboardView {...data} />;
}
