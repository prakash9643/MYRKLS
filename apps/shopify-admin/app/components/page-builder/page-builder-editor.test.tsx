import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PageBuilderEditor } from "./page-builder-editor";

const navigate = vi.fn();

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    useNavigate: () => navigate,
    useBlocker: () => ({ state: "unblocked", proceed: () => undefined, reset: () => undefined }),
  };
});

describe("PageBuilderEditor", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    navigate.mockReset();
  });

  it("keeps local edits explicit and never reports a Shopify save", () => {
    render(<PageBuilderEditor />);

    expect(screen.getByText("Shopify page editing is blocked.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Save Draft" })).toHaveProperty("disabled", true);
    expect(screen.getByText(/Your page starts here/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Add Science Section" }));

    expect(screen.getByRole("button", { name: "Save Draft" })).toHaveProperty("disabled", true);
    expect(screen.getByText("Unsaved local draft")).toBeTruthy();
    expect(screen.getByRole("textbox", { name: /heading Maximum 160 characters/ })).toBeTruthy();
  });

  it("updates the selected section preview and page handle in local state", () => {
    render(<PageBuilderEditor />);

    fireEvent.change(screen.getAllByRole("textbox", { name: "Page title" })[0], {
      target: { value: "Our science" },
    });
    fireEvent.change(screen.getAllByLabelText(/URL handle/)[0], {
      target: { value: "our-science" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Science Section" }));
    fireEvent.change(screen.getByRole("textbox", { name: /heading Maximum 160 characters/ }), {
      target: { value: "Science, thoughtfully made" },
    });

    expect(screen.getAllByText("/pages/our-science")).toHaveLength(2);
    expect(screen.getByText("Science, thoughtfully made")).toBeTruthy();
    expect(screen.getByText("Save Draft is disabled. Local changes are not persisted to Shopify or browser storage.")).toBeTruthy();
    expect(navigate).not.toHaveBeenCalled();
  });
});
