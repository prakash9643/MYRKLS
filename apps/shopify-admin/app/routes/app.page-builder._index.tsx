import { Link } from "react-router";

export default function PageBuilderIndexRoute() {
  return (
    <s-section heading="Page Builder">
      <div className="page-builder-blocked" role="status">
        <strong>Shopify CMS page access is not enabled.</strong>
        <span>
          Phase 2 defines CMS pages, templates, and sections locally, but the live definitions and
          entries have not been verified. This app currently has definition-read scopes only and
          no page or section entry read/write operations.
        </span>
      </div>
      <div className="page-builder-list-intro">
        <div>
          <h2>Pages</h2>
          <p>
            Existing Shopify pages are not loaded. This does not mean the store has no CMS pages;
            page search and editing remain unavailable until the authenticated Admin API is
            approved and verified.
          </p>
        </div>
        <Link className="page-builder-button page-builder-button-primary" to="/app/page-builder/new">
          Create local draft
        </Link>
      </div>
      <label className="page-builder-field page-builder-page-search">
        <span>Search CMS pages</span>
        <input disabled placeholder="Unavailable until Shopify page reads are approved" type="search" />
      </label>
      <div className="page-builder-list-empty">
        <h3>No live page data loaded</h3>
        <p>
          The editor foundation can create an in-memory draft, but it will not save to Shopify or
          browser storage.
        </p>
      </div>
    </s-section>
  );
}
