const fs = require('fs');
const path = require('path');

const SITE_URL = (process.env.SITE_URL || 'https://instalyze.ghaniyyirrahmans.me')
  .replace(/\/+$/, '');
const LASTMOD = process.env.SITEMAP_LASTMOD || new Date().toISOString().slice(0, 10);
const PUBLIC_DIR = path.join(process.cwd(), 'public');

const routes = [
  {
    path: '/',
    changefreq: 'monthly',
    priority: '1.0',
  },
];

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function absoluteUrl(routePath) {
  return `${SITE_URL}${routePath.startsWith('/') ? routePath : `/${routePath}`}`;
}

function buildSitemap() {
  const urls = routes
    .map(
      (route) => `  <url>
    <loc>${escapeXml(absoluteUrl(route.path))}</loc>
    <lastmod>${escapeXml(LASTMOD)}</lastmod>
    <changefreq>${escapeXml(route.changefreq)}</changefreq>
    <priority>${escapeXml(route.priority)}</priority>
  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function buildRobots() {
  return `User-agent: *
Allow: /

Sitemap: ${absoluteUrl('/sitemap.xml')}
`;
}

fs.mkdirSync(PUBLIC_DIR, { recursive: true });
fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), buildSitemap(), 'utf8');
fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), buildRobots(), 'utf8');

console.log(`[INFO] Generated sitemap and robots for ${SITE_URL}`);
