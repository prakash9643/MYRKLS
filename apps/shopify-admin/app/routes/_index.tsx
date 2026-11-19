import { Form, redirect, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { login } from "../shopify.server";

export function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  if (url.searchParams.has("shop")) {
    throw redirect(`/app${url.search}`);
  }
  return { showLogin: Boolean(login) };
}

export default function IndexRoute() {
  const { showLogin } = useLoaderData<typeof loader>();
  return (
    <s-page heading="MYRKLS CMS">
      <s-section heading="Manage your MYRKLS website">
        <s-paragraph>
          MYRKLS CMS provides a secure, read-only connection to your Shopify store. Content editing
          will be introduced in later phases.
        </s-paragraph>
        {showLogin ? (
          <Form method="post" action="/auth/login">
            <label>
              Shopify store domain
              <input autoComplete="url" name="shop" placeholder="your-store.myshopify.com" required />
            </label>
            <button type="submit">Continue to Shopify authentication</button>
          </Form>
        ) : null}
      </s-section>
    </s-page>
  );
}
