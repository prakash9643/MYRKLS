export const SUPPORTED_SHOPIFY_FIELD_TYPES = [
  'boolean',
  'color',
  'date',
  'date_time',
  'file_reference',
  'json',
  'list.link',
  'list.metaobject_reference',
  'list.single_line_text_field',
  'metaobject_reference',
  'multi_line_text_field',
  'number_integer',
  'rich_text_field',
  'single_line_text_field',
  'url',
] as const;

export type ShopifyFieldType = (typeof SUPPORTED_SHOPIFY_FIELD_TYPES)[number];
export type SchemaClassification =
  | 'CREATE'
  | 'ALREADY_COMPATIBLE'
  | 'INCOMPATIBLE'
  | 'REQUIRES_REVIEW'
  | 'SKIPPED';

export interface SchemaValidation {
  name: string;
  value: string;
}

export interface CmsFieldDefinition {
  key: string;
  name: string;
  type: ShopifyFieldType;
  required: boolean;
  description?: string;
  validations?: SchemaValidation[];
  referenceTo?: string;
}

export interface CmsMetaobjectDefinition {
  type: string;
  name: string;
  description: string;
  displayNameKey: string;
  ownership: 'MERCHANT';
  adminAccess: 'MERCHANT_READ_WRITE';
  storefrontAccess: 'PUBLIC_READ' | 'NONE';
  publishable: boolean;
  legacyTypes?: string[];
  fields: CmsFieldDefinition[];
}

export interface CmsMetafieldDefinition {
  ownerType: 'PRODUCT' | 'COLLECTION';
  namespace: string;
  key: string;
  name: string;
  description: string;
  type: ShopifyFieldType;
  adminAccess: 'MERCHANT_READ_WRITE';
  storefrontAccess: 'PUBLIC_READ' | 'NONE';
  validations?: SchemaValidation[];
  referenceTo?: string;
  legacyKeys?: string[];
}

export interface CmsSchemaManifest {
  apiVersion: string;
  sectionTypes: string[];
  metaobjects: CmsMetaobjectDefinition[];
  metafields: CmsMetafieldDefinition[];
}

export interface ShopifyDefinitionField {
  key: string;
  name: string;
  type: string | { name: string };
  required?: boolean;
  validations?: SchemaValidation[];
}

export interface ShopifyMetaobjectDefinitionSnapshot {
  id: string;
  type: string;
  name: string;
  displayNameKey: string | null;
  access: {
    admin: string;
    storefront: string;
  };
  capabilities: {
    publishable: { enabled: boolean } | null;
  };
  fieldDefinitions: ShopifyDefinitionField[];
}

export interface ShopifyMetafieldDefinitionSnapshot {
  id: string;
  ownerType: 'PRODUCT' | 'COLLECTION';
  namespace: string;
  key: string;
  name: string;
  type: string | { name: string };
  access: {
    admin: string;
    storefront: string;
  };
  validations: SchemaValidation[];
}

export interface SchemaCheckItem {
  kind: 'metaobject' | 'metafield';
  key: string;
  classification: SchemaClassification;
  details: string[];
}
