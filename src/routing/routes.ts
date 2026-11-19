import type { ViewState } from '../types';

export type AppRouteView = ViewState | 'page-not-found';

export interface ResolvedAppRoute {
  view: ViewState;
  productHandle: string | null;
  collectionHandle: string | null;
  searchQuery: string;
  canonicalPath: string;
  notFound: boolean;
}

const KNOWN_PAGE_ROUTES: Record<string, ViewState> = {
  'our-science': 'our-science',
  'about-us': 'about-us',
  'contact-us': 'contact-us',
  terms: 'terms',
  'privacy-policy': 'privacy-policy',
  'shipping-policy': 'shipping-policy',
  'returns-refunds': 'returns-refunds',
};

const LEGACY_PRODUCT_HANDLE_MAP: Readonly<Record<string, string>> = {
  vision: 'vision-multi-pathway-pigment-corrector',
  incarnation: 'skin-renewal',
};

export const resolveProductHandleAlias = (handle: string): string => {
  const normalized = handle.trim().toLowerCase();
  return LEGACY_PRODUCT_HANDLE_MAP[normalized] || normalized;
};

const slugFromPath = (path: string, prefix: string): string | null => {
  const match = new RegExp(`^/${prefix}/([^/]+)/?$`, 'i').exec(path);
  if (!match) return null;
  let slug: string;
  try {
    slug = decodeURIComponent(match[1]);
  } catch {
    return '';
  }
  return /^[^\u0000-\u0020\u007f/?#\\]+$/u.test(slug) && slug !== '.' && slug !== '..'
    ? slug.toLowerCase()
    : '';
};

const result = (
  view: AppRouteView,
  canonicalPath: string,
  options: Partial<ResolvedAppRoute> = {}
): ResolvedAppRoute => ({
  view: view === 'page-not-found' ? 'not-found' : view,
  productHandle: options.productHandle ?? null,
  collectionHandle: options.collectionHandle ?? null,
  searchQuery: options.searchQuery ?? '',
  canonicalPath,
  notFound: options.notFound ?? false,
});

export const resolveAppRoute = (url: URL): ResolvedAppRoute => {
  const path = url.pathname.replace(/\/{2,}/g, '/');
  const productHandle = slugFromPath(path, 'products');
  if (productHandle !== null) {
    const resolvedHandle = productHandle ? resolveProductHandleAlias(productHandle) : '';
    return resolvedHandle
      ? result('pdp', `/products/${encodeURIComponent(resolvedHandle)}`, {
          productHandle: resolvedHandle,
        })
      : result('page-not-found', path, { notFound: true });
  }

  const collectionHandle = slugFromPath(path, 'collections');
  if (collectionHandle !== null) {
    return collectionHandle
      ? result(
          'view-all',
          `/collections/${encodeURIComponent(collectionHandle)}`,
          { collectionHandle }
        )
      : result('page-not-found', path, { notFound: true });
  }

  const pageHandle = slugFromPath(path, 'pages');
  if (pageHandle !== null) {
    const view = KNOWN_PAGE_ROUTES[pageHandle];
    return view
      ? result(view, `/${pageHandle}`)
      : result('page-not-found', path, { notFound: true });
  }

  if (path === '/search' || path === '/search/') {
    return result('view-all', '/search', {
      searchQuery: url.searchParams.get('q')?.trim() || '',
    });
  }

  const knownPath = Object.entries(KNOWN_PAGE_ROUTES).find(
    ([routePath]) => path === `/${routePath}` || path === `/${routePath}/`
  );
  if (knownPath) return result(knownPath[1], `/${knownPath[0]}`);
  if (path === '/checkout' || path === '/checkout/') return result('checkout', '/checkout');
  if (path === '/account' || path === '/account/') return result('account', '/account');
  if (path === '/collections' || path === '/collections/') {
    return result('view-all', '/collections/all', { collectionHandle: 'all' });
  }
  if (path !== '/' && path !== '') return result('page-not-found', path, { notFound: true });

  const hash = url.hash.toLowerCase();
  const view = url.searchParams.get('view')?.toLowerCase();
  const productQuery = url.searchParams.get('product');
  const categoryQuery = url.searchParams.get('category');

  if (view === 'account' || hash.startsWith('#account')) return result('account', '/account');
  if (view === 'checkout' || hash === '#checkout') return result('checkout', '/checkout');

  const productMatch = /^#(?:product|pdp)\/([^/?#]+)/.exec(hash);
  if (view === 'pdp' || productQuery || productMatch || hash === '#incarnation') {
    const rawHandle = productQuery || productMatch?.[1] || 'incarnation';
    const safeHandle = resolveProductHandleAlias(rawHandle);
    return /^[a-z0-9][a-z0-9-]*$/.test(safeHandle)
      ? result('pdp', `/products/${encodeURIComponent(safeHandle)}`, { productHandle: safeHandle })
      : result('page-not-found', '/', { notFound: true });
  }

  if (
    view === 'our-science' ||
    view === 'science' ||
    hash === '#our-science' ||
    hash === '#science'
  ) return result('our-science', '/our-science');
  if (view === 'about' || view === 'about-us' || hash === '#about' || hash === '#about-us') {
    return result('about-us', '/about-us');
  }
  if (view === 'contact' || view === 'contact-us' || hash === '#contact' || hash === '#contact-us') {
    return result('contact-us', '/contact-us');
  }
  if (view === 'terms' || view === 'terms-and-conditions' || hash.includes('terms')) {
    return result('terms', '/terms');
  }
  if (view === 'privacy' || view === 'privacy-policy' || hash.includes('privacy')) {
    return result('privacy-policy', '/privacy-policy');
  }
  if (view === 'shipping' || view === 'shipping-policy' || hash.includes('shipping')) {
    return result('shipping-policy', '/shipping-policy');
  }
  if (view === 'returns' || view === 'returns-refunds' || view === 'refunds' || hash.includes('returns') || hash.includes('refunds')) {
    return result('returns-refunds', '/returns-refunds');
  }

  if (
    view === 'view-all' ||
    categoryQuery ||
    hash === '#all-products' ||
    hash === '#view-all' ||
    hash === '#catalog' ||
    hash.startsWith('#collection/') ||
    hash.startsWith('#category/')
  ) {
    const collection = (categoryQuery || hash.split('/')[1] || '').toLowerCase();
    const isAll = !collection || collection === 'all';
    return result(
      'view-all',
      isAll ? '/collections/all' : `/collections/${encodeURIComponent(collection)}`,
      { collectionHandle: isAll ? 'all' : collection }
    );
  }

  if (path === '/' || path === '') return result('home', '/');
  return result('page-not-found', path, { notFound: true });
};

export const productPath = (handle: string): string => `/products/${encodeURIComponent(handle)}`;
export const collectionPath = (handle: string): string => `/collections/${encodeURIComponent(handle)}`;
