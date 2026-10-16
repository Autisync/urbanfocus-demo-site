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
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';

const DEFAULT_TRACK_KEY = '';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
cpSync('src', 'dist', { recursive: true, filter: (f) => !f.includes('partials') });

// Every page shares one head, header and footer: <!--@head-->, <!--@header-->
// and <!--@footer--> are filled from src/partials/. <body data-page="x"> marks
// the matching nav link (data-nav="x") as the current page.
const partial = (name) => readFileSync(`src/partials/${name}.html`, 'utf8').trimEnd();
const parts = { head: partial('head'), header: partial('header'), footer: partial('footer') };
for (const file of readdirSync('src').filter((f) => f.endsWith('.html'))) {
  let html = readFileSync(`src/${file}`, 'utf8').replace(/<!--@(head|header|footer)-->/g, (_, k) => parts[k]);
  const page = (html.match(/<body[^>]*data-page="([^"]+)"/) || [])[1];
  if (page) html = html.replace(`data-nav="${page}"`, `data-nav="${page}" aria-current="page"`);
  writeFileSync(`dist/${file}`, html);
}

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
