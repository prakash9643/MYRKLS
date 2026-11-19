import { CMS_METAOBJECT_DEFINITIONS, CMS_SECTION_TYPES } from "../generated/cms-schema/definitions";
import { validateShopifyHandle } from "../generated/cms-schema/validation";
import type { CmsFieldDefinition } from "../generated/cms-schema/types";

export { CMS_SECTION_TYPES };
export type CmsSectionType = (typeof CMS_SECTION_TYPES)[number];
export type EditorFieldValue = string | boolean;
export type EditorFieldValues = Record<string, EditorFieldValue>;

export interface EditorSection {
  id: string;
  sectionType: CmsSectionType;
  values: EditorFieldValues;
}

export interface PageEditorState {
  handle: string;
  values: EditorFieldValues;
  sections: EditorSection[];
}

export interface EditorValidationIssue {
  path: string;
  message: string;
}

export interface ShopifyRichTextTextNode {
  type: "text";
  value: string;
}

export interface ShopifyRichTextParagraphNode {
  type: "paragraph";
  children: ShopifyRichTextTextNode[];
}

export interface ShopifyRichTextDocument {
  type: "root";
  children: ShopifyRichTextParagraphNode[];
}

const requiredDefinition = (type: string) => {
  const definition = CMS_METAOBJECT_DEFINITIONS.find((item) => item.type === type);
  if (!definition) throw new Error(`The CMS schema is missing the "${type}" definition.`);
  return definition;
};

export const CMS_PAGE_DEFINITION = requiredDefinition("cms_page");
export const CMS_SECTION_DEFINITION = requiredDefinition("cms_section");

function choicesForField(definitionType: string, fieldKey: string): string[] {
  const definition = requiredDefinition(definitionType);
  const field = definition.fields.find((item) => item.key === fieldKey);
  const validation = field?.validations?.find((item) => item.name === "choices");
  if (!validation) {
    throw new Error(`The CMS schema is missing ${definitionType}.${fieldKey} choices.`);
  }

  const choices: unknown = JSON.parse(validation.value);
  if (!Array.isArray(choices) || choices.some((choice) => typeof choice !== "string")) {
    throw new Error(`The CMS schema has invalid ${definitionType}.${fieldKey} choices.`);
  }
  return choices;
}

export const CMS_PAGE_TYPES = choicesForField("cms_page", "page_type");

function isCmsSectionType(value: string): value is CmsSectionType {
  return CMS_SECTION_TYPES.some((item) => item === value);
}

const RESERVED_COMMERCE_CONFIG_KEYS = new Set([
  "price",
  "compareatprice",
  "inventory",
  "availability",
  "variant",
  "variants",
  "sku",
  "checkout",
  "checkouturl",
  "cartid",
  "customeraccesstoken",
]);

function hasReservedCommerceKey(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasReservedCommerceKey);
  if (!isRecord(value)) return false;
  return Object.entries(value).some(
    ([key, nestedValue]) =>
      RESERVED_COMMERCE_CONFIG_KEYS.has(key.replace(/[_-]/g, "").toLowerCase()) ||
      hasReservedCommerceKey(nestedValue)
  );
}

function defaultValue(field: CmsFieldDefinition, index: number): EditorFieldValue {
  if (field.type === "boolean") {
    if (field.key === "robots_index" || field.key === "robots_follow") return true;
    return false;
  }
  if (field.type === "json") return "{}";
  if (field.type === "number_integer") return String(index);
  return "";
}

export function createInitialPageEditorState(): PageEditorState {
  const values: EditorFieldValues = {};
  for (const field of CMS_PAGE_DEFINITION.fields) {
    if (field.key === "sections") continue;
    if (field.key === "page_type") {
      values[field.key] = CMS_PAGE_TYPES[0] ?? "";
    } else {
      values[field.key] = defaultValue(field, 0);
    }
  }
  return { handle: "", values, sections: [] };
}

