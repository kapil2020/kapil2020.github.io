// Site behaviour. Progressive enhancement: without this file every section still reads fine.

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/* ------------------------------------------------------------------ toast */
const toastEl = $('[data-toast]');
let toastTimer;
function toast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add('is-shown');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-shown'), 2200);
}

async function copyText(text, msg = 'Copied to clipboard') {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.append(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } catch {
      /* ignore */
    }
    ta.remove();
  }
  toast(msg);
}

/* ------------------------------------------------------------------ theme */
function setTheme(t) {
  root.dataset.theme = t;
  try {
    localStorage.setItem('theme', t);
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new CustomEvent('themechange', { detail: t }));
}
const toggleTheme = () => setTheme(root.dataset.theme === 'light' ? 'dark' : 'light');
$$('[data-theme-toggle]').forEach((b) => b.addEventListener('click', toggleTheme));
matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
  let saved = null;
  try {
    saved = localStorage.getItem('theme');
  } catch {
    /* ignore */
  }
  if (!saved) {
    root.dataset.theme = e.matches ? 'light' : 'dark';
    window.dispatchEvent(new CustomEvent('themechange', { detail: root.dataset.theme }));
  }
});

/* ------------------------------------------------- header, progress, top */
const nav = $('[data-nav]');
const bar = $('[data-progress]');
const toTop = $('.to-top');
let ticking = false;
function onScroll() {
  const y = scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  nav?.classList.toggle('is-scrolled', y > 8);
  if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
  toTop?.classList.toggle('is-visible', y > 900);
  ticking = false;
}
addEventListener(
  'scroll',
  () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  },
  { passive: true },
);
onScroll();

/* ------------------------------------------------------------ scroll spy */
const spyLinks = $$('[data-spy]');
const spyTargets = spyLinks.map((a) => document.getElementById(a.dataset.spy)).filter(Boolean);
if (spyTargets.length) {
  const visible = new Map();
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
      let best = null;
      let bestRatio = 0;
      for (const [id, r] of visible) if (r > bestRatio) [best, bestRatio] = [id, r];
      spyLinks.forEach((a) => {
        const on = a.dataset.spy === best;
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    },
    { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.01, 0.5, 1] },
  );
  spyTargets.forEach((t) => spy.observe(t));
}

/* ----------------------------------------------------------- mobile menu */
const menuBtn = $('[data-menu-toggle]');
const mnav = $('[data-mnav]');
function setMenu(open) {
  if (!menuBtn || !mnav) return;
  mnav.hidden = !open;
  nav.classList.toggle('is-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  root.style.overflow = open ? 'hidden' : '';
}
menuBtn?.addEventListener('click', () => setMenu(mnav.hidden));
mnav?.addEventListener('click', (e) => {
  if (e.target.closest('a')) setMenu(false);
});
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mnav && !mnav.hidden) {
    setMenu(false);
    menuBtn.focus();
  }
});
matchMedia('(min-width: 981px)').addEventListener('change', (e) => e.matches && setMenu(false));

/* ----------------------------------------------------------------- reveal */
const revealIO = new IntersectionObserver(
  (entries) => {
    let i = 0;
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.style.transitionDelay = `${Math.min(i++, 5) * 70}ms`;
      e.target.classList.add('is-in');
      revealIO.unobserve(e.target);
    });
  },
  { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
);
$$('.reveal').forEach((el) => revealIO.observe(el));

