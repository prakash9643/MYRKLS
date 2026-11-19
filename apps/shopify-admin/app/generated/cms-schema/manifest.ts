import {
  CMS_METAOBJECT_DEFINITIONS,
  CMS_METAFIELD_DEFINITIONS,
  CMS_SECTION_TYPES,
} from './definitions.ts';
import type { CmsSchemaManifest } from './types.ts';

export const CMS_SCHEMA_MANIFEST: CmsSchemaManifest = {
  apiVersion: '2026-10',
  sectionTypes: [...CMS_SECTION_TYPES],
  metaobjects: CMS_METAOBJECT_DEFINITIONS,
  metafields: CMS_METAFIELD_DEFINITIONS,
};
