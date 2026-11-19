import { useEffect } from 'react';
import { getProductByHandle } from '../shopify/services/products';
import { getCollectionSummaryByHandle } from '../shopify/services/collections';
import { isShopifyConfigured, useShopifyQuery } from '../shopify/use-shopify-query';
import {
  buildCollectionSeo,
  buildHomepageSeo,
  buildProductSeo,
  buildStaticSeo,
  escapeJsonLd,
  getSiteOrigin,
  type SeoMetadata,
} from '../seo/metadata';
import type { ViewState } from '../types';

interface MyrklsSEOProps {
  view: ViewState;
  productId?: string;
  collectionHandle?: string;
  pageTitle?: string;
  notFound?: boolean;
}

const staticPages: Partial<Record<ViewState, { title: string; description: string }>> = {
  'our-science': {
    title: 'Our Science | MYRKLS Global Skin Science',
    description:
      'Explore the science and global ingredient innovation behind MYRKLS advanced skincare.',
  },
  'about-us': {
    title: 'About MYRKLS | Global Skin Science',
    description:
      'Discover MYRKLS, where advanced skincare science and global ingredient innovation come together.',
  },
  'contact-us': {
    title: 'Contact MYRKLS | Skincare Support',
    description: 'Contact the MYRKLS team for support with skincare, products and orders.',
  },
  'privacy-policy': {
    title: 'Privacy Policy | MYRKLS',
    description: 'Read how MYRKLS handles and protects your personal information.',
  },
  terms: {
    title: 'Terms and Conditions | MYRKLS',
    description: 'Review the terms and conditions for shopping with MYRKLS.',
  },
  'shipping-policy': {
    title: 'Shipping Policy | MYRKLS',
    description: 'Learn about MYRKLS shipping, delivery timelines and order fulfilment.',
  },
  'returns-refunds': {
    title: 'Returns and Refunds | MYRKLS',
    description: 'Review the MYRKLS returns, exchanges and refund policy.',
  },
};

const ensureMeta = (name: string, value: string, useProperty = false): void => {
  const attribute = useProperty ? 'property' : 'name';
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.content = value;
};

const ensureCanonical = (href: string): void => {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = href;
};

const updateMetadata = (metadata: SeoMetadata): void => {
  document.title = metadata.title;
  ensureMeta('description', metadata.description);
  ensureMeta('robots', metadata.robots);
  ensureCanonical(metadata.canonicalUrl);
  ensureMeta('og:title', metadata.title, true);
  ensureMeta('og:description', metadata.description, true);
  ensureMeta('og:url', metadata.canonicalUrl, true);
  ensureMeta('og:type', metadata.openGraphType, true);
  ensureMeta('og:image', metadata.imageUrl, true);
  ensureMeta('twitter:card', 'summary_large_image');
  ensureMeta('twitter:title', metadata.title);
  ensureMeta('twitter:description', metadata.description);
  ensureMeta('twitter:image', metadata.imageUrl);

  document.getElementById('shopify-route-structured-data')?.remove();
  if (metadata.structuredData) {
    const script = document.createElement('script');
    script.id = 'shopify-route-structured-data';
    script.type = 'application/ld+json';
    script.textContent = escapeJsonLd(metadata.structuredData);
    document.head.appendChild(script);
  }
};

export const MyrklsSEO = ({
  view,
  productId,
  collectionHandle,
  pageTitle,
  notFound = false,
}: MyrklsSEOProps) => {
  const productQuery = useShopifyQuery(
    `seo-product:${productId || ''}`,
    () => getProductByHandle(productId || ''),
    view === 'pdp' && Boolean(productId) && isShopifyConfigured()
  );
  const collectionQuery = useShopifyQuery(
    `seo-collection:${collectionHandle || ''}`,
    () => getCollectionSummaryByHandle(collectionHandle || ''),
    view === 'view-all' &&
      Boolean(collectionHandle) &&
      collectionHandle !== 'all' &&
      isShopifyConfigured()
  );

  useEffect(() => {
    const origin = getSiteOrigin();
    const currentPath = `${window.location.pathname}${window.location.search}`;
    let metadata: SeoMetadata;

    if (notFound) {
      metadata = buildStaticSeo(
        origin,
        currentPath,
        'Page Not Found | MYRKLS',
        'The requested MYRKLS page could not be found.',
        'noindex, follow'
      );
      updateMetadata(metadata);
      return;
    }

    switch (view) {
      case 'home':
        metadata = buildHomepageSeo(origin);
        break;
      case 'pdp': {
        const handle = productId || '';
        if (
          productQuery.state.status === 'success' &&
          productQuery.state.data &&
          productQuery.state.data.handle === handle
        ) {
          metadata = buildProductSeo(productQuery.state.data, origin);
        } else {
          const label = handle.replace(/[-_]+/g, ' ').trim();
          const title = label ? `${label} | MYRKLS` : 'Product | MYRKLS';
          metadata = buildStaticSeo(
            origin,
            `/products/${encodeURIComponent(handle)}`,
            title,
            `Product information for ${label || 'this MYRKLS product'}.`,
            'noindex, follow'
          );
        }
        break;
      }
      case 'view-all':
        if (window.location.pathname === '/search') {
          metadata = buildStaticSeo(
            origin,
            '/search',
            'Search | MYRKLS',
            'Search MYRKLS products.',
            'noindex, follow'
          );
        } else if (
          collectionQuery.state.status === 'success' &&
          collectionQuery.state.data &&
          collectionQuery.state.data.handle === collectionHandle
        ) {
          metadata = buildCollectionSeo(collectionQuery.state.data, origin);
        } else {
          const title = pageTitle || 'Shop Skincare | MYRKLS';
          metadata = buildStaticSeo(origin, currentPath, title, 'Explore the MYRKLS skincare catalog.');
          if (collectionHandle && collectionHandle !== 'all') {
            metadata = {
              ...metadata,
              robots: 'noindex, follow',
              structuredData: null,
            };
          }
        }
        break;
      case 'our-science':
      case 'about-us':
      case 'contact-us':
      case 'terms':
      case 'privacy-policy':
      case 'shipping-policy':
      case 'returns-refunds': {
        const page = staticPages[view];
        metadata = buildStaticSeo(
          origin,
          window.location.pathname,
          page?.title || pageTitle || 'MYRKLS',
          page?.description || 'Explore skincare powered by global ingredient innovation.'
        );
        break;
      }
      case 'checkout':
        metadata = buildStaticSeo(
          origin,
          currentPath,
          'Secure Checkout | MYRKLS',
          'Continue to secure checkout.',
          'noindex, follow'
        );
        break;
      case 'account':
        metadata = buildStaticSeo(
          origin,
          currentPath,
          'My Account | MYRKLS',
          'Manage your MYRKLS customer account.',
          'noindex, follow'
        );
        break;
      case 'not-found':
        metadata = buildHomepageSeo(origin);
        break;
      default:
        metadata = buildHomepageSeo(origin);
    }

    updateMetadata(metadata);
  }, [
    view,
    notFound,
    productId,
    collectionHandle,
    pageTitle,
    productQuery.state.status,
    productQuery.state.data,
    collectionQuery.state.status,
    collectionQuery.state.data,
  ]);

  return null;
};

export default MyrklsSEO;
