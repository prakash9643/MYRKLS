import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(root, 'dist');
const sitemapFiles = [
  'sitemap.xml',
  'sitemap-pages.xml',
  'sitemap-products.xml',
  'sitemap-collections.xml',
];
const staticPages = [
  '/',
  '/collections/all',
  '/our-science',
  '/about-us',
  '/contact-us',
  '/terms',
  '/privacy-policy',
  '/shipping-policy',
  '/returns-refunds',
];
const pageInfoSelection = `
  pageInfo {
    hasNextPage
    endCursor
  }
`;
const productQuery = `
  query SitemapProducts($first: Int!, $after: String) {
    products(first: $first, after: $after, sortKey: TITLE) {
      nodes {
        handle
        updatedAt
        featuredImage { url altText }
      }
      ${pageInfoSelection}
    }
  }
`;
const collectionQuery = `
  query SitemapCollections($first: Int!, $after: String) {
    collections(first: $first, after: $after, sortKey: TITLE) {
      nodes {
        handle
        updatedAt
        image { url altText }
      }
      ${pageInfoSelection}
    }
  }
`;

const escapeXml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const formatDate = (value) => {
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) {
    throw new Error('Shopify sitemap data contained an invalid updatedAt date.');
  }
  return parsed.toISOString().slice(0, 10);
};

