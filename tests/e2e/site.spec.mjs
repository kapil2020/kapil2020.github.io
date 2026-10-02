// End-to-end: the page in a real browser, on a desktop and a phone.

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const isMobile = (testInfo) => testInfo.project.name === 'mobile';

/** Collect console errors and uncaught exceptions for the whole test. */
function watchErrors(page) {
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

test.describe('page', () => {
  test('loads without errors and shows the essentials', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/');
    await expect(page).toHaveTitle(/^Dr\. Kapil Meena/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dr. Kapil Meena');
    await expect(page.locator('.hero__role')).toContainText('Postdoctoral Researcher');
    await expect(page.locator('.hero__tagline')).toContainText('polluted air');
    for (const id of ['about', 'news', 'research', 'publications', 'software', 'experience', 'honours', 'teaching', 'service', 'contact']) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
    await expect(page.locator('#publications [data-type]')).toHaveCount(35); // 34 publications + the press feature
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });

  test('never scrolls sideways, from small phones to wide screens', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo), 'widths are set explicitly');
    for (const width of [320, 375, 414, 768, 1024, 1280, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0);
    }
  });

  test('all images load', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(async () => {
      for (const img of document.images) {
        img.loading = 'eager';
        if (!img.complete) await new Promise((r) => img.addEventListener('load', r, { once: true }) || img.addEventListener('error', r, { once: true }));
      }
    });
    const broken = await page.evaluate(() => [...document.images].filter((i) => i.getAttribute('src') && i.naturalWidth === 0).map((i) => i.src));
    expect(broken).toEqual([]);
  });

  test('drawings play when they scroll into view', async ({ page }) => {
    await page.goto('/');
    const fig = page.locator('#j9 svg.th');
    await expect(fig).not.toHaveClass(/is-in/);
    await fig.scrollIntoViewIfNeeded();
    await expect(fig).toHaveClass(/is-in/);
    await expect(fig).toHaveClass(/is-live/);
  });

  test('the hero sketch draws on its canvas', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(800);
    // Streets, haze and commuters are separate layers; each must have drawn something.
    const painted = await page.locator('.hero').evaluate((hero) =>
      [...hero.querySelectorAll('canvas')].map((c) => {
        const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        let n = 0;
        for (let i = 3; i < d.length; i += 4 * 7) if (d[i] > 0) n++;
        return n;
      }),
    );
    expect(painted).toHaveLength(3);
    for (const n of painted) expect(n).toBeGreaterThan(20);
  });
});

test.describe('navigation', () => {
  test('section links scroll and highlight', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo), 'desktop navigation');
    await page.goto('/');
    await page.locator('.nav__links a[href="#publications"]').click();
    await expect(page).toHaveURL(/#publications$/);
    await expect(page.locator('.nav__links a[href="#publications"]')).toHaveClass(/is-active/);
  });

  test('mobile menu opens, navigates and closes', async ({ page }, testInfo) => {
    test.skip(!isMobile(testInfo), 'phone only');
    await page.goto('/');
    const btn = page.locator('[data-menu-toggle]');
    await btn.click();
    await expect(page.locator('[data-mnav]')).toBeVisible();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await page.locator('[data-mnav] a[href="#software"]').click();
    await expect(page.locator('[data-mnav]')).toBeHidden();
    await expect(page).toHaveURL(/#software$/);
  });

  test('theme toggle switches and remembers', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.locator('[data-theme-toggle]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe('rgb(246, 247, 244)');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('follows the system colour scheme on a first visit', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('command palette finds sections and papers', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo), 'keyboard shortcut');
    await page.goto('/');
    await page.keyboard.press('Control+k');
    const dialog = page.locator('[data-cmdk]');
    await expect(dialog).toBeVisible();
    await page.keyboard.type('reroute cleaner');
    await expect(page.locator('.cmdk__item').first()).toContainText('Do commuters reroute');
    await page.keyboard.press('Enter');
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/#r5$/);
    await expect(page.locator('#r5')).toBeInViewport();

    await page.keyboard.press('Control+k');
    await page.keyboard.type('zzzzzz');
    await expect(page.locator('.cmdk__empty')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('command palette opens from the search button', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-cmdk-open]').click();
    await expect(page.locator('[data-cmdk]')).toBeVisible();
    await expect(page.locator('[data-cmdk-input]')).toBeFocused();
  });
});

