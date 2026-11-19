import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { useBlocker, useNavigate } from "react-router";
import {
  CMS_PAGE_DEFINITION,
  CMS_PAGE_TYPES,
  CMS_SECTION_DEFINITION,
  CMS_SECTION_TYPES,
  createInitialPageEditorState,
  createSectionDraft,
  duplicateSection,
  moveSection,
  removeSection,
  serializeEditorSnapshot,
  updateSectionValue,
  validatePageEditorState,
} from "../../page-builder/model";
import type { CmsSectionType, EditorFieldValue, EditorSection, PageEditorState } from "../../page-builder/model";
import type { CmsFieldDefinition } from "../../generated/cms-schema/types";

type SectionCategory = "All" | "Editorial" | "Visual" | "Trust" | "Commerce";

const SECTION_CARDS: Record<
  CmsSectionType,
  { title: string; description: string; category: Exclude<SectionCategory, "All"> }
> = {
  hero: {
    title: "Hero Banner",
    description: "An opening editorial panel with approved copy and media fields.",
    category: "Visual",
  },
  science: {
    title: "Science Section",
    description: "A structured editorial section for science-led content.",
    category: "Editorial",
  },
  innovation: {
    title: "Innovation Section",
    description: "A reusable story block for innovation content.",
    category: "Editorial",
  },
  protect: {
    title: "Protect Section",
    description: "A reusable editorial block for protection content.",
    category: "Editorial",
  },
  testimonial: {
    title: "Testimonial",
    description: "A content block for owner-approved testimonial copy.",
    category: "Trust",
  },
  faq: {
    title: "FAQ",
    description: "A content block for an approved FAQ section.",
    category: "Trust",
  },
  image_grid: {
    title: "Image Grid",
    description: "A visual block; Shopify image selection is not connected yet.",
    category: "Visual",
  },
  product_feature: {
    title: "Product Feature",
    description: "Editorial presentation only; commerce data stays in Shopify.",
    category: "Commerce",
  },
};

const SECTION_CATEGORIES: SectionCategory[] = ["All", "Editorial", "Visual", "Trust", "Commerce"];
const MAX_DISPLAY_ORDER = 9999;

function createClientId(): string {
  if (!globalThis.crypto?.randomUUID) {
    throw new Error("Secure random IDs are unavailable in this browser.");
  }
  return globalThis.crypto.randomUUID();
}

