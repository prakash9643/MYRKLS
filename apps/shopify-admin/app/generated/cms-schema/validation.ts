import { CMS_SECTION_TYPES } from './definitions.ts';
import {
  SUPPORTED_SHOPIFY_FIELD_TYPES,
  type CmsFieldDefinition,
  type CmsSchemaManifest,
  type SchemaValidation,
} from './types.ts';

const TYPE_KEY_PATTERN = /^[a-z][a-z0-9_-]{2,254}$/;
const FIELD_KEY_PATTERN = /^[a-zA-Z0-9_-]{2,64}$/;
const NAMESPACE_PATTERN = /^[a-zA-Z0-9_-]{3,255}$/;
const HANDLE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SUPPORTED_TYPES = new Set<string>(SUPPORTED_SHOPIFY_FIELD_TYPES);
const RESERVED_COMMERCE_KEYS = new Set([
  'price',
  'compare_at_price',
  'inventory',
  'availability',
  'variant',
  'sku',
  'checkout',
  'checkout_url',
  'cart_id',
  'customer_access_token',
]);

const VALIDATIONS_BY_TYPE: Record<string, Set<string>> = {
  'single_line_text_field': new Set(['min', 'max', 'regex', 'choices']),
  'multi_line_text_field': new Set(['min', 'max', 'regex']),
  'number_integer': new Set(['min', 'max']),
  'number_decimal': new Set(['min', 'max', 'max_precision']),
  date: new Set(['min', 'max']),
  date_time: new Set(['min', 'max']),
  url: new Set(['allowed_domains']),
  file_reference: new Set(['file_type_options']),
  metaobject_reference: new Set(['metaobject_definition_id']),
  'list.metaobject_reference': new Set(['metaobject_definition_id', 'list.min', 'list.max']),
  'list.single_line_text_field': new Set(['list.min', 'list.max']),
  'list.link': new Set(['list.min', 'list.max']),
  json: new Set(['schema']),
};

const REQUIRED_METAOBJECT_TYPES = [
  'site_global_settings',
  'cms_page',
  'cms_section',
  'cms_page_template',
  'header_navigation_settings',
  'footer_settings',
  'announcement_bar',
  'homepage_hero_banner',
  'faq_entry',
  'testimonial_story',
  'brand_story_section',
  'policy_page_content',
];

const REQUIRED_FIELDS_BY_TYPE: Record<string, string[]> = {
  site_global_settings: ['title', 'site_name'],
  cms_page: ['title', 'page_type', 'sections'],
  cms_section: ['section_name', 'section_type'],
  cms_page_template: ['template_name', 'template_handle', 'page_type'],
  header_navigation_settings: ['menu_reference'],
  footer_settings: ['copyright_text'],
  announcement_bar: ['announcement_text'],
  homepage_hero_banner: [
    'internal_name',
    'enabled',
    'sort_order',
    'desktop_image',
    'desktop_alt',
    'heading',
  ],
  faq_entry: ['question', 'answer'],
  testimonial_story: ['customer_name', 'testimonial_text'],
  brand_story_section: ['heading'],
  policy_page_content: ['title', 'content'],
};