export function createSectionDraft(
  sectionType: CmsSectionType,
  id: string,
  displayOrder = 0
): EditorSection {
  if (!id.trim()) throw new Error("A section draft requires a stable client ID.");
  if (!CMS_SECTION_TYPES.includes(sectionType)) {
    throw new Error(`Unsupported CMS section type "${sectionType}".`);
  }

  const values: EditorFieldValues = {};
  for (const field of CMS_SECTION_DEFINITION.fields) {
    if (field.key === "section_name") {
      values[field.key] = sectionType
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
    } else if (field.key === "section_type") {
      values[field.key] = sectionType;
    } else if (field.key === "visible") {
      values[field.key] = true;
    } else {
      values[field.key] = defaultValue(field, displayOrder);
    }
  }
  return { id, sectionType, values };
}

function withDisplayOrder(sections: EditorSection[]): EditorSection[] {
  return sections.map((section, index) => ({
    ...section,
    values: { ...section.values, display_order: String(index) },
  }));
}

export function updateSectionValue(
  sections: EditorSection[],
  sectionId: string,
  fieldKey: string,
  value: EditorFieldValue
): EditorSection[] {
  const definition = CMS_SECTION_DEFINITION.fields.find((field) => field.key === fieldKey);
  if (!definition) throw new Error(`Unknown CMS section field "${fieldKey}".`);

  const section = sections.find((item) => item.id === sectionId);
  if (!section) throw new Error(`Unknown local section ID "${sectionId}".`);
  if (definition.type === "boolean" ? typeof value !== "boolean" : typeof value !== "string") {
    throw new Error(`Invalid value type for cms_section.${fieldKey}.`);
  }

  if (
    fieldKey === "section_type" &&
    (typeof value !== "string" || !isCmsSectionType(value))
  ) {
    throw new Error(`Unsupported CMS section type "${String(value)}".`);
  }

  return sections.map((item) =>
    item.id === sectionId
      ? {
          ...item,
          sectionType: fieldKey === "section_type" ? (value as CmsSectionType) : item.sectionType,
          values: { ...item.values, [fieldKey]: value },
        }
      : item
  );
}

export function moveSection(
  sections: EditorSection[],
  sectionId: string,
  targetIndex: number
): EditorSection[] {
  const currentIndex = sections.findIndex((section) => section.id === sectionId);
  if (currentIndex < 0) throw new Error(`Unknown local section ID "${sectionId}".`);
  if (!Number.isInteger(targetIndex)) throw new Error("A section position must be an integer.");
  if (sections.length < 2) return sections;

  const boundedIndex = Math.max(0, Math.min(targetIndex, sections.length - 1));
  const reordered = [...sections];
  const [selected] = reordered.splice(currentIndex, 1);
  reordered.splice(boundedIndex, 0, selected);
  return withDisplayOrder(reordered);
}

export function duplicateSection(
  sections: EditorSection[],
  sectionId: string,
  newId: string
): EditorSection[] {
  const currentIndex = sections.findIndex((section) => section.id === sectionId);
  if (currentIndex < 0) throw new Error(`Unknown local section ID "${sectionId}".`);
  if (!newId.trim() || sections.some((section) => section.id === newId)) {
    throw new Error("A duplicate section requires a unique stable client ID.");
  }

  const source = sections[currentIndex];
  const name = source.values.section_name;
  const copiedName =
    typeof name === "string" ? `${name} copy`.slice(0, 120) : "Section copy";
  const duplicate: EditorSection = {
    id: newId,
    sectionType: source.sectionType,
    values: { ...source.values, section_name: copiedName },
  };
  const next = [...sections];
  next.splice(currentIndex + 1, 0, duplicate);
  return withDisplayOrder(next);
}

export function removeSection(sections: EditorSection[], sectionId: string): EditorSection[] {
  if (!sections.some((section) => section.id === sectionId)) {
    throw new Error(`Unknown local section ID "${sectionId}".`);
  }
  return withDisplayOrder(sections.filter((section) => section.id !== sectionId));
}

