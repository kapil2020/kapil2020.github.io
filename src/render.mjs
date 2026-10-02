// Page templates. Plain functions that return HTML strings; no framework.

import { icon, iconSprite, resetIcons } from './icons.mjs';
import { thumb, resetThumbs } from './thumbs.mjs';
import * as C from './content.mjs';

const { site, links } = C;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Escape text for HTML. Use for plain-text fields only (titles, names). */
export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Strip tags and decode the few entities used in content. */
export const plain = (s) =>
  String(s ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&amp;/g, '&')
    .replace(/&rsquo;|&lsquo;/g, '’')
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&eacute;/g, 'é')
    .replace(/&#8209;/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

const isExternal = (href) => /^https?:\/\//.test(href);

/** Open external links in a new tab, safely. */
export function a(href, inner, cls = '', extra = '') {
  const ext = isExternal(href) ? ' target="_blank" rel="noopener"' : '';
  return `<a href="${esc(href)}"${cls ? ` class="${cls}"` : ''}${ext}${extra ? ' ' + extra : ''}>${inner}</a>`;
}

/** Make every external <a> inside an HTML snippet open in a new tab. */
export const extLinks = (html) =>
  html.replace(/<a href="(https?:\/\/[^"]+)"(?![^>]*target=)/g, '<a href="$1" target="_blank" rel="noopener"');

const pubsById = Object.fromEntries(C.publications.map((p) => [p.id, p]));

function eyebrow(num, text) {
  return `<p class="eyebrow"><span class="eyebrow__num">${num}</span><span class="eyebrow__line" aria-hidden="true"></span>${text}</p>`;
}

function secHead(num, label, title, lede = '', id = '') {
  return `<header class="sec-head reveal">
    ${eyebrow(num, label)}
    <h2 class="sec-title"${id ? ` id="${id}"` : ''}>${title}</h2>
    ${lede ? `<p class="sec-lede">${lede}</p>` : ''}
  </header>`;
}

// ---------------------------------------------------------------------------
// Publications: authors, BibTeX, citation text
// ---------------------------------------------------------------------------

function authorsHtml(list) {
  return list
    .map((n) => {
      if (n === C.ME) return `<b class="me">${esc(n)}</b>`;
      return C.people[n] ? a(C.people[n], esc(n)) : esc(n);
    })
    .join(', ');
}

/** "K. K. Meena" → "Meena, K. K."; "S. Guha Majumdar" → "Guha Majumdar, S." */
function lastFirst(name) {
  const parts = name.split(' ');
  const initials = parts.filter((p) => /^[A-Z]\.$/.test(p));
  const last = parts.filter((p) => !/^[A-Z]\.$/.test(p));
  return `${last.join(' ')}, ${initials.join(' ')}`;
}

const bibEsc = (s) => plain(s).replace(/&/g, '\\&').replace(/’/g, "'");

export function bibtex(p) {
  if (!p.bib) return '';
  const b = p.bib;
  const f = [];
  f.push(['title', `{${bibEsc(p.title).replace(/\b(TOD|MCDM|Indian|India|Delhi|Kolkata|Kharagpur|Mumbai|GeoNBeats|LLM|EV|PD-MUSE)\b/g, '{$1}')}}`]);
  f.push(['author', `{${p.authors.map(lastFirst).join(' and ')}}`]);
  if (b.kind === 'article') f.push(['journal', `{${b.journal}}`]);
  if (b.kind === 'inproceedings') f.push(['booktitle', `{${bibEsc(p.venueText || p.venue)}}`]);
  if (b.howpublished) f.push(['howpublished', `{${b.howpublished}}`]);
  if (p.volume) f.push(['volume', `{${p.volume}}`]);
  if (p.pages) f.push(['pages', `{${p.pages}}`]);
  if (b.publisher) f.push(['publisher', `{${b.publisher}}`]);
  f.push(['year', `{${p.year}}`]);
  if (p.doi) f.push(['doi', `{${p.doi}}`]);
  if (b.note) f.push(['note', `{${b.note}}`]);
  const pad = Math.max(...f.map(([k]) => k.length));
  return `@${b.kind}{${b.key},\n${f.map(([k, v]) => `  ${k.padEnd(pad)} = ${v}`).join(',\n')}\n}`;
}

/** APA-style reference, used by the "Cite" button. */
export function citeText(p) {
  const au = p.authors.map(lastFirst);
  const authors = au.length > 1 ? `${au.slice(0, -1).join(', ')}, & ${au[au.length - 1]}` : au[0];
  const venue = plain(p.venueText || p.venue);
  let s = `${authors} (${p.year}). ${plain(p.title)}. `;
  if (p.type === 'journal') {
    s += venue;
    if (p.volume) s += `, ${p.volume}`;
    if (p.pages) s += `, ${p.pages.replace('--', '–')}`;
    s += '.';
  } else if (p.type === 'patent') {
    s += `${plain(p.venue)}.`;
  } else {
    s += `${venue}.`;
  }
  if (p.doi) s += ` https://doi.org/${p.doi}`;
  return s;
}

const statusClass = (s = '') =>
  /accepted/i.test(s) ? 'accepted' : /revision/i.test(s) ? 'revision' : /review|prep/i.test(s) ? 'review' : 'published';

function pubTitleHref(p) {
  if (p.doi) return `https://doi.org/${p.doi}`;
  const pre = (p.links || []).find((l) => /preprint/i.test(l.label));
  return pre ? pre.href : '';
}

