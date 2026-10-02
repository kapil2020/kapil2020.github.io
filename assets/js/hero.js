// Hero sketch: commuters on a city street grid, drifting pockets of polluted air, and a
// "clean air" bubble that follows the cursor (or wanders on its own on touch screens).
// Commuters prefer the cleaner of the streets ahead of them, so they slowly reroute
// around the haze: a small picture of the research.
//
// Runs only while the hero is on screen and the tab is visible. With reduced motion it
// draws one still frame.

const canvas = document.querySelector('[data-hero-canvas]');
if (canvas && canvas.getContext) start(canvas);

function start(canvas) {
  const ctx = canvas.getContext('2d');
  const hero = canvas.closest('.hero') || canvas.parentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  // Three layers: static streets, low-resolution haze (scaled up by CSS, so it is soft and
  // costs the compositor, not the main thread), and the moving commuters on top.
  const layer = () => {
    const c = document.createElement('canvas');
    c.className = canvas.className;
    c.setAttribute('aria-hidden', 'true');
    canvas.before(c);
    return c;
  };
  const streets = layer();
  const haze = layer();
  const sctx = streets.getContext('2d');
  const hctx = haze.getContext('2d');
  const HAZE_SCALE = 0.25;

  let W = 0;
  let H = 0;
  let DPR = 1;
  let nodes = [];
  let adj = [];
  let agents = [];
  let blobs = [];
  let sensors = [];
  let colors = {};
  let running = false;
  let onScreen = true;
  let last = 0;
  let time = 0;
  const mouse = { x: 0, y: 0, r: 0, target: 0, lastMove: -1e9 };

  // Small seeded RNG so the city looks the same on every visit.
  let seed = 20260;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  function css(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function readColors() {
    const light = document.documentElement.dataset.theme === 'light';
    colors = {
      light,
      street: light ? 'rgba(15, 23, 42, 0.08)' : 'rgba(148, 163, 196, 0.1)',
      node: light ? 'rgba(15, 23, 42, 0.12)' : 'rgba(148, 163, 196, 0.16)',
      clean: hexToRgb(css('--c-clean') || '#34d399'),
      air: hexToRgb(css('--c-air') || '#fb7185'),
      model: hexToRgb(css('--c-model') || '#60a5fa'),
      hazeAlpha: light ? 0.17 : 0.3,
    };
  }

  function hexToRgb(hex) {
    const m = hex.replace('#', '');
    const n = parseInt(m.length === 3 ? m.replace(/./g, '$&$&') : m, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  const mix = (a, b, t) => [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t));
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  function build() {
    const rect = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(rect.width));
    H = Math.max(1, Math.round(rect.height));
    DPR = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    haze.width = Math.ceil(W * HAZE_SCALE);
    haze.height = Math.ceil(H * HAZE_SCALE);
    streets.width = canvas.width;
    streets.height = canvas.height;
    seed = 20260;

    // Street grid with jitter and a few missing links, like a real city.
    const sp = Math.max(54, Math.min(92, W / 15));
    const cols = Math.ceil(W / sp) + 2;
    const rows = Math.ceil(H / sp) + 2;
    nodes = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        nodes.push({ x: (c - 0.5) * sp + (rand() - 0.5) * sp * 0.36, y: (r - 0.5) * sp + (rand() - 0.5) * sp * 0.36 });
      }
    }
    adj = nodes.map(() => []);
    const link = (a, b) => {
      adj[a].push(b);
      adj[b].push(a);
    };
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        if (c < cols - 1 && rand() < 0.88) link(i, i + 1);
        if (r < rows - 1 && rand() < 0.88) link(i, i + cols);
        if (c < cols - 1 && r < rows - 1 && rand() < 0.07) link(i, i + cols + 1);
      }
    }

    // Pockets of polluted air that drift slowly.
    blobs = Array.from({ length: Math.max(3, Math.round((W * H) / 220000)) }, () => ({
      x: W * (0.3 + rand() * 0.7),
      y: H * rand(),
      r: sp * (1.6 + rand() * 1.8),
      vx: (rand() - 0.5) * 9,
      vy: (rand() - 0.5) * 6,
      ph: rand() * Math.PI * 2,
    }));

    // A few roadside monitors.
    sensors = Array.from({ length: Math.max(4, Math.round(W / 260)) }, () => Math.floor(rand() * nodes.length)).filter((i) => adj[i].length);

    // Commuters.
    const n = Math.min(160, Math.max(36, Math.round((W * H) / 8500)));
    agents = [];
    for (let k = 0; k < n; k++) {
      let a = Math.floor(rand() * nodes.length);
      let guard = 0;
      while (!adj[a].length && guard++ < 20) a = Math.floor(rand() * nodes.length);
      if (!adj[a].length) continue;
      const b = adj[a][Math.floor(rand() * adj[a].length)];
      agents.push({ a, b, prev: -1, t: rand(), v: 34 + rand() * 46, trail: [] });
    }

    mouse.x = W * 0.72;
    mouse.y = H * 0.45;
    drawStreets();
  }

  function drawStreets() {
    sctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    sctx.clearRect(0, 0, W, H);
    sctx.strokeStyle = colors.street;
    sctx.lineWidth = 1;
    sctx.beginPath();
    adj.forEach((list, i) =>
      list.forEach((j) => {
        if (j > i) {
          sctx.moveTo(nodes[i].x, nodes[i].y);
          sctx.lineTo(nodes[j].x, nodes[j].y);
        }
      }),
    );
    sctx.stroke();
    sctx.fillStyle = colors.node;
    nodes.forEach((p, i) => {
      if (adj[i].length > 2) sctx.fillRect(p.x - 1, p.y - 1, 2, 2);
    });
  }

  function hazeAt(x, y) {
    let v = 0;
    for (const b of blobs) {
      const dx = x - b.x;
      const dy = y - b.y;
      v += Math.exp(-(dx * dx + dy * dy) / (2 * b.r * b.r * 0.45));
    }
    if (mouse.r > 1) {
      const dx = x - mouse.x;
      const dy = y - mouse.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < mouse.r) v *= d / mouse.r;
    }
    return Math.min(1, v);
  }

  function step(dt) {
    time += dt;

    // Clean-air bubble: follow the cursor, or wander when nobody is pointing.
    const idle = time - mouse.lastMove > 4;
    if (idle) {
      mouse.x += (W * (0.7 + 0.16 * Math.sin(time * 0.21)) - mouse.x) * Math.min(1, dt * 0.8);
      mouse.y += (H * (0.5 + 0.28 * Math.sin(time * 0.33 + 1)) - mouse.y) * Math.min(1, dt * 0.8);
      mouse.target = Math.min(W, H) * 0.2;
    }
    mouse.r += (mouse.target - mouse.r) * Math.min(1, dt * 3);

    for (const b of blobs) {
      b.x += (b.vx + Math.sin(time * 0.2 + b.ph) * 4) * dt;
      b.y += (b.vy + Math.cos(time * 0.17 + b.ph) * 3) * dt;
      if (b.x < -b.r) b.x = W + b.r;
      if (b.x > W + b.r) b.x = -b.r;
      if (b.y < -b.r) b.y = H + b.r;
      if (b.y > H + b.r) b.y = -b.r;
    }

    for (const g of agents) {
      const A = nodes[g.a];
      const B = nodes[g.b];
      const len = Math.hypot(B.x - A.x, B.y - A.y) || 1;
      g.t += (g.v * dt) / len;
      if (g.t >= 1) {
        // Choose the next street, preferring cleaner air ahead.
        const options = adj[g.b].filter((k) => k !== g.a);
        const list = options.length ? options : adj[g.b];
        let total = 0;
        const w = list.map((k) => {
          const p = nodes[k];
          const s = Math.pow(1 - hazeAt(p.x, p.y) * 0.85, 3) + 0.02;
          total += s;
          return s;
        });
        let pick = Math.random() * total;
        let next = list[0];
        for (let k = 0; k < list.length; k++) {
          pick -= w[k];
          if (pick <= 0) {
            next = list[k];
            break;
          }
        }
        g.prev = g.a;
        g.a = g.b;
        g.b = next;
        g.t = 0;
      }
      const P = nodes[g.a];
      const Q = nodes[g.b];
      const x = P.x + (Q.x - P.x) * g.t;
      const y = P.y + (Q.y - P.y) * g.t;
      g.trail.push(x, y);
      if (g.trail.length > 14) g.trail.splice(0, 2);
      g.x = x;
      g.y = y;
    }
  }

  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Haze, drawn small; CSS stretches the layer to full size.
    const s = HAZE_SCALE;
    hctx.setTransform(1, 0, 0, 1, 0, 0);
    hctx.globalCompositeOperation = 'source-over';
    hctx.clearRect(0, 0, haze.width, haze.height);
    for (const b of blobs) {
      const pulse = 1 + Math.sin(time * 0.6 + b.ph) * 0.06;
      const g = hctx.createRadialGradient(b.x * s, b.y * s, 0, b.x * s, b.y * s, b.r * s * pulse);
      g.addColorStop(0, rgba(colors.air, colors.hazeAlpha));
      g.addColorStop(0.55, rgba(colors.air, colors.hazeAlpha * 0.45));
      g.addColorStop(1, rgba(colors.air, 0));
      hctx.fillStyle = g;
      hctx.fillRect(0, 0, haze.width, haze.height);
    }
    if (mouse.r > 2) {
      hctx.globalCompositeOperation = 'destination-out';
      const g = hctx.createRadialGradient(mouse.x * s, mouse.y * s, 0, mouse.x * s, mouse.y * s, mouse.r * s);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(0.7, 'rgba(0,0,0,0.85)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      hctx.fillStyle = g;
      hctx.fillRect(0, 0, haze.width, haze.height);
    }
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // Clean-air bubble outline.
    if (mouse.r > 4) {
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, mouse.r, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(colors.clean, colors.light ? 0.22 : 0.18);
      ctx.setLineDash([3, 6]);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Monitors: a square that pulses, coloured by the air around it.
    for (const i of sensors) {
      const p = nodes[i];
      const h = hazeAt(p.x, p.y);
      const c = mix(colors.clean, colors.air, Math.min(1, h * 1.4));
      const ph = (time * 0.5 + i * 0.13) % 1;
      ctx.strokeStyle = rgba(c, 0.5 * (1 - ph));
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4 + ph * 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = rgba(c, 0.9);
      ctx.fillRect(p.x - 2.5, p.y - 2.5, 5, 5);
    }

    // Commuters with short trails, green in clean air and rose in polluted air. They are
    // drawn in a few colour buckets, so a frame is a handful of draw calls, not hundreds.
    const BUCKETS = 6;
    const groups = Array.from({ length: BUCKETS }, () => []);
    for (const g of agents) {
      if (g.x === undefined) continue;
      const h = Math.min(1, hazeAt(g.x, g.y) * 1.3);
      groups[Math.min(BUCKETS - 1, Math.floor(h * BUCKETS))].push(g);
    }
    ctx.lineCap = 'round';
    ctx.lineWidth = 1.6;
    groups.forEach((list, b) => {
      if (!list.length) return;
      const c = mix(colors.clean, colors.air, b / (BUCKETS - 1));
      ctx.beginPath();
      for (const g of list) {
        const tr = g.trail;
        if (tr.length < 4) continue;
        ctx.moveTo(tr[0], tr[1]);
        for (let k = 2; k < tr.length; k += 2) ctx.lineTo(tr[k], tr[k + 1]);
      }
      ctx.strokeStyle = rgba(c, colors.light ? 0.35 : 0.3);
      ctx.stroke();
      ctx.beginPath();
      for (const g of list) {
        ctx.moveTo(g.x + 5, g.y);
        ctx.arc(g.x, g.y, 5, 0, Math.PI * 2);
      }
      ctx.fillStyle = rgba(c, colors.light ? 0.16 : 0.18);
      ctx.fill();
      ctx.beginPath();
      for (const g of list) {
        ctx.moveTo(g.x + 1.9, g.y);
        ctx.arc(g.x, g.y, 1.9, 0, Math.PI * 2);
      }
      ctx.fillStyle = rgba(c, 0.95);
      ctx.fill();
    });
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    step(dt);
    draw();
    requestAnimationFrame(frame);
  }

  function play() {
    if (running || reduce.matches || !onScreen || document.hidden) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }
  const pause = () => {
    running = false;
  };

  function still() {
    // One settled frame: let the commuters move for a few simulated seconds.
    for (let k = 0; k < 90; k++) step(1 / 30);
    draw();
  }

  readColors();
  build();
  if (reduce.matches) still();
  else play();

  hero.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.target = Math.min(170, Math.max(110, W * 0.11));
      mouse.lastMove = time;
    },
    { passive: true },
  );
  hero.addEventListener('pointerleave', () => {
    mouse.lastMove = time - 3.2;
  });

  new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    if (onScreen) play();
    else pause();
  }).observe(canvas);

  document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));

  let resizeTimer;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const r = canvas.getBoundingClientRect();
      if (Math.abs(r.width - W) < 2 && Math.abs(r.height - H) < 2) return;
      build();
      if (!running) still();
    }, 120);
  }).observe(canvas);

  window.addEventListener('themechange', () => {
    readColors();
    drawStreets();
    if (!running) draw();
  });

  reduce.addEventListener('change', () => {
    if (reduce.matches) {
      pause();
      still();
    } else play();
  });
}
