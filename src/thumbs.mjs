// Topic illustrations for papers, research thrusts and software.
//
// Every drawing is inline SVG on a 400 × 250 canvas, built from a small kit of parts
// (people, vehicles, smog, sensors, charts...). Colours come from CSS classes, so each
// drawing follows the light/dark theme. Motion is declared with class names:
//
//   entrance, once, when the drawing scrolls into view (delay: --d)
//     a-draw  stroke traces itself (element needs pathLength="1")
//     a-pop   scales up from nothing       a-fade  fades in
//     a-rise  slides up and fades in       a-grow / a-growy  bar grows across / up
//   loops, while the drawing is on screen (delay: --w)
//     l-pulse  l-ring  l-float  l-drift  l-march  l-spin  l-blink  l-swing  l-drive
//
// Vehicles that follow a route use SMIL <animateMotion>, which main.js pauses off screen.
// With reduced motion, or without JavaScript, the finished drawing shows.

const W = 400;
const H = 250;

/** Small deterministic RNG so drawings are identical on every build. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n) => Math.round(n * 10) / 10;
const d = (s) => `--d:${s}s`;
const w = (s) => `--w:${s}s`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

// ---------------------------------------------------------------------------
// Kit of parts. Each returns an SVG fragment; (x, y) is the bottom centre unless noted.
// ---------------------------------------------------------------------------

const at = (x, y, inner, s = 1) =>
  `<g transform="translate(${r1(x)} ${r1(y)})${s !== 1 ? ` scale(${s})` : ''}">${inner}</g>`;

/** Wrap in an entrance-animated group. */
const anim = (cls, delay, inner, extra = '') =>
  `<g class="${cls}" style="${d(delay)}${extra ? ';' + extra : ''}">${inner}</g>`;

/** Wrap in a looping group. */
const loop = (cls, wait, inner) => `<g class="${cls}" style="${w(wait)}">${inner}</g>`;

function person(x, y, cls = 'f-ink', s = 1) {
  return at(x, y, `<circle cy="-22" r="5" class="${cls}"/><path d="M-7 0V-9a7 7 0 0 1 14 0V0z" class="${cls}"/>`, s);
}

function child(x, y, cls = 'f-ink', s = 1) {
  return at(x, y, `<circle cy="-16" r="4" class="${cls}"/><path d="M-5 0V-6a5 5 0 0 1 10 0V0z" class="${cls}"/><rect x="2" y="-11" width="5" height="7" rx="1.5" class="f-heat"/>`, s);
}

function car(x, y, cls = 'f-model', s = 1) {
  return at(
    x,
    y,
    `<path d="M-21-4c0-5 3-7 7-7l6-7h15l7 7c6 0 8 3 8 7v1h-43z" class="${cls}"/>
     <path d="M-6.5-12.5l4-4.5h5v4.5zM4.5-12.5v-4.5h3.5l4.5 4.5z" class="f-glass"/>
     <circle cx="-11" cy="-2" r="4.5" class="f-ink"/><circle cx="12" cy="-2" r="4.5" class="f-ink"/>
     <circle cx="-11" cy="-2" r="1.6" class="f-card"/><circle cx="12" cy="-2" r="1.6" class="f-card"/>`,
    s,
  );
}

function bus(x, y, cls = 'f-heat', s = 1) {
  return at(
    x,
    y,
    `<rect x="-28" y="-26" width="56" height="22" rx="4" class="${cls}"/>
     <rect x="-24" y="-22" width="9" height="8" rx="1.5" class="f-glass"/><rect x="-12" y="-22" width="9" height="8" rx="1.5" class="f-glass"/>
     <rect x="0" y="-22" width="9" height="8" rx="1.5" class="f-glass"/><rect x="12" y="-22" width="12" height="8" rx="1.5" class="f-glass"/>
     <rect x="-28" y="-10" width="56" height="2" class="f-ink o-20"/>
     <circle cx="-16" cy="-3" r="4.5" class="f-ink"/><circle cx="16" cy="-3" r="4.5" class="f-ink"/>`,
    s,
  );
}

function auto(x, y, cls = 'f-clean', s = 1) {
  return at(
    x,
    y,
    `<path d="M-16-4v-13c0-4 3-7 8-7h12c5 0 9 4 11 9l3 7v4z" class="${cls}"/>
     <path d="M-12-14v-5c0-1.5 1-2.5 3-2.5h8v7.5zM2-21.5h3c2.5 0 4.5 2 5.5 4.5l1 3H2z" class="f-glass"/>
     <rect x="-18" y="-25" width="26" height="3" rx="1.5" class="f-ink o-70"/>
     <circle cx="-9" cy="-2" r="4" class="f-ink"/><circle cx="13" cy="-2" r="4" class="f-ink"/>`,
    s,
  );
}

function bike(x, y, cls = 's-clean', s = 1, rider = '') {
  return at(
    x,
    y,
    `<g class="${cls}" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
       <circle cx="-11" cy="-8" r="7.5"/><circle cx="11" cy="-8" r="7.5"/>
       <path d="M-11-8l7-12h12M-4-20l5 12h-12M1-8l7-12 3 12M-6-23h5M6-24l3-1"/>
     </g>${rider}`,
    s,
  );
}

function rider(cls = 'f-ink') {
  return `<circle cx="1" cy="-38" r="4.5" class="${cls}"/><path d="M-2-33l-2 11 5 2 6-8z" class="${cls}"/>`;
}

function train(x, y, cars = 3, cls = 'f-model') {
  let g = '';
  for (let i = 0; i < cars; i++) {
    const ox = i * 62;
    const nose = i === cars - 1;
    g += `<path d="M${ox} -24h${nose ? 48 : 58}${nose ? 'q10 0 12 10v10' : 'v20'}h-${nose ? 60 : 58}z" class="${cls}"/>`;
    for (let k = 0; k < 4; k++) g += `<rect x="${ox + 5 + k * 12}" y="-20" width="8" height="8" rx="1.5" class="f-glass"/>`;
    g += `<rect x="${ox}" y="-8" width="${nose ? 60 : 58}" height="2" class="f-ink o-20"/>`;
  }
  return at(x, y, g);
}

function tree(x, y, s = 1, cls = 'f-clean') {
  return at(x, y, `<rect x="-1.6" y="-14" width="3.2" height="14" rx="1" class="f-trunk"/><circle cy="-22" r="11" class="${cls}"/><circle cx="-6" cy="-17" r="7" class="${cls}"/><circle cx="6" cy="-17" r="7" class="${cls}"/>`, s);
}

function sun(x, y, r = 16, spin = true) {
  let rays = '';
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    rays += `<path d="M${r1(Math.cos(a) * (r + 5))} ${r1(Math.sin(a) * (r + 5))}L${r1(Math.cos(a) * (r + 11))} ${r1(Math.sin(a) * (r + 11))}"/>`;
  }
  const raysG = `<g class="s-heat" stroke-width="2.6" stroke-linecap="round">${rays}</g>`;
  return at(x, y, `${spin ? loop('l-spin', 0, raysG) : raysG}<circle r="${r}" class="f-heat"/>${r > 7 ? `<circle r="${r - 5}" class="f-heat2"/>` : ""}`);
}

function snowflake(x, y, r = 11) {
  let g = '';
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const ex = Math.cos(a) * r;
    const ey = Math.sin(a) * r;
    const bx = Math.cos(a) * r * 0.55;
    const by = Math.sin(a) * r * 0.55;
    const b1 = a + 0.6;
    const b2 = a - 0.6;
    g += `<path d="M0 0L${r1(ex)} ${r1(ey)}M${r1(bx)} ${r1(by)}l${r1(Math.cos(b1) * 4)} ${r1(Math.sin(b1) * 4)}M${r1(bx)} ${r1(by)}l${r1(Math.cos(b2) * 4)} ${r1(Math.sin(b2) * 4)}"/>`;
  }
  return at(x, y, `<g class="s-model" stroke-width="2" stroke-linecap="round" fill="none">${g}</g>`);
}

/** A soft smog cloud. (x, y) is its centre. */
function smog(x, y, s = 1, wait = 0) {
  return at(
    x,
    y,
    loop(
      'l-drift',
      wait,
      `<g class="f-air o-25"><circle cx="-22" cy="4" r="14"/><circle cx="-4" cy="-6" r="18"/><circle cx="18" cy="2" r="15"/><circle cx="2" cy="8" r="13"/></g>
       <g class="f-air o-30"><circle cx="-8" cy="0" r="9"/><circle cx="10" cy="-2" r="8"/></g>`,
    ),
    s,
  );
}

