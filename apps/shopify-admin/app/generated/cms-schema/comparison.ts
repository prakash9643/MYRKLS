import type {
  CmsMetaobjectDefinition,
  CmsMetafieldDefinition,
  SchemaCheckItem,
  SchemaClassification,
  SchemaValidation,
  ShopifyDefinitionField,
  ShopifyMetaobjectDefinitionSnapshot,
  ShopifyMetafieldDefinitionSnapshot,
} from './types.ts';
import { normalizeShopifyValidation } from './validation.ts';

const typeName = (type: string | { name: string }): string =>
  typeof type === 'string' ? type : type.name;

const normalizeValidations = (validations: SchemaValidation[] = []): string[] =>
  validations
    .map((validation) => `${validation.name}:${normalizeShopifyValidation(validation)}`)
    .sort();

const expectedValidations = (
  validations: SchemaValidation[] = [],
  referenceTo: string | undefined,
  targetIds: Map<string, string>
): SchemaValidation[] | null => {
  if (!referenceTo) return validations;
  const id = targetIds.get(referenceTo);
  if (!id) return null;
  return [...validations, { name: 'metaobject_definition_id', value: id }];
};

const validationsMatch = (
  actual: SchemaValidation[] = [],
  expected: SchemaValidation[] | null
): boolean =>
  expected !== null &&
  JSON.stringify(normalizeValidations(actual)) === JSON.stringify(normalizeValidations(expected));

const selectClassification = (values: SchemaClassification[]): SchemaClassification => {
  if (values.includes('INCOMPATIBLE')) return 'INCOMPATIBLE';
  if (values.includes('REQUIRES_REVIEW')) return 'REQUIRES_REVIEW';
  if (values.includes('SKIPPED')) return 'SKIPPED';
  if (values.includes('CREATE')) return 'CREATE';
  return 'ALREADY_COMPATIBLE';
};

export const compareMetaobjectDefinition = (
  expected: CmsMetaobjectDefinition,
  actual: ShopifyMetaobjectDefinitionSnapshot,
  targetIds: Map<string, string>
): SchemaCheckItem => {
  const details: string[] = [];
  const classifications: SchemaClassification[] = [];

  if (actual.type.startsWith('$app:')) {
    classifications.push('REQUIRES_REVIEW');
    details.push('Existing definition is app-owned; the manifest requires merchant ownership.');
  }
  if (actual.access.admin !== expected.adminAccess) {
    classifications.push('REQUIRES_REVIEW');
    details.push(`Admin access is ${actual.access.admin}; expected ${expected.adminAccess}.`);
  }
  if (actual.access.storefront !== expected.storefrontAccess) {
    classifications.push('REQUIRES_REVIEW');
    details.push(
      `Storefront access is ${actual.access.storefront}; expected ${expected.storefrontAccess}.`
    );
  }
  if (actual.displayNameKey !== expected.displayNameKey) {
    classifications.push('REQUIRES_REVIEW');
    details.push('Display-name field differs from the manifest.');
  }
  if (Boolean(actual.capabilities.publishable?.enabled) !== expected.publishable) {
    classifications.push('REQUIRES_REVIEW');
    details.push('Publishable capability differs from the manifest.');
  }

  const actualFields = new Map(actual.fieldDefinitions.map((item) => [item.key, item]));
  for (const field of expected.fields) {
    const found = actualFields.get(field.key);
    if (!found) {
      classifications.push('INCOMPATIBLE');
      details.push(`Missing field "${field.key}".`);
      continue;
    }
    if (typeName(found.type) !== field.type) {
      classifications.push('INCOMPATIBLE');
      details.push(`Field "${field.key}" has type ${typeName(found.type)}; expected ${field.type}.`);
    }
    if (Boolean(found.required) !== field.required) {
      classifications.push('INCOMPATIBLE');
      details.push(`Field "${field.key}" required status differs from the manifest.`);
    }
    const expectedFieldValidations = expectedValidations(
      field.validations,
      field.referenceTo,
      targetIds
    );
    if (!validationsMatch(found.validations, expectedFieldValidations)) {
      classifications.push('INCOMPATIBLE');
      details.push(
        expectedFieldValidations === null
          ? `Reference target "${field.referenceTo}" does not exist in Shopify.`
          : `Field "${field.key}" validations differ from the manifest.`
      );
    }
  }

  const expectedKeys = new Set(expected.fields.map((item) => item.key));
  const extraFields = actual.fieldDefinitions
    .filter((item: ShopifyDefinitionField) => !expectedKeys.has(item.key))
    .map((item) => item.key);
  if (extraFields.length) {
    classifications.push('REQUIRES_REVIEW');
    details.push(`Existing extra fields will be preserved: ${extraFields.join(', ')}.`);
  }

  return {
    kind: 'metaobject',
    key: expected.type,
    classification: selectClassification(classifications),
    details: details.length ? details : ['Definition, ownership, access, fields, and validations match.'],
  };
};

