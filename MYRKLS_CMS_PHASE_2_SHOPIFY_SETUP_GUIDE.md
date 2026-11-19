# MYRKLS CMS Phase 2 — Shopify Setup Guide

**Current state:** No Admin credentials are configured and no live Shopify request or schema mutation has been performed. Follow this guide only after merchant approval.

## 1. Prerequisites

- Node.js `>=22.12.0` and the existing project dependencies.
- Confirmed target `*.myshopify.com` store domain and the approved Admin API version (`2026-10`).
- Merchant review of all definitions in [MYRKLS_CMS_PHASE_2_SCHEMA_REFERENCE.md](./MYRKLS_CMS_PHASE_2_SCHEMA_REFERENCE.md).
- A private trusted shell or deployment environment. Never supply an Admin token through a `VITE_*` variable, source file, browser, client build, screenshot, or chat.
- A Shopify Admin API credential with only the scopes required for the selected operation.

## 2. Credentials and scopes

Set these process environment variables in the trusted shell:

- `SHOPIFY_STORE_DOMAIN`
- `SHOPIFY_ADMIN_ACCESS_TOKEN`
- `SHOPIFY_ADMIN_API_VERSION`

The CLI reads process environment only; it does not load dotenv files. `.env.example` contains blank placeholders only.

Read-only preflight requires:

- `read_metaobject_definitions`
- `read_metafield_definitions`

Only the separately approved creation operation requires:

- `write_metaobject_definitions`
- `write_metafield_definitions`

Do not grant write scopes for a read-only audit. Use a short-lived or otherwise appropriately managed credential, restrict access to the trusted operator, and revoke or rotate it according to the store's credential policy.

## 3. Local validation before connecting

From the project directory:

```powershell
npm run typecheck:cms
npm run cms:schema:check
npm run test:cms-schema
```

These commands do not call Shopify. Resolve local errors before proceeding.

## 4. Read-only preflight

In the trusted shell, set the three environment variables without placing their values in source control. Then run:

```powershell
npm run cms:schema:preflight
```

Review the report for every one of the 22 definitions:

- `ALREADY_COMPATIBLE`: exact relevant schema and access match.
- `CREATE`: definition is absent and can be considered for additive creation.
- `INCOMPATIBLE`: field type, requiredness, validation, or reference mismatch; stop and resolve manually.
- `REQUIRES_REVIEW`: access, ownership, extra fields, or legacy aliases need owner review.
- `SKIPPED`: required configuration or live type support is missing; do not treat as deployed.

The command does not print the token. If configuration is incomplete, it reports `PENDING_APPROVAL`/`SKIPPED` and sends no Admin API request.

## 5. Approval-gated additive creation

Do not proceed until the store owner has reviewed the exact target store, the schema, all preflight results, and the effect on existing unstructured values. Shopify may validate and attach matching unstructured Metafield values when a definition is created.

For approved missing definitions only:

1. Retain the required read scopes and grant the two write scopes only for the approved operation.
2. Set `SHOPIFY_CMS_SCHEMA_APPROVED=true`.
3. If any Metafield definition is classified `CREATE`, obtain owner review of existing unstructured `cms` values and set `SHOPIFY_CMS_SCHEMA_METAFIELD_DATA_REVIEWED=true`.
4. Run the command with `--apply` in an interactive terminal:

   ```powershell
   npm run cms:schema:preflight -- --apply
   ```

5. At the prompt, type the exact `CREATE CMS SCHEMA FOR <store-domain>` confirmation for the reviewed store.
6. Check the post-deployment read-back report. Every item must be `ALREADY_COMPATIBLE`; otherwise stop and investigate.
7. Remove approval environment flags and revoke unnecessary write access when finished.

The script refuses writes when credentials are missing, blockers remain, the approval flags are absent, terminal confirmation is unavailable or incorrect, or Shopify does not verify the resulting definitions. It only creates missing definitions; it does not update or delete existing definitions or content.

## 6. Stop conditions

Stop and request owner review if:

- A legacy alias exists. The script will not migrate, rename, or duplicate that type automatically.
- An existing definition has extra fields or access different from the manifest.
- A definition is incompatible or a reference target is unavailable.
- A Metafield creation could affect existing unstructured values that have not been reviewed.
- The connected store or API version is not the approved target.

Do not edit the manifest merely to force a green preflight. Record and approve a schema difference first.

## 7. After schema setup

Schema creation alone does not create entries, migrate content, connect storefront readers, add routes, or enable rendering. Any content population or runtime integration is a separate phase requiring its own validation, rollout, and merchant approval.
