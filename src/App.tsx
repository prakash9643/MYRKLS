import React, { useState, useEffect } from 'react';
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
import { MyrklsViewAllPage } from './components/MyrklsViewAllPage';
import { MyrklsProductDetailPage } from './components/pdp/MyrklsProductDetailPage';
import { MyrklsProductReelsSection } from './components/pdp/MyrklsProductReelsSection';
import { MyrklsCartProvider } from './context/MyrklsCartContext';
import { MyrklsAuthProvider } from './context/MyrklsAuthContext';
import { MyrklsCartDrawer } from './components/MyrklsCartDrawer';
import { MyrklsCheckoutPage } from './components/checkout/MyrklsCheckoutPage';
import { MyrklsAccountDashboard } from './components/account/MyrklsAccountDashboard';
import type { ViewState } from './types';

const getInitialView = (): ViewState => {
  if (typeof window === 'undefined') return 'home';
  const hash = (window.location.hash || '').toLowerCase();
  const search = new URLSearchParams(window.location.search);
  if (search.get('view') === 'account' || hash.includes('account')) {
    return 'account';
  }
  if (search.get('view') === 'checkout' || hash.includes('checkout')) {
    return 'checkout';
  }
  if (
    search.get('view') === 'pdp' ||
    search.get('product') ||
    hash.includes('product') ||
    hash.includes('pdp') ||
    (hash.includes('incarnation') && !hash.includes('#clinical-serums'))
  ) {
    return 'pdp';
  }
  if (
    search.get('view') === 'view-all' ||
    search.get('category') ||
    hash.includes('all-products') ||
    hash.includes('view-all') ||
    hash.includes('catalog') ||
    hash.includes('collection') ||
    hash.includes('category')
  ) {
    return 'view-all';
  }
  return 'home';
};

const getInitialProductId = (): string => {
  if (typeof window === 'undefined') return 'incarnation';
  const search = new URLSearchParams(window.location.search);
  const prod = search.get('product');
  if (prod) return prod.toLowerCase();
  const hash = (window.location.hash || '').toLowerCase();
  if (hash.includes('product/') || hash.includes('pdp/')) {
    const parts = hash.split('/');
    if (parts[1]) return parts[1];
  }
  return 'incarnation';
};

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(getInitialView);
  const [previousView, setPreviousView] = useState<ViewState>('home');
  const [selectedProductId, setSelectedProductId] = useState<string>(getInitialProductId);

  useEffect(() => {
    const handleUrlChange = () => {
      const hash = (window.location.hash || '').toLowerCase();
      const search = new URLSearchParams(window.location.search);

      if (search.get('view') === 'account' || hash.includes('account')) {
        setCurrentView('account');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (search.get('view') === 'checkout' || hash.includes('checkout')) {
        setCurrentView('checkout');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (
        search.get('view') === 'pdp' ||
        search.get('product') ||
        hash.includes('product') ||
        hash.includes('pdp')
      ) {
        const prod = search.get('product');
        if (prod) {
          setSelectedProductId(prod.toLowerCase());
        } else {
          const parts = hash.split('/');
          if (parts.length > 1 && parts[1]) {
            setSelectedProductId(parts[1]);
          }
        }
        setCurrentView('pdp');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash.includes('incarnation') && !hash.includes('#clinical-serums')) {
        setSelectedProductId('incarnation');
        setCurrentView('pdp');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (
        search.get('view') === 'view-all' ||
        search.get('category') ||
        hash.includes('all-products') ||
        hash.includes('view-all') ||
        hash.includes('catalog') ||
        hash.includes('collection') ||
        hash.includes('category')
      ) {
        setCurrentView('view-all');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (!hash || hash === '#home' || hash.includes('clinical-serums')) {
        setCurrentView('home');
      }
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
    window.history.pushState(null, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToViewAll = (category?: string) => {
    setCurrentView('view-all');
    if (category && category !== 'ALL') {
      window.location.hash = `#collection/${category.toLowerCase()}`;
    } else {
      window.location.hash = '#all-products';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPdp = (productId: string = 'incarnation') => {
    setSelectedProductId(productId);
    setCurrentView('pdp');
    window.location.hash = `#product/${productId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCheckout = () => {
    setPreviousView(currentView);
    setCurrentView('checkout');
    window.location.hash = '#checkout';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const returnFromCheckout = () => {
    if (previousView === 'pdp') {
      navigateToPdp(selectedProductId);
    } else if (previousView === 'view-all') {
      navigateToViewAll();
    } else {
      navigateToHome();
    }
  };

  const navigateToAccount = () => {
    setPreviousView(currentView);
    setCurrentView('account');
    window.location.hash = '#account';
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
      <MyrklsCartProvider>
        <SmoothScroll>
          <div className="min-h-screen bg-[#FAF9F7] text-[#1A1A1A] font-sans antialiased selection:bg-[#1A1A1A] selection:text-white">
            {currentView === 'checkout' ? (
              <MyrklsCheckoutPage
                onBackToStore={returnFromCheckout}
                onNavigateHome={navigateToHome}
                onNavigateViewAll={navigateToViewAll}
                onNavigateProduct={navigateToPdp}
              />
            ) : currentView === 'account' ? (
              <MyrklsAccountDashboard
                onBackToStore={returnFromAccount}
                onNavigateProduct={navigateToPdp}
                onNavigateViewAll={navigateToViewAll}
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
                  <MyrklsFeaturedProtection />
                  <MyrklsFAQ />
                  <MyrklsProductReelsSection onNavigateProduct={navigateToPdp} />
                  <MyrklsReviews />
                </main>
                <MyrklsFooter onNavigateViewAll={navigateToViewAll} />
              </>
            )}
          </div>
          <MyrklsCartDrawer
            onNavigateViewAll={navigateToViewAll}
            onNavigateProduct={navigateToPdp}
            onNavigateCheckout={navigateToCheckout}
          />
        </SmoothScroll>
      </MyrklsCartProvider>
    </MyrklsAuthProvider>
  );
};

export default App;
