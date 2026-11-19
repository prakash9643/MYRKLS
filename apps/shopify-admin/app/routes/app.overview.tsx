import type { LoaderFunctionArgs } from "react-router";
import { requireAdmin } from "../services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  return null;
}

export default function WebsiteOverviewRoute() {
  return (
    <s-section heading="Website Overview">
      <s-paragraph>
        Website pages and sections will be managed here in a later CMS phase. No content editing or
        publishing is enabled in this phase.
      </s-paragraph>
    </s-section>
  );
}