const REQUIRED_METAFIELDS = [
  'PRODUCT.cms.enable_custom_sections',
  'PRODUCT.cms.product_intro',
  'PRODUCT.cms.product_faqs',
  'PRODUCT.cms.related_editorial_content',
  'PRODUCT.cms.product_badges',
  'COLLECTION.cms.collection_banner',
  'COLLECTION.cms.collection_subtitle',
  'COLLECTION.cms.collection_intro',
  'COLLECTION.cms.collection_sections',
  'COLLECTION.cms.collection_faqs',
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizedValidationValue = (validation: SchemaValidation): string => {
  try {
    return JSON.stringify(JSON.parse(validation.value));
  } catch {
    return validation.value;
  }
};

const validateValidations = (
  item: CmsFieldDefinition | { type: string; validations?: SchemaValidation[] },
  path: string,
  errors: string[]
): void => {
  const allowed = VALIDATIONS_BY_TYPE[item.type] || new Set<string>();
  const seen = new Set<string>();
  for (const validation of item.validations || []) {
    if (!allowed.has(validation.name)) {
      errors.push(`${path}: validation "${validation.name}" is unsupported for ${item.type}.`);
    }
    if (seen.has(validation.name)) {
      errors.push(`${path}: duplicate validation "${validation.name}".`);
    }
    seen.add(validation.name);
    if (!validation.value.trim()) errors.push(`${path}: validation "${validation.name}" has no value.`);
    if (validation.name === 'choices') {
      try {
        const values: unknown = JSON.parse(validation.value);
        if (
          !Array.isArray(values) ||
          values.length === 0 ||
          values.length > 128 ||
          values.some((value) => typeof value !== 'string') ||
          new Set(values).size !== values.length
        ) {
          errors.push(`${path}: choices must be a non-empty unique string array of at most 128 values.`);
        }
      } catch {
        errors.push(`${path}: choices must be valid JSON.`);
      }
    }
    if (validation.name === 'file_type_options') {
      try {
        const values: unknown = JSON.parse(validation.value);
        if (
          !Array.isArray(values) ||
          values.length === 0 ||
          values.some((value) => value !== 'Image' && value !== 'Video')
        ) {
          errors.push(`${path}: file_type_options may contain only Image or Video.`);
        }
      } catch {
        errors.push(`${path}: file_type_options must be valid JSON.`);
      }
    }
    if (
      ['min', 'max', 'list.min', 'list.max', 'max_precision'].includes(validation.name) &&
      !Number.isFinite(Number(validation.value))
    ) {
      errors.push(`${path}: validation "${validation.name}" must be numeric.`);
    }
  }
};

const validateField = (
  item: CmsFieldDefinition,
  path: string,
  metaobjectTypes: Set<string>,
  errors: string[]
): void => {
  if (!FIELD_KEY_PATTERN.test(item.key)) errors.push(`${path}: invalid field key "${item.key}".`);
  if (!SUPPORTED_TYPES.has(item.type)) errors.push(`${path}: unsupported field type "${item.type}".`);
  if (typeof item.required !== 'boolean') errors.push(`${path}: required must be a boolean.`);
  validateValidations(item, path, errors);

  if (item.referenceTo) {
    if (!['metaobject_reference', 'list.metaobject_reference'].includes(item.type)) {
      errors.push(`${path}: referenceTo is valid only for metaobject reference types.`);
    }
    if (!metaobjectTypes.has(item.referenceTo)) {
      errors.push(`${path}: reference target "${item.referenceTo}" is not in the manifest.`);
    }
    if (
      !(item.validations || []).some((validation) => validation.name === 'metaobject_definition_id')
    ) {
      // The target ID is resolved from the live store during preflight and deployment.
    }
  }
};

export const validateShopifyHandle = (handle: string): boolean =>
  handle.length > 0 && handle.length <= 255 && HANDLE_PATTERN.test(handle);

export const validateCmsSchema = (manifest: CmsSchemaManifest): string[] => {
  const errors: string[] = [];
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(manifest.apiVersion)) {
    errors.push(`Invalid Admin API version "${manifest.apiVersion}".`);
  }

  const metaobjectTypes = new Set<string>();
  for (const definition of manifest.metaobjects) {
    if (!TYPE_KEY_PATTERN.test(definition.type)) {
      errors.push(`Invalid metaobject type key "${definition.type}".`);
    }
    if (metaobjectTypes.has(definition.type)) {
      errors.push(`Duplicate metaobject type "${definition.type}".`);
    }
    metaobjectTypes.add(definition.type);
  }
  for (const requiredType of REQUIRED_METAOBJECT_TYPES) {
    if (!metaobjectTypes.has(requiredType)) errors.push(`Missing required metaobject "${requiredType}".`);
  }

  for (const definition of manifest.metaobjects) {
    const fieldKeys = new Set<string>();
    for (const item of definition.fields) {
      const path = `${definition.type}.${item.key}`;
      if (fieldKeys.has(item.key)) errors.push(`${path}: duplicate field key.`);
      fieldKeys.add(item.key);
      validateField(item, path, metaobjectTypes, errors);
    }
    const displayField = definition.fields.find((item) => item.key === definition.displayNameKey);
    if (!displayField) {
      errors.push(`${definition.type}: displayNameKey "${definition.displayNameKey}" is not defined.`);
    } else if (displayField.type !== 'single_line_text_field') {
      errors.push(`${definition.type}: displayNameKey must refer to a single-line text field.`);
    }
    for (const requiredKey of REQUIRED_FIELDS_BY_TYPE[definition.type] || []) {
      const requiredField = definition.fields.find((item) => item.key === requiredKey);
      if (!requiredField || requiredField.required !== true) {
        errors.push(`${definition.type}: required field "${requiredKey}" is missing or optional.`);
      }
    }
    if (
      definition.ownership !== 'MERCHANT' ||
      definition.adminAccess !== 'MERCHANT_READ_WRITE'
    ) {
      errors.push(`${definition.type}: public CMS definitions must be merchant-owned and merchant-editable.`);
    }
    if (definition.storefrontAccess !== 'PUBLIC_READ' || !definition.publishable) {
      errors.push(`${definition.type}: public content must be publishable and read-only on Storefront.`);
    }
    if (definition.type === 'cms_section') {
      const sectionField = definition.fields.find((item) => item.key === 'section_type');
      const choicesValidation = sectionField?.validations?.find(
        (validation) => validation.name === 'choices'
      );
      try {
        const values: unknown = choicesValidation
          ? JSON.parse(choicesValidation.value)
          : null;
        if (
          !Array.isArray(values) ||
          values.length !== manifest.sectionTypes.length ||
          manifest.sectionTypes.some((sectionType) => !values.includes(sectionType))
        ) {
          errors.push('cms_section.section_type choices must equal the Phase 1 allowlist.');
        }
      } catch {
        errors.push('cms_section.section_type choices must be valid JSON.');
      }
    }
  }

  if (
    manifest.sectionTypes.length !== CMS_SECTION_TYPES.length ||
    CMS_SECTION_TYPES.some((sectionType) => !manifest.sectionTypes.includes(sectionType))
  ) {
    errors.push('Section types must match the Phase 1 approved allowlist exactly.');
  }

  const metafieldKeys = new Set<string>();
  for (const definition of manifest.metafields) {
    const path = `${definition.ownerType}.${definition.namespace}.${definition.key}`;
    if (!NAMESPACE_PATTERN.test(definition.namespace)) {
      errors.push(`${path}: invalid metafield namespace.`);
    }
    if (!FIELD_KEY_PATTERN.test(definition.key)) errors.push(`${path}: invalid metafield key.`);
    if (!SUPPORTED_TYPES.has(definition.type)) {
      errors.push(`${path}: unsupported metafield type "${definition.type}".`);
    }
    const compositeKey = `${definition.ownerType}.${definition.namespace}.${definition.key}`;
    if (metafieldKeys.has(compositeKey)) errors.push(`${path}: duplicate metafield definition.`);
    metafieldKeys.add(compositeKey);
    validateValidations(definition, path, errors);
    if (definition.namespace !== 'cms') errors.push(`${path}: CMS metafields must use namespace "cms".`);
    if (definition.storefrontAccess !== 'PUBLIC_READ') {
      errors.push(`${path}: public editorial metafields must be Storefront read-only.`);
    }
    if (definition.referenceTo && !metaobjectTypes.has(definition.referenceTo)) {
      errors.push(`${path}: reference target "${definition.referenceTo}" is not in the manifest.`);
    }
    if (
      definition.referenceTo &&
      !['metaobject_reference', 'list.metaobject_reference'].includes(definition.type)
    ) {
      errors.push(`${path}: referenceTo is valid only for metaobject reference types.`);
    }
    if (RESERVED_COMMERCE_KEYS.has(definition.key)) {
      errors.push(`${path}: CMS metafields may not shadow protected commerce fields.`);
    }
  }

  for (const requiredKey of REQUIRED_METAFIELDS) {
    if (!metafieldKeys.has(requiredKey)) errors.push(`Missing required metafield "${requiredKey}".`);
  }

  const dependencies = new Map(
    manifest.metaobjects.map((definition) => [
      definition.type,
      definition.fields
        .map((item) => item.referenceTo)
        .filter((target): target is string => Boolean(target)),
    ])
  );
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (type: string): void => {
    if (visiting.has(type)) {
      errors.push(`Metaobject reference cycle includes "${type}" and cannot be safely created.`);
      return;
    }
    if (visited.has(type)) return;
    visiting.add(type);
    for (const target of dependencies.get(type) || []) visit(target);
    visiting.delete(type);
    visited.add(type);
  };
  for (const type of dependencies.keys()) visit(type);

  return [...new Set(errors)];
};

export const redactSecret = (value: string, secret?: string): string => {
  let redacted = secret ? value.split(secret).join('[REDACTED]') : value;
  return redacted.replace(
    /\b(?:shpat|shpca|shppa|shpss)_[A-Za-z0-9_-]+\b/g,
    '[REDACTED]'
  );
};

export const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  isRecord(value);

export const normalizeShopifyValidation = (validation: SchemaValidation): string =>
  normalizedValidationValue(validation);
