import React, { Suspense, lazy, useState, useEffect } from 'react';
import { SmoothScroll } from './components/SmoothScroll';
import { MyrklsHeader } from './components/MyrklsHeader';
import { MyrklsHero } from './components/MyrklsHero';
import { MyrklsProductGrid } from './components/MyrklsProductGrid';
import { MyrklsScienceSection } from './components/MyrklsScienceSection';
import { MyrklsFeaturedInnovation } from './components/MyrklsFeaturedInnovation';
import { MyrklsGlobalScienceNetwork } from './components/MyrklsGlobalScienceNetwork';
import { MyrklsFeaturedProtection } from './components/MyrklsFeaturedProtection';
import { MyrklsFAQ } from './components/MyrklsFAQ';
import { MyrklsReviews } from './components/MyrklsReviews';
import { MyrklsFooter } from './components/MyrklsFooter';
import { MyrklsSEO } from './components/MyrklsSEO';
import { MyrklsProductReelsSection } from './components/pdp/MyrklsProductReelsSection';
import { MyrklsCartProvider } from './context/MyrklsCartContext';
import { MyrklsAuthProvider } from './context/MyrklsAuthContext';
import { ShopifyCustomerAccountProvider } from './context/ShopifyCustomerAccountContext';
import { MyrklsCartDrawer } from './components/MyrklsCartDrawer';
import { useCart } from './context/MyrklsCartContext';
import type { ViewState } from './types';
import {
  collectionPath,
  productPath,
  resolveAppRoute,
  resolveProductHandleAlias,
} from './routing/routes';
import { readShopifyConfig } from './shopify/config';
import { CookieConsentBanner } from './analytics/CookieConsentBanner';
import { usePageTracking } from './analytics/use-page-tracking';

const MyrklsViewAllPage = lazy(() =>
  import('./components/MyrklsViewAllPage').then((module) => ({ default: module.MyrklsViewAllPage }))
);
const MyrklsOurSciencePage = lazy(() =>
  import('./components/MyrklsOurSciencePage').then((module) => ({ default: module.MyrklsOurSciencePage }))
);
const MyrklsAboutUsPage = lazy(() =>
  import('./components/MyrklsAboutUsPage').then((module) => ({ default: module.MyrklsAboutUsPage }))
);
const MyrklsContactUsPage = lazy(() =>
  import('./components/MyrklsContactUsPage').then((module) => ({ default: module.MyrklsContactUsPage }))
);
const MyrklsTermsPage = lazy(() =>
  import('./components/MyrklsTermsPage').then((module) => ({ default: module.MyrklsTermsPage }))
);
const MyrklsPrivacyPolicyPage = lazy(() =>
  import('./components/MyrklsPrivacyPolicyPage').then((module) => ({ default: module.MyrklsPrivacyPolicyPage }))
);
const MyrklsShippingPolicyPage = lazy(() =>
  import('./components/MyrklsShippingPolicyPage').then((module) => ({ default: module.MyrklsShippingPolicyPage }))
);
const MyrklsReturnsRefundsPage = lazy(() =>
  import('./components/MyrklsReturnsRefundsPage').then((module) => ({ default: module.MyrklsReturnsRefundsPage }))
);
const MyrklsProductDetailPage = lazy(() =>
  import('./components/pdp/MyrklsProductDetailPage').then((module) => ({ default: module.MyrklsProductDetailPage }))
);
const ShopifyCustomerAccountPage = lazy(() =>
  import('./components/account/ShopifyCustomerAccountPage').then((module) => ({
    default: module.ShopifyCustomerAccountPage,
  }))
);

interface CheckoutRouteProps {
  onNavigateHome: () => void;
  onNavigateViewAll: () => void;
  onNavigateProduct: (productId: string) => void;
}

const CheckoutRoute: React.FC<CheckoutRouteProps> = (props) => {
  const { isShopifyCart, items, openCart } = useCart();

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F7] text-[#111111]">
      <MyrklsHeader
        onNavigateHome={props.onNavigateHome}
        onNavigateViewAll={props.onNavigateViewAll}
        onNavigateProduct={props.onNavigateProduct}
      />
      <main className="flex flex-1 items-center justify-center px-5 py-16">
        <section className="w-full max-w-xl border border-[#E5E0D8] bg-white p-8 text-center sm:p-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#777777]">
            {isShopifyCart ? 'Secure Shopify checkout' : 'Checkout unavailable'}
          </p>
          <h1 className="mt-4 font-['Syne',sans-serif] text-2xl font-bold uppercase sm:text-3xl">
            {isShopifyCart ? 'Complete your order securely' : 'Shopify checkout is not configured'}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#666666]">
            {isShopifyCart
              ? 'Shopify checkout confirms your delivery details, shipping, taxes, payment options and final total. Payment details are never collected on this website.'
              : 'No payment or order can be placed here. Configure the Shopify Storefront connection before enabling customer checkout.'}
          </p>
          {isShopifyCart && (
            <button
              type="button"
              onClick={() => {
                if (items.length > 0) openCart();
                else props.onNavigateViewAll();
              }}
              className="mt-8 w-full bg-[#111111] px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#FF5A1F] sm:w-auto"
            >
              {items.length > 0 ? 'Review bag and continue' : 'Explore products'}
            </button>
          )}
        </section>
      </main>
      <MyrklsFooter
        onNavigateViewAll={props.onNavigateViewAll}
        onNavigateHome={props.onNavigateHome}
      />
    </div>
  );
};

