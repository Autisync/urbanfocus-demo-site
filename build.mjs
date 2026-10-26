// Copies src/ to dist/ and writes dist/config.js from the environment, so the
// site needs no framework and no install step on Vercel.
//
//   TRACK_KEY     the website's key from the CRM (Visitors > Tracking), starts
//                 as_. Optional: without it visits are not counted.
//   CRM_API_URL   defaults to https://api.autisync.com/api
//   CRM_APP_URL   defaults to https://app.autisync.com (t.js, full booking page)
//   BOOKING_SLUG  the CRM calendar, default urbanfocus
//   SITE_SLUG     the CRM website whose contact form is used, default urbanfocus
//   LISTINGS_KEY  Properties > Website key (pk_...). With it, "Imóveis à venda"
//                 shows the homes published in the CRM, live. Public by design.
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// While the new site waits for approval, www.urbanfocus.pt (Vercel
// production) shows src/em-construcao.html on every page except the legal
// ones, and the full site only appears on Vercel preview deployments (the
// "preview" branch). Approved: set LIVE to true and push to main.
// SITE_LIVE=1 in Vercel's environment variables does the same.
const LIVE = false;

const DEFAULT_TRACK_KEY = '';
const production = process.env.VERCEL_ENV === 'production';
const underConstruction = production && !LIVE && process.env.SITE_LIVE !== '1';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
cpSync('src', 'dist', { recursive: true });

const config = {
  site: 'urbanfocus',
  api: (process.env.CRM_API_URL || 'https://api.autisync.com/api').replace(/\/+$/, ''),
  app: (process.env.CRM_APP_URL || 'https://app.autisync.com').replace(/\/+$/, ''),
  bookingSlug: process.env.BOOKING_SLUG || 'urbanfocus',
  siteSlug: process.env.SITE_SLUG || process.env.BOOKING_SLUG || 'urbanfocus',
  trackKey: process.env.TRACK_KEY ?? DEFAULT_TRACK_KEY,
  listingsKey: process.env.LISTINGS_KEY || '',
};
writeFileSync('dist/config.js', `window.SITE_CONFIG = ${JSON.stringify(config)};\n`);
console.log(`Built urbanfocus against ${config.api} (calendar ${config.bookingSlug})${config.trackKey ? ', visitors tracked' : ', no TRACK_KEY: visits are not counted'}${config.listingsKey ? ', homes live from the CRM' : ', no LISTINGS_KEY: shows the T2 in the page'}`);

if (underConstruction) {
  // Every page but the legal ones (the construction page links to them)
  // shows the construction page; pictures, /social and the rest stay put.
  const keep = new Set(['termos.html', 'privacidade.html', 'cookies.html']);
  const soon = readFileSync('src/em-construcao.html', 'utf8');
  const walk = (dir) => readdirSync(dir).forEach((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path);
    if (name.endsWith('.html') && !(dir === 'dist' && keep.has(name))) writeFileSync(path, soon);
  });
  walk('dist');
  writeFileSync('dist/sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://www.urbanfocus.pt/</loc></url></urlset>\n');
  console.log('Production, not live yet: every page shows the construction page (full site on the preview)');
} else {
  console.log(production ? 'Production: the full site is live' : 'Preview: the full site');
}