function fieldMaxLength(field: CmsFieldDefinition): number | undefined {
  const maximum = field.validations?.find((validation) => validation.name === "max")?.value;
  return maximum === undefined ? undefined : Number(maximum);
}

function isSafeEditorUrl(value: string): boolean {
  if (!value) return true;
  return value.startsWith("/") && !value.startsWith("//");
}

export function validatePageEditorState(state: PageEditorState): EditorValidationIssue[] {
  const issues: EditorValidationIssue[] = [];
  const title = state.values.title;
  const titleField = CMS_PAGE_DEFINITION.fields.find((field) => field.key === "title");
  const titleMax = titleField ? fieldMaxLength(titleField) : undefined;

  if (typeof title !== "string" || !title.trim()) {
    issues.push({ path: "title", message: "Enter a page title." });
  } else if (titleMax && title.length > titleMax) {
    issues.push({ path: "title", message: `Use ${titleMax} characters or fewer.` });
  }

  if (!validateShopifyHandle(state.handle)) {
    issues.push({
      path: "handle",
      message: "Use a lowercase handle with letters, numbers, and single hyphens.",
    });
  }

  if (
    typeof state.values.page_type !== "string" ||
    !CMS_PAGE_TYPES.includes(state.values.page_type)
  ) {
    issues.push({ path: "page_type", message: "Choose an approved page type." });
  }

  if (state.sections.length === 0) {
    issues.push({ path: "sections", message: "Add at least one approved section." });
  }

  state.sections.forEach((section, index) => {
    const prefix = `sections.${index}`;
    const name = section.values.section_name;
    if (typeof name !== "string" || !name.trim()) {
      issues.push({ path: `${prefix}.section_name`, message: "Enter a section name." });
    } else if (name.length > 120) {
      issues.push({
        path: `${prefix}.section_name`,
        message: "Use 120 characters or fewer.",
      });
    }

    if (!CMS_SECTION_TYPES.some((item) => item === section.sectionType)) {
      issues.push({
        path: `${prefix}.section_type`,
        message: "Choose an approved section type.",
      });
    }

    const orderValue = section.values.display_order;
    const order = typeof orderValue === "string" ? Number(orderValue) : Number.NaN;
    if (!Number.isInteger(order) || order < 0 || order > 9999) {
      issues.push({
        path: `${prefix}.display_order`,
        message: "Section order must be a whole number from 0 to 9999.",
      });
    }

    for (const key of ["button_url", "secondary_button_url"]) {
      const url = section.values[key];
      if (typeof url === "string" && !isSafeEditorUrl(url)) {
        issues.push({
          path: `${prefix}.${key}`,
          message: "Use a site-relative path; external domains need an owner-approved allowlist.",
        });
      }
    }

    const customConfig = section.values.custom_config;
    if (typeof customConfig === "string") {
      try {
        const parsed: unknown = JSON.parse(customConfig);
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
          issues.push({
            path: `${prefix}.custom_config`,
            message: "Custom configuration must be a JSON object.",
          });
        } else if (hasReservedCommerceKey(parsed)) {
          issues.push({
            path: `${prefix}.custom_config`,
            message: "Commerce data such as prices, variants, inventory, availability, and checkout cannot be stored in CMS content.",
          });
        }
      } catch {
        issues.push({
          path: `${prefix}.custom_config`,
          message: "Enter valid JSON before continuing.",
        });
      }
    }
  });

  return issues;
}

export function serializePlainTextRichText(value: string): string {
  const document: ShopifyRichTextDocument = {
    type: "root",
    children: value.replace(/\r\n?/g, "\n").split("\n").map((line) => ({
      type: "paragraph",
      children: line ? [{ type: "text", value: line }] : [],
    })),
  };
  return JSON.stringify(document);
}

