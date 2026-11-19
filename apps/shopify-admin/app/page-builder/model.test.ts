import { describe, expect, it } from "vitest";
import { CMS_PAGE_TYPES, CMS_SECTION_TYPES, createInitialPageEditorState, createSectionDraft, deserializeEditorSnapshot, deserializePlainTextRichText, duplicateSection, moveSection, removeSection, serializeEditorSnapshot, serializePlainTextRichText, updateSectionValue, validatePageEditorState } from "./model";

describe("schema-backed page builder state", () => {
  it("uses only the section and page types defined by the Phase 2 manifest", () => {
    expect(CMS_SECTION_TYPES).toEqual([
      "hero",
      "science",
      "innovation",
      "protect",
      "testimonial",
      "faq",
      "image_grid",
      "product_feature",
    ]);
    expect(CMS_PAGE_TYPES).toEqual([
      "about",
      "campaign",
      "contact",
      "faq",
      "landing",
      "policy",
      "science",
    ]);
  });

  it("preserves stable IDs and exact order across insert, duplicate, move, and removal", () => {
    const hero = createSectionDraft("hero", "hero-id");
    const faq = createSectionDraft("faq", "faq-id", 1);
    const original = [hero, faq];
    const duplicated = duplicateSection(original, "hero-id", "hero-copy-id");

    expect(duplicated.map((section) => section.id)).toEqual(["hero-id", "hero-copy-id", "faq-id"]);
    expect(duplicated.map((section) => section.values.display_order)).toEqual(["0", "1", "2"]);

    const moved = moveSection(duplicated, "faq-id", 0);
    expect(moved.map((section) => section.id)).toEqual(["faq-id", "hero-id", "hero-copy-id"]);
    expect(moved.map((section) => section.values.display_order)).toEqual(["0", "1", "2"]);

    const removed = removeSection(moved, "hero-id");
    expect(removed.map((section) => section.id)).toEqual(["faq-id", "hero-copy-id"]);
    expect(removed.map((section) => section.values.display_order)).toEqual(["0", "1"]);
  });

  it("updates only the target section and rejects fields outside the schema", () => {
    const sections = [
      createSectionDraft("science", "science-id"),
      createSectionDraft("protect", "protect-id", 1),
    ];
    const changed = updateSectionValue(sections, "science-id", "heading", "Science story");

    expect(changed[0].values.heading).toBe("Science story");
    expect(changed[1]).toEqual(sections[1]);
    expect(() => updateSectionValue(changed, "science-id", "price", "10")).toThrow(
      'Unknown CMS section field "price".'
    );
    expect(() => createSectionDraft("hero", "", 0)).toThrow(
      "A section draft requires a stable client ID."
    );
  });

  it("round-trips an in-memory editor snapshot and rejects unknown schema fields", () => {
    const initial = createInitialPageEditorState();
    const state = {
      ...initial,
      handle: "our-science",
      values: { ...initial.values, title: "Our science" },
      sections: [createSectionDraft("science", "stable-science-id")],
    };

    expect(deserializeEditorSnapshot(serializeEditorSnapshot(state))).toEqual(state);

    const snapshot = JSON.parse(serializeEditorSnapshot(state)) as Record<string, unknown>;
    const values = snapshot.values as Record<string, unknown>;
    values.price = "10";
    expect(() => deserializeEditorSnapshot(JSON.stringify(snapshot))).toThrow(
      'Unknown CMS editor field "price".'
    );
  });

  it("serializes plain rich text without accepting executable markup", () => {
    const serialized = serializePlainTextRichText("First line\nSecond line");
    expect(JSON.parse(serialized)).toEqual({
      type: "root",
      children: [
        { type: "paragraph", children: [{ type: "text", value: "First line" }] },
        { type: "paragraph", children: [{ type: "text", value: "Second line" }] },
      ],
    });
    expect(deserializePlainTextRichText(serialized)).toBe("First line\nSecond line");
    expect(() =>
      deserializePlainTextRichText(JSON.stringify({
        type: "root",
        children: [{ type: "html", value: "<script>alert(1)</script>" }],
      }))
    ).toThrow("The Shopify rich-text value contains an unsupported node.");
  });

  it("validates the handle and requires a schema-valid page draft", () => {
    const initial = createInitialPageEditorState();
    const invalid = validatePageEditorState(initial);
    expect(invalid.some((issue) => issue.path === "title")).toBe(true);
    expect(invalid.some((issue) => issue.path === "handle")).toBe(true);
    expect(invalid.some((issue) => issue.path === "sections")).toBe(true);

    const valid = {
      ...initial,
      handle: "science-page",
      values: { ...initial.values, title: "Science page" },
      sections: [createSectionDraft("science", "science-id")],
    };
    expect(validatePageEditorState(valid)).toEqual([]);
  });

  it("rejects commerce values in editable section configuration", () => {
    const initial = createInitialPageEditorState();
    const state = {
      ...initial,
      handle: "science-page",
      values: { ...initial.values, title: "Science page" },
      sections: [
        {
          ...createSectionDraft("product_feature", "product-feature-id"),
          values: {
            ...createSectionDraft("product_feature", "product-feature-id").values,
            custom_config: JSON.stringify({ product: { price: "10.00" } }),
          },
        },
      ],
    };

    expect(validatePageEditorState(state)).toContainEqual({
      path: "sections.0.custom_config",
      message: "Commerce data such as prices, variants, inventory, availability, and checkout cannot be stored in CMS content.",
    });
  });
});
