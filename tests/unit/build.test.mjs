// Checks on the built site in _site/ (run `npm test`, which builds first).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, REDIRECTS } from '../../scripts/build.mjs';
import { publications } from '../../src/content.mjs';
import { thumb, thumbNames } from '../../src/thumbs.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SITE = join(ROOT, '_site');

build({ quiet: true });
const html = readFileSync(join(SITE, 'index.html'), 'utf8');

const attrs = (name, src = html) => [...src.matchAll(new RegExp(`\\s${name}="([^"]*)"`, 'g'))].map((m) => m[1]);
const ids = attrs('id');
const idSet = new Set(ids);

/** Minimal well-formedness check: every element that opens also closes, in order. */
function assertBalanced(markup, label) {
  const stack = [];
  const voids = new Set(['meta', 'link', 'img', 'br', 'hr', 'input', 'source', 'area', 'base', 'col', 'embed', 'track', 'wbr']);
  const body = markup.replace(/<!--[\s\S]*?-->/g, '').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
  for (const m of body.matchAll(/<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g)) {
    const [, close, tag, , self] = m;
    const t = tag.toLowerCase();
    if (self || voids.has(t) || t === '!doctype') continue;
    if (close) {
      const open = stack.pop();
      assert.equal(open, t, `${label}: </${t}> closes <${open}>`);
    } else stack.push(t);
  }
  assert.deepEqual(stack, [], `${label}: unclosed ${stack.join(', ')}`);
}

test('index.html is well formed', () => assertBalanced(html, 'index.html'));

