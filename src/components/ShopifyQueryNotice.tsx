import React from 'react';
import { AlertCircle, Loader2, RefreshCw, Search } from 'lucide-react';

interface ShopifyQueryNoticeProps {
  status: 'loading' | 'error' | 'empty';
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export const ShopifyQueryNotice: React.FC<ShopifyQueryNoticeProps> = ({
  status,
  message,
  onRetry,
  compact = false,
}) => (
  <div
    role={status === 'error' ? 'alert' : 'status'}
    className={`w-full border border-[#DDD8D0] bg-white text-center ${
      compact ? 'p-5' : 'py-16 px-6'
    }`}
  >
    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center border border-[#DDD8D0] text-[#133429]">
      {status === 'loading' ? (
        <Loader2 className="animate-spin" size={19} aria-hidden="true" />
      ) : status === 'error' ? (
        <AlertCircle size={19} className="text-[#B54732]" aria-hidden="true" />
      ) : (
        <Search size={19} aria-hidden="true" />
      )}
    </div>
    <p className="text-[13px] font-semibold text-[#133429]">
      {status === 'loading'
        ? 'Loading Shopify catalog…'
        : status === 'error'
          ? 'Shopify data could not be loaded'
          : 'No products found'}
    </p>
    {message && <p className="mx-auto mt-2 max-w-xl text-[12px] text-[#5A6660]">{message}</p>}
    {status === 'error' && onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 bg-[#133429] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#FF5A1F]"
      >
        <RefreshCw size={13} />
        Retry
      </button>
    )}
  </div>
);