/* ------------------------------------------------------------- drawings */
// Entrances play once when a drawing scrolls in; loops and vehicles run only while it is
// on screen, so a page of drawings costs nothing when you are reading elsewhere.
const thumbs = $$('svg.th');
thumbs.forEach((svg) => {
  try {
    svg.pauseAnimations();
  } catch {
    /* SMIL unsupported */
  }
});
if (reduceMotion.matches) {
  thumbs.forEach((svg) => svg.classList.add('is-in'));
} else {
  const thumbIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        const svg = e.target;
        if (e.isIntersecting) {
          svg.classList.add('is-in', 'is-live');
          try {
            svg.unpauseAnimations();
          } catch {
            /* ignore */
          }
        } else {
          svg.classList.remove('is-live');
          try {
            svg.pauseAnimations();
          } catch {
            /* ignore */
          }
        }
      });
    },
    { threshold: 0.25 },
  );
  thumbs.forEach((svg) => thumbIO.observe(svg));
}

/* ------------------------------------------- pause off-screen decoration */
const pauseIO = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.target.toggleAttribute('data-offscreen', !e.isIntersecting)),
  { rootMargin: '100px 0px' },
);
$$('.hero, .marquee, .section').forEach((el) => pauseIO.observe(el));

/* --------------------------------------------------------------- counters */
const counters = $$('[data-count]');
if (counters.length && !reduceMotion.matches) {
  const countIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        countIO.unobserve(e.target);
        const el = e.target;
        const to = Number(el.dataset.count);
        const t0 = performance.now();
        const dur = 1400 + Math.min(to, 200) * 2;
        const step = (t) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(2, -10 * p);
          el.textContent = String(Math.round(to * (p === 1 ? 1 : eased)));
          if (p < 1) requestAnimationFrame(step);
        };
        el.textContent = '0';
        requestAnimationFrame(step);
      });
    },
    { threshold: 0.6 },
  );
  counters.forEach((c) => countIO.observe(c));
}

/* ------------------------------------------------------------ spotlight */
let spotRaf = 0;
document.addEventListener(
  'pointermove',
  (e) => {
    if (e.pointerType !== 'mouse' || spotRaf) return;
    spotRaf = requestAnimationFrame(() => {
      spotRaf = 0;
      const card = e.target.closest?.('.pub--card, .app, .feature');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  },
  { passive: true },
);

/* -------------------------------------------------------------- news tabs */
const tabs = $('[data-tabs]');
if (tabs) {
  tabs.hidden = false;
  const btns = $$('[role="tab"]', tabs);
  const select = (btn, focus = false) => {
    btns.forEach((b) => {
      const on = b === btn;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(b.getAttribute('aria-controls'));
      if (panel) panel.toggleAttribute('data-inactive', !on);
    });
    if (focus) btn.focus();
  };
  btns.forEach((b, i) => {
    b.addEventListener('click', () => select(b));
    b.addEventListener('keydown', (e) => {
      const k = e.key;
      if (k === 'ArrowRight' || k === 'ArrowLeft' || k === 'Home' || k === 'End') {
        e.preventDefault();
        const n = k === 'Home' ? 0 : k === 'End' ? btns.length - 1 : (i + (k === 'ArrowRight' ? 1 : -1) + btns.length) % btns.length;
        select(btns[n], true);
      }
    });
  });
}

/* ----------------------------------------------------------- publications */
const tools = $('[data-pub-tools]');
const pubs = $$('#publications [data-type]');
const groups = $$('[data-group]');
const search = $('[data-pub-search]');
const status = $('[data-pub-status]');
const empty = $('[data-pub-empty]');
const total = pubs.filter((el) => el.dataset.type !== 'press').length;
const state = { type: 'all', topics: new Set(), q: '' };

function applyFilters() {
  const terms = state.q.toLowerCase().split(/\s+/).filter(Boolean);
  let shown = 0;
  pubs.forEach((el) => {
    const t = el.dataset.type;
    const typeOk = state.type === 'all' || t === state.type || (state.type === 'patent' && t === 'press');
    const topicOk = !state.topics.size || (el.dataset.topics || '').split(' ').some((t) => state.topics.has(t));
    const hay = el.dataset.search || '';
    const qOk = terms.every((t) => hay.includes(t));
    const ok = typeOk && topicOk && qOk;
    el.classList.toggle('is-filtered-out', !ok);
    if (ok && t !== 'press') shown++;
  });
  groups.forEach((g) => {
    const n = $$('[data-type]', g).filter((el) => !el.classList.contains('is-filtered-out')).length;
    g.hidden = n === 0;
    const c = $('[data-group-count]', g);
    if (c) c.textContent = String(n);
  });
  const filtered = state.type !== 'all' || state.topics.size || terms.length;
  if (status) status.textContent = filtered ? `Showing ${shown} of ${total} publications` : '';
  if (empty) empty.hidden = shown > 0 || pubs.some((el) => !el.classList.contains('is-filtered-out'));
}

function setType(type) {
  state.type = type;
  $$('[data-filter]', tools).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === type)));
  applyFilters();
}