/** Scattered PM particles inside a box. */
function particles(seed, x0, y0, x1, y1, n, cls = 'f-air') {
  const rand = rng(seed);
  let g = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + rand() * (x1 - x0);
    const y = y0 + rand() * (y1 - y0);
    const r = 1.2 + rand() * 2.2;
    g += `<g class="l-float" style="${w(r1(rand() * 3))}"><circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" class="${cls}" opacity="${r1(0.35 + rand() * 0.5)}"/></g>`;
  }
  return g;
}

function pin(x, y, cls = 'f-air', label = '') {
  return at(
    x,
    y,
    `<path d="M0 0c-6-8-10-12-10-17a10 10 0 0 1 20 0c0 5-4 9-10 17z" class="${cls}"/><circle cy="-17" r="4" class="f-card"/>${
      label ? `<text y="-14" text-anchor="middle" class="t t-on">${label}</text>` : ''
    }`,
  );
}

/** Rounded label. (x, y) is the top-left corner. */
function chip(x, y, text, cls = 'f-card', tcls = 't', wpx) {
  const width = wpx || Math.round(text.replace(/&[a-z]+;/g, 'x').length * 6.2 + 16);
  return `<g transform="translate(${x} ${y})"><rect width="${width}" height="19" rx="9.5" class="${cls}"/><text x="${width / 2}" y="13" text-anchor="middle" class="${tcls}">${text}</text></g>`;
}

function card(x, y, w0, h0, extra = '') {
  return `<rect x="${x}" y="${y}" width="${w0}" height="${h0}" rx="10" class="f-card s-line" stroke-width="1"${extra}/>`;
}

function doc(x, y, s = 1, lines = 5, accent = 'f-model') {
  let g = `<rect x="-26" y="-34" width="52" height="68" rx="5" class="f-card s-line" stroke-width="1.2"/><rect x="-18" y="-25" width="24" height="5" rx="2.5" class="${accent}"/>`;
  for (let i = 0; i < lines; i++) g += `<rect x="-18" y="${-14 + i * 8}" width="${i % 3 === 2 ? 22 : 36}" height="3" rx="1.5" class="f-mute o-50"/>`;
  return at(x, y, g, s);
}

function gauge(x, y, r = 30, needleDeg = 35, wait = 0) {
  // Semicircle from 180° to 360°, three bands.
  const arc = (a0, a1) => {
    const p0 = [Math.cos(a0) * r, Math.sin(a0) * r];
    const p1 = [Math.cos(a1) * r, Math.sin(a1) * r];
    return `M${r1(p0[0])} ${r1(p0[1])}A${r} ${r} 0 0 1 ${r1(p1[0])} ${r1(p1[1])}`;
  };
  const pi = Math.PI;
  return at(
    x,
    y,
    `<g fill="none" stroke-width="7" stroke-linecap="round">
       <path d="${arc(pi, pi * 1.33)}" class="s-clean"/><path d="${arc(pi * 1.38, pi * 1.62)}" class="s-heat"/><path d="${arc(pi * 1.67, pi * 2)}" class="s-air"/>
     </g>
     <g transform="rotate(${needleDeg})"><g class="l-swing" style="${w(wait)}"><path d="M0 0L0 ${-(r - 9)}" class="s-ink" stroke-width="3" stroke-linecap="round"/></g></g>
     <circle r="5" class="f-ink"/>`,
  );
}

function building(x, y, bw, bh, cls = 'f-bld', seed = 1) {
  const rand = rng(seed);
  let win = '';
  for (let yy = y - bh + 7; yy < y - 8; yy += 10) {
    for (let xx = x + 5; xx < x + bw - 6; xx += 9) {
      if (rand() > 0.35) win += `<rect x="${r1(xx)}" y="${r1(yy)}" width="4" height="5" rx="1" class="f-win"/>`;
    }
  }
  return `<rect x="${x}" y="${y - bh}" width="${bw}" height="${bh}" rx="2" class="${cls}"/>${win}`;
}

function phone(x, y, pw, ph, inner = '') {
  return `<g transform="translate(${x} ${y})"><rect width="${pw}" height="${ph}" rx="14" class="f-ink"/><rect x="5" y="5" width="${pw - 10}" height="${ph - 10}" rx="10" class="f-card"/>${inner}<rect x="${pw / 2 - 14}" y="9" width="28" height="5" rx="2.5" class="f-ink"/></g>`;
}

function nnet(x, y, layers, gapX, gapY, edgeCls = 's-ai', nodeCls = 'f-ai', delay0 = 0.2) {
  const pts = layers.map((n, i) => Array.from({ length: n }, (_, k) => [x + i * gapX, y + (k - (n - 1) / 2) * gapY]));
  let edges = '';
  let nodes = '';
  let t = delay0;
  for (let i = 0; i < pts.length - 1; i++) {
    for (const a of pts[i]) for (const b of pts[i + 1]) edges += `<path d="M${r1(a[0])} ${r1(a[1])}L${r1(b[0])} ${r1(b[1])}" pathLength="1" class="a-draw ${edgeCls} o-40" stroke-width="1.2" style="${d(r1(t + i * 0.25))}"/>`;
  }
  pts.forEach((layer, i) =>
    layer.forEach(([px, py], k) => {
      nodes += anim('a-pop', r1(t + i * 0.25 + k * 0.04), loop('l-blink', r1(i * 0.4 + k * 0.25), `<circle cx="${r1(px)}" cy="${r1(py)}" r="5.5" class="${nodeCls}"/>`));
    }),
  );
  return `<g fill="none">${edges}</g>${nodes}`;
}

/** Move `inner` along the path with id `pathId`. */
function mover(pathId, dur, inner, begin = 0, rotate = false) {
  return `<g>${inner}<animateMotion dur="${dur}s" begin="${begin}s" repeatCount="indefinite"${rotate ? ' rotate="auto"' : ''} calcMode="linear"><mpath href="#${pathId}"/></animateMotion></g>`;
}

function bars(x, y, values, bw, gap, maxH, classes, delay = 0.4) {
  return values
    .map((v, i) => {
      const h = v * maxH;
      return `<rect x="${x + i * (bw + gap)}" y="${r1(y - h)}" width="${bw}" height="${r1(h)}" rx="3" class="a-growy ${classes[i % classes.length]}" style="${d(r1(delay + i * 0.08))}"/>`;
    })
    .join('');
}

// ---------------------------------------------------------------------------
// Frame
// ---------------------------------------------------------------------------

function frame(uid, tone, label, body, glow = [0.85, 0.1], [W, H] = [400, 250]) {
  return `<svg class="th tone-${tone}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="${uid}-glow" cx="${glow[0]}" cy="${glow[1]}" r="0.8"><stop offset="0" class="st-tone" stop-opacity=".34"/><stop offset="1" class="st-tone" stop-opacity="0"/></radialGradient>
  <pattern id="${uid}-dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" class="f-dot"/></pattern>
</defs>
<rect width="${W}" height="${H}" class="f-bg"/><rect width="${W}" height="${H}" fill="url(#${uid}-glow)"/><rect width="${W}" height="${H}" fill="url(#${uid}-dots)"/>
${body}
</svg>`;
}

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------

