import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoadingState } from "./loading-state";

describe("embedded loading state", () => {
  it("renders an accessible loading indicator", () => {
    render(<LoadingState />);
    expect(screen.getByRole("status", { name: "Loading MYRKLS CMS" })).toBeTruthy();
  });
});
