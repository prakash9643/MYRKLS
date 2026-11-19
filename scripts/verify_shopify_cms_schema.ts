import assert from 'node:assert/strict';
import {
  CMS_SCHEMA_MANIFEST,
  SUPPORTED_SHOPIFY_FIELD_TYPES,
  compareCmsSchema,
  redactSecret,
  validateCmsSchema,
  validateShopifyHandle,
  type CmsSchemaManifest,
  type ShopifyMetaobjectDefinitionSnapshot,
  type ShopifyMetafieldDefinitionSnapshot,
} from '../src/shopify/cms/schema/index.ts';

const cloneManifest = (): CmsSchemaManifest =>
  JSON.parse(JSON.stringify(CMS_SCHEMA_MANIFEST)) as CmsSchemaManifest;

const ids = new Map(
  CMS_SCHEMA_MANIFEST.metaobjects.map((definition, index) => [
    definition.type,
    `gid://shopify/MetaobjectDefinition/${index + 1}`,
  ])
);

const makeCompatibleMetaobjects = (): ShopifyMetaobjectDefinitionSnapshot[] =>
  CMS_SCHEMA_MANIFEST.metaobjects.map((definition) => ({
    id: ids.get(definition.type) || '',
    type: definition.type,
    name: definition.name,
    displayNameKey: definition.displayNameKey,
    access: {
      admin: definition.adminAccess,
      storefront: definition.storefrontAccess,
    },
    capabilities: { publishable: { enabled: definition.publishable } },
    fieldDefinitions: definition.fields.map((field) => ({
      key: field.key,
      name: field.name,
      type: { name: field.type },
      required: field.required,
      validations: [
        ...(field.validations || []),
        ...(field.referenceTo
          ? [
              {
                name: 'metaobject_definition_id',
                value: ids.get(field.referenceTo) || '',
              },
            ]
          : []),
      ],
    })),
  }));

const makeCompatibleMetafields = (): ShopifyMetafieldDefinitionSnapshot[] =>
  CMS_SCHEMA_MANIFEST.metafields.map((definition, index) => ({
    id: `gid://shopify/MetafieldDefinition/${index + 1}`,
    ownerType: definition.ownerType,
    namespace: definition.namespace,
    key: definition.key,
    name: definition.name,
    type: { name: definition.type },
    access: {
      admin: definition.adminAccess,
      storefront: definition.storefrontAccess,
    },
    validations: [
      ...(definition.validations || []),
      ...(definition.referenceTo
        ? [
            {
              name: 'metaobject_definition_id',
              value: ids.get(definition.referenceTo) || '',
            },
          ]
        : []),
    ],
  }));

