import { PassThrough } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter } from "react-router";
import type { EntryContext } from "react-router";
import { isbot } from "isbot";
import { addDocumentResponseHeaders } from "./shopify.server";

export const streamTimeout = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext
): Promise<Response> {
  addDocumentResponseHeaders(request, responseHeaders);
  responseHeaders.set("X-Content-Type-Options", "nosniff");
  responseHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
  responseHeaders.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production" && new URL(request.url).protocol === "https:") {
    responseHeaders.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  const callbackName = isbot(request.headers.get("user-agent") ?? "")
    ? "onAllReady"
    : "onShellReady";

  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        [callbackName]: () => {
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html; charset=utf-8");
          resolve(new Response(stream, { headers: responseHeaders, status: responseStatusCode }));
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError() {
          responseStatusCode = 500;
          console.error("MYRKLS CMS server rendering failed; request details were omitted.");
        },
      }
    );

    setTimeout(abort, streamTimeout + 1_000);
  });
}
