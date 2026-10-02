#!/usr/bin/env node
// Render the favicon set and the social preview image (Open Graph, 1200 × 630) with
// headless Chromium, using the site's own fonts. Outputs go to assets/img/ and are committed;
// run again only when the name, role or portrait changes:  npm run images
// The .ico needs ImageMagick (`convert`).

import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, stats } from '../src/content.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IMG = join(ROOT, 'assets/img');
// Fonts are inlined: a page made with setContent() may not load file:// URLs.
const font = (f) => `data:font/woff2;base64,${readFileSync(join(ROOT, 'assets/fonts', f)).toString('base64')}`;

const FONTS = `
@font-face{font-family:Inter;src:url(${font('inter-latin.woff2')});font-weight:100 900}
@font-face{font-family:Display;src:url(${font('instrument-serif.woff2')})}
@font-face{font-family:Display;src:url(${font('instrument-serif-italic.woff2')});font-style:italic}
@font-face{font-family:Mono;src:url(${font('jetbrains-mono.woff2')});font-weight:100 800}`;

const GRAD = 'linear-gradient(135deg,#34d399 0%,#22d3ee 50%,#a5b4fc 100%)';

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#34d399"/><stop offset=".5" stop-color="#22d3ee"/><stop offset="1" stop-color="#a5b4fc"/></linearGradient></defs>
  <rect width="64" height="64" rx="15" fill="url(#g)"/>
  <text x="32" y="41.5" text-anchor="middle" font-family="ui-monospace,SFMono-Regular,Menlo,Consolas,monospace" font-size="25" font-weight="700" letter-spacing="-.5" fill="#04130d">KM</text>
</svg>
`;

const iconHtml = (size) => `<!doctype html><style>${FONTS}
html,body{margin:0;width:${size}px;height:${size}px;background:transparent}
.m{width:${size}px;height:${size}px;border-radius:${size * 0.23}px;background:${GRAD};display:grid;place-items:center;
font:700 ${size * 0.39}px/1 Mono;letter-spacing:-0.02em;color:#04130d}</style><div class="m">KM</div>`;

function ogHtml() {
  const portrait = `data:image/jpeg;base64,${readFileSync(join(IMG, 'portrait-880.jpg')).toString('base64')}`;
  // A faint street grid, drawn once, so the card echoes the hero.
  let grid = '';
  for (let x = 0; x <= 1200; x += 60) grid += `<path d="M${x} 0V630" />`;
  for (let y = 0; y <= 630; y += 60) grid += `<path d="M0 ${y}H1200" />`;
  const s = stats.slice(0, 4);
  return `<!doctype html><style>${FONTS}
*{box-sizing:border-box}html,body{margin:0}
body{width:1200px;height:630px;overflow:hidden;background:#070a12;color:#e9edf5;font-family:Inter;position:relative}
.glow{position:absolute;inset:0;background:radial-gradient(600px 400px at 85% 10%,rgba(129,140,248,.22),transparent 70%),radial-gradient(500px 400px at 10% 100%,rgba(52,211,153,.18),transparent 70%)}
.haze{position:absolute;left:640px;top:220px;width:380px;height:380px;border-radius:50%;background:radial-gradient(circle,rgba(251,113,133,.22),transparent 70%)}
svg.grid{position:absolute;inset:0}svg.grid path{stroke:rgba(148,163,196,.08);stroke-width:1}
.wrap{position:absolute;inset:0;padding:64px 72px;display:flex;gap:56px}
.text{flex:1;display:flex;flex-direction:column}
.eyebrow{display:inline-flex;align-items:center;gap:12px;align-self:flex-start;padding:9px 18px;border:1px solid rgba(148,163,196,.25);border-radius:999px;font-size:20px;color:#b6bfd1;background:rgba(15,21,36,.7)}
.dot{width:10px;height:10px;border-radius:50%;background:#34d399;box-shadow:0 0 0 6px rgba(52,211,153,.18)}
h1{margin:28px 0 0;font:400 104px/0.92 Display;letter-spacing:-0.03em}
h1 em{font-style:italic;background:${GRAD};-webkit-background-clip:text;color:transparent;padding-right:.08em}
p{margin:26px 0 0;font:400 30px/1.3 Display;color:#b6bfd1;max-width:600px}
p em{font-style:italic;color:#6ee7b7}
.stats{margin-top:auto;display:flex;gap:30px}
.stat b{display:block;font:400 46px/1 Display;background:${GRAD};-webkit-background-clip:text;color:transparent}
.stat span{font-size:16px;color:#8691a8;white-space:nowrap}
.photo{width:360px;height:450px;border-radius:30px;padding:2px;background:linear-gradient(160deg,rgba(52,211,153,.8),transparent 45%,rgba(129,140,248,.7));align-self:center;box-shadow:0 30px 80px -20px rgba(0,0,0,.8)}
.photo img{width:100%;height:100%;object-fit:cover;border-radius:28px;display:block}
.url{position:absolute;right:72px;bottom:28px;font:500 18px Mono;color:#8691a8}
</style>
<div class="glow"></div><div class="haze"></div><svg class="grid" width="1200" height="630">${grid}</svg>
<div class="wrap"><div class="text">
<span class="eyebrow"><span class="dot"></span>${site.role} · ${site.lab}, ${site.orgShort}</span>
<h1>Kapil Kumar<br><em>Meena</em></h1>
<p>Travel behaviour under <em>polluted air</em>, <em>extreme heat</em> and <em>new information</em>, with the models and tools to act on it.</p>
<div class="stats">${s.map((x) => `<div class="stat"><b>${x.value}${x.suffix || ''}</b><span>${x.label}</span></div>`).join('')}</div>
</div><div class="photo"><img src="${portrait}"></div></div>
<div class="url">kapil2020.github.io</div>`;
}

const browser = await chromium.launch();
try {
  writeFileSync(join(IMG, 'favicon.svg'), favicon);

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
console.log('Wrote favicon.svg, favicon.ico, apple-touch-icon.png, icon-192/512.png and og.png to assets/img/');
