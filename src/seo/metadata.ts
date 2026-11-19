import type { ShopifyCollectionSummary, ShopifyProduct } from '../shopify/types';
import { getProductImage } from '../shopify/presentation';
import { collectionPath, productPath } from '../routing/routes';

export type StructuredData = Record<string, unknown>;

export interface SeoMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  robots: string;
  openGraphType: 'website' | 'product';
  imageUrl: string;
  structuredData: StructuredData | null;
}

export const getSiteOrigin = (siteUrl = import.meta.env.VITE_SITE_URL): string => {
  const configured = siteUrl?.trim() || 'https://myrkls.com';
  let url: URL;
  try {
    url = new URL(configured);
  } catch {
    throw new Error('VITE_SITE_URL must be an absolute production HTTPS URL.');
  }
  if (
    url.protocol !== 'https:' ||
    url.hostname !== 'myrkls.com' ||
    url.port ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    (url.pathname !== '/' && url.pathname !== '')
  ) {
    throw new Error('VITE_SITE_URL must be the MYRKLS production origin (https://myrkls.com).');
  }
  return url.origin;
};

const truncate = (value: string, limit: number): string =>
  value.trim().replace(/\s+/g, ' ').slice(0, limit);

export const buildHomepageSeo = (origin: string): SeoMetadata => ({
  title: 'MYRKLS — Advanced Global Skin Science | The World’s Science. Your Skin’s Future.',
  description:
    'Advanced skincare powered by global ingredient innovation. Discover MYRKLS serums, moisturizers, cleansers and sunscreen.',
  canonicalUrl: `${origin}/`,
  robots: 'index, follow',
  openGraphType: 'website',
  imageUrl: `${origin}/myrkls-hero-awakening-sphere.webp`,
  structuredData: null,
});

export const buildProductSeo = (product: ShopifyProduct, origin: string): SeoMetadata => {
  const canonicalUrl = `${origin}${productPath(product.handle)}`;
  const image = getProductImage(product);
  const title = truncate(product.seo.title || `${product.title} | MYRKLS`, 70);
  const description = truncate(product.seo.description || product.description, 320);
  const availability = product.availableForSale
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';
  const productSchema: StructuredData = {
    '@type': 'Product',
    '@id': `${canonicalUrl}#product`,
    name: product.title,
    description: truncate(product.seo.description || product.description, 5000),
    url: canonicalUrl,
    ...(image ? { image: [image.url] } : {}),
    ...(product.vendor ? { brand: { '@type': 'Brand', name: product.vendor } } : {}),
    ...(product.variants.length === 1 && product.variants[0].sku
      ? { sku: product.variants[0].sku }
      : {}),
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: product.priceRange.minVariantPrice.amount,
      highPrice: product.priceRange.maxVariantPrice.amount,
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      availability,
      url: canonicalUrl,
      ...(product.variantsPageInfo.hasNextPage
        ? {}
        : {
            offers: product.variants.map((variant) => ({
              '@type': 'Offer',
              url: canonicalUrl,
              price: variant.price.amount,
              priceCurrency: variant.price.currencyCode,
              availability: variant.availableForSale
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
              itemCondition: 'https://schema.org/NewCondition',
              ...(variant.sku ? { sku: variant.sku } : {}),
              ...(variant.title && variant.title !== 'Default Title'
                ? { name: `${product.title} - ${variant.title}` }
                : {}),
            })),
          }),
    },
    ...(product.options.length > 0
      ? {
          additionalProperty: product.options.flatMap((option) =>
            option.values.map((value) => ({
              '@type': 'PropertyValue',
              name: option.name,
              value,
            }))
          ),
        }
      : {}),
  };
  return {
    title,
    description: description || truncate(product.title, 320),
    canonicalUrl,
    robots: 'index, follow',
    openGraphType: 'product',
    imageUrl: image?.url || `${origin}/myrkls-hero-awakening-sphere.webp`,
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        productSchema,
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
            { '@type': 'ListItem', position: 2, name: 'Shop', item: `${origin}/collections/all` },
            { '@type': 'ListItem', position: 3, name: product.title, item: canonicalUrl },
          ],
        },
      ],
    },
  };
};

export const buildCollectionSeo = (
  collection: ShopifyCollectionSummary,
  origin: string
): SeoMetadata => {
  const canonicalUrl = `${origin}${collectionPath(collection.handle)}`;
  const title = truncate(collection.seo.title || `${collection.title} | MYRKLS`, 70);
  const description = truncate(collection.seo.description || collection.description, 320);
  return {
    title,
    description: description || `Explore ${collection.title} at MYRKLS.`,
    canonicalUrl,
    robots: 'index, follow',
    openGraphType: 'website',
    imageUrl: collection.image?.url || `${origin}/myrkls-hero-awakening-sphere.webp`,
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id': `${canonicalUrl}#collection`,
          url: canonicalUrl,
          name: collection.title,
          description: description || `Explore ${collection.title} at MYRKLS.`,
          ...(collection.image?.url ? { image: collection.image.url } : {}),
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
            { '@type': 'ListItem', position: 2, name: collection.title, item: canonicalUrl },
          ],
        },
      ],
    },
  };
};

export const buildStaticSeo = (
  origin: string,
  path: string,
  title: string,
  description: string,
  robots = 'index, follow'
): SeoMetadata => {
  const pathWithoutQueryOrHash = path.split(/[?#]/, 1)[0] || '/';
  const canonicalPath = pathWithoutQueryOrHash.startsWith('/')
    ? pathWithoutQueryOrHash
    : `/${pathWithoutQueryOrHash}`;
  return {
    title,
    description: truncate(description, 320),
    canonicalUrl: `${origin}${canonicalPath}`,
    robots,
    openGraphType: 'website',
    imageUrl: `${origin}/myrkls-hero-awakening-sphere.webp`,
    structuredData: robots.includes('noindex')
      ? null
      : {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${origin}${canonicalPath}#webpage`,
          url: `${origin}${canonicalPath}`,
          name: title,
          description: truncate(description, 320),
          isPartOf: { '@id': `${origin}/#website` },
        },
  };
};

export const escapeJsonLd = (value: StructuredData): string =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