function pubActions(p) {
  const acts = [];
  if (p.doi) acts.push(a(`https://doi.org/${p.doi}`, `DOI ${icon('arrow-up-right')}`, 'act act--primary'));
  for (const l of p.links || []) {
    acts.push(a(l.href, `${esc(l.label)}${l.internal ? '' : ' ' + icon('arrow-up-right')}`, 'act'));
  }
  if (p.bib) acts.push(`<button type="button" class="act" data-bib="${p.id}" aria-expanded="false" aria-controls="bib-${p.id}">${icon('quote')}BibTeX</button>`);
  if (p.type === 'journal' || p.type === 'patent' || (p.type === 'conference' && p.doi)) {
    acts.push(`<button type="button" class="act" data-cite="${esc(citeText(p))}">${icon('copy')}Cite</button>`);
  }
  return acts.join('');
}

function bibPanel(p) {
  if (!p.bib) return '';
  return `<div class="bib" id="bib-${p.id}" hidden>
      <pre><code>${esc(bibtex(p))}</code></pre>
      <button type="button" class="bib__copy" data-copy-from="bib-${p.id}">${icon('copy')}<span>Copy</span></button>
    </div>`;
}

function searchText(p) {
  return [p.title, p.authors.join(' '), plain(p.venue), p.badge, p.status, p.year, p.cv, (p.topics || []).map((t) => C.topics[t].label).join(' '), plain(p.summary || '')]
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9.₂ ]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function topicTags(p) {
  return `<ul class="tags" aria-label="Topics">${(p.topics || [])
    .map((t) => `<li class="tag tag--${C.topics[t].tone}">${esc(C.topics[t].label)}</li>`)
    .join('')}</ul>`;
}

function pubCard(p) {
  const href = pubTitleHref(p);
  const title = href ? a(href, esc(p.title)) : esc(p.title);
  return `<li class="pub pub--card reveal" id="${p.id}" data-type="${p.type}" data-topics="${(p.topics || []).join(' ')}" data-year="${p.year}" data-search="${esc(searchText(p))}">
    <div class="pub__fig" aria-hidden="true">${thumb(p.fig)}</div>
    <div class="pub__body">
      <div class="pub__meta">
        <span class="badge badge--${p.type}">${esc(p.badge)}</span>
        <span class="status status--${statusClass(p.status)}">${esc(p.status)}</span>
        <span class="pub__cv" title="Label in the CV">${esc(p.cv)}</span>
      </div>
      <h4 class="pub__title">${title}</h4>
      <p class="pub__authors">${authorsHtml(p.authors)}</p>
      <p class="pub__venue">${p.venue}</p>
      ${p.summary ? `<p class="pub__summary">${p.summary}</p>` : ''}
      ${p.highlight ? `<p class="pub__highlight">${icon('sparkles')}<span>${esc(p.highlight)}</span></p>` : ''}
      <div class="pub__foot">${topicTags(p)}<div class="pub__actions">${pubActions(p)}</div></div>
      ${bibPanel(p)}
    </div>
  </li>`;
}

function pubRow(p) {
  const href = pubTitleHref(p);
  const title = href ? a(href, esc(p.title)) : esc(p.title);
  const acts = pubActions(p);
  return `<li class="pub pub--row reveal" id="${p.id}" data-type="${p.type}" data-topics="${(p.topics || []).join(' ')}" data-year="${p.year}" data-search="${esc(searchText(p))}">
    <span class="pub__dot pub__dot--${C.topics[p.topics[0]].tone}" aria-hidden="true"></span>
    <div class="pub__body">
      <h4 class="pub__title">${title}</h4>
      <p class="pub__authors">${authorsHtml(p.authors)}</p>
      <p class="pub__venue"><span class="badge badge--conference">${esc(p.badge)}</span>${p.venue}${p.status ? ` <span class="status status--${statusClass(p.status)}">${esc(p.status)}</span>` : ''}</p>
      ${acts ? `<div class="pub__actions">${acts}</div>` : ''}
      ${bibPanel(p)}
    </div>
    <span class="pub__cv" title="Label in the CV">${esc(p.cv)}</span>
  </li>`;
}

function patentCard(p) {
  return `<article class="feature feature--patent reveal" id="${p.id}" data-type="patent" data-topics="${p.topics.join(' ')}" data-year="${p.year}" data-search="${esc(searchText(p))}">
    <div class="feature__fig" aria-hidden="true">${thumb(p.fig)}</div>
    <div class="feature__body">
      <p class="feature__kicker">${icon('stamp')} Published patent</p>
      <h4 class="feature__title">${esc(p.title)}</h4>
      <p class="pub__authors">${authorsHtml(p.authors)}</p>
      <p class="pub__venue">${esc(p.venue)}</p>
      <p class="pub__summary">${p.summary}</p>
      <div class="pub__actions">${pubActions(p)}</div>
      ${bibPanel(p)}
    </div>
  </article>`;
}