const getInitialRoute = () =>
  typeof window === 'undefined'
    ? resolveAppRoute(new URL('https://myrkls.com/'))
    : resolveAppRoute(new URL(window.location.href));

const getInitialView = (): ViewState => getInitialRoute().view;

const getInitialProductId = (): string => getInitialRoute().productHandle || 'incarnation';

const RouteNotFound: React.FC<{ onNavigateHome: () => void }> = ({ onNavigateHome }) => (
  <div className="flex min-h-screen flex-col bg-[#FAF9F7] text-[#133429]">
    <main className="flex flex-1 items-center justify-center px-5 py-20 text-center">
      <section>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#777777]">MYRKLS / 404</p>
        <h1 className="mt-4 font-['Syne',sans-serif] text-3xl font-bold uppercase">Page not found</h1>
        <p className="mt-3 text-sm text-[#666666]">That product, collection or page could not be found.</p>
        <button
          type="button"
          onClick={onNavigateHome}
          className="mt-7 bg-[#133429] px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-white hover:bg-[#FF5A1F]"
        >
          Return to MYRKLS
        </button>
      </section>
    </main>
  </div>
);

const RouteLoading: React.FC = () => (
  <div
    role="status"
    aria-live="polite"
    className="flex min-h-[50vh] items-center justify-center bg-[#FAF9F7] px-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#53645A]"
  >
    Loading page…
  </div>
);

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(getInitialView);
  const [routeNotFound, setRouteNotFound] = useState(() => getInitialRoute().notFound);
  const [previousView, setPreviousView] = useState<ViewState>('home');
  const [selectedProductId, setSelectedProductId] = useState<string>(getInitialProductId);
  usePageTracking(currentView, routeNotFound);

  useEffect(() => {
    const handleUrlChange = () => {
      const currentUrl = new URL(window.location.href);
      const route = resolveAppRoute(currentUrl);
      setCurrentView(route.view);
      setRouteNotFound(route.notFound);
      if (route.productHandle) setSelectedProductId(route.productHandle);

      const searchParams = new URLSearchParams();
      if (route.canonicalPath === '/search' && route.searchQuery) {
        searchParams.set('q', route.searchQuery);
      }
      const legacyHashRoute =
        /^#(?:product|pdp|collection|category)\//i.test(currentUrl.hash) ||
        new Set([
          '#home', '#account', '#checkout', '#our-science', '#science', '#about', '#about-us',
          '#contact', '#contact-us', '#terms', '#terms-and-conditions', '#privacy', '#privacy-policy',
          '#shipping', '#shipping-policy', '#returns', '#returns-refunds', '#refunds',
          '#all-products', '#view-all', '#catalog',
        ]).has(currentUrl.hash.toLowerCase());
      const legacyQueryRoute = ['view', 'product', 'category'].some((key) => currentUrl.searchParams.has(key));
      const shouldNormalize =
        currentUrl.pathname !== route.canonicalPath ||
        (currentUrl.pathname === '/' && (legacyHashRoute || legacyQueryRoute));
      const preservedAccountSubroute =
        route.view === 'account' && currentUrl.hash.toLowerCase().startsWith('#account/');
      if (!route.notFound && shouldNormalize) {
        const canonicalLocation = `${route.canonicalPath}${searchParams.size ? `?${searchParams}` : ''}${
          preservedAccountSubroute ? currentUrl.hash : ''
        }`;
        window.history.replaceState(null, '', canonicalLocation);
      }
      if (route.view !== 'view-all') window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    handleUrlChange();
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  const navigateToHome = () => {
    setCurrentView('home');
    setRouteNotFound(false);
    window.history.pushState(null, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToViewAll = (category?: string) => {
    setCurrentView('view-all');
    setRouteNotFound(false);
    const shopifyEnabled = readShopifyConfig().config !== null;
    const location = category && category !== 'ALL'
      ? shopifyEnabled
        ? collectionPath(category.toLowerCase())
        : `#collection/${category.toLowerCase()}`
      : shopifyEnabled
        ? '/collections/all'
        : '#all-products';
    window.history.pushState(null, '', location);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPdp = (productId: string = 'incarnation') => {
    const handle = resolveProductHandleAlias(productId);
    setSelectedProductId(handle);
    setCurrentView('pdp');
    setRouteNotFound(false);
    window.history.pushState(
      null,
      '',
      readShopifyConfig().config ? productPath(handle) : `#product/${encodeURIComponent(handle)}`
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCheckout = () => {
    setPreviousView(currentView);
    setCurrentView('checkout');
    window.history.pushState(null, '', '/checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAccount = () => {
    setPreviousView(currentView);
    setCurrentView('account');
    window.history.pushState(null, '', '/account');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToOurScience = () => {
    setPreviousView(currentView);
    setCurrentView('our-science');
    window.history.pushState(null, '', '/our-science');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAboutUs = () => {
    setPreviousView(currentView);
    setCurrentView('about-us');
    window.history.pushState(null, '', '/about-us');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToContactUs = () => {
    setPreviousView(currentView);
    setCurrentView('contact-us');
    window.history.pushState(null, '', '/contact-us');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToTerms = () => {
    setPreviousView(currentView);
    setCurrentView('terms');
    window.history.pushState(null, '', '/terms');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPrivacy = () => {
    setPreviousView(currentView);
    setCurrentView('privacy-policy');
    window.history.pushState(null, '', '/privacy-policy');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToShipping = () => {
    setPreviousView(currentView);
    setCurrentView('shipping-policy');
    window.history.pushState(null, '', '/shipping-policy');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToReturns = () => {
    setPreviousView(currentView);
    setCurrentView('returns-refunds');
    window.history.pushState(null, '', '/returns-refunds');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const returnFromAccount = () => {
    if (previousView === 'pdp') {
      navigateToPdp(selectedProductId);
    } else if (previousView === 'view-all') {
      navigateToViewAll();
    } else {
      navigateToHome();
    }
  };

  return (
    <MyrklsAuthProvider>
      <ShopifyCustomerAccountProvider>
       <MyrklsCartProvider>
        <SmoothScroll>
          <div className="min-h-screen bg-[#FAF9F7] text-[#1A1A1A] font-sans antialiased selection:bg-[#1A1A1A] selection:text-white">
            <MyrklsSEO
              view={currentView}
              productId={selectedProductId}
              collectionHandle={resolveAppRoute(new URL(window.location.href)).collectionHandle || undefined}
              notFound={routeNotFound}
            />
            <Suspense fallback={<RouteLoading />}>
            {routeNotFound ? (
              <>
                <MyrklsHeader
                  onNavigateHome={navigateToHome}
                  onNavigateViewAll={navigateToViewAll}
                  onNavigateProduct={navigateToPdp}
                  onNavigateAccount={navigateToAccount}
                />
                <RouteNotFound onNavigateHome={navigateToHome} />
                <MyrklsFooter onNavigateViewAll={navigateToViewAll} onNavigateHome={navigateToHome} />
              </>
            ) : currentView === 'checkout' ? (
              <CheckoutRoute
                onNavigateHome={navigateToHome}
                onNavigateViewAll={navigateToViewAll}
                onNavigateProduct={navigateToPdp}
              />
            ) : currentView === 'account' ? (
              <ShopifyCustomerAccountPage
                onBackToStore={returnFromAccount}
                onNavigateViewAll={navigateToViewAll}
                onNavigateProduct={navigateToPdp}
              />
            ) : currentView === 'pdp' ? (
              <MyrklsProductDetailPage
                productId={selectedProductId}
                onBackToHome={navigateToHome}
                onNavigateViewAll={navigateToViewAll}
                onNavigateProduct={navigateToPdp}
                onNavigateAccount={navigateToAccount}
                onNavigateCheckout={navigateToCheckout}
              />
            ) : currentView === 'returns-refunds' ? (
              <MyrklsReturnsRefundsPage
                onBackToHome={navigateToHome}
                onNavigateViewAll={navigateToViewAll}
                onNavigateProduct={navigateToPdp}
                onNavigateAccount={navigateToAccount}
                onNavigateOurScience={navigateToOurScience}
                onNavigateAboutUs={navigateToAboutUs}
                onNavigateContactUs={navigateToContactUs}
                onNavigateTerms={navigateToTerms}
                onNavigatePrivacy={navigateToPrivacy}
                onNavigateShipping={navigateToShipping}
              />
            ) : currentView === 'shipping-policy' ? (
              <MyrklsShippingPolicyPage
                onBackToHome={navigateToHome}
                onNavigateViewAll={navigateToViewAll}
                onNavigateProduct={navigateToPdp}
                onNavigateAccount={navigateToAccount}
                onNavigateOurScience={navigateToOurScience}
                onNavigateAboutUs={navigateToAboutUs}
                onNavigateContactUs={navigateToContactUs}
                onNavigateTerms={navigateToTerms}
                onNavigatePrivacy={navigateToPrivacy}
              />
            ) : currentView === 'privacy-policy' ? (
              <MyrklsPrivacyPolicyPage
                onBackToHome={navigateToHome}
                onNavigateViewAll={navigateToViewAll}
                onNavigateProduct={navigateToPdp}
                onNavigateAccount={navigateToAccount}
                onNavigateOurScience={navigateToOurScience}
                onNavigateAboutUs={navigateToAboutUs}
                onNavigateContactUs={navigateToContactUs}
                onNavigateTerms={navigateToTerms}
                onNavigateShipping={navigateToShipping}
              />
            ) : currentView === 'terms' ? (
              <MyrklsTermsPage
                onBackToHome={navigateToHome}
                onNavigateViewAll={navigateToViewAll}
                onNavigateProduct={navigateToPdp}
                onNavigateAccount={navigateToAccount}
                onNavigateOurScience={navigateToOurScience}
                onNavigateAboutUs={navigateToAboutUs}
                onNavigateContactUs={navigateToContactUs}
                onNavigatePrivacy={navigateToPrivacy}
                onNavigateShipping={navigateToShipping}
              />
            ) : currentView === 'contact-us' ? (
              <MyrklsContactUsPage
                onBackToHome={navigateToHome}
                onNavigateViewAll={navigateToViewAll}
                onNavigateProduct={navigateToPdp}
                onNavigateAccount={navigateToAccount}
                onNavigateOurScience={navigateToOurScience}
                onNavigateAboutUs={navigateToAboutUs}
              />
            ) : currentView === 'about-us' ? (
              <MyrklsAboutUsPage
                onBackToHome={navigateToHome}
                onNavigateViewAll={navigateToViewAll}
                onNavigateProduct={navigateToPdp}
                onNavigateAccount={navigateToAccount}
                onNavigateOurScience={navigateToOurScience}
                onNavigateContactUs={navigateToContactUs}
              />
            ) : currentView === 'our-science' ? (
              <MyrklsOurSciencePage
                onBackToHome={navigateToHome}
                onNavigateViewAll={navigateToViewAll}
                onNavigateProduct={navigateToPdp}
                onNavigateAccount={navigateToAccount}
                onNavigateAboutUs={navigateToAboutUs}
                onNavigateContactUs={navigateToContactUs}
              />
            ) : currentView === 'view-all' ? (
              <MyrklsViewAllPage
                onBackToHome={navigateToHome}
                onNavigatePdp={navigateToPdp}
                onNavigateAccount={navigateToAccount}
              />
            ) : (
              <>
                <MyrklsHeader
                  onNavigateViewAll={navigateToViewAll}
                  onNavigateHome={navigateToHome}
                  onNavigateProduct={navigateToPdp}
                  onNavigateAccount={navigateToAccount}
                  onNavigateOurScience={navigateToOurScience}
                  onNavigateAboutUs={navigateToAboutUs}
                  onNavigateContactUs={navigateToContactUs}
                />
                <main>
                  <MyrklsHero />
                  <MyrklsProductGrid
                    onNavigateViewAll={navigateToViewAll}
                    onSelectProduct={navigateToPdp}
                  />
                  <MyrklsScienceSection />
                  <MyrklsFeaturedInnovation />
                  <MyrklsGlobalScienceNetwork />
                  <MyrklsFeaturedProtection onNavigateProduct={navigateToPdp} />
                  <MyrklsFAQ />
                  <MyrklsProductReelsSection onNavigateProduct={navigateToPdp} />
                  <MyrklsReviews />
                </main>
                <MyrklsFooter
                  onNavigateViewAll={navigateToViewAll}
                  onNavigateHome={navigateToHome}
                  onNavigateAboutUs={navigateToAboutUs}
                  onNavigateContactUs={navigateToContactUs}
                  onNavigateTerms={navigateToTerms}
                  onNavigatePrivacy={navigateToPrivacy}
                  onNavigateShipping={navigateToShipping}
                  onNavigateReturns={navigateToReturns}
                />
              </>
            )}
            </Suspense>
          </div>
          <MyrklsCartDrawer
            onNavigateViewAll={navigateToViewAll}
            onNavigateProduct={navigateToPdp}
            onNavigateCheckout={navigateToCheckout}
          />
          <CookieConsentBanner />
        </SmoothScroll>
       </MyrklsCartProvider>
      </ShopifyCustomerAccountProvider>
    </MyrklsAuthProvider>
  );
};

export default App;