const getSiteOrigin = (siteUrl) => {
  const value = siteUrl?.trim() || 'https://myrkls.com';
  let url;
  try {
    url = new URL(value);
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

const writeSitemapFiles = async (pages, products, collections, origin) => {
  await mkdir(outputDirectory, { recursive: true });
  const pageEntries = pages
    .map(
      (page) =>
        `  <url><loc>${escapeXml(`${origin}${page}`)}</loc></url>`
    )
    .join('\n');
  await writeFile(
    path.join(outputDirectory, 'sitemap-pages.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pageEntries}\n</urlset>\n`,
    'utf8'
  );

  const sitemapLocations = ['sitemap-pages.xml'];
  if (products.length > 0) {
    const productEntries = products
      .map((product) => {
        const productUrl = `${origin}/products/${encodeURIComponent(product.handle)}`;
        const image = product.image
          ? `\n    <image:image><image:loc>${escapeXml(product.image.url)}</image:loc>${
              product.image.altText
                ? `<image:title>${escapeXml(product.image.altText)}</image:title>`
                : ''
            }</image:image>`
          : '';
        return `  <url><loc>${escapeXml(productUrl)}</loc><lastmod>${formatDate(
          product.updatedAt
        )}</lastmod>${image}\n  </url>`;
      })
      .join('\n');
    await writeFile(
      path.join(outputDirectory, 'sitemap-products.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${productEntries}\n</urlset>\n`,
      'utf8'
    );
    sitemapLocations.push('sitemap-products.xml');
  }

  if (collections.length > 0) {
    const collectionEntries = collections
      .map(
        (collection) =>
          `  <url><loc>${escapeXml(
            `${origin}/collections/${encodeURIComponent(collection.handle)}`
          )}</loc><lastmod>${formatDate(collection.updatedAt)}</lastmod></url>`
      )
      .join('\n');
    await writeFile(
      path.join(outputDirectory, 'sitemap-collections.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${collectionEntries}\n</urlset>\n`,
      'utf8'
    );
    sitemapLocations.push('sitemap-collections.xml');
  }

  const sitemapEntries = sitemapLocations
    .map((filename) => `  <sitemap><loc>${escapeXml(`${origin}/${filename}`)}</loc></sitemap>`)
    .join('\n');
  await writeFile(
    path.join(outputDirectory, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</sitemapindex>\n`,
    'utf8'
  );
};

const requestPage = async (endpoint, token, operation, query, after) => {
  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({
        query,
        variables: { first: 250, after },
      }),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new Error(`Shopify sitemap request failed during ${operation}. Check network connectivity.`);
  }
  if (!response.ok) {
    throw new Error(`Shopify sitemap request failed during ${operation} (HTTP ${response.status}).`);
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error(`Shopify returned an invalid response during ${operation}.`);
  }
  if (!body || typeof body !== 'object') {
    throw new Error(`Shopify returned an invalid response during ${operation}.`);
  }
  if (body.errors?.length) {
    throw new Error(`Shopify reported a GraphQL error during ${operation}.`);
  }
  const connection = body.data?.[operation === 'product pagination' ? 'products' : 'collections'];
  if (
    !connection ||
    !Array.isArray(connection.nodes) ||
    typeof connection.pageInfo?.hasNextPage !== 'boolean'
  ) {
    throw new Error(`Shopify returned invalid sitemap data during ${operation}.`);
  }
  return connection;
};

const getCatalogEntries = async (endpoint, token, operation, query, routeType) => {
  const entries = [];
  const seenCursors = new Set();
  let after = null;
  let hasNextPage = true;
  while (hasNextPage) {
    const connection = await requestPage(endpoint, token, operation, query, after);
    for (const node of connection.nodes) {
      if (
        typeof node.handle !== 'string' ||
        node.handle.length > 255 ||
        !/^[^\u0000-\u0020\u007f/?#\\]+$/u.test(node.handle) ||
        node.handle === '.' ||
        node.handle === '..' ||
        typeof node.updatedAt !== 'string'
      ) {
        throw new Error(`Shopify returned an invalid ${routeType} sitemap entry.`);
      }
      const image = node.featuredImage || node.image;
      if (
        image &&
        (typeof image.url !== 'string' ||
          !image.url.startsWith('https://') ||
          (image.altText !== null && image.altText !== undefined && typeof image.altText !== 'string'))
      ) {
        throw new Error(`Shopify returned an invalid ${routeType} sitemap image.`);
      }
      entries.push({
        handle: node.handle,
        updatedAt: node.updatedAt,
        image: image ? { url: image.url, altText: image.altText || '' } : null,
      });
    }

    hasNextPage = connection.pageInfo.hasNextPage;
    if (hasNextPage) {
      const cursor = connection.pageInfo.endCursor;
      if (typeof cursor !== 'string' || !cursor || seenCursors.has(cursor)) {
        throw new Error(`Shopify returned an invalid pagination cursor during ${operation}.`);
      }
      seenCursors.add(cursor);
      after = cursor;
    }
  }
  return entries;
};

const main = async () => {
  const env = loadEnv('production', root, 'VITE_');
  const origin = getSiteOrigin(env.VITE_SITE_URL);
  const domain = env.VITE_SHOPIFY_STORE_DOMAIN?.trim().toLowerCase();
  const token = env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();
  const apiVersion = env.VITE_SHOPIFY_API_VERSION?.trim() || '2026-10';

  for (const filename of sitemapFiles) {
    await rm(path.join(outputDirectory, filename), { force: true });
  }

  if (!domain || !token) {
    await writeSitemapFiles(staticPages, [], [], origin);
    console.warn(
      'Shopify sitemap generated with static pages only. Configure VITE_SHOPIFY_STORE_DOMAIN and VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN to include live products and collections.'
    );
    return;
  }
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(domain)) {
    throw new Error('VITE_SHOPIFY_STORE_DOMAIN must be a *.myshopify.com hostname.');
  }
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(apiVersion)) {
    throw new Error('VITE_SHOPIFY_API_VERSION must use the YYYY-MM format.');
  }

  const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;
  const [products, collections] = await Promise.all([
    getCatalogEntries(endpoint, token, 'product pagination', productQuery, 'product'),
    getCatalogEntries(endpoint, token, 'collection pagination', collectionQuery, 'collection'),
  ]);
  await writeSitemapFiles(staticPages, products, collections, origin);
  console.log(
    `Shopify sitemap generated: ${products.length} products, ${collections.length} collections, ${staticPages.length} static pages.`
  );
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Sitemap generation failed.');
  process.exitCode = 1;
});