const tests: Array<[string, () => void]> = [
  [
    'manifest completeness',
    () => {
      assert.equal(CMS_SCHEMA_MANIFEST.metaobjects.length, 12);
      assert.equal(CMS_SCHEMA_MANIFEST.metafields.length, 10);
      assert.equal(validateCmsSchema(CMS_SCHEMA_MANIFEST).length, 0);
    },
  ],
  [
    'duplicate definition and field keys',
    () => {
      const duplicateDefinition = cloneManifest();
      duplicateDefinition.metaobjects.push(duplicateDefinition.metaobjects[0]);
      assert.ok(validateCmsSchema(duplicateDefinition).some((error) => error.includes('Duplicate metaobject type')));

      const duplicateField = cloneManifest();
      const section = duplicateField.metaobjects.find((item) => item.type === 'cms_section');
      assert.ok(section);
      section.fields.push({ ...section.fields[0] });
      assert.ok(validateCmsSchema(duplicateField).some((error) => error.includes('duplicate field key')));
    },
  ],
  [
    'invalid Shopify field type',
    () => {
      const invalid = cloneManifest();
      const firstField = invalid.metaobjects[0].fields[0] as unknown as { type: string };
      firstField.type = 'not_a_shopify_field_type';
      assert.ok(validateCmsSchema(invalid).some((error) => error.includes('unsupported field type')));
    },
  ],
  [
    'invalid reference target',
    () => {
      const invalid = cloneManifest();
      const productFaqs = invalid.metafields.find((item) => item.key === 'product_faqs');
      assert.ok(productFaqs);
      productFaqs.referenceTo = 'missing_definition';
      assert.ok(validateCmsSchema(invalid).some((error) => error.includes('reference target')));
    },
  ],
  [
    'section type allowlist',
    () => {
      const invalid = cloneManifest();
      const sectionType = invalid.metaobjects
        .find((item) => item.type === 'cms_section')
        ?.fields.find((item) => item.key === 'section_type');
      assert.ok(sectionType);
      const choice = sectionType.validations?.find((item) => item.name === 'choices');
      assert.ok(choice);
      choice.value = '["hero","arbitrary_component"]';
      assert.ok(validateCmsSchema(invalid).some((error) => error.includes('Phase 1 allowlist')));
    },
  ],
  [
    'invalid handles',
    () => {
      assert.equal(validateShopifyHandle('valid-campaign-1'), true);
      assert.equal(validateShopifyHandle('Upper Case'), false);
      assert.equal(validateShopifyHandle('../bad'), false);
    },
  ],
  [
    'missing required field',
    () => {
      const invalid = cloneManifest();
      const hero = invalid.metaobjects.find((item) => item.type === 'homepage_hero_banner');
      assert.ok(hero);
      const heading = hero.fields.find((item) => item.key === 'heading');
      assert.ok(heading);
      heading.required = false;
      assert.ok(validateCmsSchema(invalid).some((error) => error.includes('required field "heading"')));
    },
  ],
  [
    'metafield namespace and key validation',
    () => {
      const invalid = cloneManifest();
      invalid.metafields[0].namespace = 'x';
      invalid.metafields[1].key = 'bad key';
      const errors = validateCmsSchema(invalid);
      assert.ok(errors.some((error) => error.includes('invalid metafield namespace')));
      assert.ok(errors.some((error) => error.includes('invalid metafield key')));
    },
  ],
  [
    'compatible schema comparison',
    () => {
      const result = compareCmsSchema(
        CMS_SCHEMA_MANIFEST.metaobjects,
        CMS_SCHEMA_MANIFEST.metafields,
        makeCompatibleMetaobjects(),
        makeCompatibleMetafields(),
        new Set(SUPPORTED_SHOPIFY_FIELD_TYPES)
      );
      assert.equal(result.length, 22);
      assert.ok(result.every((item) => item.classification === 'ALREADY_COMPATIBLE'));
    },
  ],
  [
    'incompatible schema and missing validation detection',
    () => {
      const metaobjects = makeCompatibleMetaobjects();
      const section = metaobjects.find((item) => item.type === 'cms_section');
      assert.ok(section);
      const heading = section.fieldDefinitions.find((item) => item.key === 'heading');
      assert.ok(heading);
      heading.type = { name: 'number_integer' };
      const metafields = makeCompatibleMetafields();
      const collectionBanner = metafields.find((item) => item.key === 'collection_banner');
      assert.ok(collectionBanner);
      collectionBanner.validations = [];
      const result = compareCmsSchema(
        CMS_SCHEMA_MANIFEST.metaobjects,
        CMS_SCHEMA_MANIFEST.metafields,
        metaobjects,
        metafields,
        new Set(SUPPORTED_SHOPIFY_FIELD_TYPES)
      );
      assert.equal(result.find((item) => item.key === 'cms_section')?.classification, 'INCOMPATIBLE');
      assert.equal(
        result.find((item) => item.key === 'COLLECTION.cms.collection_banner')?.classification,
        'INCOMPATIBLE'
      );
    },
  ],
  [
    'legacy type requires review rather than duplicate creation',
    () => {
      const actual = makeCompatibleMetaobjects().filter((item) => item.type !== 'cms_section');
      actual.push({
        ...makeCompatibleMetaobjects()[2],
        id: 'gid://shopify/MetaobjectDefinition/legacy',
        type: 'homepage_section',
      });
      const result = compareCmsSchema(
        CMS_SCHEMA_MANIFEST.metaobjects,
        [],
        actual,
        [],
        new Set(SUPPORTED_SHOPIFY_FIELD_TYPES)
      );
      assert.equal(result.find((item) => item.key === 'cms_section')?.classification, 'REQUIRES_REVIEW');
    },
  ],
  [
    'preflight comparison is idempotent',
    () => {
      const first = compareCmsSchema(
        CMS_SCHEMA_MANIFEST.metaobjects,
        CMS_SCHEMA_MANIFEST.metafields,
        makeCompatibleMetaobjects(),
        makeCompatibleMetafields(),
        new Set(SUPPORTED_SHOPIFY_FIELD_TYPES)
      );
      const second = compareCmsSchema(
        CMS_SCHEMA_MANIFEST.metaobjects,
        CMS_SCHEMA_MANIFEST.metafields,
        makeCompatibleMetaobjects(),
        makeCompatibleMetafields(),
        new Set(SUPPORTED_SHOPIFY_FIELD_TYPES)
      );
      assert.deepEqual(second, first);
      assert.ok(second.every((item) => item.classification === 'ALREADY_COMPATIBLE'));
    },
  ],
  [
    'secret redaction',
    () => {
      const secret = 'shpat_sensitive_example_token';
      const output = redactSecret(`authorization ${secret}`, secret);
      assert.equal(output.includes(secret), false);
      assert.match(output, /\[REDACTED\]/);
      assert.equal(redactSecret('header shpss_another_secret_value').includes('shpss_'), false);
    },
  ],
];

for (const [name, run] of tests) {
  run();
  console.log(`PASS ${name}`);
}
