const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const headerRules = vercel.headers || [];
const allHeaders = new Map(
  headerRules.flatMap((rule) => (rule.headers || []).map((header) => [header.key.toLowerCase(), header.value]))
);

for (const name of [
  'content-security-policy',
  'strict-transport-security',
  'x-content-type-options',
  'referrer-policy',
  'permissions-policy',
  'x-frame-options',
]) {
  assert.ok(allHeaders.has(name), `Vercel response headers must include ${name}`);
}

const csp = allHeaders.get('content-security-policy');
assert.ok(csp.includes("default-src 'self'"));
assert.ok(csp.includes("object-src 'none'"));
assert.ok(csp.includes("frame-ancestors 'none'"));
assert.ok(!/(?:^|\s)\*(?:\s|;|$)/.test(csp), 'CSP must not include an unrestricted wildcard source');
assert.ok(!csp.includes("'unsafe-eval'"), 'CSP must not permit eval');

const hsts = allHeaders.get('strict-transport-security');
assert.ok(!hsts.includes('includeSubDomains'));
assert.ok(!hsts.includes('preload'));

assert.ok(
  headerRules.some((rule) =>
    rule.source === '/assets/:path*' &&
    (rule.headers || []).some(
      (header) =>
        header.key.toLowerCase() === 'cache-control' &&
        header.value.includes('immutable')
    )
  ),
  'Hashed Vite assets should receive immutable cache headers'
);

for (const route of ['/products/:handle', '/collections/:handle', '/pages/:handle', '/search', '/account']) {
  assert.ok(
    vercel.rewrites.some((rewrite) => rewrite.source === route),
    `Vercel SPA routing should rewrite ${route}`
  );
}

assert.ok(
  packageJson.engines?.node && packageJson.engines.node.includes('22.12.0'),
  'Node.js engine must satisfy the current Vite major'
);

console.log('PASS Vercel security headers, CSP guardrails, cache policy, SPA rewrites, and Node runtime');
