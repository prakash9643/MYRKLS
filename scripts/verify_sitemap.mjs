import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const outputDirectory = path.resolve('dist');
const index = await readFile(path.join(outputDirectory, 'sitemap.xml'), 'utf8');
assert.match(index, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);

const sitemapNames = [...index.matchAll(/<loc>https:\/\/myrkls\.com\/(sitemap-[a-z]+\.xml)<\/loc>/g)]
  .map((match) => match[1]);
assert.ok(sitemapNames.includes('sitemap-pages.xml'), 'static pages sitemap must be listed');
assert.equal(new Set(sitemapNames).size, sitemapNames.length, 'sitemap index entries must be unique');

const allUrls = new Set();
for (const filename of sitemapNames) {
  await access(path.join(outputDirectory, filename));
  const xml = await readFile(path.join(outputDirectory, filename), 'utf8');
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  for (const [, location] of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
    const url = new URL(location);
    assert.equal(url.origin, 'https://myrkls.com');
    assert.equal(url.search, '');
    assert.equal(url.hash, '');
    assert.equal(
      ['/cart', '/checkout', '/account', '/orders', '/search'].some((prefix) =>
        url.pathname.startsWith(prefix)
      ),
      false,
      'utility and private routes must not be indexed'
    );
    assert.equal(allUrls.has(url.href), false, `duplicate sitemap URL: ${url.href}`);
    allUrls.add(url.href);
  }
}

for (const filename of ['sitemap-products.xml', 'sitemap-collections.xml']) {
  try {
    await access(path.join(outputDirectory, filename));
  } catch {
    assert.equal(sitemapNames.includes(filename), false);
  }
}

console.log(`PASS sitemap XML structure and ${allUrls.size} unique public URLs`);