test('every drawing renders as well-formed SVG without NaN or undefined', () => {
  for (const name of thumbNames) {
    const svg = thumb(name);
    assertBalanced(svg, name);
    assert.doesNotMatch(svg, /NaN|undefined|Infinity|\[object/, name);
    assert.match(svg, /aria-label="[^"]{20,}"/, `${name} needs a description`);
  }
});

test('head has the essentials for search and sharing', () => {
  assert.match(html, /<html lang="en-GB"/);
  assert.match(html, /<title>[^<]{20,}<\/title>/);
  assert.match(html, /<meta name="description" content="[^"]{80,}">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/kapil2020\.github\.io\/">/);
  assert.match(html, /<meta property="og:image" content="https:\/\/kapil2020\.github\.io\/assets\/img\/og\.png">/);
  assert.match(html, /<meta name="viewport" content="width=device-width/);
});

test('structured data parses and describes the person and the papers', () => {
  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(m, 'JSON-LD present');
  const data = JSON.parse(m[1]);
  const person = data['@graph'].find((n) => n['@type'] === 'Person');
  assert.equal(person.name, 'Kapil Kumar Meena');
  assert.ok(person.sameAs.some((u) => u.includes('orcid.org/0000-0002-0271-0175')));
  const articles = data['@graph'].filter((n) => n['@type'] === 'ScholarlyArticle');
  assert.equal(articles.length, 9);
});

test('ids are unique', () => {
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  assert.deepEqual(dupes, []);
});

test('every in-page link points at an element that exists', () => {
  for (const href of attrs('href').filter((h) => h.startsWith('#'))) {
    if (href === '#') continue;
    assert.ok(idSet.has(href.slice(1)), `broken anchor ${href}`);
  }
  for (const ref of attrs('aria-controls').concat(attrs('aria-labelledby'))) {
    for (const id of ref.split(' ')) assert.ok(idSet.has(id), `aria reference to missing #${id}`);
  }
});

test('every SVG reference (url(#…), <use>, <mpath>) resolves', () => {
  for (const m of html.matchAll(/url\(#([\w-]+)\)/g)) assert.ok(idSet.has(m[1]), `url(#${m[1]})`);
  for (const m of html.matchAll(/<(?:use|mpath) href="#([\w-]+)"/g)) assert.ok(idSet.has(m[1]), `href #${m[1]}`);
});

test('every local file the page references exists', () => {
  const refs = [...attrs('href'), ...attrs('src'), ...attrs('srcset').flatMap((s) => s.split(',').map((x) => x.trim().split(' ')[0])), ...attrs('data-lightbox')];
  const local = refs.filter((r) => r && !/^(https?:|mailto:|#|data:)/.test(r));
  assert.ok(local.length > 10);
  for (const r of local) {
    const path = r.split(/[?#]/)[0].replace(/^\//, '');
    const file = join(SITE, path.endsWith('/') || path === '' ? `${path}index.html` : path);
    assert.ok(existsSync(file), `missing ${r}`);
  }
});

test('external links are https and open safely', () => {
  for (const m of html.matchAll(/<a\s[^>]*>/g)) {
    const tag = m[0];
    const href = tag.match(/href="([^"]*)"/)?.[1] || '';
    if (/^http:/.test(href)) assert.fail(`insecure link ${href}`);
    if (/target="_blank"/.test(tag)) assert.match(tag, /rel="noopener"/, tag);
    if (/^https:/.test(href)) assert.match(tag, /target="_blank"/, `external link without new tab: ${href}`);
  }
});

test('images have alt text and dimensions', () => {
  for (const m of html.matchAll(/<img\s[^>]*>/g)) {
    const tag = m[0];
    if (/data-lightbox-img/.test(tag)) continue; // filled in when the viewer opens
    assert.match(tag, /alt="[^"]+"/, tag);
    assert.match(tag, /width="\d+"/, tag);
    assert.match(tag, /height="\d+"/, tag);
  }
});

test('every publication appears on the page with its DOI', () => {
  for (const p of publications) {
    assert.ok(idSet.has(p.id), `missing #${p.id}`);
    if (p.doi) assert.ok(html.includes(`https://doi.org/${p.doi}`), `missing DOI for ${p.id}`);
  }
});

test('BibTeX export is complete and balanced', () => {
  const bib = readFileSync(join(SITE, 'publications.bib'), 'utf8');
  const entries = [...bib.matchAll(/^@(\w+)\{([\w-]+),/gm)];
  assert.equal(entries.length, publications.filter((p) => p.bib).length);
  const keys = entries.map((e) => e[2]);
  assert.equal(new Set(keys).size, keys.length, 'duplicate BibTeX keys');
  let depth = 0;
  for (const ch of bib) {
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    assert.ok(depth >= 0, 'unbalanced braces');
  }
  assert.equal(depth, 0, 'unbalanced braces');
  assert.match(bib, /author\s+= \{Meena, K\. K\. and Goswami, A\. K\.\}/);
});

test('old al-folio URLs redirect to real places', () => {
  for (const [from, to] of Object.entries(REDIRECTS)) {
    const page = readFileSync(join(SITE, from, 'index.html'), 'utf8');
    assert.match(page, new RegExp(`url=${to.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
    const [path, hash] = to.split('#');
    if (hash) assert.ok(idSet.has(hash), `${from} → missing #${hash}`);
    else assert.ok(existsSync(join(SITE, path.replace(/^\//, '') || 'index.html')), `${from} → missing ${path}`);
  }
});

test('404 page uses absolute asset paths (it is served at any URL)', () => {
  const page = readFileSync(join(SITE, '404.html'), 'utf8');
  assert.match(page, /href="\/assets\/css\/main\.css\?v=/);
  assertBalanced(page, '404.html');
});

test('site files for crawlers and installs exist', () => {
  for (const f of ['robots.txt', 'sitemap.xml', 'site.webmanifest', '.nojekyll', 'favicon.ico', 'assets/img/og.png', 'assets/img/icon-192.png', 'assets/cv/Kapil-Kumar-Meena-CV.pdf']) {
    assert.ok(existsSync(join(SITE, f)), f);
  }
  assert.match(readFileSync(join(SITE, 'robots.txt'), 'utf8'), /Sitemap: https:\/\/kapil2020\.github\.io\/sitemap\.xml/);
  JSON.parse(readFileSync(join(SITE, 'site.webmanifest'), 'utf8'));
});

test('page weight stays within budget', () => {
  const gz = gzipSync(html).length;
  assert.ok(gz < 90 * 1024, `index.html is ${(gz / 1024).toFixed(1)} kB gzipped`);
  const css = gzipSync(readFileSync(join(SITE, 'assets/css/main.css'))).length;
  assert.ok(css < 25 * 1024, `main.css is ${(css / 1024).toFixed(1)} kB gzipped`);
});