function labelForValue(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function maxLengthFor(field: CmsFieldDefinition): number | undefined {
  const maximum = field.validations?.find((validation) => validation.name === "max")?.value;
  return maximum === undefined ? undefined : Number(maximum);
}

function fieldValue(values: Record<string, EditorFieldValue>, key: string): string | boolean {
  const value = values[key];
  if (value === undefined) throw new Error(`The editor is missing schema field "${key}".`);
  return value;
}

function PageFields({
  state,
  onChange,
}: {
  state: PageEditorState;
  onChange: (field: string, value: EditorFieldValue) => void;
}) {
  return (
    <div className="page-builder-settings">
      <label className="page-builder-field">
        <span>Page title <strong aria-hidden="true">*</strong></span>
        <input
          autoComplete="off"
          maxLength={160}
          name="title"
          value={String(state.values.title ?? "")}
          onChange={(event) => onChange("title", event.currentTarget.value)}
        />
        <small>Required by the cms_page definition. Maximum 160 characters.</small>
      </label>
      <label className="page-builder-field">
        <span>URL handle <strong aria-hidden="true">*</strong></span>
        <div className="page-builder-handle">
          <span aria-hidden="true">/pages/</span>
          <input
            autoComplete="off"
            name="handle"
            value={state.handle}
            onChange={(event) => onChange("handle", event.currentTarget.value)}
          />
        </div>
        <small>The handle is Shopify's native Metaobject entry handle.</small>
      </label>
      <label className="page-builder-field">
        <span>Page type <strong aria-hidden="true">*</strong></span>
        <select
          name="page_type"
          value={String(state.values.page_type ?? "")}
          onChange={(event) => onChange("page_type", event.currentTarget.value)}
        >
          {CMS_PAGE_TYPES.map((pageType) => (
            <option key={pageType} value={pageType}>{labelForValue(pageType)}</option>
          ))}
        </select>
      </label>
      <label className="page-builder-field">
        <span>Template</span>
        <select aria-describedby="page-builder-template-help" disabled value="">
          <option value="">Unavailable until Shopify page/template reads are approved</option>
        </select>
        <small id="page-builder-template-help">
          No live templates are loaded or represented with sample data.
        </small>
      </label>
      <h3>Search and social</h3>
      {CMS_PAGE_DEFINITION.fields
        .filter((field) => ["seo_title", "seo_description", "seo_keywords", "canonical_url"].includes(field.key))
        .map((field) => {
          const value = fieldValue(state.values, field.key);
          const maxLength = maxLengthFor(field);
          const isMultiline = field.type === "multi_line_text_field" || field.type === "list.single_line_text_field";
          return (
            <label className="page-builder-field" key={field.key}>
              <span>{labelForValue(field.key)}</span>
              {isMultiline ? (
                <textarea
                  maxLength={maxLength}
                  name={field.key}
                  rows={field.key === "seo_description" ? 3 : 2}
                  value={String(value)}
                  onChange={(event) => onChange(field.key, event.currentTarget.value)}
                />
              ) : (
                <input
                  maxLength={maxLength}
                  name={field.key}
                  type={field.type === "url" ? "url" : "text"}
                  value={String(value)}
                  onChange={(event) => onChange(field.key, event.currentTarget.value)}
                />
              )}
              {maxLength ? <small>Maximum {maxLength} characters.</small> : null}
            </label>
          );
        })}
      <div className="page-builder-field">
        <span>Open Graph image</span>
        <button className="page-builder-button page-builder-button-secondary" disabled type="button">
          Select image from Shopify
        </button>
        <small>Shopify Files access and an authenticated picker are not configured.</small>
      </div>
      <div className="page-builder-checkboxes">
        {(["robots_index", "robots_follow"] as const).map((fieldKey) => (
          <label key={fieldKey}>
            <input
              checked={Boolean(state.values[fieldKey])}
              type="checkbox"
              onChange={(event) => onChange(fieldKey, event.currentTarget.checked)}
            />
            {fieldKey === "robots_index" ? "Allow search indexing" : "Allow link following"}
          </label>
        ))}
      </div>
    </div>
  );
}

function SectionField({
  definition,
  section,
  onChange,
}: {
  definition: CmsFieldDefinition;
  section: EditorSection;
  onChange: (key: string, value: EditorFieldValue) => void;
}) {
  const currentValue = fieldValue(section.values, definition.key);
  const id = `section-${section.id}-${definition.key}`;
  const maxLength = maxLengthFor(definition);

  if (definition.key === "section_type") {
    return (
      <label className="page-builder-field" htmlFor={id}>
        <span>{definition.name}{definition.required ? <strong aria-hidden="true"> *</strong> : null}</span>
        <select
          id={id}
          value={section.sectionType}
          onChange={(event) => onChange(definition.key, event.currentTarget.value)}
        >
          {CMS_SECTION_TYPES.map((sectionType) => (
            <option key={sectionType} value={sectionType}>{labelForValue(sectionType)}</option>
          ))}
        </select>
      </label>
    );
  }

  if (definition.type === "boolean") {
    return (
      <label className="page-builder-checkbox" htmlFor={id}>
        <input
          id={id}
          checked={Boolean(currentValue)}
          type="checkbox"
          onChange={(event) => onChange(definition.key, event.currentTarget.checked)}
        />
        {labelForValue(definition.key)}
      </label>
    );
  }

  if (definition.type === "file_reference") {
    return (
      <div className="page-builder-field">
        <span>{definition.name}</span>
        <button className="page-builder-button page-builder-button-secondary" disabled type="button">
          Select image from Shopify
        </button>
        <small>File access and an authenticated picker are not configured.</small>
      </div>
    );
  }

  if (
    definition.type === "metaobject_reference" ||
    definition.type === "list.metaobject_reference" ||
    definition.type === "list.link" ||
    definition.type === "list.single_line_text_field"
  ) {
    return (
      <label className="page-builder-field" htmlFor={id}>
        <span>{definition.name}</span>
        <input
          disabled
          id={id}
          value=""
          aria-describedby={`${id}-help`}
          readOnly
        />
        <small id={`${id}-help`}>This Shopify reference picker is not connected.</small>
      </label>
    );
  }

  if (definition.type === "rich_text_field" || definition.type === "multi_line_text_field" || definition.type === "json") {
    return (
      <label className="page-builder-field" htmlFor={id}>
        <span>{definition.name}</span>
        <textarea
          id={id}
          maxLength={maxLength}
          rows={definition.type === "json" ? 5 : 4}
          value={String(currentValue)}
          onChange={(event) => onChange(definition.key, event.currentTarget.value)}
        />
        {definition.type === "rich_text_field" ? (
          <small>Plain text only. Shopify rich-text serialization is not sent until persistence is approved.</small>
        ) : null}
        {definition.type === "json" ? <small>Enter a JSON object; do not include commerce data.</small> : null}
      </label>
    );
  }

  const inputType = definition.type === "number_integer" ? "number" : definition.type === "url" ? "url" : "text";
  return (
    <label className="page-builder-field" htmlFor={id}>
      <span>{definition.name}{definition.required ? <strong aria-hidden="true"> *</strong> : null}</span>
      <input
        id={id}
        max={definition.type === "number_integer" ? MAX_DISPLAY_ORDER : undefined}
        maxLength={maxLength}
        min={definition.type === "number_integer" ? 0 : undefined}
        name={definition.key}
        type={inputType}
        value={String(currentValue)}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(definition.key, event.currentTarget.value)}
      />
      {maxLength ? <small>Maximum {maxLength} characters.</small> : null}
    </label>
  );
}