function mediaCard() {
  const m = C.media;
  return `<article class="feature feature--media reveal" id="media" data-type="press" data-topics="tools air" data-search="the hindu media drum press greener routes">
    <button type="button" class="feature__fig feature__fig--photo" data-lightbox="${m.clipping}" data-lightbox-alt="${esc(`${m.outlet}, 8 June 2025: ${m.title}`)}" aria-label="Open the print page from ${esc(m.outlet)}">
      <picture><source srcset="${m.thumb}.webp" type="image/webp"><img src="${m.thumb}.jpg" alt="${esc(`${m.outlet} clipping: ${m.title}`)}" width="520" height="352" loading="lazy" decoding="async"></picture>
      <span class="feature__zoom">${icon('search')} View print page</span>
    </button>
    <div class="feature__body">
      <p class="feature__kicker">${icon('newspaper')} In the press · <i>${esc(m.outlet)}</i></p>
      <h4 class="feature__title">${a(m.href, `&ldquo;${esc(m.title)}&rdquo;`)}</h4>
      <p class="pub__venue">${esc(m.byline)}</p>
      <p class="pub__summary">${esc(m.text)}</p>
      <div class="pub__actions">${a(m.href, `Read online ${icon('arrow-up-right')}`, 'act act--primary')}<button type="button" class="act" data-lightbox="${m.clipping}" data-lightbox-alt="${esc(`${m.outlet}, 8 June 2025: ${m.title}`)}">${icon('image')}Print page</button></div>
    </div>
  </article>`;
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

const NAV = [
  ['about', 'About'],
  ['research', 'Research'],
  ['publications', 'Publications'],
  ['software', 'Software'],
  ['experience', 'Experience'],
  ['contact', 'Contact'],
];

function header() {
  return `<header class="nav" data-nav>
  <div class="container nav__inner">
    <a class="brand" href="#top" aria-label="${esc(site.displayName)}, back to top">${esc(site.displayName)}</a>
    <nav class="nav__links" aria-label="Sections">
      ${NAV.map(([id, label]) => `<a href="#${id}" data-spy="${id}">${label}</a>`).join('')}
    </nav>
    <div class="nav__actions">
      <button type="button" class="cmdk-btn" data-cmdk-open aria-label="Search the site">
        ${icon('search')}<span class="cmdk-btn__label">Search</span><kbd class="kbd" data-kbd-mod>Ctrl K</kbd>
      </button>
      <button type="button" class="icon-btn" data-theme-toggle aria-label="Switch colour theme">
        ${icon('sun', 'i--sun')}${icon('moon', 'i--moon')}
      </button>
      <a class="btn btn--primary btn--sm nav__cv" href="${site.cv}" target="_blank" rel="noopener">${icon('file-text')}CV</a>
      <button type="button" class="icon-btn nav__menu" data-menu-toggle aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu">
        ${icon('menu', 'i--menu')}${icon('x', 'i--close')}
      </button>
    </div>
  </div>
  <div class="progress" aria-hidden="true"><span data-progress></span></div>
</header>
<div class="mnav" id="mobile-nav" data-mnav hidden>
  <nav aria-label="Sections (mobile)">
    ${[...NAV.slice(0, 5), ['news', 'News'], ['honours', 'Honours'], ['teaching', 'Teaching & talks'], ['contact', 'Contact']]
      .map(([id, label], i) => `<a href="#${id}" style="--i:${i}">${label}${icon('arrow-right')}</a>`)
      .join('')}
  </nav>
  <div class="mnav__foot">
    <a class="btn btn--primary" href="${site.cv}" target="_blank" rel="noopener">${icon('download')}Download CV</a>
    <a class="btn btn--ghost" href="mailto:${site.email}">${icon('mail')}Email</a>
  </div>
</div>`;
}

function hero() {
  const h = C.hero;
  return `<section class="hero" id="top" aria-labelledby="hero-title">
  <canvas class="hero__canvas" data-hero-canvas aria-hidden="true"></canvas>
  <div class="hero__veil" aria-hidden="true"></div>
  <div class="hero__media">
    <picture>
      <source type="image/webp" srcset="assets/img/hero-640.webp 640w, assets/img/hero-1122.webp 1122w" sizes="(max-width: 980px) 100vw, 46vw">
      <img src="assets/img/hero-1122.jpg" srcset="assets/img/hero-640.jpg 640w, assets/img/hero-1122.jpg 1122w" sizes="(max-width: 980px) 100vw, 46vw" width="1122" height="1572" alt="Portrait of ${esc(site.displayName)}" fetchpriority="high" decoding="async">
    </picture>
  </div>
  <div class="container hero__inner">
    <div class="hero__text">
      <h1 class="hero__title" id="hero-title">${esc(site.displayName)}</h1>
      <p class="hero__role"><span class="hero__role-title">${esc(h.role)}</span><span class="hero__role-org">${extLinks(h.affiliation)}</span></p>
      <p class="hero__tagline">${h.tagline}</p>
      <div class="hero__cta">
        <a class="btn btn--primary btn--lg" href="#research">Explore my research ${icon('arrow-right')}</a>
        <a class="btn btn--ghost btn--lg" href="${site.cv}" target="_blank" rel="noopener">${icon('download')}Download CV</a>
      </div>
      <ul class="hero__social" aria-label="Profiles">
        <li>${a(`mailto:${site.email}`, icon('mail'), 'social', `aria-label="Email ${site.email}" data-tip="Email"`)}</li>
        ${C.profiles.map((p) => `<li>${a(p.href, icon(p.icon), 'social', `aria-label="${p.label}" data-tip="${p.label}"`)}</li>`).join('')}
      </ul>
    </div>
    <dl class="hero__creds">
      ${h.credentials.map((c) => `<div class="cred"><dt>${esc(c.label)}</dt><dd><a href="${c.href}">${c.value}</a></dd></div>`).join('')}
    </dl>
  </div>
</section>`;
}

function stats() {
  return `<section class="stats" aria-label="Research record">
  <div class="container">
    <ul class="stats__grid">
      ${C.stats
        .map(
          (s) => `<li class="stat reveal">
        <a href="${s.href}"${isExternal(s.href) ? ' target="_blank" rel="noopener"' : ''}${s.filter ? ` data-filter-link="${s.filter}"` : ''}>
          <span class="stat__value"><span data-count="${s.value}">${s.value}</span>${s.suffix || ''}</span>
          <span class="stat__label">${esc(s.label)}</span>
          ${s.note ? `<span class="stat__note">${esc(s.note)}</span>` : ''}
        </a>
      </li>`,
        )
        .join('')}
    </ul>
  </div>
</section>`;
}

function marquee() {
  const items = C.venues.map((v) => `<li>${esc(v)}</li>`).join('<li class="sep" aria-hidden="true">✦</li>');
  return `<section class="marquee" aria-label="Published and presented at">
  <p class="marquee__label container">Published &amp; presented at</p>
  <div class="marquee__track" data-marquee>
    <ul class="marquee__list">${items}<li class="sep" aria-hidden="true">✦</li></ul>
    <ul class="marquee__list" aria-hidden="true">${items}<li class="sep" aria-hidden="true">✦</li></ul>
  </div>
</section>`;
}

function about() {
  const ab = C.about;
  return `<section class="section about" id="about" aria-labelledby="about-title">
  <div class="container">
    ${secHead('01', 'About', 'Cleaner air, cooler streets, <em>smarter travel choices.</em>', '', 'about-title')}
    <div class="about__grid">
      <div class="about__text reveal">
        <p class="about__lead">${ab.lead}</p>
        ${ab.paragraphs.map((p) => `<p>${extLinks(p.replace(/\s+/g, ' '))}</p>`).join('')}
        <div class="pillars" role="list" aria-label="Research at a glance">
          ${ab.pillars
            .map(
              (p, i) => `${i ? '<span class="pillars__x" aria-hidden="true">×</span>' : ''}<div class="pillar pillar--${p.key}" role="listitem">${icon(p.icon)}<b>${p.title}</b><span>${p.text}</span></div>`,
            )
            .join('')}
        </div>
      </div>
      <aside class="about__aside reveal">
        <div class="now card">
          <p class="card__kicker"><span class="pulse-dot" aria-hidden="true"></span>Currently at UCLA</p>
          <ul class="now__list">${ab.now.map((n) => `<li><b>${n.title}</b><span>${n.text}</span></li>`).join('')}</ul>
        </div>
        <dl class="facts card">
          ${ab.facts.map((f) => `<div class="fact">${icon(f.icon)}<dt>${f.label}</dt><dd>${f.value}</dd></div>`).join('')}
        </dl>
        <div class="about__links">
          <a class="btn btn--primary" href="mailto:${site.email}">${icon('mail')}Get in touch</a>
          <a class="btn btn--ghost" href="${site.cv}" target="_blank" rel="noopener">${icon('file-text')}Full CV</a>
        </div>
      </aside>
    </div>
  </div>
</section>`;
}

const NEWS_KIND = {
  paper: ['file-text', 'Paper'],
  patent: ['stamp', 'Patent'],
  career: ['briefcase', 'Career'],
  talk: ['mic', 'Talk'],
  award: ['trophy', 'Award'],
  grant: ['hand-coins', 'Grant'],
  media: ['newspaper', 'Media'],
  service: ['users', 'Service'],
};

function news() {
  const years = C.news;
  return `<section class="section news" id="news" aria-labelledby="news-title">
  <div class="container">
    ${secHead('02', 'News', 'What&rsquo;s <em>new</em>', '', 'news-title')}
    <div class="news__tabs" role="tablist" aria-label="News by year" data-tabs hidden>
      ${years.map((y, i) => `<button type="button" role="tab" id="news-tab-${y.year}" aria-controls="news-${y.year}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${y.year}<span class="count">${y.items.length}</span></button>`).join('')}
    </div>
    <div class="news__panels">
      ${years
        .map(
          (y, i) => `<div class="news__year" id="news-${y.year}" role="tabpanel" aria-labelledby="news-tab-${y.year}" data-panel${i ? ' data-inactive' : ''}>
        <h3 class="news__y">${y.year}</h3>
        <ol class="timeline">
          ${y.items
            .map(
              (n, k) => `<li class="tl tl--${n.kind}${i === 0 && k === 0 ? ' tl--new' : ''}">
            <span class="tl__dot" aria-hidden="true">${icon(NEWS_KIND[n.kind][0])}</span>
            <div class="tl__body">
              <p class="tl__meta"><span class="tl__tag">${NEWS_KIND[n.kind][1]}</span>${n.when ? `<span class="tl__when">${n.when} ${y.year}</span>` : ''}</p>
              <p class="tl__text">${extLinks(n.html)}</p>
            </div>
          </li>`,
            )
            .join('')}
        </ol>
      </div>`,
        )
        .join('')}
    </div>
  </div>
</section>`;
}

function research() {
  const r = C.research;
  return `<section class="section research" id="research" aria-labelledby="research-title">
  <div class="container">
    ${secHead('03', 'Research', 'From the street, to the model, <em>to the decision.</em>', r.lede, 'research-title')}
    <figure class="pipeline reveal" aria-labelledby="pipeline-cap">
      <ol class="pipeline__steps">
        ${r.pipeline
          .map(
            (s, i) => `<li class="step step--${s.key}">
          <span class="step__num">0${i + 1}</span>
          <h3 class="step__title">${icon(s.icon)}${s.title}</h3>
          <ul>${s.items.map((it) => `<li>${it}</li>`).join('')}</ul>
        </li>`,
          )
          .join('<li class="pipeline__arrow" aria-hidden="true"><span></span></li>')}
      </ol>
      <figcaption id="pipeline-cap"><b>Figure 1.</b> How the work fits together. ${esc(r.settings)}</figcaption>
    </figure>
    <div class="thrusts">
      ${r.thrusts
        .map(
          (t, i) => `<article class="thrust reveal${i % 2 ? ' thrust--flip' : ''}">
        <div class="thrust__fig" aria-hidden="true">${thumb(t.fig)}</div>
        <div class="thrust__body">
          <p class="thrust__kicker tone-text--${t.tone}">${t.kicker}</p>
          <h3 class="thrust__title">${t.title}</h3>
          <p>${t.html.replace(/\s+/g, ' ')}</p>
          <ul class="cites" aria-label="Related work">
            ${t.cites
              .map((id) => {
                const p = pubsById[id];
                const hint = p.type === 'review' ? p.status.toLowerCase() : p.type === 'prep' ? 'in prep.' : p.type === 'conference' ? 'conf.' : p.status === 'Accepted' ? 'accepted' : '';
                return `<li><a href="#${id}" class="cite">${esc(p.cite || p.badge)}${hint ? `<span>${esc(hint)}</span>` : ''}</a></li>`;
              })
              .join('')}
          </ul>
        </div>
      </article>`,
        )
        .join('')}
    </div>
  </div>
</section>`;
}

function publications() {
  const all = C.publications;
  const count = (t) => all.filter((p) => p.type === t).length;
  const filters = [
    ['all', 'All', all.length],
    ['journal', 'Journal', count('journal')],
    ['review', 'Under review', count('review')],
    ['conference', 'Conference', count('conference')],
    ['patent', 'Patent & press', count('patent')],
    ['prep', 'In prep.', count('prep')],
  ];
  const usedTopics = Object.keys(C.topics).filter((t) => all.some((p) => p.topics.includes(t)));
  const group = (g) => {
    const items = all.filter((p) => p.type === g.type);
    let body;
    if (g.type === 'patent') body = `<div class="features">${items.map(patentCard).join('')}${mediaCard()}</div>`;
    else if (g.type === 'conference') body = `<ol class="pubs pubs--rows">${items.map(pubRow).join('')}</ol>`;
    else body = `<ol class="pubs pubs--cards">${items.map(pubCard).join('')}</ol>`;
    return `<div class="pub-group" data-group="${g.type}">
      <h3 class="pub-group__title">${g.title}<span class="count" data-group-count>${g.type === 'patent' ? items.length + 1 : items.length}</span></h3>
      ${body}
    </div>`;
  };
  return `<section class="section pubs-sec" id="publications" aria-labelledby="pubs-title">
  <div class="container">
    ${secHead(
      '04',
      'Publications',
      'Papers, a patent, <em>and the questions behind them.</em>',
      `A published patent, ${count('journal')} journal articles, ${count('review')} manuscripts under review and ${count('conference')} refereed conference papers. Also on ${a(links.scholar, 'Google Scholar')} and ${a(links.orcid, 'ORCID')}.`,
      'pubs-title',
    )}
    <div class="pub-tools reveal" data-pub-tools hidden>
      <div class="seg" role="group" aria-label="Filter by type">
        ${filters.map(([k, label, n], i) => `<button type="button" class="seg__btn" data-filter="${k}" aria-pressed="${i === 0}">${label}<span class="count">${k === 'patent' ? n + 1 : n}</span></button>`).join('')}
      </div>
      <div class="pub-tools__row">
        <label class="search">
          ${icon('search')}
          <span class="sr-only">Search publications</span>
          <input type="search" placeholder="Search titles, venues, co-authors…" autocomplete="off" spellcheck="false" data-pub-search>
          <kbd class="kbd">/</kbd>
        </label>
        <a class="btn btn--ghost btn--sm" href="publications.bib" download>${icon('download')}All BibTeX</a>
      </div>
      <div class="topics" role="group" aria-label="Filter by topic">
        ${usedTopics.map((t) => `<button type="button" class="topic topic--${C.topics[t].tone}" data-topic="${t}" aria-pressed="false">${esc(C.topics[t].label)}</button>`).join('')}
      </div>
      <p class="pub-tools__status" role="status" aria-live="polite" data-pub-status></p>
    </div>
    ${C.pubGroups.map(group).join('')}
    <div class="pub-empty" data-pub-empty hidden>
      <p>No publications match that search.</p>
      <button type="button" class="btn btn--ghost btn--sm" data-pub-reset>Clear filters</button>
    </div>
  </div>
</section>`;
}

function software() {
  return `<section class="section software" id="software" aria-labelledby="software-title">
  <div class="container">
    ${secHead('05', 'Software', 'Research you can <em>click on.</em>', 'Tools built from the research, most of them live. Open them, break them, tell me what you find.', 'software-title')}
    <div class="apps">
      ${C.software
        .map((s) => {
          const main = s.links.find((l) => l.primary) || s.links[0];
          return `<article class="app reveal${s.wide ? ' app--wide' : ''}" id="sw-${s.id}">
        <a class="app__fig" href="${main.href}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">${thumb(s.fig)}</a>
        <div class="app__body">
          <div class="app__main">
          <p class="app__kicker tone-text--${s.tone}">${esc(s.kicker)}</p>
          <h3 class="app__name">${a(main.href, s.name)}${s.live ? '<span class="live"><span class="pulse-dot" aria-hidden="true"></span>Live</span>' : ''}</h3>
          <p class="app__text">${esc(s.text)}</p>
          </div>
          <div class="app__side">
          ${s.creds ? `<p class="app__creds">${s.creds.map((c) => `<a class="cite" href="${c.href}">${esc(c.label)}</a>`).join('')}</p>` : ''}
          <ul class="chips" aria-label="Built with">${s.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
          <p class="app__links">${s.links.map((l) => a(l.href, `${esc(l.label)} ${icon(l.label === 'Code' ? 'github' : 'arrow-up-right')}`, `btn btn--sm ${l.primary ? 'btn--soft' : 'btn--ghost'}`)).join('')}</p>
          </div>
        </div>
      </article>`;
        })
        .join('')}
      <article class="app app--cta reveal">
        <div class="app__body">
          <p class="app__kicker tone-text--clean">Open source</p>
          <h3 class="app__name">More code, notebooks <em>&amp; experiments</em></h3>
          <p class="app__text">Analysis pipelines, dashboards and side projects, from mode-share models to district maps, live on GitHub.</p>
          <p class="app__links">${a(links.github, `${icon('github')}github.com/kapil2020 ${icon('arrow-right')}`, 'btn btn--primary')}</p>
        </div>
        <span class="app__cta-mark" aria-hidden="true">${icon('github')}</span>
      </article>
    </div>
  </div>
</section>`;
}

function timelineList(items, iconName) {
  return `<ol class="xp">
    ${items
      .map(
        (x) => `<li class="xp__item${x.current ? ' xp__item--now' : ''} reveal">
      <span class="xp__icon" aria-hidden="true">${icon(iconName)}</span>
      <div class="xp__body">
        <p class="xp__when">${esc(x.when)}${x.current ? '<span class="xp__now">Now</span>' : ''}</p>
        <h4 class="xp__title">${esc(x.title)}</h4>
        <p class="xp__org">${extLinks(x.org)} <span class="xp__place">${icon('map-pin')}${esc(x.place)}</span></p>
        <p class="xp__text">${extLinks(x.text)}</p>
      </div>
    </li>`,
      )
      .join('')}
  </ol>`;
}

function experience() {
  return `<section class="section experience" id="experience" aria-labelledby="experience-title">
  <div class="container">
    ${secHead('06', 'Experience', 'Kota → Roorkee → Kharagpur → Leeds → <em>Los Angeles.</em>', '', 'experience-title')}
    <div class="xp-grid">
      <div><h3 class="col-title">${icon('briefcase')}Appointments</h3>${timelineList(C.appointments, 'briefcase')}</div>
      <div><h3 class="col-title">${icon('graduation-cap')}Education</h3>${timelineList(C.education, 'graduation-cap')}</div>
    </div>
  </div>
</section>`;
}

function honours() {
  return `<section class="section honours" id="honours" aria-labelledby="honours-title">
  <div class="container">
    ${secHead('07', 'Honours', 'Awards, fellowships <em>&amp; grants</em>', '', 'honours-title')}
    <ul class="awards">
      ${C.awards
        .map(
          (x) => `<li class="award reveal">
        <span class="award__icon" aria-hidden="true">${icon(x.icon)}</span>
        <span class="award__year">${esc(x.year)}</span>
        <b class="award__title">${esc(x.title)}</b>
        <span class="award__org">${esc(x.org)}</span>
      </li>`,
        )
        .join('')}
    </ul>
  </div>
</section>`;
}

function teaching() {
  const t = C.teaching;
  return `<section class="section teaching" id="teaching" aria-labelledby="teaching-title">
  <div class="container">
    ${secHead('08', 'Teaching &amp; talks', 'Sharing what <em>the data say.</em>', '', 'teaching-title')}
    <div class="two-col">
      <div class="card card--pad reveal">
        <h3 class="col-title">${icon('school')}Teaching</h3>
        <p class="muted-lead">${esc(t.interests)}</p>
        <ul class="courses">${t.ta.map((c) => `<li><span class="courses__code">${esc(c.code)}</span>${esc(c.name)}</li>`).join('')}</ul>
        <p class="small">${esc(t.taNote)}</p>
      </div>
      <div class="card card--pad reveal">
        <h3 class="col-title">${icon('mic')}Invited talks</h3>
        <ol class="talks">
          ${C.talks.map((x) => `<li><span class="talks__year">${esc(x.year)}</span><div><b>${esc(x.title)}</b><span>${esc(x.where)}</span></div></li>`).join('')}
        </ol>
      </div>
    </div>
  </div>
</section>`;
}

function service() {
  const s = C.service;
  return `<section class="section service" id="service" aria-labelledby="service-title">
  <div class="container">
    ${secHead('09', 'Service &amp; toolkit', 'Giving back, <em>and getting it done.</em>', '', 'service-title')}
    <div class="two-col">
      <div class="card card--pad reveal">
        <h3 class="col-title">${icon('book-open')}Reviewer for ${s.reviewer.length} journals</h3>
        <ul class="chips chips--lg">${s.reviewer.map((j) => `<li><i>${esc(j)}</i></li>`).join('')}</ul>
        <h3 class="col-title col-title--sm">${icon('users')}Roles</h3>
        <ol class="roles">${s.roles.map((r) => `<li><span>${esc(r.year)}</span>${esc(r.text)}</li>`).join('')}</ol>
        <h3 class="col-title col-title--sm">${icon('badge-check')}Member</h3>
        <p class="small">${s.member.map(esc).join(' · ')}</p>
      </div>
      <div class="skills reveal">
        ${C.skills
          .map(
            (k) => `<div class="skill card card--pad skill--${k.key}">
          <h3 class="col-title">${icon(k.icon)}${k.title}</h3>
          <ul class="chips">${k.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
        </div>`,
          )
          .join('')}
      </div>
    </div>
  </div>
</section>`;
}

function contact() {
  return `<section class="section contact" id="contact" aria-labelledby="contact-title">
  <div class="container">
    <div class="contact__card reveal">
      <div class="contact__glow" aria-hidden="true"></div>
      ${eyebrow('10', 'Contact')}
      <h2 class="contact__title" id="contact-title">Let&rsquo;s make travel <em>cleaner, cooler</em> and <em>fairer.</em></h2>
      <p class="contact__text">I&rsquo;m always happy to talk about collaborations, datasets, invited talks or the next question worth asking. The quickest way to reach me is email.</p>
      <div class="contact__actions">
        <a class="btn btn--primary btn--lg" href="mailto:${site.email}">${icon('mail')}${esc(site.email)}</a>
        <button type="button" class="btn btn--ghost btn--lg" data-copy="${site.email}" data-copy-msg="Email address copied">${icon('copy')}Copy address</button>
      </div>
      <ul class="contact__links">
        ${C.profiles.map((p) => `<li>${a(p.href, `${icon(p.icon)}<span>${p.label}</span>${icon('arrow-up-right', 'i--sm')}`, 'contact__link')}</li>`).join('')}
        <li>${a(site.cv, `${icon('file-text')}<span>Curriculum vitae (PDF)</span>${icon('arrow-up-right', 'i--sm')}`, 'contact__link')}</li>
      </ul>
      <p class="contact__where">${icon('map-pin')}${esc(site.lab)}, ${esc(site.org)} · ${esc(site.location)}</p>
    </div>
  </div>
</section>`;
}

function footer() {
  return `<footer class="footer">
  <div class="container footer__inner">
    <div class="footer__brand">
      <b class="brand">${esc(site.displayName)}</b>
      <span>${esc(site.role)}, ${esc(site.lab)}, ${esc(site.orgShort)}</span>
    </div>
    <nav class="footer__nav" aria-label="Footer">
      ${[...NAV, ['news', 'News'], ['honours', 'Honours'], ['teaching', 'Teaching']].map(([id, l]) => `<a href="#${id}">${l}</a>`).join('')}
    </nav>
    <div class="footer__meta">
      <p>© 2026 ${esc(site.name)} · Last updated ${esc(site.updated)}</p>
      <p>Hand-built, no trackers. Prefer something simpler? ${a(links.classic, 'Classic one-page version')}.</p>
    </div>
    <a class="to-top" href="#top" aria-label="Back to top">${icon('arrow-up')}</a>
  </div>
</footer>`;
}

function dialogs() {
  return `<dialog class="cmdk" data-cmdk aria-label="Search the site">
  <div class="cmdk__box">
    <div class="cmdk__head">
      ${icon('search')}
      <input type="text" class="cmdk__input" placeholder="Jump to a section, paper or action…" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="cmdk-list" aria-autocomplete="list" aria-label="Search" data-cmdk-input>
      <kbd class="kbd">Esc</kbd>
    </div>
    <ul class="cmdk__list" id="cmdk-list" role="listbox" aria-label="Results" data-cmdk-list></ul>
    <p class="cmdk__foot"><span><kbd class="kbd">↑</kbd><kbd class="kbd">↓</kbd> move</span><span><kbd class="kbd">↵</kbd> open</span><span><kbd class="kbd">Esc</kbd> close</span></p>
  </div>
</dialog>
<dialog class="lightbox" data-lightbox-dialog aria-label="Image viewer">
  <button type="button" class="icon-btn lightbox__close" data-lightbox-close aria-label="Close">${icon('x')}</button>
  <img alt="" data-lightbox-img>
</dialog>
<div class="toast" role="status" aria-live="polite" data-toast></div>`;
}

// ---------------------------------------------------------------------------
// Document
// ---------------------------------------------------------------------------

function jsonLd() {
  const person = {
    '@type': 'Person',
    '@id': `${site.url}/#person`,
    name: site.name,
    honorificPrefix: 'Dr.',
    alternateName: [site.displayName, 'Kapil Meena', 'K. K. Meena'],
    jobTitle: site.role,
    url: `${site.url}/`,
    image: `${site.url}/assets/img/portrait-880.jpg`,
    email: `mailto:${site.email}`,
    affiliation: { '@type': 'Organization', name: `${site.lab}, ${site.org}`, url: links.humanLab },
    alumniOf: [
      { '@type': 'CollegeOrUniversity', name: 'Indian Institute of Technology Kharagpur' },
      { '@type': 'CollegeOrUniversity', name: 'Indian Institute of Technology Roorkee' },
      { '@type': 'CollegeOrUniversity', name: 'Rajasthan Technical University' },
    ],
    address: { '@type': 'PostalAddress', addressLocality: 'Los Angeles', addressRegion: 'CA', addressCountry: 'US' },
    sameAs: [...C.profiles.map((p) => p.href), links.classic],
    knowsAbout: ['Travel behaviour', 'Discrete choice modelling', 'Air pollution exposure', 'Heat exposure', 'Transportation engineering', 'Machine learning', 'Route choice', 'Electric mobility'],
  };
  const articles = C.publications
    .filter((p) => p.type === 'journal')
    .map((p) => ({
      '@type': 'ScholarlyArticle',
      headline: p.title,
      author: p.authors.map((n) => (n === C.ME ? { '@id': `${site.url}/#person` } : { '@type': 'Person', name: n })),
      datePublished: String(p.year),
      isPartOf: { '@type': 'Periodical', name: plain(p.venueText || p.venue) },
      ...(p.doi ? { sameAs: `https://doi.org/${p.doi}`, identifier: { '@type': 'PropertyValue', propertyID: 'DOI', value: p.doi } } : {}),
    }));
  const page = {
    '@type': 'ProfilePage',
    '@id': `${site.url}/#page`,
    url: `${site.url}/`,
    name: site.title,
    dateModified: '2026-10-02',
    mainEntity: { '@id': `${site.url}/#person` },
  };
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': [page, person, ...articles] }).replace(/</g, '\\u003c');
}

