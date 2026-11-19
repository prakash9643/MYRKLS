import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import {
  CMS_SCHEMA_MANIFEST,
  compareCmsSchema,
  redactSecret,
  validateCmsSchema,
  type CmsFieldDefinition,
  type CmsMetaobjectDefinition,
  type CmsMetafieldDefinition,
  type SchemaCheckItem,
  type SchemaValidation,
  type ShopifyMetaobjectDefinitionSnapshot,
  type ShopifyMetafieldDefinitionSnapshot,
} from '../src/shopify/cms/schema/index.ts';

interface AdminConfig {
  storeDomain: string;
  accessToken: string;
  apiVersion: string;
}

interface Connection<T> {
  nodes: T[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

interface AdminSchemaSnapshot {
  metaobjects: ShopifyMetaobjectDefinitionSnapshot[];
  metafields: ShopifyMetafieldDefinitionSnapshot[];
  supportedTypes: Set<string>;
}

interface PreflightReport {
  status: 'READY' | 'PENDING_APPROVAL';
  storeDomain: string | null;
  apiVersion: string;
  items: SchemaCheckItem[];
  notes: string[];
}

const TYPES_QUERY = `
  query CmsSchemaTypes {
    metafieldDefinitionTypes {
      name
      supportedValidations { name type }
    }
  }
`;

const METAOBJECTS_QUERY = `
  query CmsMetaobjectDefinitions($after: String) {
    metaobjectDefinitions(first: 250, after: $after) {
      nodes {
        id
        type
        name
        displayNameKey
        access { admin storefront }
        capabilities { publishable { enabled } }
        fieldDefinitions {
          key
          name
          type { name }
          required
          validations { name value }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const METAFIELDS_QUERY = `
  query CmsMetafieldDefinitions(
    $ownerType: MetafieldOwnerType!
    $namespace: String!
    $after: String
  ) {
    metafieldDefinitions(
      ownerType: $ownerType
      namespace: $namespace
      first: 250
      after: $after
    ) {
      nodes {
        id
        ownerType
        namespace
        key
        name
        type { name }
        access { admin storefront }
        validations { name value }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const CREATE_METAOBJECT_MUTATION = `
  mutation CreateCmsMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
    metaobjectDefinitionCreate(definition: $definition) {
      metaobjectDefinition { id type }
      userErrors { field message code }
    }
  }
`;

const CREATE_METAFIELD_MUTATION = `
  mutation CreateCmsMetafieldDefinition($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition { id namespace key }
      userErrors { field message code }
    }
  }
`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const textValue = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const readAdminConfig = (): { config: AdminConfig | null; missing: string[] } => {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN?.trim().toLowerCase() || '';
  const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim() || '';
  const apiVersion = process.env.SHOPIFY_ADMIN_API_VERSION?.trim() || '';
  const missing = [
    !storeDomain ? 'SHOPIFY_STORE_DOMAIN' : '',
    !accessToken ? 'SHOPIFY_ADMIN_ACCESS_TOKEN' : '',
    !apiVersion ? 'SHOPIFY_ADMIN_API_VERSION' : '',
  ].filter(Boolean);

  if (missing.length) return { config: null, missing };
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(storeDomain)) {
    throw new Error('SHOPIFY_STORE_DOMAIN must be a *.myshopify.com hostname.');
  }
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(apiVersion)) {
    throw new Error('SHOPIFY_ADMIN_API_VERSION must use the YYYY-MM format.');
  }
  return { config: { storeDomain, accessToken, apiVersion }, missing: [] };
};

const adminGraphql = async <TData>(
  config: AdminConfig,
  operationName: string,
  query: string,
  variables: Record<string, unknown> = {}
): Promise<TData> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20_000);
  const endpoint = `https://${config.storeDomain}/admin/api/${config.apiVersion}/graphql.json`;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': config.accessToken,
      },
      body: JSON.stringify({ operationName, query, variables }),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Shopify Admin API returned HTTP ${response.status} for ${operationName}.`);
    }
    const payload: unknown = await response.json();
    if (!isRecord(payload)) throw new Error(`Shopify returned an invalid ${operationName} response.`);
    if (Array.isArray(payload.errors) && payload.errors.length) {
      const messages = payload.errors
        .filter(isRecord)
        .map((item) => textValue(item.message))
        .filter(Boolean)
        .map((message) => redactSecret(message, config.accessToken));
      throw new Error(
        messages.length
          ? `${operationName}: ${messages.join('; ')}`
          : `${operationName} failed with a GraphQL error.`
      );
    }
    if (!isRecord(payload.data)) {
      throw new Error(`Shopify returned no data for ${operationName}.`);
    }
    return payload.data as TData;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(redactSecret(error.message, config.accessToken));
    }
    throw new Error(`${operationName} failed with an unknown Admin API error.`);
  } finally {
    clearTimeout(timeoutId);
  }
};

const readConnection = <T>(value: unknown, operation: string): Connection<T> => {
  if (!isRecord(value) || !Array.isArray(value.nodes) || !isRecord(value.pageInfo)) {
    throw new Error(`Shopify returned an invalid ${operation} connection.`);
  }
  return {
    nodes: value.nodes as T[],
    pageInfo: {
      hasNextPage: value.pageInfo.hasNextPage === true,
      endCursor: textValue(value.pageInfo.endCursor) || null,
    },
  };
};

const readAllMetaobjectDefinitions = async (
  config: AdminConfig
): Promise<ShopifyMetaobjectDefinitionSnapshot[]> => {
  const all: ShopifyMetaobjectDefinitionSnapshot[] = [];
  let after: string | null = null;
  do {
    const data: { metaobjectDefinitions: unknown } = await adminGraphql<{
      metaobjectDefinitions: unknown;
    }>(
      config,
      'CmsMetaobjectDefinitions',
      METAOBJECTS_QUERY,
      { after }
    );
    const connection: Connection<ShopifyMetaobjectDefinitionSnapshot> = readConnection<
      ShopifyMetaobjectDefinitionSnapshot
    >(
      data.metaobjectDefinitions,
      'metaobject definition'
    );
    all.push(...connection.nodes);
    after = connection.pageInfo.hasNextPage ? connection.pageInfo.endCursor : null;
    if (connection.pageInfo.hasNextPage && !after) {
      throw new Error('Shopify returned a paginated metaobject connection without a cursor.');
    }
  } while (after);
  return all;
};

const readAllMetafieldDefinitions = async (
  config: AdminConfig,
  ownerType: 'PRODUCT' | 'COLLECTION'
): Promise<ShopifyMetafieldDefinitionSnapshot[]> => {
  const all: ShopifyMetafieldDefinitionSnapshot[] = [];
  let after: string | null = null;
  do {
    const data: { metafieldDefinitions: unknown } = await adminGraphql<{
      metafieldDefinitions: unknown;
    }>(
      config,
      'CmsMetafieldDefinitions',
      METAFIELDS_QUERY,
      { ownerType, namespace: 'cms', after }
    );
    const connection: Connection<ShopifyMetafieldDefinitionSnapshot> = readConnection<
      ShopifyMetafieldDefinitionSnapshot
    >(
      data.metafieldDefinitions,
      'metafield definition'
    );
    all.push(...connection.nodes);
    after = connection.pageInfo.hasNextPage ? connection.pageInfo.endCursor : null;
    if (connection.pageInfo.hasNextPage && !after) {
      throw new Error(`Shopify returned a paginated ${ownerType} metafield connection without a cursor.`);
    }
  } while (after);
  return all;
};

const readAdminSchema = async (config: AdminConfig): Promise<AdminSchemaSnapshot> => {
  const [metaobjects, productMetafields, collectionMetafields, typeData] = await Promise.all([
    readAllMetaobjectDefinitions(config),
    readAllMetafieldDefinitions(config, 'PRODUCT'),
    readAllMetafieldDefinitions(config, 'COLLECTION'),
    adminGraphql<{
      metafieldDefinitionTypes: Array<{ name: string; supportedValidations: Array<{ name: string }> }>;
    }>(config, 'CmsSchemaTypes', TYPES_QUERY),
  ]);
  if (!Array.isArray(typeData.metafieldDefinitionTypes)) {
    throw new Error('Shopify returned an invalid Admin API field-type list.');
  }
  return {
    metaobjects,
    metafields: [...productMetafields, ...collectionMetafields],
    supportedTypes: new Set(typeData.metafieldDefinitionTypes.map((item) => item.name)),
  };
};

const skippedItems = (reason: string): SchemaCheckItem[] => [
  ...CMS_SCHEMA_MANIFEST.metaobjects.map((item) => ({
    kind: 'metaobject' as const,
    key: item.type,
    classification: 'SKIPPED' as const,
    details: [reason],
  })),
  ...CMS_SCHEMA_MANIFEST.metafields.map((item) => ({
    kind: 'metafield' as const,
    key: `${item.ownerType}.${item.namespace}.${item.key}`,
    classification: 'SKIPPED' as const,
    details: [reason],
  })),
];

const makeReport = (
  config: AdminConfig | null,
  items: SchemaCheckItem[],
  notes: string[]
): PreflightReport => ({
  status: config ? 'READY' : 'PENDING_APPROVAL',
  storeDomain: config?.storeDomain || null,
  apiVersion: config?.apiVersion || CMS_SCHEMA_MANIFEST.apiVersion,
  items,
  notes,
});

const printReport = (report: PreflightReport): void => {
  const counts = new Map<string, number>();
  for (const item of report.items) {
    counts.set(item.classification, (counts.get(item.classification) || 0) + 1);
  }
  console.log(
    `CMS schema preflight: ${report.status}` +
      (report.storeDomain ? ` | ${report.storeDomain} | Admin API ${report.apiVersion}` : '')
  );
  for (const classification of [
    'CREATE',
    'ALREADY_COMPATIBLE',
    'INCOMPATIBLE',
    'REQUIRES_REVIEW',
    'SKIPPED',
  ]) {
    console.log(`${classification}: ${counts.get(classification) || 0}`);
  }
  for (const item of report.items) {
    console.log(`${item.classification} ${item.kind} ${item.key}`);
    for (const detail of item.details) console.log(`  - ${detail}`);
  }
  for (const note of report.notes) console.log(`NOTE ${note}`);
}

const makeReferenceValidations = (
  validations: SchemaValidation[] = [],
  referenceTo: string | undefined,
  targetIds: Map<string, string>
): SchemaValidation[] => {
  if (!referenceTo) return validations;
  const targetId = targetIds.get(referenceTo);
  if (!targetId) throw new Error(`Cannot create a reference to missing metaobject "${referenceTo}".`);
  return [...validations, { name: 'metaobject_definition_id', value: targetId }];
};

const makeFieldInput = (
  field: CmsFieldDefinition,
  targetIds: Map<string, string>
): Record<string, unknown> => ({
  key: field.key,
  name: field.name,
  type: field.type,
  required: field.required,
  ...(field.description ? { description: field.description } : {}),
  validations: makeReferenceValidations(field.validations, field.referenceTo, targetIds),
});

const createMetaobjectDefinition = async (
  config: AdminConfig,
  definition: CmsMetaobjectDefinition,
  targetIds: Map<string, string>
): Promise<string> => {
  const input = {
    type: definition.type,
    name: definition.name,
    description: definition.description,
    displayNameKey: definition.displayNameKey,
    fieldDefinitions: definition.fields.map((field) => makeFieldInput(field, targetIds)),
    access: {
      admin: definition.adminAccess,
      storefront: definition.storefrontAccess,
    },
    capabilities: { publishable: { enabled: definition.publishable } },
  };
  const data = await adminGraphql<{
    metaobjectDefinitionCreate: {
      metaobjectDefinition: { id: string; type: string } | null;
      userErrors: Array<{ field: string[] | null; message: string; code: string | null }>;
    };
  }>(config, 'CreateCmsMetaobjectDefinition', CREATE_METAOBJECT_MUTATION, { definition: input });
  const result = data.metaobjectDefinitionCreate;
  if (result.userErrors.length) {
    throw new Error(`Metaobject definition ${definition.type} was rejected by Shopify.`);
  }
  if (!result.metaobjectDefinition?.id) {
    throw new Error(`Shopify did not confirm creation of metaobject ${definition.type}.`);
  }
  return result.metaobjectDefinition.id;
};

const createMetafieldDefinition = async (
  config: AdminConfig,
  definition: CmsMetafieldDefinition,
  targetIds: Map<string, string>
): Promise<void> => {
  const input = {
    name: definition.name,
    namespace: definition.namespace,
    key: definition.key,
    description: definition.description,
    type: definition.type,
    ownerType: definition.ownerType,
    access: {
      admin: definition.adminAccess,
      storefront: definition.storefrontAccess,
    },
    validations: makeReferenceValidations(
      definition.validations,
      definition.referenceTo,
      targetIds
    ),
  };
  const data = await adminGraphql<{
    metafieldDefinitionCreate: {
      createdDefinition: { id: string; namespace: string; key: string } | null;
      userErrors: Array<{ field: string[] | null; message: string; code: string | null }>;
    };
  }>(config, 'CreateCmsMetafieldDefinition', CREATE_METAFIELD_MUTATION, { definition: input });
  const result = data.metafieldDefinitionCreate;
  if (result.userErrors.length) {
    throw new Error(
      `Metafield definition ${definition.ownerType}.${definition.namespace}.${definition.key} was rejected by Shopify.`
    );
  }
  if (!result.createdDefinition?.id) {
    throw new Error(
      `Shopify did not confirm creation of metafield ${definition.ownerType}.${definition.namespace}.${definition.key}.`
    );
  }
};

const orderMetaobjectsForCreation = (
  definitions: CmsMetaobjectDefinition[]
): CmsMetaobjectDefinition[] => {
  const byType = new Map(definitions.map((definition) => [definition.type, definition]));
  const visited = new Set<string>();
  const ordered: CmsMetaobjectDefinition[] = [];
  const visit = (definition: CmsMetaobjectDefinition): void => {
    if (visited.has(definition.type)) return;
    visited.add(definition.type);
    for (const field of definition.fields) {
      const dependency = field.referenceTo ? byType.get(field.referenceTo) : undefined;
      if (dependency) visit(dependency);
    }
    ordered.push(definition);
  };
  for (const definition of definitions) visit(definition);
  return ordered;
};

const askForStoreConfirmation = async (storeDomain: string): Promise<boolean> => {
  if (!stdin.isTTY || !stdout.isTTY) {
    throw new Error('Live schema creation requires an interactive terminal confirmation.');
  }
  const prompt = createInterface({ input: stdin, output: stdout });
  try {
    const answer = await prompt.question(
      `Type "CREATE CMS SCHEMA FOR ${storeDomain}" to confirm the approved live schema creation: `
    );
    return answer === `CREATE CMS SCHEMA FOR ${storeDomain}`;
  } finally {
    prompt.close();
  }
};

const applyAdditiveChanges = async (
  config: AdminConfig,
  snapshot: AdminSchemaSnapshot,
  items: SchemaCheckItem[]
): Promise<void> => {
  if (process.env.SHOPIFY_CMS_SCHEMA_APPROVED !== 'true') {
    throw new Error('No writes performed: SHOPIFY_CMS_SCHEMA_APPROVED=true is required.');
  }
  const blockers = items.filter((item) =>
    ['INCOMPATIBLE', 'REQUIRES_REVIEW', 'SKIPPED'].includes(item.classification)
  );
  if (blockers.length) {
    throw new Error(
      `No writes performed: resolve ${blockers.length} incompatible, review, or skipped result(s) first.`
    );
  }
  const metafieldCreates = items.some(
    (item) => item.kind === 'metafield' && item.classification === 'CREATE'
  );
  if (
    metafieldCreates &&
    process.env.SHOPIFY_CMS_SCHEMA_METAFIELD_DATA_REVIEWED !== 'true'
  ) {
    throw new Error(
      'No writes performed: the store owner must review existing unstructured cms metafields and set SHOPIFY_CMS_SCHEMA_METAFIELD_DATA_REVIEWED=true.'
    );
  }
  const hasCreates = items.some((item) => item.classification === 'CREATE');
  if (!hasCreates) {
    console.log('No schema writes required; all manifest definitions are already compatible.');
    return;
  }
  if (!(await askForStoreConfirmation(config.storeDomain))) {
    throw new Error('No writes performed: store-domain confirmation did not match.');
  }

  const targetIds = new Map(snapshot.metaobjects.map((definition) => [definition.type, definition.id]));
  const missingMetaobjects = new Set(
    items
      .filter((item) => item.kind === 'metaobject' && item.classification === 'CREATE')
      .map((item) => item.key)
  );
  for (const definition of orderMetaobjectsForCreation(CMS_SCHEMA_MANIFEST.metaobjects)) {
    if (!missingMetaobjects.has(definition.type)) continue;
    const id = await createMetaobjectDefinition(config, definition, targetIds);
    targetIds.set(definition.type, id);
    console.log(`Created metaobject definition: ${definition.type}`);
  }

  for (const definition of CMS_SCHEMA_MANIFEST.metafields) {
    const key = `${definition.ownerType}.${definition.namespace}.${definition.key}`;
    if (
      items.some(
        (item) =>
          item.kind === 'metafield' &&
          item.key === key &&
          item.classification === 'CREATE'
      )
    ) {
      await createMetafieldDefinition(config, definition, targetIds);
      console.log(`Created metafield definition: ${key}`);
    }
  }
};

const main = async (): Promise<void> => {
  const localErrors = validateCmsSchema(CMS_SCHEMA_MANIFEST);
  if (localErrors.length) {
    throw new Error(`Local manifest validation failed: ${localErrors.join(' | ')}`);
  }
  const { config, missing } = readAdminConfig();
  const notes = [
    'Credentials are read from process environment only; no dotenv file is loaded.',
    'This command never deletes or updates existing definitions or content.',
    'Shopify documents metafieldDefinitionCreate as validating matching unstructured values and attaching valid values to the new definition; owner review is required before creation.',
    'Required scopes: read_metaobject_definitions and read_metafield_definitions; add write_metaobject_definitions and write_metafield_definitions only for explicitly approved --apply.',
  ];

  if (!config) {
    const report = makeReport(
      null,
      skippedItems(`Missing server-side configuration: ${missing.join(', ')}.`),
      [...notes, 'Live schema preflight is PENDING_APPROVAL; no Admin API request was sent.']
    );
    printReport(report);
    if (process.argv.includes('--apply')) {
      throw new Error('No writes performed: configure server-side Admin API access first.');
    }
    return;
  }

  const snapshot = await readAdminSchema(config);
  const items = compareCmsSchema(
    CMS_SCHEMA_MANIFEST.metaobjects,
    CMS_SCHEMA_MANIFEST.metafields,
    snapshot.metaobjects,
    snapshot.metafields,
    snapshot.supportedTypes
  );
  const report = makeReport(config, items, notes);
  printReport(report);

  if (!process.argv.includes('--apply')) {
    if (items.some((item) => item.classification === 'INCOMPATIBLE')) process.exitCode = 2;
    return;
  }

  await applyAdditiveChanges(config, snapshot, items);
  const verified = await readAdminSchema(config);
  const finalItems = compareCmsSchema(
    CMS_SCHEMA_MANIFEST.metaobjects,
    CMS_SCHEMA_MANIFEST.metafields,
    verified.metaobjects,
    verified.metafields,
    verified.supportedTypes
  );
  printReport(makeReport(config, finalItems, [...notes, 'Post-deployment read-back completed.']));
  if (finalItems.some((item) => item.classification !== 'ALREADY_COMPATIBLE')) {
    throw new Error('Shopify did not confirm that every manifest definition is compatible.');
  }
};

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'CMS schema preflight failed.';
  console.error(redactSecret(message, process.env.SHOPIFY_ADMIN_ACCESS_TOKEN));
  process.exitCode = 1;
});