function resetFilters() {
  state.topics.clear();
  $$('[data-topic]', tools).forEach((b) => b.setAttribute('aria-pressed', 'false'));
  if (search) search.value = '';
  state.q = '';
  setType('all');
}

if (tools) {
  tools.hidden = false;
  $$('[data-filter]', tools).forEach((b) => b.addEventListener('click', () => setType(b.dataset.filter)));
  $$('[data-topic]', tools).forEach((b) =>
    b.addEventListener('click', () => {
      const t = b.dataset.topic;
      const on = !state.topics.has(t);
      if (on) state.topics.add(t);
      else state.topics.delete(t);
      b.setAttribute('aria-pressed', String(on));
      applyFilters();
    }),
  );
  let qTimer;
  search?.addEventListener('input', () => {
    clearTimeout(qTimer);
    qTimer = setTimeout(() => {
      state.q = search.value.trim();
      applyFilters();
    }, 90);
  });
  $('[data-pub-reset]')?.addEventListener('click', resetFilters);
  $$('[data-filter-link]').forEach((a) =>
    a.addEventListener('click', () => {
      resetFilters();
      setType(a.dataset.filterLink);
    }),
  );
}

/** Make sure an element inside Publications is visible before jumping to it. */
function ensureVisible(el) {
  if (el && el.closest('#publications') && (el.classList.contains('is-filtered-out') || el.closest('[data-group][hidden]'))) resetFilters();
}
addEventListener('hashchange', () => ensureVisible(document.getElementById(decodeURIComponent(location.hash.slice(1)))));
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const el = document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
  ensureVisible(el);
});

/* --------------------------------------------------- BibTeX, cite, copy */
document.addEventListener('click', (e) => {
  const bibBtn = e.target.closest('[data-bib]');
  if (bibBtn) {
    const panel = document.getElementById(`bib-${bibBtn.dataset.bib}`);
    if (panel) {
      panel.hidden = !panel.hidden;
      bibBtn.setAttribute('aria-expanded', String(!panel.hidden));
    }
    return;
  }
  const from = e.target.closest('[data-copy-from]');
  if (from) {
    const code = document.getElementById(from.dataset.copyFrom)?.querySelector('code');
    if (code) copyText(code.textContent, 'BibTeX copied');
    return;
  }
  const cite = e.target.closest('[data-cite]');
  if (cite) {
    copyText(cite.dataset.cite, 'Citation copied');
    return;
  }
  const cp = e.target.closest('[data-copy]');
  if (cp) copyText(cp.dataset.copy, cp.dataset.copyMsg || 'Copied');
});

/* --------------------------------------------------------------- lightbox */
const lb = $('[data-lightbox-dialog]');
const lbImg = $('[data-lightbox-img]');
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-lightbox]');
  if (!t || !lb?.showModal) return;
  lbImg.src = t.dataset.lightbox;
  lbImg.alt = t.dataset.lightboxAlt || '';
  lb.showModal();
});
$('[data-lightbox-close]')?.addEventListener('click', () => lb.close());
lb?.addEventListener('click', (e) => {
  if (e.target === lb) lb.close();
});