/** Inline script in <head>: set the theme before first paint to avoid a flash. */
const THEME_BOOT = `(function(){var d=document.documentElement;d.classList.remove('no-js');d.classList.add('js');try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}d.dataset.theme=t}catch(e){d.dataset.theme='dark'}})();`;

export function head({ title, description, path = '/', css, extra = '' }) {
  const url = `${site.url}${path}`;
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="${esc(site.name)}">
<meta name="keywords" content="${esc(site.keywords)}">
<link rel="canonical" href="${url}">
<meta name="color-scheme" content="dark light">
<meta name="theme-color" content="#070a12" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#f6f7f4" media="(prefers-color-scheme: light)">
<meta property="og:type" content="profile">
<meta property="og:site_name" content="${esc(site.displayName)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${site.url}/assets/img/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(site.displayName)}, ${esc(site.role)} at ${esc(site.orgShort)}">
<meta property="profile:first_name" content="Kapil Kumar">
<meta property="profile:last_name" content="Meena">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${site.url}/assets/img/og.png">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/assets/img/icon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/schibsted-grotesk.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<script>${THEME_BOOT}</script>
<link rel="stylesheet" href="${css}">
${extra}`;
}

export function renderIndex({ css, js, heroJs }) {
  resetThumbs();
  resetIcons();
  const body = [header(), `<main id="main">`, hero(), stats(), marquee(), about(), news(), research(), publications(), software(), experience(), honours(), teaching(), service(), contact(), `</main>`, footer(), dialogs()].join('\n');
  return `<!doctype html>
<html lang="en-GB" class="no-js" data-theme="dark">
<head>
${head({
  title: site.title,
  description: site.description,
  css,
  extra: `<link rel="alternate" type="application/x-bibtex" href="/publications.bib" title="Publications (BibTeX)">
<script type="application/ld+json">${jsonLd()}</script>
<script type="module" src="${js}"></script>
<script type="module" src="${heroJs}"></script>`,
})}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${body}
${iconSprite()}
</body>
</html>
`;
}

export function render404({ css }) {
  resetIcons();
  const main = `<main class="lost">
  <div class="lost__box">
    <p class="eyebrow"><span class="eyebrow__num">404</span><span class="eyebrow__line" aria-hidden="true"></span>Rerouting</p>
    <h1 class="lost__title">This route is <em>closed.</em></h1>
    <p class="lost__text">The page you were looking for has moved or never existed. The site is now a single page; everything is a scroll away.</p>
    <div class="lost__actions">
      <a class="btn btn--primary btn--lg" href="/">${icon('arrow-right')}Take the clean route home</a>
      <a class="btn btn--ghost btn--lg" href="/#publications">${icon('book-open')}Publications</a>
    </div>
  </div>
</main>`;
  return `<!doctype html>
<html lang="en-GB" class="no-js" data-theme="dark">
<head>
${head({ title: `Page not found · ${site.name}`, description: 'This page does not exist.', path: '/404.html', css, extra: '<meta name="robots" content="noindex">' })}
</head>
<body>
${main}
${iconSprite()}
</body>
</html>
`;
}

/** A tiny page that forwards an old al-folio URL to its new home. */
export function renderRedirect(to) {
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<title>Redirecting…</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${site.url}${to}">
<meta http-equiv="refresh" content="0; url=${to}">
<script>location.replace(${JSON.stringify(to)})</script>
</head>
<body>
<p>This page has moved to <a href="${to}">${site.url}${to}</a>.</p>
</body>
</html>
`;
}

export function renderBib() {
  const entries = C.publications.filter((p) => p.bib).map(bibtex);
  return `% Publications of ${site.name}\n% ${site.url}/#publications · generated ${site.updated}\n\n${entries.join('\n\n')}\n`;
}
