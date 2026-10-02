#!/usr/bin/env node
// Build the static site into _site/. No dependencies: `node scripts/build.mjs`.
//
//   _site/index.html          the page, rendered from src/content.mjs
//   _site/404.html            "this route is closed"
//   _site/publications.bib    BibTeX for every published item
//   _site/assets/...          copied as-is (CSS and JS get a content hash in their URL)
//   _site/<old al-folio URL>/ small redirect pages, so old links keep working

import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderIndex, render404, renderRedirect, renderBib } from '../src/render.mjs';
import { site } from '../src/content.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, '_site');

const hash = (file) => createHash('sha256').update(readFileSync(join(ROOT, file))).digest('hex').slice(0, 10);
const write = (rel, content) => {
  const p = join(OUT, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
};

// Old al-folio URLs → where that content lives now.
export const REDIRECTS = {
  'publications/': '/#publications',
  'projects/': '/#software',
  'repositories/': '/#software',
  'teaching/': '/#teaching',
  'news/': '/#news',
  'people/': '/#about',
  'blog/': '/',
  'books/': '/',
  'cv/': `/${site.cv}`,
  'projects/drum-web-app/': '/#sw-drum',
  'projects/air-quality-dashboard/': '/#sw-aqi',
  'projects/pm2-5-forecasting/': '/#sw-pm25',
  'projects/tutem/': '/#software',
  'projects/maas-demand-study/': '/#software',
  ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`projects/${i + 1}_project/`, '/#software'])),
};

export function build({ quiet = false } = {}) {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  cpSync(join(ROOT, 'assets'), join(OUT, 'assets'), { recursive: true });

  const css = `assets/css/main.css?v=${hash('assets/css/main.css')}`;
  const js = `assets/js/main.js?v=${hash('assets/js/main.js')}`;
  const heroJs = `assets/js/hero.js?v=${hash('assets/js/hero.js')}`;

  write('index.html', renderIndex({ css, js, heroJs }));
  write('404.html', render404({ css: `/${css}` }));
  write('publications.bib', renderBib());
  for (const [from, to] of Object.entries(REDIRECTS)) write(join(from, 'index.html'), renderRedirect(to));

  write('.nojekyll', '');
  write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
  write(
    'sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${site.url}/</loc><lastmod>2026-10-02</lastmod><changefreq>monthly</changefreq><priority>1.0</priority></url>
  <url><loc>${site.url}/${site.cv}</loc><lastmod>2026-10-02</lastmod><priority>0.6</priority></url>
</urlset>
`,
  );
  write(
    'site.webmanifest',
    JSON.stringify(
      {
        name: site.displayName,
        short_name: site.shortName,
        description: site.description,
        start_url: '/',
        display: 'standalone',
        background_color: '#070a12',
        theme_color: '#070a12',
        icons: [
          { src: '/assets/img/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/assets/img/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      null,
      2,
    ),
  );
  if (existsSync(join(ROOT, 'assets/img/favicon.ico'))) cpSync(join(ROOT, 'assets/img/favicon.ico'), join(OUT, 'favicon.ico'));

  if (!quiet) {
    const kb = (f) => (readFileSync(join(OUT, f)).length / 1024).toFixed(1);
    console.log(`Built _site/ · index.html ${kb('index.html')} kB · main.css ${kb('assets/css/main.css')} kB · main.js ${kb('assets/js/main.js')} kB`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) build();
