import React from 'react';

interface StorefrontErrorBoundaryState {
  hasError: boolean;
}

export class StorefrontErrorBoundary extends React.Component<
  React.PropsWithChildren,
  StorefrontErrorBoundaryState
> {
  state: StorefrontErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): StorefrontErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    console.error('[MYRKLS] Storefront rendering failed.', error.name);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#FAF9F7] px-5 text-[#133429]">
          <section className="max-w-lg text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#777777]">
              MYRKLS / TEMPORARY ERROR
            </p>
            <h1 className="mt-4 font-['Syne',sans-serif] text-2xl font-bold uppercase">
              This page could not load
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#666666]">
              Reload to retry this page. MYRKLS does not collect payment details on this site.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-7 bg-[#133429] px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-white hover:bg-[#FF5A1F]"
            >
              Reload page
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
