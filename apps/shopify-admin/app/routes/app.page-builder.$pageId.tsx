import { Link, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { requireAdmin } from "../services/auth.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  if (!params.pageId) throw new Response("A CMS page ID is required.", { status: 400 });
  return { pageId: params.pageId };
}

export default function ExistingPageBuilderRoute() {
  const { pageId } = useLoaderData<typeof loader>();
  return (
    <s-section heading="Edit CMS page">
      <div className="page-builder-blocked" role="status">
        <strong>This page has not been loaded or edited.</strong>
        <span>
          Authenticated CMS entry reads and the live schema are not verified. The requested ID
          <code>{pageId}</code> was not sent to Shopify, and no placeholder page data was created.
        </span>
      </div>
      <Link className="page-builder-button page-builder-button-secondary" to="/app/page-builder">
        Back to Page Builder
      </Link>
    </s-section>
  );
}