export function deserializePlainTextRichText(value: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("The Shopify rich-text value is not valid JSON.");
  }
  if (!isRecord(parsed) || parsed.type !== "root" || !Array.isArray(parsed.children)) {
    throw new Error("The Shopify rich-text value has an unsupported structure.");
  }

  const lines = parsed.children.map((paragraph): string => {
    if (!isRecord(paragraph) || paragraph.type !== "paragraph" || !Array.isArray(paragraph.children)) {
      throw new Error("The Shopify rich-text value contains an unsupported node.");
    }
    return paragraph.children.map((node): string => {
      if (!isRecord(node) || node.type !== "text" || typeof node.value !== "string") {
        throw new Error("Only plain text is supported by this editor foundation.");
      }
      return node.value;
    }).join("");
  });
  return lines.join("\n");
}

interface LocalEditorSnapshot {
  version: 1;
  handle: string;
  values: EditorFieldValues;
  sections: EditorSection[];
}

export function serializeEditorSnapshot(state: PageEditorState): string {
  const snapshot: LocalEditorSnapshot = {
    version: 1,
    handle: state.handle,
    values: state.values,
    sections: state.sections,
  };
  return JSON.stringify(snapshot);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readFieldValues(
  value: unknown,
  definitionFields: CmsFieldDefinition[],
  excludedKeys: Set<string>
): EditorFieldValues {
  if (!isRecord(value)) throw new Error("The local editor snapshot has invalid field data.");
  const allowedFields = definitionFields.filter((field) => !excludedKeys.has(field.key));
  const allowedKeys = new Set(allowedFields.map((field) => field.key));
  const values: EditorFieldValues = {};

  for (const [key, fieldValue] of Object.entries(value)) {
    if (!allowedKeys.has(key)) throw new Error(`Unknown CMS editor field "${key}".`);
    const field = allowedFields.find((item) => item.key === key);
    if (!field) throw new Error(`Unknown CMS editor field "${key}".`);
    if (field.type === "boolean") {
      if (typeof fieldValue !== "boolean") {
        throw new Error(`Invalid boolean value for CMS editor field "${key}".`);
      }
    } else if (typeof fieldValue !== "string") {
      throw new Error(`Invalid text value for CMS editor field "${key}".`);
    }
    values[key] = fieldValue;
  }

  if (allowedFields.some((field) => !(field.key in values))) {
    throw new Error("The local editor snapshot is missing a schema field.");
  }
  return values;
}

export function deserializeEditorSnapshot(serialized: string): PageEditorState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    throw new Error("The local editor snapshot is not valid JSON.");
  }

  if (!isRecord(parsed) || parsed.version !== 1 || typeof parsed.handle !== "string") {
    throw new Error("The local editor snapshot has an unsupported format.");
  }

  const pageValues = readFieldValues(parsed.values, CMS_PAGE_DEFINITION.fields, new Set(["sections"]));
  if (
    typeof pageValues.page_type !== "string" ||
    !CMS_PAGE_TYPES.includes(pageValues.page_type)
  ) {
    throw new Error("The local editor snapshot has an unsupported page type.");
  }
  if (!Array.isArray(parsed.sections)) {
    throw new Error("The local editor snapshot has invalid section data.");
  }

  const sectionIds = new Set<string>();
  const sections = parsed.sections.map((entry): EditorSection => {
    if (!isRecord(entry) || typeof entry.id !== "string" || !entry.id.trim()) {
      throw new Error("The local editor snapshot has a section without a stable ID.");
    }
    if (sectionIds.has(entry.id)) throw new Error("The local editor snapshot has duplicate section IDs.");
    sectionIds.add(entry.id);

    const values = readFieldValues(entry.values, CMS_SECTION_DEFINITION.fields, new Set());
    const sectionType = values.section_type;
    if (
      typeof sectionType !== "string" ||
      !isCmsSectionType(sectionType) ||
      entry.sectionType !== sectionType
    ) {
      throw new Error("The local editor snapshot has an unsupported section type.");
    }
    return { id: entry.id, sectionType, values };
  });

  return { handle: parsed.handle, values: pageValues, sections };
}
