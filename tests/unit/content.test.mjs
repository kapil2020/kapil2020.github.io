// Content integrity: the site must say what the CV says, and every reference must resolve.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../../src/content.mjs';
import { thumbNames } from '../../src/thumbs.mjs';
import { iconNames } from '../../src/icons.mjs';

const byType = (t) => C.publications.filter((p) => p.type === t);

test('publication counts match the CV record line', () => {
  assert.equal(byType('journal').length, 9, 'journal articles');
  assert.equal(byType('review').length, 6, 'manuscripts under review');
  assert.equal(byType('prep').length, 1, 'in preparation');
  assert.equal(byType('conference').length, 17, 'conference papers');
  assert.equal(byType('patent').length, 1, 'patents');
});

test('headline stats agree with the publication list', () => {
  const stat = (label) => C.stats.find((s) => s.label === label)?.value;
  assert.equal(stat('Journal articles'), byType('journal').length);
  assert.equal(stat('Manuscripts under review'), byType('review').length);
  assert.equal(stat('Conference papers'), byType('conference').length);
  assert.equal(stat('Published patent'), byType('patent').length);
});

test('CV labels are complete and unique (J1–J9, R1–R6, P1, C1–C17)', () => {
  const labels = C.publications.map((p) => p.cv);
  assert.equal(new Set(labels).size, labels.length, 'duplicate CV label');
  const expect = (prefix, n) => Array.from({ length: n }, (_, i) => `${prefix}${i + 1}`);
  for (const l of [...expect('J', 9), ...expect('R', 6), ...expect('C', 17), 'P1', 'Patent']) {
    assert.ok(labels.includes(l), `missing ${l}`);
  }
});

test('publication ids are unique and URL-safe', () => {
  const ids = C.publications.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^[a-z][a-z0-9-]*$/);
});

test('every publication lists K. K. Meena as an author', () => {
  for (const p of C.publications) assert.ok(p.authors.includes(C.ME), `${p.id} is missing ${C.ME}`);
});

test('DOIs are well formed', () => {
  for (const p of C.publications.filter((x) => x.doi)) {
    assert.match(p.doi, /^10\.\d{4,9}\/\S+$/, p.id);
  }
  // Every published journal article has a DOI.
  for (const p of byType('journal')) assert.ok(p.doi, `${p.id} has no DOI`);
});

test('years are plausible and lists run newest first', () => {
  for (const type of ['journal', 'conference']) {
    const years = byType(type).map((p) => p.year);
    for (const y of years) assert.ok(y >= 2019 && y <= 2027, `year ${y}`);
    assert.deepEqual(years, [...years].sort((a, b) => b - a), `${type} not sorted by year`);
  }
});

test('every drawing referenced exists', () => {
  for (const p of C.publications.filter((x) => x.fig)) assert.ok(thumbNames.includes(p.fig), `${p.id}: ${p.fig}`);
  for (const s of C.software) assert.ok(thumbNames.includes(s.fig), `${s.id}: ${s.fig}`);
  for (const t of C.research.thrusts) assert.ok(thumbNames.includes(t.fig), t.fig);
  // Cards in the journal, review and prep groups all carry a drawing.
  for (const p of C.publications.filter((x) => ['journal', 'review', 'prep', 'patent'].includes(x.type))) assert.ok(p.fig, `${p.id} has no drawing`);
});

test('topics and research citations resolve', () => {
  const ids = new Set(C.publications.map((p) => p.id));
  for (const p of C.publications) for (const t of p.topics) assert.ok(C.topics[t], `${p.id}: unknown topic ${t}`);
  for (const t of C.research.thrusts) for (const id of t.cites) assert.ok(ids.has(id), `thrust cites unknown ${id}`);
});

test('icons used in content exist', () => {
  const used = [
    ...C.profiles.map((p) => p.icon),
    ...C.hero.chips.map((c) => c.icon),
    ...C.about.pillars.map((p) => p.icon),
    ...C.about.facts.map((f) => f.icon),
    ...C.research.pipeline.map((s) => s.icon),
    ...C.awards.map((a) => a.icon),
    ...C.skills.map((s) => s.icon),
  ];
  for (const n of used) assert.ok(iconNames.includes(n), `unknown icon ${n}`);
});

test('external links use https', () => {
  const urls = JSON.stringify(C).match(/https?:\/\/[^"'\s<>)]+/g) || [];
  assert.ok(urls.length > 30);
  for (const u of urls) assert.ok(u.startsWith('https://'), u);
});

test('news is grouped by year, newest first, with known kinds', () => {
  const years = C.news.map((n) => n.year);
  assert.deepEqual(years, [...years].sort((a, b) => b - a));
  const kinds = new Set(['paper', 'patent', 'career', 'talk', 'award', 'grant', 'media', 'service']);
  for (const y of C.news) for (const n of y.items) assert.ok(kinds.has(n.kind), n.kind);
});

test('key facts from the CV are present', () => {
  const all = JSON.stringify(C);
  for (const fact of ['202631018379', 'HUMAN Lab', 'IIT Kharagpur', 'IIT Roorkee', 'University of Leeds', 'WRI India', 'All India Rank 559', 'Rajasthan Technical University', 'kapilm.48@gmail.com', '0000-0002-0271-0175']) {
    assert.ok(all.includes(fact), `missing: ${fact}`);
  }
  assert.equal(C.service.reviewer.length, 8, 'reviewer for 8 journals');
});
