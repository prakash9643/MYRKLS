import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useAnalyticsConsent } from './ConsentProvider';

export const CookieConsentBanner: React.FC = () => {
  const {
    consent,
    preferencesOpen,
    acceptAll,
    rejectOptional,
    savePreferences,
    openPreferences,
    closePreferences,
  } = useAnalyticsConsent();
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    setAnalytics(consent?.analytics || false);
    setMarketing(consent?.marketing || false);
  }, [consent, preferencesOpen]);

  useEffect(() => {
    if (!preferencesOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePreferences();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [closePreferences, preferencesOpen]);

  return (
    <>
      {!consent && !preferencesOpen && (
        <section
          aria-label="Privacy preferences"
          className="fixed inset-x-0 bottom-0 z-[70] border-t border-[#D8D2C8] bg-[#FAF9F7] p-4 text-[#133429] shadow-[0_-8px_30px_rgba(19,52,41,0.12)] sm:inset-x-5 sm:bottom-5 sm:mx-auto sm:max-w-4xl sm:border"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <p className="font-['Syne',sans-serif] text-sm font-bold uppercase tracking-wide">
                Your privacy choices
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#53645A]">
                Necessary storage keeps the storefront working. With your permission, analytics
                helps us understand shopping journeys and marketing enables relevant measurement.
                You can change your choice at any time.
              </p>
              <button
                type="button"
                onClick={openPreferences}
                className="mt-2 text-[11px] font-semibold text-[#133429] underline underline-offset-2"
              >
                Customize preferences
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:min-w-[280px]">
              <button
                type="button"
                onClick={rejectOptional}
                className="border border-[#133429] bg-transparent px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-[#133429] transition-colors hover:bg-[#E9EEE9]"
              >
                Reject optional
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="bg-[#133429] px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#FF5A1F]"
              >
                Accept all
              </button>
            </div>
          </div>
        </section>
      )}

      {preferencesOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 p-3 sm:items-center sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePreferences();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-preferences-title"
            className="w-full max-w-xl border border-[#D8D2C8] bg-[#FAF9F7] p-5 text-[#133429] shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A1F]">
                  MYRKLS / PRIVACY
                </p>
                <h2
                  id="cookie-preferences-title"
                  className="mt-1 font-['Syne',sans-serif] text-xl font-bold uppercase"
                >
                  Cookie preferences
                </h2>
              </div>
              <button
                type="button"
                onClick={closePreferences}
                aria-label="Close privacy preferences"
                className="flex h-9 w-9 items-center justify-center border border-[#D8D2C8] hover:border-[#133429]"
              >
                <X size={16} />
              </button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#53645A]">
              Choose which optional technologies MYRKLS may use. Changing your choice withdraws
              previous optional consent and stops future analytics or marketing events.
            </p>

            <div className="mt-5 divide-y divide-[#E2DDD5] border-y border-[#E2DDD5]">
              <div className="flex items-start justify-between gap-4 py-4">
                <div>
                  <h3 className="text-sm font-bold">Necessary</h3>
                  <p className="mt-1 text-xs text-[#66736B]">
                    Required for storefront, cart and privacy choices. Always active.
                  </p>
                </div>
                <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-[#526258]">
                  Always on
                </span>
              </div>
              <label className="flex cursor-pointer items-start justify-between gap-4 py-4">
                <span>
                  <span className="block text-sm font-bold">Analytics</span>
                  <span className="mt-1 block text-xs text-[#66736B]">
                    Measures page and product interactions through the configured analytics tags.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(event) => setAnalytics(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-[#133429]"
                />
              </label>
              <label className="flex cursor-pointer items-start justify-between gap-4 py-4">
                <span>
                  <span className="block text-sm font-bold">Marketing</span>
                  <span className="mt-1 block text-xs text-[#66736B]">
                    Enables the configured marketing pixel to measure campaign interactions.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(event) => setMarketing(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-[#133429]"
                />
              </label>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={rejectOptional}
                className="border border-[#133429] px-3 py-3 text-[10px] font-bold uppercase tracking-wider hover:bg-[#E9EEE9]"
              >
                Reject optional
              </button>
              <button
                type="button"
                onClick={() => savePreferences({ analytics, marketing })}
                className="border border-[#133429] px-3 py-3 text-[10px] font-bold uppercase tracking-wider hover:bg-[#E9EEE9]"
              >
                Save choices
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="bg-[#133429] px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#FF5A1F]"
              >
                Accept all
              </button>
            </div>
            <p className="mt-3 text-[10px] leading-relaxed text-[#7C817C]">
              Your choice is stored on this device. Review the Privacy Policy for details; legal
              terms and regional requirements should be confirmed by MYRKLS counsel.
            </p>
          </section>
        </div>
      )}
    </>
  );
};