export const compareMetafieldDefinition = (
  expected: CmsMetafieldDefinition,
  actual: ShopifyMetafieldDefinitionSnapshot,
  targetIds: Map<string, string>
): SchemaCheckItem => {
  const details: string[] = [];
  const classifications: SchemaClassification[] = [];
  if (typeName(actual.type) !== expected.type) {
    classifications.push('INCOMPATIBLE');
    details.push(`Type is ${typeName(actual.type)}; expected ${expected.type}.`);
  }
  if (actual.name !== expected.name) {
    classifications.push('REQUIRES_REVIEW');
    details.push('Admin display name differs from the manifest.');
  }
  if (actual.access.admin !== expected.adminAccess) {
    classifications.push('REQUIRES_REVIEW');
    details.push(`Admin access is ${actual.access.admin}; expected ${expected.adminAccess}.`);
  }
  if (actual.access.storefront !== expected.storefrontAccess) {
    classifications.push('REQUIRES_REVIEW');
    details.push(
      `Storefront access is ${actual.access.storefront}; expected ${expected.storefrontAccess}.`
    );
  }
  const expectedDefinitionValidations = expectedValidations(
    expected.validations,
    expected.referenceTo,
    targetIds
  );
  if (!validationsMatch(actual.validations, expectedDefinitionValidations)) {
    classifications.push('INCOMPATIBLE');
    details.push(
      expectedDefinitionValidations === null
        ? `Reference target "${expected.referenceTo}" does not exist in Shopify.`
        : 'Validations differ from the manifest.'
    );
  }
  return {
    kind: 'metafield',
    key: `${expected.ownerType}.${expected.namespace}.${expected.key}`,
    classification: selectClassification(classifications),
    details: details.length ? details : ['Definition, owner, access, type, and validations match.'],
  };
};

export const compareCmsSchema = (
  metaobjects: CmsMetaobjectDefinition[],
  metafields: CmsMetafieldDefinition[],
  actualMetaobjects: ShopifyMetaobjectDefinitionSnapshot[],
  actualMetafields: ShopifyMetafieldDefinitionSnapshot[],
  supportedTypes: Set<string>
): SchemaCheckItem[] => {
  const targetIds = new Map(actualMetaobjects.map((definition) => [definition.type, definition.id]));
  const metaobjectByType = new Map(actualMetaobjects.map((definition) => [definition.type, definition]));
  const metafieldByKey = new Map(
    actualMetafields.map((definition) => [
      `${definition.ownerType}.${definition.namespace}.${definition.key}`,
      definition,
    ])
  );
  const results: SchemaCheckItem[] = [];

  for (const expected of metaobjects) {
    const unsupported = expected.fields
      .filter((field) => !supportedTypes.has(field.type))
      .map((field) => `${field.key}:${field.type}`);
    if (unsupported.length) {
      results.push({
        kind: 'metaobject',
        key: expected.type,
        classification: 'SKIPPED',
        details: [`Unsupported by the live Admin API version: ${unsupported.join(', ')}.`],
      });
      continue;
    }
    const actual = metaobjectByType.get(expected.type);
    if (actual) {
      results.push(compareMetaobjectDefinition(expected, actual, targetIds));
      continue;
    }
    const alias = (expected.legacyTypes || []).find((legacyType) => metaobjectByType.has(legacyType));
    if (alias) {
      results.push({
        kind: 'metaobject',
        key: expected.type,
        classification: 'REQUIRES_REVIEW',
        details: [`Legacy definition "${alias}" exists; no rename or duplicate is performed automatically.`],
      });
      continue;
    }
    results.push({
      kind: 'metaobject',
      key: expected.type,
      classification: 'CREATE',
      details: ['Definition is missing and can be created additively after approval.'],
    });
  }

  for (const expected of metafields) {
    if (!supportedTypes.has(expected.type)) {
      results.push({
        kind: 'metafield',
        key: `${expected.ownerType}.${expected.namespace}.${expected.key}`,
        classification: 'SKIPPED',
        details: [`Type "${expected.type}" is unsupported by the live Admin API version.`],
      });
      continue;
    }
    const key = `${expected.ownerType}.${expected.namespace}.${expected.key}`;
    const actual = metafieldByKey.get(key);
    results.push(
      actual
        ? compareMetafieldDefinition(expected, actual, targetIds)
        : {
            kind: 'metafield',
            key,
            classification: 'CREATE',
            details: [
              'Definition is missing; creation may attach matching unstructured metafield values and requires owner review.',
            ],
          }
    );
  }

  return results;
};
