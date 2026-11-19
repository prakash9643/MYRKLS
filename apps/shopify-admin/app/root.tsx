import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse, useRouteError } from "react-router";
import type { LinksFunction } from "react-router";
import stylesHref from "./styles.css?url";
import { LoadingState } from "./components/loading-state";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: stylesHref }];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link rel="stylesheet" href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;

  return (
    <s-page heading="MYRKLS CMS">
      <s-section heading="Unable to load this page">
        <s-paragraph>
          The request could not be completed. Refresh the app or reopen it from Shopify Admin.
          {status >= 500 ? " If the problem continues, contact the app administrator." : ""}
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export function HydrateFallback() {
  return <LoadingState />;
}