export function PageBuilderEditor() {
  const navigate = useNavigate();
  const [state, setState] = useState(createInitialPageEditorState);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<SectionCategory>("All");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const initialSnapshot = useRef(serializeEditorSnapshot(createInitialPageEditorState()));
  const snapshot = useMemo(() => serializeEditorSnapshot(state), [state]);
  const isDirty = snapshot !== initialSnapshot.current;
  const blocker = useBlocker(isDirty);
  const selectedSection = state.sections.find((section) => section.id === selectedSectionId) ?? null;
  const validationIssues = useMemo(() => validatePageEditorState(state), [state]);
  const visibleSectionTypes = CMS_SECTION_TYPES.filter((sectionType) => {
    const card = SECTION_CARDS[sectionType];
    return (
      (category === "All" || card.category === category) &&
      `${card.title} ${card.description}`.toLowerCase().includes(search.toLowerCase().trim())
    );
  });

  useEffect(() => {
    if (!isDirty) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty || blocker.state !== "blocked") return;
    if (window.confirm("Discard this unsaved local draft and leave the editor?")) {
      blocker.proceed();
    } else {
      blocker.reset();
    }
  }, [blocker.state, isDirty]);

  function changePageValue(field: string, value: EditorFieldValue) {
    if (field === "handle") {
      if (typeof value !== "string") throw new Error("Page handles must be text.");
      setState((current) => ({ ...current, handle: value }));
      return;
    }
    setState((current) => ({ ...current, values: { ...current.values, [field]: value } }));
  }

  function addSection(sectionType: CmsSectionType, requestedIndex?: number) {
    const sectionId = createClientId();
    setState((current) => {
      const selectedIndex = selectedSectionId
        ? current.sections.findIndex((section) => section.id === selectedSectionId)
        : -1;
      const insertionIndex = requestedIndex ?? (selectedIndex >= 0 ? selectedIndex + 1 : current.sections.length);
      const index = Math.max(0, Math.min(insertionIndex, current.sections.length));
      const section = createSectionDraft(sectionType, sectionId, index);
      const next = [...current.sections];
      next.splice(index, 0, section);
      const ordered = next.map((item, order) => ({
        ...item,
        values: { ...item.values, display_order: String(order) },
      }));
      return { ...current, sections: ordered };
    });
    setSelectedSectionId(sectionId);
  }

  function changeSectionValue(sectionId: string, field: string, value: EditorFieldValue) {
    setState((current) => ({
      ...current,
      sections: updateSectionValue(current.sections, sectionId, field, value),
    }));
  }

  function reorderSection(sectionId: string, targetIndex: number) {
    setState((current) => ({
      ...current,
      sections: moveSection(current.sections, sectionId, targetIndex),
    }));
  }

  function duplicateSelectedSection(sectionId: string) {
    const newId = createClientId();
    setState((current) => ({
      ...current,
      sections: duplicateSection(current.sections, sectionId, newId),
    }));
    setSelectedSectionId(newId);
  }

  function deleteSection(sectionId: string) {
    const section = state.sections.find((item) => item.id === sectionId);
    if (!section || !window.confirm(`Remove "${String(section.values.section_name)}" from this local draft?`)) {
      return;
    }
    setState((current) => ({
      ...current,
      sections: removeSection(current.sections, sectionId),
    }));
    if (selectedSectionId === sectionId) {
      const next = state.sections.find((item) => item.id !== sectionId);
      setSelectedSectionId(next?.id ?? null);
    }
  }

  function handleDrop(event: DragEvent<HTMLElement>, targetIndex: number) {
    event.preventDefault();
    const sectionId = event.dataTransfer.getData("text/plain") || draggedSectionId;
    if (sectionId) reorderSection(sectionId, targetIndex);
    setDraggedSectionId(null);
    setDropIndex(null);
  }

  function exitEditor() {
    navigate("/app/page-builder");
  }

  return (
    <main className="page-builder">
      <div className="page-builder-blocked" role="status">
        <strong>Shopify page editing is blocked.</strong>
        <span>
          This editor holds changes in memory only. The live schema has not been verified, the app
          has no CMS entry read/write scopes, and no Shopify mutation will be sent.
        </span>
      </div>

      <header className="page-builder-toolbar">
        <div className="page-builder-brand">
          <span className="page-builder-brand-mark" aria-hidden="true">M</span>
          <span><strong>MYRKLS CMS</strong><small>Page Builder</small></span>
        </div>
        <label className="page-builder-toolbar-title">
          <span className="visually-hidden">Page title</span>
          <input
            aria-label="Page title"
            autoComplete="off"
            maxLength={160}
            placeholder="Untitled page"
            value={String(state.values.title ?? "")}
            onChange={(event) => changePageValue("title", event.currentTarget.value)}
          />
          <small>{state.handle ? `/pages/${state.handle}` : "New local draft"}</small>
        </label>
        <span className="page-builder-draft-status">{isDirty ? "Unsaved local draft" : "New local draft"}</span>
        <div className="page-builder-toolbar-actions">
          <div className="page-builder-preview-switch" aria-label="Canvas preview size">
            <button
              aria-pressed={previewMode === "desktop"}
              className={previewMode === "desktop" ? "is-active" : ""}
              type="button"
              onClick={() => setPreviewMode("desktop")}
            >
              Desktop
            </button>
            <button
              aria-pressed={previewMode === "mobile"}
              className={previewMode === "mobile" ? "is-active" : ""}
              type="button"
              onClick={() => setPreviewMode("mobile")}
            >
              Mobile
            </button>
          </div>
          <button
            className="page-builder-button page-builder-button-primary"
            disabled
            title="Shopify page persistence is blocked until authorization, scopes, database, and live schema are verified."
            type="button"
          >
            Save Draft
          </button>
          <button className="page-builder-button page-builder-button-secondary" type="button" onClick={exitEditor}>
            Exit editor
          </button>
        </div>
      </header>

      <div className="page-builder-workspace">
        <aside aria-label="Page builder controls" className="page-builder-sidebar page-builder-library">
          <section className="page-builder-panel-section">
            <div className="page-builder-panel-heading">
              <div><h2>Section Library</h2><p>Approved Phase 1 section types</p></div>
              <span className="page-builder-count">{CMS_SECTION_TYPES.length}</span>
            </div>
            <label className="page-builder-field">
              <span>Search sections</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
              />
            </label>
            <div aria-label="Section categories" className="page-builder-filter-list">
              {SECTION_CATEGORIES.map((item) => (
                <button
                  aria-pressed={category === item}
                  className={category === item ? "is-active" : ""}
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="page-builder-library-list">
              {visibleSectionTypes.length > 0 ? visibleSectionTypes.map((sectionType) => {
                const card = SECTION_CARDS[sectionType];
                return (
                  <article className="page-builder-library-card" key={sectionType}>
                    <span className="page-builder-library-icon" aria-hidden="true">{card.title.charAt(0)}</span>
                    <div className="page-builder-library-copy">
                      <h3>{card.title}</h3>
                      <p>{card.description}</p>
                      <span>{card.category}</span>
                    </div>
                    <button
                      aria-label={`Add ${card.title}`}
                      className="page-builder-icon-button"
                      type="button"
                      onClick={() => addSection(sectionType)}
                    >
                      Add
                    </button>
                  </article>
                );
              }) : <p className="page-builder-empty-note">No approved sections match this search.</p>}
            </div>
          </section>

          <details className="page-builder-panel-section" open>
            <summary><h2>Page settings</h2></summary>
            <PageFields state={state} onChange={changePageValue} />
          </details>
        </aside>

        <section aria-label="Page canvas" className="page-builder-canvas-region">
          <div className="page-builder-canvas-heading">
            <div>
              <h2>Page canvas</h2>
              <p>Structure preview only — no storefront rendering or publishing.</p>
            </div>
            <span>{state.sections.length} {state.sections.length === 1 ? "section" : "sections"}</span>
          </div>
          <div className={`page-builder-canvas page-builder-canvas-${previewMode}`}>
            <div className="page-builder-canvas-preview">
              <div className="page-builder-preview-browser" aria-hidden="true">
                <span /><span /><span />
                <small>{state.handle ? `/pages/${state.handle}` : "/pages/new-page"}</small>
              </div>
              {state.sections.length === 0 ? (
                <div className="page-builder-canvas-empty">
                  <span className="page-builder-empty-icon" aria-hidden="true">+</span>
                  <h3>Your page starts here</h3>
                  <p>Add an approved section from the library. It will remain a local draft until Shopify persistence is authorized.</p>
                </div>
              ) : (
                <div className="page-builder-section-list">
                  {state.sections.map((section, index) => {
                    const card = SECTION_CARDS[section.sectionType];
                    const heading = section.values.heading;
                    const body = section.values.body;
                    const isSelected = selectedSectionId === section.id;
                    return (
                      <div
                        className={`page-builder-section-slot ${dropIndex === index ? "is-drop-target" : ""}`}
                        key={section.id}
                        onDragOver={(event) => {
                          event.preventDefault();
                          setDropIndex(index);
                        }}
                        onDrop={(event) => handleDrop(event, index)}
                      >
                        <article
                          aria-label={`${card.title} section`}
                          className={`page-builder-canvas-card ${isSelected ? "is-selected" : ""} ${section.values.visible === false ? "is-hidden" : ""}`}
                        >
                          <div className="page-builder-canvas-card-toolbar">
                            <button
                              aria-label={`Drag ${String(section.values.section_name)}`}
                              className="page-builder-drag-handle"
                              draggable
                              type="button"
                              onDragStart={(event) => {
                                event.dataTransfer.setData("text/plain", section.id);
                                event.dataTransfer.effectAllowed = "move";
                                setDraggedSectionId(section.id);
                                setSelectedSectionId(section.id);
                              }}
                              onDragEnd={() => {
                                setDraggedSectionId(null);
                                setDropIndex(null);
                              }}
                            >
                              ::
                            </button>
                            <button
                              aria-label={`Select ${String(section.values.section_name)}`}
                              aria-pressed={isSelected}
                              className="page-builder-section-select"
                              type="button"
                              onClick={() => setSelectedSectionId(section.id)}
                            >
                              <span>{card.title}</span>
                              <small>{section.sectionType}</small>
                            </button>
                            <div className="page-builder-card-actions">
                              <button
                                aria-label={`Move ${String(section.values.section_name)} up`}
                                disabled={index === 0}
                                type="button"
                                onClick={() => reorderSection(section.id, index - 1)}
                              >↑</button>
                              <button
                                aria-label={`Move ${String(section.values.section_name)} down`}
                                disabled={index === state.sections.length - 1}
                                type="button"
                                onClick={() => reorderSection(section.id, index + 1)}
                              >↓</button>
                              <button
                                aria-label={`Duplicate ${String(section.values.section_name)}`}
                                type="button"
                                onClick={() => duplicateSelectedSection(section.id)}
                              >Duplicate</button>
                              <button
                                aria-label={`${section.values.visible === false ? "Show" : "Hide"} ${String(section.values.section_name)}`}
                                type="button"
                                onClick={() => changeSectionValue(section.id, "visible", section.values.visible === false)}
                              >{section.values.visible === false ? "Show" : "Hide"}</button>
                              <button
                                aria-label={`Remove ${String(section.values.section_name)}`}
                                type="button"
                                onClick={() => deleteSection(section.id)}
                              >Remove</button>
                            </div>
                          </div>
                          <button
                            className="page-builder-section-preview"
                            type="button"
                            onClick={() => setSelectedSectionId(section.id)}
                          >
                            <span>{String(section.values.subheading || card.description)}</span>
                            <strong>{String(heading || section.values.section_name)}</strong>
                            <small>{String(body || "Add content in the settings inspector.")}</small>
                          </button>
                        </article>
                        <button
                          aria-label={`Add ${card.title} after ${String(section.values.section_name)}`}
                          className="page-builder-insert-button"
                          type="button"
                          onClick={() => addSection(section.sectionType, index + 1)}
                        >
                          + Add section here
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        <aside aria-label="Section settings" className="page-builder-sidebar page-builder-inspector">
          <div className="page-builder-panel-heading">
            <div><h2>Settings</h2><p>{selectedSection ? SECTION_CARDS[selectedSection.sectionType].title : "Page details"}</p></div>
          </div>
          {selectedSection ? (
            <div className="page-builder-inspector-fields">
              {CMS_SECTION_DEFINITION.fields.map((field) => (
                <SectionField
                  definition={field}
                  key={field.key}
                  section={selectedSection}
                  onChange={(fieldKey, value) => changeSectionValue(selectedSection.id, fieldKey, value)}
                />
              ))}
            </div>
          ) : (
            <div className="page-builder-inspector-empty">
              <p>Select a section on the canvas to edit its schema-backed fields.</p>
              <p>Section values use only the generic <code>cms_section</code> fields in the Phase 2 manifest.</p>
            </div>
          )}
          {validationIssues.length > 0 ? (
            <div className="page-builder-validation" role="status">
              <strong>Local validation</strong>
              <ul>
                {validationIssues.slice(0, 5).map((issue) => (
                  <li key={`${issue.path}:${issue.message}`}>{issue.message}</li>
                ))}
              </ul>
              <small>Shopify cannot validate or save this draft until the blocked integration is completed.</small>
            </div>
          ) : null}
        </aside>
      </div>
      <p className="page-builder-save-note">
        Save Draft is disabled. Local changes are not persisted to Shopify or browser storage.
      </p>
    </main>
  );
}