/* -------------------------------------------------------- command palette */
const cmdk = $('[data-cmdk]');
const cmdkInput = $('[data-cmdk-input]');
const cmdkList = $('[data-cmdk-list]');
$$('[data-kbd-mod]').forEach((k) => (k.textContent = isMac ? '⌘ K' : 'Ctrl K'));

const svgIcon = (paths) =>
  `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const I = {
  hash: svgIcon('<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>'),
  doc: svgIcon('<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8M16 13H8M16 17H8"/>'),
  bolt: svgIcon('<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>'),
  ext: svgIcon('<path d="M7 7h10v10"/><path d="M7 17 17 7"/>'),
  app: svgIcon('<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>'),
};

function buildCommands() {
  const cmds = [];
  const sections = [
    ['top', 'Home'],
    ['about', 'About'],
    ['news', 'News'],
    ['research', 'Research'],
    ['publications', 'Publications'],
    ['software', 'Software'],
    ['experience', 'Experience & education'],
    ['honours', 'Honours & awards'],
    ['teaching', 'Teaching & talks'],
    ['service', 'Service & toolkit'],
    ['contact', 'Contact'],
  ];
  sections.forEach(([id, label]) => cmds.push({ group: 'Sections', label, icon: I.hash, run: () => go(`#${id}`) }));
  cmds.push(
    { group: 'Actions', label: 'Toggle light / dark theme', icon: I.bolt, keys: 'theme dark light mode', run: toggleTheme },
    { group: 'Actions', label: 'Copy email address', icon: I.bolt, keys: 'mail contact', run: () => copyText('kapilm.48@gmail.com', 'Email address copied') },
    { group: 'Actions', label: 'Download CV (PDF)', icon: I.doc, keys: 'resume curriculum vitae', run: () => open('assets/cv/Kapil-Kumar-Meena-CV.pdf', '_blank', 'noopener') },
    { group: 'Actions', label: 'Download all BibTeX', icon: I.doc, keys: 'bibtex citations', run: () => (location.href = 'publications.bib') },
    { group: 'Actions', label: 'Send an email', icon: I.bolt, keys: 'mail contact', run: () => (location.href = 'mailto:kapilm.48@gmail.com') },
  );
  $$('.hero__social a.social').forEach((a) => {
    if (a.href.startsWith('mailto:')) return;
    cmds.push({ group: 'Profiles', label: a.getAttribute('aria-label'), icon: I.ext, run: () => open(a.href, '_blank', 'noopener') });
  });
  $$('#software .app[id]').forEach((app) => {
    const name = $('.app__name a', app)?.textContent.trim();
    if (!name) return;
    cmds.push({ group: 'Software', label: name, hint: $('.app__kicker', app)?.textContent.trim(), icon: I.app, run: () => go(`#${app.id}`) });
  });
  $$('#publications [data-type]').forEach((p) => {
    const title = $('.pub__title, .feature__title', p)?.textContent.trim();
    if (!title) return;
    const badge = $('.badge', p)?.textContent.trim() || '';
    cmds.push({ group: 'Publications', label: title, hint: badge, keys: p.dataset.search, icon: I.doc, run: () => go(`#${p.id}`) });
  });
  return cmds;
}

function go(hash) {
  const el = document.getElementById(hash.slice(1));
  ensureVisible(el);
  if (el) {
    history.pushState(null, '', hash);
    el.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
    if (el.matches('.pub, .feature')) {
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = '';
    }
  }
}

let commands = [];
let results = [];
let active = 0;

function score(cmd, terms) {
  if (!terms.length) return cmd.group === 'Publications' ? 0 : 1;
  const label = String(cmd.label || '').toLowerCase();
  const hay = `${label} ${(cmd.keys || '').toLowerCase()} ${(cmd.hint || '').toLowerCase()} ${cmd.group.toLowerCase()}`;
  let s = 0;
  for (const t of terms) {
    if (!hay.includes(t)) return 0;
    s += label.startsWith(t) ? 4 : label.includes(` ${t}`) ? 3 : label.includes(t) ? 2 : 1;
  }
  return s;
}