const scenes = {
  // Hybrid latent class: one crowd, three classes that weigh exposure differently.
  'latent-class': (u) => {
    const crowd = [];
    const rand = rng(7);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) crowd.push([46 + c * 20 + (r % 2) * 9, 150 + r * 30, rand()]);
    const cls = ['f-model', 'f-air', 'f-clean'];
    const ys = [56, 125, 194];
    const betas = [0.92, 0.55, 0.2];
    const routes = ys
      .map(
        (y, i) =>
          `<path d="M140 ${150 + (i - 1) * 8}C180 ${150 + (i - 1) * 8} 185 ${y} 226 ${y}" pathLength="1" class="a-draw ${cls[i].replace('f-', 's-')}" stroke-width="2.2" fill="none" style="${d(0.5 + i * 0.15)}"/>
           <path d="M140 ${150 + (i - 1) * 8}C180 ${150 + (i - 1) * 8} 185 ${y} 226 ${y}" class="l-march ${cls[i].replace('f-', 's-')}" stroke-width="2.2" fill="none" stroke-dasharray="3 9" style="${w(i * 0.3)}"/>`,
      )
      .join('');
    const classes = ys
      .map(
        (y, i) =>
          anim(
            'a-rise',
            0.8 + i * 0.15,
            `${card(228, y - 27, 150, 54)}<rect x="228" y="${y - 27}" width="5" height="54" rx="2.5" class="${cls[i]}"/>
             ${person(250, y + 16, cls[i], 0.75)}${person(266, y + 16, cls[i], 0.75)}
             <text x="284" y="${y - 7}" class="t">Class ${i + 1}</text>
             <rect x="284" y="${y + 2}" width="80" height="6" rx="3" class="f-line"/>
             <rect x="284" y="${y + 2}" width="${r1(80 * betas[i])}" height="6" rx="3" class="a-grow ${cls[i]}" style="${d(1.2 + i * 0.15)}"/>
             <text x="284" y="${y + 20}" class="t-s">β exposure</text>`,
          ),
      )
      .join('');
    return frame(
      u,
      'air',
      'Illustration: a crowd of commuters under smog splits into three latent classes that weigh pollution exposure differently',
      `${smog(88, 64, 1.15)}${particles(11, 28, 30, 150, 110, 16)}
       ${crowd.map(([x, y, rv], i) => anim('a-pop', r1(0.1 + i * 0.03), person(x, y, rv > 0.66 ? 'f-model' : rv > 0.33 ? 'f-air' : 'f-clean', 0.72))).join('')}
       ${routes}${classes}`,
      [0.2, 0.2],
    );
  },

  // DRUM: the fastest route crosses a hotspot; the clean route goes round it.
  'drum-routes': (u) => {
    const fast = `M52 212C120 200 150 150 196 128S300 70 348 44`;
    const clean = `M52 212C70 160 90 120 140 104S240 92 270 60 330 36 348 44`;
    const short = `M52 212C150 214 240 200 290 150S340 70 348 44`;
    let grid = '';
    for (let x = 20; x < W; x += 46) grid += `<path d="M${x} 0V${H}" class="s-road" stroke-width="7"/>`;
    for (let y = 18; y < H; y += 42) grid += `<path d="M0 ${y}H${W}" class="s-road" stroke-width="7"/>`;
    return frame(
      u,
      'clean',
      'Illustration: a city map with three routes; the green least-exposure route detours around a red pollution hotspot',
      `<g class="o-70">${grid}</g>
       <g transform="translate(200 140)">${loop('l-pulse', 0, '<circle r="46" class="f-air o-20"/><circle r="28" class="f-air o-25"/>')}</g>
       ${loop('l-ring', 0, '<circle cx="200" cy="140" r="30" class="s-air" fill="none" stroke-width="1.5"/>')}
       ${particles(3, 160, 105, 245, 175, 14)}
       <path d="${short}" pathLength="1" class="a-draw s-model" stroke-width="3" fill="none" stroke-dasharray="1" style="${d(0.3)}"/>
       <path d="${fast}" pathLength="1" class="a-draw s-air" stroke-width="4" fill="none" stroke-linecap="round" style="${d(0.6)}"/>
       <path id="${u}-clean" d="${clean}" pathLength="1" class="a-draw s-clean" stroke-width="6" fill="none" stroke-linecap="round" style="${d(0.9)}"/>
       <path d="${clean}" class="l-march s-white" stroke-width="2" fill="none" stroke-dasharray="2 10" stroke-linecap="round"/>
       ${mover(`${u}-clean`, 7, '<circle r="7" class="f-clean"/><circle r="3" class="f-white"/>')}
       ${anim('a-pop', 0.2, pin(52, 214, 'f-ink'))}${anim('a-pop', 0.3, pin(348, 46, 'f-clean'))}
       ${anim('a-rise', 1.3, `${card(18, 18, 136, 50)}<circle cx="34" cy="34" r="4" class="f-clean"/><text x="44" y="38" class="t">Least exposure</text><text x="30" y="58" class="t-b f-clean-t">−50%</text><text x="84" y="58" class="t-s">for +40% time</text>`)}`,
      [0.8, 0.15],
    );
  },

  // School commute: modes, each with a PM dose bar.
  'school-exposure': (u) => {
    const modes = [
      ['bus', 70],
      ['auto', 158],
      ['bike', 228],
      ['walk', 288],
    ];
    const doses = [0.55, 0.85, 0.7, 0.62];
    const vehicles = modes
      .map(([m, x], i) => {
        const g = m === 'bus' ? bus(x, 214, 'f-heat', 0.85) : m === 'auto' ? auto(x, 214, 'f-clean', 0.95) : m === 'bike' ? bike(x, 214, 's-model', 0.85, rider('f-ink')) : child(x, 214, 'f-ink', 1.1) + child(x + 14, 214, 'f-ink', 0.95);
        return anim('a-rise', r1(0.2 + i * 0.12), loop('l-float', i * 0.4, g));
      })
      .join('');
    const doseBars = modes
      .map(([, x], i) => {
        const h = doses[i] * 70;
        return `<rect x="${x - 7}" y="${r1(150 - h)}" width="14" height="${r1(h)}" rx="4" class="a-growy f-air" style="${d(r1(0.7 + i * 0.1))};opacity:${0.5 + doses[i] * 0.5}"/><rect x="${x - 7}" y="80" width="14" height="70" rx="4" class="s-line" fill="none" stroke-width="1"/>`;
      })
      .join('');
    return frame(
      u,
      'air',
      'Illustration: children travel to school by bus, auto-rickshaw, bicycle and on foot, each with a bar showing their pollution dose',
      `<rect x="0" y="214" width="${W}" height="36" class="f-road"/><path d="M0 232H${W}" class="s-white o-50" stroke-width="2" stroke-dasharray="14 12"/>
       ${particles(21, 20, 160, 330, 210, 14)}
       ${doseBars}
       <text x="38" y="70" class="t">PM₂.₅ dose by mode</text>
       ${anim(
         'a-rise',
         0.1,
         `<path d="M318 214V136l38-24 38 24v78z" class="f-card s-line"/><path d="M312 138l44-30 44 30" class="s-ink" stroke-width="3" fill="none" stroke-linecap="round"/>
          <rect x="344" y="176" width="24" height="38" rx="3" class="f-model"/><circle cx="356" cy="140" r="8" class="f-heat"/>
          <path d="M356 108V82" class="s-ink" stroke-width="2"/><path d="M356 82h18l-4 6 4 6h-18z" class="f-air"/>`,
       )}
       ${vehicles}`,
      [0.9, 0.85],
    );
  },

  // First/last mile cycling to suburban rail, with a health dividend.
  'bike-rail': (u) => {
    const path = 'M30 224C90 222 110 170 170 168S260 160 288 112';
    return frame(
      u,
      'clean',
      'Illustration: a cyclist rides from home to a suburban rail station, with a heart showing the health benefit',
      `<rect x="150" y="96" width="${W - 150}" height="10" class="f-ink o-70"/>
       ${[180, 250, 320, 390].map((x) => `<rect x="${x}" y="106" width="6" height="40" class="f-ink o-30"/>`).join('')}
       ${loop('l-drive', 0, train(170, 96, 3, 'f-model'))}
       <path d="M250 112h120v6H250z" class="f-mute o-50"/>
       <text x="300" y="134" class="t-s">Station</text>
       <path d="${path}" class="s-road" stroke-width="16" fill="none" stroke-linecap="round"/>
       <path id="${u}-p" d="${path}" pathLength="1" class="a-draw s-clean" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="1" style="${d(0.3)}"/>
       ${mover(`${u}-p`, 6, at(0, 4, bike(0, 0, 's-clean', 0.7, rider('f-ink'))))}
       ${anim('a-rise', 0.1, `<path d="M14 222v-26l18-14 18 14v26z" class="f-bld"/><rect x="26" y="204" width="10" height="18" class="f-card"/>`)}
       ${anim('a-pop', 0.9, at(76, 72, loop('l-pulse', 0, '<path d="M0 14C-22 0-22-18-10-20c5-1 9 2 10 6 1-4 5-7 10-6C22-18 22 0 0 14z" class="f-air"/>')))}
       ${anim('a-rise', 1.1, chip(100, 50, 'first / last mile', 'f-card', 't'))}
       ${tree(372, 230, 0.8)}${tree(212, 238, 0.7)}`,
      [0.15, 0.2],
    );
  },

  // TOD: a station with walking catchments and a ranked list of attributes.
  'tod-priority': (u) => {
    const cx = 128;
    const cy = 138;
    let blds = '';
    const rand = rng(5);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + rand() * 0.3;
      const rr = 40 + rand() * 50;
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr * 0.75;
      const h = 34 - rr * 0.22 + rand() * 10;
      blds += anim('a-growy', r1(0.2 + i * 0.03), `<rect x="${r1(x - 6)}" y="${r1(y - h)}" width="12" height="${r1(h)}" rx="2" class="${rand() > 0.5 ? 'f-bld' : 'f-bld2'}"/>`);
    }
    const vals = [0.95, 0.8, 0.66, 0.5, 0.36];
    const ranks = vals
      .map(
        (v, i) =>
          `<text x="262" y="${78 + i * 30}" class="t-s">#${i + 1}</text><rect x="284" y="${68 + i * 30}" width="${r1(96)}" height="12" rx="6" class="f-line"/><rect x="284" y="${68 + i * 30}" width="${r1(96 * v)}" height="12" rx="6" class="a-grow ${i === 0 ? 'f-clean' : 'f-model'}" style="${d(r1(0.8 + i * 0.1))};opacity:${1 - i * 0.12}"/>`,
      )
      .join('');
    return frame(
      u,
      'clean',
      'Illustration: buildings cluster around a transit station with walking catchment rings, next to a ranked bar chart of attributes',
      `<ellipse cx="${cx}" cy="${cy}" rx="104" ry="78" class="s-clean o-30" fill="none" stroke-dasharray="4 6" stroke-width="1.5"/>
       <ellipse cx="${cx}" cy="${cy}" rx="62" ry="46" class="s-clean o-50" fill="none" stroke-dasharray="4 6" stroke-width="1.5"/>
       ${loop('l-ring', 0, `<ellipse cx="${cx}" cy="${cy}" rx="40" ry="30" class="s-clean" fill="none" stroke-width="2"/>`)}
       <path d="M10 ${cy}H${246}" class="s-road" stroke-width="8"/>
       ${blds}
       ${anim('a-pop', 0.1, `<circle cx="${cx}" cy="${cy}" r="15" class="f-model"/><path d="M${cx - 6} ${cy + 5}v-9a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v9zM${cx - 4} ${cy - 2}h8" class="s-white" stroke-width="1.8" fill="none"/>`)}
       ${anim('a-rise', 0.6, `${card(250, 34, 140, 182)}<text x="262" y="54" class="t">MCDM ranking</text>${ranks}`)}`,
      [0.3, 0.5],
    );
  },

  // Literature review: a fan of papers under a magnifier, with the modes they cover.
  'exposure-review': (u) => {
    const modes = [
      [282, 70, car(0, 8, 'f-model', 0.7)],
      [352, 112, bus(0, 10, 'f-heat', 0.6)],
      [282, 160, bike(0, 12, 's-clean', 0.7, rider('f-ink'))],
      [352, 202, person(0, 14, 'f-ink', 0.9)],
    ];
    return frame(
      u,
      'air',
      'Illustration: a fan of research papers under a magnifying glass, linked to the travel modes they study',
      `${anim('a-rise', 0.1, at(110, 130, '<g transform="rotate(-14)">' + doc(0, 0, 1.25, 6, 'f-air') + '</g>'))}
       ${anim('a-rise', 0.2, at(130, 128, '<g transform="rotate(-2)">' + doc(0, 0, 1.25, 6, 'f-model') + '</g>'))}
       ${anim('a-rise', 0.3, at(152, 132, '<g transform="rotate(10)">' + doc(0, 0, 1.25, 6, 'f-clean') + '</g>'))}
       ${loop('l-float', 0, anim('a-pop', 0.7, `<circle cx="168" cy="150" r="30" class="f-glass s-ink" stroke-width="5"/><path d="M190 172l26 26" class="s-ink" stroke-width="9" stroke-linecap="round"/><g class="f-air o-50"><circle cx="160" cy="146" r="9"/><circle cx="174" cy="152" r="7"/></g><path d="M146 164c10-6 22-8 42-22" class="s-clean" stroke-width="3" fill="none"/>`))}
       ${modes.map(([x, y, g], i) => `<path d="M206 ${120 + i * 6}C240 ${120 + i * 6} 240 ${y} ${x - 26} ${y}" pathLength="1" class="a-draw s-mute" stroke-width="1.5" fill="none" stroke-dasharray="1" style="${d(1 + i * 0.12)}"/>` + anim('a-pop', r1(1.2 + i * 0.12), `<circle cx="${x}" cy="${y}" r="24" class="f-card s-line"/>` + at(x, y, g))).join('')}
       ${anim('a-rise', 1.5, chip(24, 22, 'review · way forward', 'f-card', 't'))}`,
      [0.15, 0.9],
    );
  },

  // ML: awareness signals in, mode probabilities out.
  'ml-awareness': (u) => {
    const out = [
      ['f-model', 0.42],
      ['f-heat', 0.28],
      ['f-clean', 0.18],
      ['f-ai', 0.12],
    ];
    return frame(
      u,
      'ai',
      'Illustration: air-quality awareness signals feed a neural network that outputs travel mode probabilities',
      `${anim('a-rise', 0.1, `${card(18, 40, 90, 74)}${gauge(63, 96, 26, 30, 0)}<text x="34" y="58" class="t-s">AQI</text>`)}
       ${anim('a-rise', 0.25, `${phone(36, 128, 54, 98, `<rect x="12" y="24" width="30" height="16" rx="4" class="f-air"/><text x="27" y="36" text-anchor="middle" class="t t-on">AQI</text><rect x="12" y="48" width="30" height="4" rx="2" class="f-mute o-50"/><rect x="12" y="56" width="22" height="4" rx="2" class="f-mute o-50"/><rect x="12" y="66" width="30" height="16" rx="4" class="f-line"/>`)}`)}
       ${nnet(150, 125, [4, 5, 5, 4], 46, 30)}
       ${out.map(([c, v], i) => `<rect x="300" y="${74 + i * 30}" width="84" height="16" rx="8" class="f-line"/><rect x="300" y="${74 + i * 30}" width="${r1(84 * v * 2)}" height="16" rx="8" class="a-grow ${c}" style="${d(r1(1.3 + i * 0.1))}"/>`).join('')}
       <text x="300" y="62" class="t-s">P(mode)</text>`,
      [0.85, 0.85],
    );
  },

  // Delhi: commuters under haze, asked how they perceive the air.
  'delhi-perception': (u) => {
    const scale = [0, 1, 2, 3, 4]
      .map((i) => `<circle cx="${290 + i * 18}" cy="62" r="6" class="${i === 3 ? 'f-air' : 'f-line'}"/>`)
      .join('');
    return frame(
      u,
      'air',
      'Illustration: commuters beneath a hazy Delhi skyline with India Gate, each asked to rate the air on a five-point scale',
      `<rect width="${W}" height="170" class="f-haze"/>
       ${anim('a-rise', 0.1, `<g class="f-bld2">${building(14, 176, 36, 70, 'f-bld2', 2)}${building(54, 176, 28, 52, 'f-bld2', 3)}${building(300, 176, 30, 64, 'f-bld2', 4)}${building(336, 176, 44, 82, 'f-bld2', 5)}</g>`)}
       ${anim('a-rise', 0.25, '<path d="M150 176V96h100v80h-30v-46a20 20 0 0 0-40 0v46z" class="f-bld"/><rect x="144" y="86" width="112" height="12" rx="2" class="f-bld"/><rect x="160" y="78" width="80" height="9" rx="2" class="f-bld"/>')}
       ${smog(110, 60, 1.3, 0)}${smog(300, 110, 1.1, 1.2)}
       ${particles(41, 10, 20, 390, 170, 22)}
       <rect x="0" y="176" width="${W}" height="74" class="f-road"/>
       ${[90, 150, 214, 270].map((x, i) => anim('a-rise', r1(0.5 + i * 0.1), person(x, 226, i % 2 ? 'f-model' : 'f-ink', 0.9))).join('')}
       ${anim('a-pop', 1, `${card(268, 32, 120, 46)}<text x="282" y="47" class="t-s">How is the air today?</text>${scale}`)}
       <path d="M296 80L276 104" class="s-line" stroke-width="2" fill="none"/>`,
      [0.5, 0.2],
    );
  },

  // Systematic review: many studies narrow to evidence by mode.
  'systematic-review': (u) => {
    let docs = '';
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 7; c++) {
        const keep = (r * 7 + c) % 3 === 0;
        docs += anim('a-pop', r1(0.05 + (r * 7 + c) * 0.03), `<rect x="${24 + c * 26}" y="${30 + r * 30}" width="18" height="23" rx="3" class="${keep ? 'f-model' : 'f-card s-line'}" stroke-width="1"/>`);
      }
    const modes = [0.45, 0.6, 0.8, 0.95, 0.7];
    const lbl = ['walk', 'cycle', 'auto', 'bus', 'car'];
    return frame(
      u,
      'air',
      'Illustration: a grid of studies narrows through a funnel to evidence on exposure across travel modes',
      `${docs}
       ${anim('a-fade', 0.8, '<path d="M24 128h176l-60 44v40h-56v-40z" class="f-model o-15"/><path d="M24 128h176l-60 44v40h-56v-40z" class="s-model" fill="none" stroke-width="1.5"/>')}
       ${loop('l-float', 0, `<g>${[0, 1, 2].map((i) => `<rect x="${92 + i * 14}" y="${180 + (i % 2) * 6}" width="10" height="14" rx="2" class="f-model"/>`).join('')}</g>`)}
       ${anim('a-rise', 0.9, card(228, 24, 160, 200))}
       <text x="242" y="46" class="t">Exposure by mode</text>
       ${modes.map((v, i) => `<text x="242" y="${76 + i * 32}" class="t-s">${lbl[i]}</text><rect x="282" y="${66 + i * 32}" width="94" height="12" rx="6" class="f-line"/><rect x="282" y="${66 + i * 32}" width="${r1(94 * v)}" height="12" rx="6" class="a-grow f-air" style="${d(r1(1.1 + i * 0.08))};opacity:${0.45 + v * 0.55}"/>`).join('')}`,
      [0.1, 0.1],
    );
  },

  // EV charging: information on a phone shapes which charger drivers trust.
  'ev-charging': (u) => {
    const cable = 'M150 196C176 214 206 204 214 176';
    return frame(
      u,
      'ev',
      'Illustration: an electric car plugged into a public charger, with a phone showing charger availability and a reliability rating',
      `<rect x="0" y="206" width="${W}" height="44" class="f-road"/>
       ${anim('a-rise', 0.1, car(100, 210, 'f-ev', 1.6))}
       ${anim('a-rise', 0.2, '<rect x="206" y="112" width="40" height="96" rx="8" class="f-ink"/><rect x="213" y="122" width="26" height="22" rx="4" class="f-ev"/><rect x="214" y="152" width="24" height="5" rx="2.5" class="f-card o-50"/><rect x="214" y="161" width="16" height="5" rx="2.5" class="f-card o-50"/>')}
       ${loop('l-blink', 0, '<path d="M228 124l-7 11h6l-3 8 9-12h-6l3-7z" class="f-white"/>')}
       <path d="${cable}" pathLength="1" class="a-draw s-ink" stroke-width="4" fill="none" stroke-linecap="round" style="${d(0.5)}"/>
       <path d="${cable}" class="l-march s-ev" stroke-width="2" fill="none" stroke-dasharray="3 8"/>
       ${anim(
         'a-rise',
         0.6,
         phone(286, 26, 92, 170, `
           <text x="14" y="36" class="t-s">Chargers</text>
           ${[0, 1, 2].map((i) => `<rect x="14" y="${46 + i * 30}" width="64" height="24" rx="6" class="${i === 0 ? 'f-ev o-25' : 'f-line'}"/><circle cx="26" cy="${58 + i * 30}" r="5" class="${['f-clean', 'f-heat', 'f-air'][i]}"/><rect x="36" y="${53 + i * 30}" width="${[34, 26, 30][i]}" height="4" rx="2" class="f-mute o-70"/><rect x="36" y="${60 + i * 30}" width="18" height="3" rx="1.5" class="f-mute o-40"/>`).join('')}
           ${[0, 1, 2, 3, 4].map((i) => `<path transform="translate(${18 + i * 12} 144)" d="M0-5l1.5 3.2 3.5.4-2.6 2.4.7 3.5L0 2.8-3.1 4.5l.7-3.5L-5-1.4l3.5-.4z" class="${i < 4 ? 'f-heat' : 'f-line'}"/>`).join('')}`),
       )}
       ${loop('l-ring', 0.5, '<circle cx="290" cy="60" r="14" class="s-ev" fill="none" stroke-width="2"/>')}
       ${anim('a-rise', 1.1, chip(20, 26, 'information → trust', 'f-card', 't'))}`,
      [0.8, 0.2],
    );
  },

  // Seasonal panel: winter smog pushes commuters onto the cleaner route.
  'seasonal-reroute': (u) => {
    const panel = (ox, winter) => {
      const direct = `M${ox + 22} 196C${ox + 70} 170 ${ox + 110} 120 ${ox + 160} 70`;
      const detour = `M${ox + 22} 196C${ox + 30} 120 ${ox + 70} 80 ${ox + 160} 70`;
      return `
        <rect x="${ox}" y="18" width="182" height="214" rx="14" class="f-card s-line" stroke-width="1"/>
        ${winter ? snowflake(ox + 158, 44, 11) : sun(ox + 158, 44, 9, true)}
        <text x="${ox + 16}" y="48" class="t">${winter ? 'Winter' : 'Summer'}</text>
        ${winter ? smog(ox + 110, 140, 0.95) + particles(51, ox + 70, 100, ox + 170, 190, 16) : particles(52, ox + 80, 110, ox + 160, 180, 5)}
        <path d="${direct}" pathLength="1" class="a-draw ${winter ? 's-air o-50' : 's-model'}" stroke-width="${winter ? 3 : 5}" fill="none" stroke-linecap="round" style="${d(winter ? 0.4 : 0.9)}"/>
        <path id="${u}-${winter ? 'w' : 's'}" d="${winter ? detour : direct}" class="s-none" fill="none"/>
        <path d="${detour}" pathLength="1" class="a-draw ${winter ? 's-clean' : 's-mute o-50'}" stroke-width="${winter ? 5 : 3}" fill="none" stroke-linecap="round" style="${d(winter ? 0.6 : 1.1)}"/>
        ${mover(`${u}-${winter ? 'w' : 's'}`, winter ? 6 : 5, `<circle r="6" class="${winter ? 'f-clean' : 'f-model'}"/><circle r="2.4" class="f-white"/>`)}
        ${anim('a-pop', 0.2, `<circle cx="${ox + 22}" cy="196" r="6" class="f-ink"/>`)}${anim('a-pop', 0.3, `<circle cx="${ox + 160}" cy="70" r="6" class="f-ink"/>`)}`;
    };
    return frame(
      u,
      'air',
      'Illustration: two panels compare winter and summer; in smoggy winter the commuter takes the cleaner detour, in summer the direct route',
      `${anim('a-rise', 0.05, panel(14, true))}${anim('a-rise', 0.2, panel(204, false))}
       ${anim('a-pop', 1.4, `<g transform="translate(122 196)"><rect width="156" height="38" rx="12" class="f-ink"/><rect x="8" y="8" width="22" height="22" rx="6" class="f-air"/><text x="19" y="23" text-anchor="middle" class="t t-on">!</text><text x="38" y="17" class="t t-inv">AQI alert</text><text x="38" y="30" class="t-s t-inv o-70">before you leave</text></g>`)}`,
      [0.25, 0.1],
    );
  },

  // Shade: pedestrians pay for (and value) shade on a hot street.
  'shade-pricing': (u) => {
    const walk = 'M20 206H380';
    return frame(
      u,
      'heat',
      'Illustration: a pedestrian walks under trees and a canopy on a hot sunny street, with a price tag on the shaded segment',
      `${sun(340, 52, 22, true)}
       ${[0, 1, 2].map((i) => loop('l-drift', i * 0.6, `<path d="M${60 + i * 26} ${60 + i * 6}q8-8 16 0t16 0t16 0" class="s-heat o-50" stroke-width="2.5" fill="none" stroke-linecap="round"/>`)).join('')}
       <rect x="0" y="196" width="${W}" height="20" class="f-road"/>
       <rect x="0" y="216" width="${W}" height="34" class="f-bld2 o-50"/>
       ${[90, 160, 230].map((x) => `<ellipse cx="${x + 14}" cy="206" rx="34" ry="8" class="f-shade"/>`).join('')}
       ${[90, 160, 230].map((x, i) => anim('a-growy', r1(0.2 + i * 0.15), tree(x, 198, 1.5))).join('')}
       ${anim('a-rise', 0.6, '<path d="M286 198V140M354 198V140" class="s-ink" stroke-width="3"/><path d="M276 140h88l-10-16h-68z" class="f-model"/><ellipse cx="322" cy="206" rx="40" ry="7" class="f-shade"/>')}
       <path id="${u}-w" d="${walk}" class="s-none" fill="none"/>
       ${mover(`${u}-w`, 12, person(0, 0, 'f-ink', 0.9))}
       ${anim('a-pop', 1, `<g transform="translate(120 104)"><g class="l-swing" style="${w(0)}"><path d="M0 0h58l10 12-10 12H0z" class="f-heat"/><circle cx="58" cy="12" r="3" class="f-card"/><text x="26" y="17" text-anchor="middle" class="t t-on">₹ shade</text></g></g>`)}
       ${anim('a-rise', 1.2, chip(18, 20, 'heat-resilient access', 'f-card', 't'))}`,
      [0.85, 0.15],
    );
  },

  // Conflict screening: one top-down traffic image read as a graph.
  'conflict-screening': (u) => {
    const nodes = [
      [150, 112, 'f-model'],
      [206, 150, 'f-heat'],
      [252, 104, 'f-clean'],
      [196, 82, 'f-air'],
      [118, 160, 'f-ai'],
    ];
    const edges = [
      [0, 1],
      [1, 2],
      [0, 3],
      [3, 2],
      [0, 4],
      [4, 1],
    ];
    const veh = (x, y, rot, cls, len = 26, wid = 13) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="${-len / 2}" y="${-wid / 2}" width="${len}" height="${wid}" rx="4" class="${cls}"/><rect x="${len / 2 - 9}" y="${-wid / 2 + 2}" width="5" height="${wid - 4}" rx="1.5" class="f-glass"/></g>`;
    return frame(
      u,
      'safety',
      'Illustration: a top-down intersection with mixed traffic; vehicles are linked as a graph and a pulsing ring marks a near-conflict',
      `<rect x="0" y="92" width="${W}" height="80" class="f-road"/><rect x="160" y="0" width="80" height="${H}" class="f-road"/>
       <path d="M0 132H160M240 132H${W}" class="s-white o-50" stroke-width="2" stroke-dasharray="12 10"/><path d="M200 0V92M200 172V${H}" class="s-white o-50" stroke-width="2" stroke-dasharray="12 10"/>
       ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${164 + i * 12}" y="174" width="8" height="18" class="f-white o-40"/>`).join('')}
       ${loop('l-drift', 0, veh(150, 112, 0, 'f-model'))}${loop('l-float', 0.3, veh(206, 150, -90, 'f-heat', 22, 12))}${loop('l-drift', 0.6, veh(252, 104, 180, 'f-clean', 30, 14))}
       ${veh(196, 82, 90, 'f-air', 18, 9)}${veh(118, 160, 0, 'f-ai', 18, 9)}
       ${edges.map(([a, b], i) => `<path d="M${nodes[a][0]} ${nodes[a][1]}L${nodes[b][0]} ${nodes[b][1]}" pathLength="1" class="a-draw s-ink o-70" stroke-width="1.6" stroke-dasharray="1" style="${d(r1(0.6 + i * 0.1))}"/>`).join('')}
       ${nodes.map(([x, y, c], i) => anim('a-pop', r1(0.5 + i * 0.08), `<circle cx="${x}" cy="${y}" r="5" class="f-card s-ink" stroke-width="2"/>`)).join('')}
       ${loop('l-ring', 0, '<circle cx="178" cy="131" r="22" class="s-safety" fill="none" stroke-width="3"/>')}
       ${anim('a-pop', 1.2, chip(300, 20, 'conflict?', 'f-safety', 't t-on', 82))}
       ${anim('a-rise', 0.2, '<g transform="translate(26 26)"><rect width="44" height="30" rx="7" class="f-ink"/><circle cx="22" cy="15" r="9" class="f-glass"/><circle cx="22" cy="15" r="4" class="f-ink"/><rect x="30" y="-5" width="10" height="6" rx="2" class="f-ink"/></g>')}
       <text x="78" y="46" class="t-s">one image</text>`,
      [0.85, 0.1],
    );
  },

  // Mode choice beyond time and cost: air quality as a third attribute, by season.
  'seasonal-mode': (u) => {
    const modes = [
      ['metro', 'f-model'],
      ['bus', 'f-heat'],
      ['car', 'f-ai'],
      ['walk', 'f-clean'],
    ];
    const vals = [
      [0.4, 0.5, 0.25],
      [0.7, 0.25, 0.75],
      [0.55, 0.85, 0.5],
      [0.9, 0.05, 0.9],
    ];
    const icons = [
      at(0, 0, '<rect x="-20" y="-22" width="40" height="22" rx="7" class="f-model"/><rect x="-14" y="-17" width="10" height="8" rx="2" class="f-glass"/><rect x="4" y="-17" width="10" height="8" rx="2" class="f-glass"/>'),
      bus(0, 0, 'f-heat', 0.7),
      car(0, 0, 'f-ai', 0.85),
      person(0, 0, 'f-ink', 0.95),
    ];
    const attrs = ['time', 'cost', 'air'];
    const cols = modes
      .map(([, c], i) => {
        const x = 22 + i * 94;
        return anim(
          'a-rise',
          r1(0.1 + i * 0.1),
          `${card(x, 54, 82, 178)}${at(x + 41, 102, icons[i])}
           ${attrs.map((a, k) => `<text x="${x + 10}" y="${135 + k * 30}" class="t-s">${a}</text><rect x="${x + 10}" y="${141 + k * 30}" width="62" height="8" rx="4" class="f-line"/><rect x="${x + 10}" y="${141 + k * 30}" width="${r1(62 * vals[i][k])}" height="8" rx="4" class="a-grow ${k === 2 ? 'f-air' : 'f-mute'}" style="${d(r1(0.7 + i * 0.08 + k * 0.05))}"/>`).join('')}`,
        );
      })
      .join('');
    return frame(
      u,
      'air',
      'Illustration: four travel modes compared on time, cost and air quality, with a winter and summer toggle',
      `${cols}
       ${anim('a-pop', 0.9, `<g transform="translate(218 12)"><rect width="162" height="30" rx="15" class="f-card s-line"/><g class="l-toggle"><rect x="4" y="4" width="74" height="22" rx="11" class="f-model o-25"/></g>${snowflake(20, 15, 7)}<text x="32" y="19" class="t-s">winter</text>${sun(98, 15, 3.5, false)}<text x="114" y="19" class="t-s">summer</text></g>`)}
       <text x="24" y="36" class="t">Beyond time &amp; cost</text>`,
      [0.9, 0.05],
    );
  },

  // Econometric theory meets deep learning.
  'econ-deep': (u) =>
    frame(
      u,
      'ai',
      'Illustration: a random utility equation and a neural network merge into one robust mode-choice prediction',
      `${anim('a-rise', 0.1, `${card(18, 58, 132, 70)}<text x="34" y="88" class="t-eq">U = βx + ε</text><text x="34" y="112" class="t-s">random utility</text>`)}
       ${anim('a-rise', 0.25, `${card(18, 140, 132, 70)}<text x="34" y="168" class="t-s">theory-consistent</text><path d="M34 190q20-18 40 0t40 0" class="s-model" stroke-width="2.5" fill="none"/>`)}
       <path d="M150 93C180 93 180 125 196 125M150 175C180 175 180 125 196 125" pathLength="1" class="a-draw s-mute" stroke-width="2" fill="none" stroke-dasharray="1" style="${d(0.6)}"/>
       ${nnet(212, 125, [3, 5, 5, 3], 40, 30, 's-ai', 'f-ai', 0.7)}
       <path d="M342 125h18" class="s-mute" stroke-width="2"/>
       ${anim('a-pop', 1.5, '<circle cx="372" cy="125" r="14" class="f-clean"/><path d="M365 125l5 5 9-10" class="s-white" stroke-width="2.6" fill="none" stroke-linecap="round"/>')}
       ${anim('a-rise', 1.6, chip(258, 20, 'robust prediction', 'f-card', 't'))}`,
      [0.75, 0.5],
    ),

  // PD-MUSE: a convex bowl replaces a hard non-concave search.
  'pd-muse': (u) => {
    const cx = 132;
    const cy = 128;
    let rings = '';
    for (let i = 6; i >= 1; i--) rings += `<ellipse cx="${cx}" cy="${cy}" rx="${i * 18}" ry="${i * 12}" class="${i % 2 ? 's-model' : 's-ai'}" fill="none" stroke-width="1.5" opacity="${0.18 + (6 - i) * 0.1}"/>`;
    const iter = `M${cx + 100} ${cy - 62}L${cx + 52} ${cy - 18}L${cx + 40} ${cy + 26}L${cx + 10} ${cy + 8}L${cx - 4} ${cy - 6}L${cx + 2} ${cy + 2}`;
    const tree0 = [318, 52];
    const nests = [
      [282, 118],
      [354, 118],
    ];
    const alts = [
      [266, 184],
      [298, 184],
      [338, 184],
      [370, 184],
    ];
    return frame(
      u,
      'model',
      'Illustration: an optimisation path spirals into the minimum of a convex bowl, beside a nested logit tree',
      `${rings}
       <path id="${u}-it" d="${iter}" pathLength="1" class="a-draw s-heat" stroke-width="2.5" fill="none" stroke-linejoin="round" style="${d(0.5)}"/>
       ${iter
         .replace(/M|L/g, ' ')
         .trim()
         .split(/\s+/)
         .reduce((acc, v, i, arr) => (i % 2 ? acc : acc.concat([[+v, +arr[i + 1]]])), [])
         .map(([x, y], i) => anim('a-pop', r1(0.5 + i * 0.15), `<circle cx="${x}" cy="${y}" r="4" class="f-heat"/>`))
         .join('')}
       ${loop('l-ring', 0, `<circle cx="${cx + 2}" cy="${cy + 2}" r="10" class="s-clean" fill="none" stroke-width="2"/>`)}
       ${anim('a-pop', 1.5, `<circle cx="${cx + 2}" cy="${cy + 2}" r="6" class="f-clean"/>`)}
       ${mover(`${u}-it`, 4, '<circle r="3.5" class="f-white"/>')}
       <text x="26" y="34" class="t">convex step</text><text x="26" y="50" class="t-s">+ small search</text>
       ${anim('a-rise', 0.3, card(246, 26, 144, 196))}
       ${[...nests.map((n) => [tree0, n]), [nests[0], alts[0]], [nests[0], alts[1]], [nests[1], alts[2]], [nests[1], alts[3]]]
         .map(([a, b], i) => `<path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" pathLength="1" class="a-draw s-model" stroke-width="2" stroke-dasharray="1" style="${d(r1(0.6 + i * 0.1))}"/>`)
         .join('')}
       ${anim('a-pop', 0.5, `<circle cx="${tree0[0]}" cy="${tree0[1]}" r="9" class="f-model"/>`)}
       ${nests.map(([x, y], i) => anim('a-pop', r1(0.8 + i * 0.1), `<rect x="${x - 12}" y="${y - 9}" width="24" height="18" rx="6" class="f-ai"/>`)).join('')}
       ${alts.map(([x, y], i) => anim('a-pop', r1(1 + i * 0.08), `<circle cx="${x}" cy="${y}" r="8" class="f-card s-model" stroke-width="2"/>`)).join('')}
       <text x="276" y="212" class="t-s">nested logit</text>`,
      [0.3, 0.5],
    );
  },

  // Patent: a certificate carrying the route.
  patent: (u) =>
    frame(
      u,
      'clean',
      'Illustration: a patent certificate with a seal and a clean route drawn across it',
      `${anim('a-rise', 0.1, '<g transform="translate(200 125) rotate(-4)"><rect x="-120" y="-96" width="240" height="192" rx="10" class="f-card s-line" stroke-width="1.2"/><rect x="-108" y="-84" width="216" height="168" rx="6" class="s-line" fill="none" stroke-dasharray="3 4"/></g>')}
       <g transform="rotate(-4 200 125)">
         <text x="104" y="68" class="t">PATENT</text><text x="104" y="84" class="t-s">No. 202631018379</text>
         ${[0, 1, 2].map((i) => `<rect x="104" y="${96 + i * 9}" width="${[110, 90, 100][i]}" height="4" rx="2" class="f-mute o-50"/>`).join('')}
         <path d="M112 196C150 190 150 150 190 150S236 168 262 140" pathLength="1" class="a-draw s-clean" stroke-width="4" fill="none" stroke-linecap="round" style="${d(0.5)}"/>
         ${anim('a-pop', 0.4, pin(112, 198, 'f-ink'))}${anim('a-pop', 0.9, pin(262, 142, 'f-clean'))}
       </g>
       ${anim(
         'a-pop',
         1,
         `<g transform="translate(300 176)">${loop('l-spin', 0, Array.from({ length: 16 }, (_, i) => `<path transform="rotate(${i * 22.5})" d="M0-30l4 8h-8z" class="f-heat"/>`).join(''))}<circle r="24" class="f-heat"/><circle r="17" class="f-heat2"/><path d="M-7 0l5 5 9-10" class="s-white" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M-12 22l-6 26 18-10 18 10-6-26" class="f-air"/></g>`,
       )}`,
      [0.2, 0.2],
    ),

  // ---------------------------------------------------------------- software
  // DRUM, wide: the city map with five routes, and the list the app shows.
  'sw-drum': (u) => {
    const routes = [
      ['Shortest', 's-model', 'M54 196C140 200 210 186 262 146S330 80 352 50'],
      ['Fastest', 's-heat', 'M54 196C150 186 190 150 214 120S300 70 352 50'],
      ['Least exposure', 's-clean', 'M54 196C60 140 80 96 130 84S250 74 290 58 340 40 352 50'],
      ['Least energy', 's-ai', 'M54 196C110 170 150 170 180 140S290 100 352 50'],
      ['Balanced', 's-ev', 'M54 196C80 150 110 120 160 110S300 80 352 50'],
    ];
    let grid = '';
    for (let x = 24; x < 400; x += 48) grid += `<path d="M${x} 0V240" class="s-road" stroke-width="7"/>`;
    for (let y = 20; y < 240; y += 44) grid += `<path d="M0 ${y}H400" class="s-road" stroke-width="7"/>`;
    return frame(
      u,
      'clean',
      'Illustration: the DRUM app shows five routes across a city map, with the least-exposure route selected',
      `<g class="o-70">${grid}</g>
       <g transform="translate(206 138)">${loop('l-pulse', 0, '<circle r="54" class="f-air o-20"/><circle r="32" class="f-air o-25"/>')}</g>
       ${loop('l-ring', 0, '<circle cx="206" cy="138" r="34" class="s-air" fill="none" stroke-width="1.5"/>')}
       ${particles(31, 160, 100, 252, 180, 16)}
       ${routes.map(([, c, p], i) => `<path ${i === 2 ? `id="${u}-sel"` : ''} d="${p}" pathLength="1" class="a-draw ${c}${i === 2 ? '' : ' o-50'}" stroke-width="${i === 2 ? 6 : 3}" fill="none" stroke-linecap="round" style="${d(r1(0.3 + i * 0.14))}"/>`).join('')}
       <path d="${routes[2][2]}" class="l-march s-white" stroke-width="2" fill="none" stroke-dasharray="2 10" stroke-linecap="round"/>
       ${mover(`${u}-sel`, 7, '<circle r="7" class="f-clean"/><circle r="3" class="f-white"/>')}
       ${anim('a-pop', 0.2, pin(54, 198, 'f-ink'))}${anim('a-pop', 0.3, pin(352, 52, 'f-clean'))}
       <rect x="400" width="240" height="240" class="f-bg"/>
       ${anim(
         'a-rise',
         0.5,
         `${card(414, 16, 212, 208)}<text x="430" y="40" class="t">5 routes · Delhi</text>${routes
           .map(
             ([name, c], i) =>
               `<g transform="translate(426 ${54 + i * 33})"><rect width="188" height="27" rx="8" class="${i === 2 ? 'f-clean o-15' : 'f-line o-50'}"/><rect x="10" y="11.5" width="18" height="4" rx="2" class="${c.replace('s-', 'f-')}"/><text x="38" y="17.5" class="t-s${i === 2 ? ' t-b' : ''}">${name}</text>${i === 2 ? '<text x="134" y="17.5" class="t-s f-clean-t">−50%</text><path d="M170 14l3 3 6-7" class="s-clean" stroke-width="2.2" fill="none" stroke-linecap="round"/>' : ''}</g>`,
           )
           .join('')}`,
       )}`,
      [0.3, 0.1],
      [640, 240],
    );
  },

  'sw-survey': (u) => {
    const opt = (x, label, rows, chosen) =>
      `${card(x, 44, 138, 140)}<text x="${x + 14}" y="66" class="t">${label}</text>
       ${rows.map(([k, v], i) => `<text x="${x + 14}" y="${92 + i * 24}" class="t-s">${k}</text><text x="${x + 124}" y="${92 + i * 24}" text-anchor="end" class="t-s t-b">${v}</text>`).join('')}
       <g class="${chosen ? 'l-pick' : 'l-pick2'}"><rect x="${x + 14}" y="158" width="110" height="18" rx="9" class="f-model"/><text x="${x + 69}" y="171" text-anchor="middle" class="t-s t-on">choose</text></g>`;
    return frame(
      u,
      'model',
      'Illustration: a stated-preference choice card with two route options described by time, cost and air quality',
      `<text x="22" y="30" class="t">Which route would you take?</text>
       ${anim('a-rise', 0.1, opt(22, 'Route A', [['time', '32 min'], ['cost', '₹40'], ['AQI', '180']], true))}
       ${anim('a-rise', 0.25, opt(170, 'Route B', [['time', '41 min'], ['cost', '₹40'], ['AQI', '90']], false))}
       ${anim('a-rise', 0.5, `${card(320, 44, 68, 140)}${bars(334, 170, [0.4, 0.75], 16, 8, 100, ['f-model', 'f-clean'], 0.7)}<text x="354" y="64" text-anchor="middle" class="t-s">live</text>`)}
       ${anim('a-rise', 0.8, chip(22, 200, 'adaptive design', 'f-card', 't'))}${anim('a-rise', 0.9, chip(150, 200, 'two-wave panel', 'f-card', 't'))}`,
      [0.85, 0.85],
    );
  },

  'sw-pm25': (u) => {
    const rand = rng(77);
    let dots = '';
    for (let i = 0; i < 70; i++) {
      const a = rand() * Math.PI * 2;
      const rr = Math.sqrt(rand()) * 62;
      const x = 86 + Math.cos(a) * rr;
      const y = 110 + Math.sin(a) * rr;
      const v = rand();
      dots += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(1.8 + v * 1.8)}" class="${v > 0.75 ? 'f-air' : v > 0.4 ? 'f-heat' : 'f-clean'}" opacity=".85"/>`;
    }
    const hist = 'M190 170L210 150L230 160L250 120L270 135L290 100L310 112';
    const fc = 'M310 112L330 90L350 104L370 80';
    return frame(
      u,
      'air',
      'Illustration: a globe of city points coloured by PM2.5 next to a line chart with a dashed next-day forecast',
      `<circle cx="86" cy="110" r="66" class="f-card s-line"/>
       <ellipse cx="86" cy="110" rx="66" ry="22" class="s-line" fill="none"/><ellipse cx="86" cy="110" rx="26" ry="66" class="s-line" fill="none"/>
       ${anim('a-fade', 0.2, dots)}
       ${loop('l-ring', 0, '<circle cx="104" cy="96" r="8" class="s-air" fill="none" stroke-width="2"/>')}
       ${anim('a-rise', 0.3, card(176, 40, 212, 170))}
       <text x="190" y="62" class="t">PM₂.₅ · next day</text>
       <path d="${hist}" pathLength="1" class="a-draw s-model" stroke-width="3" fill="none" stroke-linejoin="round" stroke-dasharray="1" style="${d(0.6)}"/>
       <rect x="310" y="72" width="66" height="116" rx="6" class="f-air o-10"/>
       <path d="${fc}" class="a-fade s-air" stroke-width="3" fill="none" stroke-dasharray="5 5" style="${d(1.3)}"/>
       ${loop('l-pulse', 0, '<circle cx="370" cy="80" r="5" class="f-air"/>')}
       <text x="318" y="200" class="t-s">forecast</text>
       <path d="M190 188H376" class="s-line" stroke-width="1"/>`,
      [0.15, 0.2],
    );
  },

  'sw-aqi': (u) => {
    const cities = [0.82, 0.64, 0.5, 0.38, 0.28];
    return frame(
      u,
      'heat',
      'Illustration: an air-quality dashboard with a gauge, a ranking of cities and a trend line',
      `${anim('a-rise', 0.1, `${card(18, 22, 140, 110)}<text x="32" y="42" class="t-s">AQI now</text>${gauge(88, 112, 40, 40, 0)}`)}
       ${anim('a-rise', 0.2, `${card(18, 142, 140, 86)}<path d="M32 210L52 196L72 202L92 178L112 186L132 168L146 174" pathLength="1" class="a-draw s-air" stroke-width="2.5" fill="none" stroke-dasharray="1" style="${d(0.8)}"/><text x="32" y="162" class="t-s">7-day trend</text>`)}
       ${anim('a-rise', 0.3, card(170, 22, 212, 206))}
       <text x="186" y="44" class="t">Cities by AQI</text>
       ${cities.map((v, i) => `<rect x="186" y="${60 + i * 32}" width="36" height="8" rx="4" class="f-mute o-40"/><rect x="232" y="${58 + i * 32}" width="134" height="12" rx="6" class="f-line"/><rect x="232" y="${58 + i * 32}" width="${r1(134 * v)}" height="12" rx="6" class="a-grow ${v > 0.6 ? 'f-air' : v > 0.4 ? 'f-heat' : 'f-clean'}" style="${d(r1(0.5 + i * 0.08))}"/>`).join('')}`,
      [0.1, 0.9],
    );
  },

  'sw-modeshare': (u) => {
    const R = 58;
    const C = 2 * Math.PI * R;
    const segs = [
      ['s-clean', 0.34],
      ['s-heat', 0.4],
      ['s-mute', 0.26],
    ];
    let off = 0;
    const ring = segs
      .map(([c, v], i) => {
        const s = `<circle r="${R}" class="a-draw-ring ${c}" fill="none" stroke-width="22" stroke-dasharray="${r1(v * C - 3)} ${r1(C)}" stroke-dashoffset="${r1(-off * C)}" style="${d(r1(0.3 + i * 0.2))}"/>`;
        off += v;
        return s;
      })
      .join('');
    return frame(
      u,
      'clean',
      'Illustration: a donut chart of cycling, motorcycle and other mode shares beside bicycle and motorcycle icons',
      `<g transform="translate(110 125) rotate(-90)">${loop('l-spin-slow', 0, ring)}</g>
       <text x="110" y="122" text-anchor="middle" class="t">mode</text><text x="110" y="138" text-anchor="middle" class="t-s">share</text>
       ${anim('a-rise', 0.4, `${card(214, 30, 170, 86)}${bike(262, 100, 's-clean', 1.2)}<text x="300" y="72" class="t">cycling</text><text x="300" y="90" class="t-s">cities worldwide</text>`)}
       ${anim('a-rise', 0.55, `${card(214, 128, 170, 86)}${at(262, 196, '<g class="s-heat" fill="none" stroke-width="2.6" stroke-linecap="round"><circle cx="-14" cy="-8" r="8"/><circle cx="14" cy="-8" r="8"/></g><path d="M-10-14h14l6-8h6l-4 8h4l2 6h-24z" class="f-heat"/><circle cx="2" cy="-30" r="5" class="f-ink"/>', 1.1)}<text x="300" y="170" class="t">motorcycle</text><text x="300" y="188" class="t-s">+ prediction</text>`)}`,
      [0.15, 0.85],
    );
  },

  'sw-districts': (u) => {
    // A rough hexagon mosaic of India, one hex per "district".
    const rows = [
      [6, 7],
      [5, 7],
      [5, 8],
      [4, 9],
      [2, 12],
      [1, 13],
      [1, 12],
      [2, 11],
      [3, 10],
      [3, 9],
      [4, 8],
      [4, 7],
      [5, 7],
      [5, 6],
      [6, 6],
    ];
    const r = 7.6;
    const hw = Math.sqrt(3) * r;
    const hex = (cx, cy) => {
      let p = '';
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i + Math.PI / 6;
        p += `${i ? 'L' : 'M'}${r1(cx + Math.cos(a) * (r - 0.6))} ${r1(cy + Math.sin(a) * (r - 0.6))}`;
      }
      return p + 'Z';
    };
    const rand = rng(99);
    let g = '';
    let k = 0;
    rows.forEach(([a, b], ri) => {
      for (let c = a; c <= b; c++) {
        const cx = 44 + c * hw + (ri % 2) * (hw / 2);
        const cy = 20 + ri * r * 1.5;
        const v = rand();
        g += anim('a-pop', r1(0.05 + k * 0.012), `<path d="${hex(cx, cy)}" class="f-ai" opacity="${r1(0.25 + v * 0.75)}"/>`);
        k++;
      }
    });
    // Islands in the south-east and the north-east
    g += `<path d="${hex(44 + 16 * hw, 20 + 6 * r * 1.5)}" class="f-ai" opacity=".5"/><path d="${hex(44 + 15 * hw, 20 + 5 * r * 1.5)}" class="f-ai" opacity=".8"/>`;
    return frame(
      u,
      'ai',
      'Illustration: a hexagon mosaic shaped like India, shaded by a district-level statistic, with a legend',
      `${g}
       ${loop('l-ring', 0, `<circle cx="${r1(44 + 7 * hw)}" cy="${r1(20 + 8 * r * 1.5)}" r="9" class="s-heat" fill="none" stroke-width="2"/>`)}
       ${anim('a-rise', 0.6, `${card(262, 34, 124, 120)}<text x="276" y="56" class="t">District</text>${[0, 1, 2, 3].map((i) => `<rect x="276" y="${68 + i * 18}" width="96" height="10" rx="5" class="f-line"/><rect x="276" y="${68 + i * 18}" width="${[80, 56, 70, 40][i]}" height="10" rx="5" class="a-grow f-ai" style="${d(r1(0.9 + i * 0.08))};opacity:${0.4 + i * 0.18}"/>`).join('')}`)}
       ${anim('a-rise', 0.8, `<g transform="translate(262 170)"><rect width="124" height="12" rx="6" fill="url(#${u}-leg)"/><text y="28" class="t-s">low</text><text x="124" y="28" text-anchor="end" class="t-s">high</text></g>`)}
       <defs><linearGradient id="${u}-leg"><stop offset="0" class="st-ai" stop-opacity=".2"/><stop offset="1" class="st-ai" stop-opacity="1"/></linearGradient></defs>`,
      [0.85, 0.85],
    );
  },
};

/** Names of every available drawing. */
export const thumbNames = Object.keys(scenes);

let counter = 0;
/** Render drawing `name`. Each call gets unique ids, so a drawing can appear twice. */
export function thumb(name) {
  const fn = scenes[name];
  if (!fn) throw new Error(`Unknown thumbnail: ${name}`);
  counter += 1;
  return fn(`th${counter}`)
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ');
}

/** Reset the id counter (so repeated builds produce identical output). */
export function resetThumbs() {
  counter = 0;
}
