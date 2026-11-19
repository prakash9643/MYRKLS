import { CMS_SCHEMA_MANIFEST, validateCmsSchema } from '../src/shopify/cms/schema/index.ts';

const errors = validateCmsSchema(CMS_SCHEMA_MANIFEST);
if (errors.length) {
  console.error('CMS schema validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `PASS CMS schema manifest: ${CMS_SCHEMA_MANIFEST.metaobjects.length} metaobjects, ` +
      `${CMS_SCHEMA_MANIFEST.metafields.length} metafields, ` +
      `${CMS_SCHEMA_MANIFEST.sectionTypes.length} approved section types`
  );
}