function renderCmdk() {
  const terms = cmdkInput.value.toLowerCase().split(/\s+/).filter(Boolean);
  results = commands
    .map((c) => ({ c, s: score(c, terms) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => (terms.length ? b.s - a.s : 0))
    .slice(0, terms.length ? 40 : 30)
    .map((r) => r.c);
  if (!terms.length) results.sort((a, b) => ['Sections', 'Actions', 'Software', 'Profiles'].indexOf(a.group) - ['Sections', 'Actions', 'Software', 'Profiles'].indexOf(b.group));
  active = 0;
  if (!results.length) {
    cmdkList.innerHTML = `<li class="cmdk__empty">No results for “${cmdkInput.value.replace(/[<>&]/g, '')}”</li>`;
    cmdkInput.removeAttribute('aria-activedescendant');
    return;
  }
  let html = '';
  let last = '';
  results.forEach((c, i) => {
    if (c.group !== last) {
      html += `<li class="cmdk__group" role="presentation">${c.group}</li>`;
      last = c.group;
    }
    const esc = (s) => String(s || '').replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[m]);
    html += `<li class="cmdk__item" role="option" id="cmdk-${i}" data-i="${i}" aria-selected="${i === 0}">${c.icon}<span class="cmdk__item-text">${esc(c.label)}</span>${c.hint ? `<span class="cmdk__item-hint">${esc(c.hint)}</span>` : ''}</li>`;
  });
  cmdkList.innerHTML = html;
  cmdkInput.setAttribute('aria-activedescendant', 'cmdk-0');
}

function moveActive(n) {
  const items = $$('.cmdk__item', cmdkList);
  if (!items.length) return;
  active = (n + items.length) % items.length;
  items.forEach((el, i) => el.setAttribute('aria-selected', String(i === active)));
  items[active].scrollIntoView({ block: 'nearest' });
  cmdkInput.setAttribute('aria-activedescendant', items[active].id);
}

function runActive(i = active) {
  const c = results[i];
  if (!c) return;
  cmdk.close();
  setTimeout(() => c.run(), 10);
}

function openCmdk() {
  if (!cmdk?.showModal) return;
  if (!commands.length) commands = buildCommands();
  setMenu(false);
  cmdkInput.value = '';
  renderCmdk();
  cmdk.showModal();
  cmdkInput.focus();
}

if (cmdk) {
  $$('[data-cmdk-open]').forEach((b) => b.addEventListener('click', openCmdk));
  cmdkInput.addEventListener('input', renderCmdk);
  cmdkInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveActive(active + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveActive(active - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runActive();
    }
  });
  cmdkList.addEventListener('click', (e) => {
    const item = e.target.closest('.cmdk__item');
    if (item) runActive(Number(item.dataset.i));
  });
  cmdkList.addEventListener('pointermove', (e) => {
    const item = e.target.closest('.cmdk__item');
    if (item && Number(item.dataset.i) !== active) moveActive(Number(item.dataset.i));
  });
  cmdk.addEventListener('click', (e) => {
    if (e.target === cmdk) cmdk.close();
  });
}

/* -------------------------------------------------------------- shortcuts */
addEventListener('keydown', (e) => {
  const typing = e.target.closest?.('input, textarea, select, [contenteditable="true"]');
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if (cmdk?.open) cmdk.close();
    else openCmdk();
    return;
  }
  if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === '/' && search) {
    e.preventDefault();
    search.focus({ preventScroll: true });
    search.closest('#publications')?.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }
});

/* ---------------------------------------------------- deep link on load */
if (location.hash.length > 1) ensureVisible(document.getElementById(decodeURIComponent(location.hash.slice(1))));
