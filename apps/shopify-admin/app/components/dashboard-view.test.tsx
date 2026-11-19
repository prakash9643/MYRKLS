import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardView } from "./dashboard-view";
import type { DashboardSchemaStatus } from "./dashboard-view";
import type { StoreConnectionStatus } from "../services/store.server";

const connection: StoreConnectionStatus = {
  status: "connected",
  storeName: "MYRKLS",
  shop: "myrkls.myshopify.com",
  apiVersion: "2026-10",
  lastSuccessfulAt: "2026-11-17T10:00:00.000Z",
  message: null,
};

const verifiedSchema: DashboardSchemaStatus = {
  status: "verified",
  total: 22,
  metaobjectCount: 12,
  metafieldCount: 10,
  createCount: 0,
  incompatibleCount: 0,
  reviewCount: 0,
  skippedCount: 0,
  checkedAt: "2026-11-17T10:00:00.000Z",
  message: null,
};

describe("embedded dashboard states", () => {
  it("shows authenticated store and read-only schema state", () => {
    render(<DashboardView connection={connection} schema={verifiedSchema} scopes={["read_metaobject_definitions"]} />);

    expect(screen.getByText("myrkls.myshopify.com")).toBeTruthy();
    expect(screen.getByText("Authenticated merchant session")).toBeTruthy();
    expect(screen.getByText(/Live schema read completed/)).toBeTruthy();
    expect(screen.getByText("read_metaobject_definitions")).toBeTruthy();
  });

  it("shows connection and schema errors without exposing sensitive data", () => {
    const failedConnection = {
      ...connection,
      status: "error" as const,
      message: "Shopify denied the read request. Confirm the app's granted scopes.",
    };
    const failedSchema = { ...verifiedSchema, status: "error" as const, message: "Permission denied." };
    render(<DashboardView connection={failedConnection} schema={failedSchema} scopes={[]} />);

    expect(screen.getByText("Not connected")).toBeTruthy();
    expect(screen.getByText("Live schema status is unavailable.")).toBeTruthy();
    expect(screen.getByText("Permission denied.")).toBeTruthy();
  });
});
