#!/usr/bin/env node
// Render the favicon set and the social preview image (Open Graph, 1200 × 630) with
// headless Chromium, using the site's own fonts. Outputs go to assets/img/ and are committed;
// run again only when the name, role or portrait changes:  npm run images
// The .ico needs ImageMagick (`convert`).

import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, hero } from '../src/content.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IMG = join(ROOT, 'assets/img');
// Fonts are inlined: a page made with setContent() may not load file:// URLs.
const font = (f) => `data:font/woff2;base64,${readFileSync(join(ROOT, 'assets/fonts', f)).toString('base64')}`;

const FONTS = `
@font-face{font-family:Inter;src:url(${font('inter-latin.woff2')});font-weight:100 900}
@font-face{font-family:Display;src:url(${font('schibsted-grotesk.woff2')});font-weight:400 900}
@font-face{font-family:Mono;src:url(${font('jetbrains-mono.woff2')});font-weight:100 800}`;

// Monogram on ink, set in the display face.
const iconHtml = (size) => `<!doctype html><style>${FONTS}
html,body{margin:0;width:${size}px;height:${size}px;background:transparent}
.m{width:${size}px;height:${size}px;border-radius:${size * 0.22}px;background:#0c1220;display:grid;place-items:center;
font:700 ${size * 0.42}px/1 Display;letter-spacing:-0.06em;color:#fff;padding-right:${size * 0.02}px}
.m span{color:#34d399}</style><div class="m"><div>KM<span>.</span></div></div>`;

function ogHtml() {
  const portrait = `data:image/jpeg;base64,${readFileSync(join(IMG, 'hero-1122.jpg')).toString('base64')}`;
  let grid = '';
  for (let x = 0; x <= 1200; x += 60) grid += `<path d="M${x} 0V630" />`;
  for (let y = 0; y <= 630; y += 60) grid += `<path d="M0 ${y}H1200" />`;
  const strip = (h) => h.replace(/<[^>]+>/g, '');
  return `<!doctype html><style>${FONTS}
*{box-sizing:border-box}html,body{margin:0}
body{width:1200px;height:630px;overflow:hidden;background:#070a12;color:#e9edf5;font-family:Display;position:relative}
svg.grid{position:absolute;inset:0}svg.grid path{stroke:rgba(148,163,196,.07);stroke-width:1}
.photo{position:absolute;top:0;right:0;bottom:0;width:560px;-webkit-mask-image:linear-gradient(90deg,transparent 0%,rgba(0,0,0,.55) 14%,#000 34%)}
.photo img{width:100%;height:100%;object-fit:cover;object-position:58% 0%;display:block}
.photo:after{content:'';position:absolute;inset:auto 0 0;height:30%;background:linear-gradient(transparent,#070a12)}
.text{position:absolute;left:72px;top:0;bottom:0;width:640px;display:flex;flex-direction:column;justify-content:center}
h1{margin:0;font:650 92px/1 Display;letter-spacing:-0.045em}
.role{margin-top:22px;font:500 24px/1.3 Display;color:#b6bfd1}.role b{color:#e9edf5;font-weight:650}
.role i{font-style:normal;display:inline-block;width:1px;height:22px;background:rgba(148,163,196,.35);margin:0 14px;vertical-align:-3px}
p{margin:24px 0 0;font:400 25px/1.5 Display;color:#b6bfd1;max-width:560px}p strong{color:#e9edf5;font-weight:600}
.creds{display:flex;gap:0;margin-top:40px;padding-top:20px;border-top:1px solid rgba(148,163,196,.18)}
.c{padding-right:18px;margin-right:18px;border-right:1px solid rgba(148,163,196,.18)}.c:last-child{border:0}
.c span{display:block;font:500 12px Mono;letter-spacing:.12em;text-transform:uppercase;color:#8691a8;margin-bottom:6px}
.c b{font:600 17px Display;color:#e9edf5}
.url{position:absolute;right:40px;bottom:26px;font:500 17px Mono;color:#b6bfd1}
</style>
<svg class="grid" width="1200" height="630">${grid}</svg>
<div class="photo"><img src="${portrait}"></div>
<div class="text">
<h1>${site.displayName}</h1>
<div class="role"><b>${hero.role}</b><i></i>${site.lab}, ${site.orgShort}</div>
<p>${hero.tagline}</p>
<div class="creds">${hero.credentials.slice(0, 3).map((c) => `<div class="c"><span>${c.label}</span><b>${strip(c.value)}</b></div>`).join('')}</div>
</div>
<div class="url">kapil2020.github.io</div>`;
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const [name, size] of [
    ['apple-touch-icon.png', 180],
    ['icon-192.png', 192],
    ['icon-512.png', 512],
    ['favicon-32.png', 32],
    ['favicon-16.png', 16],
  ]) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(iconHtml(size));
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(IMG, name), omitBackground: name !== 'apple-touch-icon.png' });
  }

  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(ogHtml());
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(IMG, 'og.png') });
} finally {
  await browser.close();
}

try {
  execFileSync('convert', [join(IMG, 'favicon-16.png'), join(IMG, 'favicon-32.png'), join(IMG, 'favicon.ico')]);
} catch {
  console.warn('ImageMagick not found: favicon.ico was not updated.');
}
console.log('Wrote favicon.ico, apple-touch-icon.png, icon-192/512.png and og.png to assets/img/');
