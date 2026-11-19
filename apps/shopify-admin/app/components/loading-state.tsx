export function LoadingState() {
  return (
    <s-page heading="MYRKLS CMS">
      <s-section>
        <s-spinner accessibilityLabel="Loading MYRKLS CMS" />
        <span className="visually-hidden" role="status" aria-label="Loading MYRKLS CMS">
          Loading MYRKLS CMS
        </span>
      </s-section>
    </s-page>
  );
}