test.describe('publications', () => {
  test('filter by type, topic and text', async ({ page }) => {
    await page.goto('/#publications');
    const visible = page.locator('#publications [data-type]:not(.is-filtered-out)');
    await expect(visible).toHaveCount(35);

    await page.locator('[data-filter="journal"]').click();
    await expect(visible).toHaveCount(9);
    await expect(page.locator('[data-group="conference"]')).toBeHidden();

    await page.locator('[data-filter="conference"]').click();
    await expect(visible).toHaveCount(17);

    await page.locator('[data-filter="all"]').click();
    await page.locator('[data-topic="heat"]').click();
    await expect(visible).toHaveCount(1);
    await expect(page.locator('#r4')).toBeVisible();
    await page.locator('[data-topic="heat"]').click();

    await page.locator('[data-pub-search]').fill('kolkata');
    await expect(visible).toHaveCount(2);
    await expect(page.locator('#r5')).toBeVisible();
    await expect(page.locator('#c7')).toBeVisible();
    await expect(page.locator('[data-pub-status]')).toHaveText('Showing 2 of 34 publications');

    await page.locator('[data-pub-search]').fill('no such paper');
    await expect(page.locator('[data-pub-empty]')).toBeVisible();
    await page.locator('[data-pub-reset]').click();
    await expect(visible).toHaveCount(35);
    await expect(page.locator('[data-pub-search]')).toHaveValue('');
  });

  test('"/" focuses the search box', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo), 'keyboard shortcut');
    await page.goto('/');
    await page.keyboard.press('/');
    await expect(page.locator('[data-pub-search]')).toBeFocused();
  });

  test('BibTeX opens, and citations copy', async ({ page, context }, testInfo) => {
    test.skip(isMobile(testInfo), 'clipboard permissions are desktop-only here');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/#j4');
    const btn = page.locator('#j4 [data-bib]');
    await btn.click();
    await expect(page.locator('#bib-j4')).toBeVisible();
    await expect(page.locator('#bib-j4 code')).toContainText('@article{meena2024review');
    await expect(btn).toHaveAttribute('aria-expanded', 'true');

    await page.locator('#bib-j4 [data-copy-from]').click();
    await expect(page.locator('[data-toast]')).toHaveText('BibTeX copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('journal = {Transport Policy}');

    await page.locator('#j4 [data-cite]').click();
    await expect(page.locator('[data-toast]')).toHaveText('Citation copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'Meena, K. K., & Goswami, A. K. (2024). A review of air pollution exposure impacts on travel behaviour and way forward. Transport Policy, 154, 48–60. https://doi.org/10.1016/j.tranpol.2024.05.024',
    );
  });

  test('a link to a filtered-out paper clears the filters', async ({ page }) => {
    await page.goto('/#publications');
    await page.locator('[data-filter="conference"]').click();
    await expect(page.locator('#j8')).toBeHidden();
    await page.locator('#research a.cite[href="#j8"]').click();
    await expect(page.locator('#j8')).toBeVisible();
  });

  test('the press clipping opens in a viewer', async ({ page }) => {
    await page.goto('/#media');
    await page.locator('#media .feature__fig--photo').click();
    const lb = page.locator('[data-lightbox-dialog]');
    await expect(lb).toBeVisible();
    await expect(lb.locator('img')).toHaveAttribute('src', /hindu-clipping\.jpg$/);
    await page.keyboard.press('Escape');
    await expect(lb).toBeHidden();
  });
});

test.describe('other sections', () => {
  test('news tabs switch years with mouse and keyboard', async ({ page }) => {
    await page.goto('/#news');
    await expect(page.locator('#news-2026')).toBeVisible();
    await expect(page.locator('#news-2024')).toBeHidden();
    await page.locator('#news-tab-2024').click();
    await expect(page.locator('#news-2024')).toBeVisible();
    await expect(page.locator('#news-2026')).toBeHidden();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#news-tab-2023')).toBeFocused();
    await expect(page.locator('#news-2023')).toBeVisible();
  });

  test('stats count up to the CV numbers', async ({ page }) => {
    await page.goto('/');
    await page.locator('.stats').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-count="17"]')).toHaveText('17', { timeout: 5000 });
    await expect(page.locator('[data-count="200"]')).toHaveText('200', { timeout: 5000 });
  });

  test('email can be copied from the contact card', async ({ page, context }, testInfo) => {
    test.skip(isMobile(testInfo), 'clipboard permissions are desktop-only here');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/#contact');
    await page.locator('#contact [data-copy]').click();
    await expect(page.locator('[data-toast]')).toHaveText('Email address copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('kapilm.48@gmail.com');
  });
});

test.describe('motion and fallbacks', () => {
  test('reduced motion shows everything at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const op = await page.locator('#experience .xp__item').first().evaluate((el) => getComputedStyle(el).opacity);
    expect(op).toBe('1');
    await expect(page.locator('#j9 svg.th')).toHaveClass(/is-in/);
    await expect(page.locator('#j9 svg.th')).not.toHaveClass(/is-live/);
  });

  test('works without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/no-js/);
    await expect(page.locator('#about .about__lead')).toBeVisible();
    await expect(page.locator('#news-2024')).toBeVisible();
    await expect(page.locator('#j9 .pub__title')).toBeVisible();
    await context.close();
  });
});

test.describe('site', () => {
  test('unknown pages get the 404 page', async ({ page }) => {
    const res = await page.goto('/no/such/page');
    expect(res.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('This route is');
    await expect(page.locator('link[rel="stylesheet"]')).toHaveAttribute('href', /^\/assets\/css\/main\.css/);
    const color = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(color).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('old al-folio URLs land in the right place', async ({ page }) => {
    await page.goto('/publications/');
    await expect(page).toHaveURL(/\/#publications$/);
    await page.goto('/projects/drum-web-app/');
    await expect(page).toHaveURL(/\/#sw-drum$/);
  });

  test('the CV and BibTeX downloads are served', async ({ request }) => {
    const cv = await request.get('/assets/cv/Kapil-Kumar-Meena-CV.pdf');
    expect(cv.status()).toBe(200);
    expect((await cv.body()).subarray(0, 4).toString()).toBe('%PDF');
    const bib = await request.get('/publications.bib');
    expect(await bib.text()).toContain('@article{meena2025dynamic');
  });
});

test.describe('accessibility', () => {
  for (const theme of ['dark', 'light']) {
    test(`no WCAG 2 A/AA violations (${theme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
      await page.goto('/');
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const summary = results.violations.map((v) => `${v.id}: ${v.nodes.length} × ${v.nodes[0]?.target.join(' ')} (${v.nodes[0]?.failureSummary?.split('\n')[1]?.trim()})`);
      expect(summary).toEqual([]);
    });
  }

  test('the 404 page is accessible', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/missing');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });

  test('keyboard users can skip to content', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo), 'keyboard');
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.locator('.skip');
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
  });
});
