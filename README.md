# kapil2020.github.io

The academic website of **Kapil Kumar Meena**, postdoctoral researcher in the HUMAN Lab at UCLA:
<https://kapil2020.github.io>

Hand-built, with no framework and no third-party requests. All content lives in one data file; a small
Node script renders it into a static page. Every push is tested in a real browser before anything goes live.

## What's on the page

- **Hero** with a live generative sketch: commuters (dots) move along a city street grid, steer around
  drifting pockets of polluted air, and the cursor acts as a clean-air bubble. It's the research in one
  picture, it pauses when it's off screen, and with reduced motion it draws a single still frame.
- **About, News (tabbed by year), Research** (Figure 1 pipeline and three research thrusts),
  **Publications, Software, Experience, Honours, Teaching & talks, Service & toolkit, Contact.**
- **Topic illustrations for every paper and tool**: 23 inline-SVG drawings, one per study (smog and
  latent classes, seasonal rerouting, shade pricing, EV charging, conflict screening, PD-MUSE...). Each
  draws itself in when it scrolls into view and loops gently while visible. They follow the light/dark
  theme.
- **Publications toolkit**: filter by type and by topic, live search (`/` to focus), per-paper BibTeX
  and one-click APA citation, an "All BibTeX" download (`/publications.bib`), and a viewer for the
  press clipping.
- **Command palette** (`Ctrl K` / `⌘ K`): jump to any section, paper or tool; copy the email; switch
  theme; download the CV.
- Light and dark themes (follows the system, remembers your choice), scroll progress, section
  highlighting, responsive from 320 px phones to wide screens, print styles.
- SEO and sharing: descriptive meta tags, a 1200 × 630 social card, `schema.org` Person and
  ScholarlyArticle data, sitemap, robots.txt, web manifest and favicons.
- Old al-folio URLs (`/publications/`, `/projects/…`, `/cv/` and others) redirect to their new places.

## Editing

| To change… | Edit |
| --- | --- |
| Any text, publication, news item, award, link | `src/content.mjs` |
| Page structure | `src/render.mjs` |
| Paper and software illustrations | `src/thumbs.mjs` |
| Look and feel | `assets/css/main.css` |
| Behaviour (filters, palette, theme…) | `assets/js/main.js` |
| Hero sketch | `assets/js/hero.js` |
| CV | replace `assets/cv/Kapil-Kumar-Meena-CV.pdf` |

**Adding a paper.** Copy an entry in `publications` in `src/content.mjs`, give it a new `id` and its CV
label (`J10`, `C18`…), and put it at the top of its group. Journal, under-review and in-preparation
items need a `fig`: reuse a drawing from `src/thumbs.mjs` or add a new one there. When a manuscript is
accepted, change its `type` to `journal`, add the `doi` and a `bib` entry, and update the numbers in
`stats`. The unit tests check that the counts, CV labels, DOIs, drawings and links all agree.

**Drawings.** Each is a function in `src/thumbs.mjs` that returns SVG on a 400 × 250 canvas, built from
a kit of parts (`person`, `car`, `bus`, `bike`, `smog`, `gauge`, `nnet`…). Colours come from classes
(`f-air`, `s-clean`…), so they follow the theme. Motion comes from class names: entrances (`a-draw`,
`a-pop`, `a-rise`, `a-grow`) and loops (`l-pulse`, `l-ring`, `l-float`…); see the top of the file.

**Images.** `npm run images` re-renders the favicons and the social card (`assets/img/og.png`) from
the site's fonts and portrait.

## Build, preview, test

Needs Node 20 or newer.

```bash
npm install            # Playwright and axe, for the tests
npm run dev            # build into _site/ and serve at http://localhost:4000
npm test               # build + unit and integrity tests (node:test)
npm run test:e2e       # end-to-end and accessibility tests in Chromium, desktop and phone
```

The unit tests check the content against the CV (counts, labels, DOIs), and the built page for broken
anchors and files, duplicate ids, unsafe external links, missing alt text, structured data, BibTeX
syntax, redirects and page weight. The end-to-end tests load the page on a desktop and a phone, check
there is no sideways scrolling from 320 px to 1920 px, no console errors, and that the theme switch,
menu, filters, search, command palette, BibTeX, copy buttons, news tabs, viewer, 404 page and redirects
work, with and without JavaScript and with reduced motion. axe checks WCAG 2.1 A/AA in both themes.

## Deploy

`.github/workflows/deploy.yml` builds and tests every push and pull request. On `main` it then
publishes `_site/` to the `gh-pages` branch, which GitHub Pages serves.

## Credits

Fonts: Inter, Instrument Serif and JetBrains Mono (SIL Open Font License), self-hosted. Icons: Lucide
(ISC) and Simple Icons (CC0).
