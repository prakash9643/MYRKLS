import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("auth/login", "routes/auth.login.tsx"),
  route("auth/*", "routes/auth.$.tsx"),
  route("app", "routes/app.tsx", [
    index("routes/app._index.tsx"),
    route("overview", "routes/app.overview.tsx"),
    route("connection", "routes/app.connection.tsx"),
    route("schema", "routes/app.schema.tsx"),
    route("page-builder", "routes/app.page-builder.tsx", [
      index("routes/app.page-builder._index.tsx"),
      route("new", "routes/app.page-builder.new.tsx"),
      route(":pageId", "routes/app.page-builder.$pageId.tsx"),
    ]),
    route("settings", "routes/app.settings.tsx"),
  ]),
  route("webhooks/app/:action", "routes/webhooks.app.$action.tsx"),
];
