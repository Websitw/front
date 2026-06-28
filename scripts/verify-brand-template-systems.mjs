import { access, mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const baseUrl = process.env.BRAND_TEMPLATE_BASE_URL || "http://127.0.0.1:4174";
const apiOrigin = process.env.BRAND_TEMPLATE_API_ORIGIN || "http://xapis.net:9010/v1/";
const outputDir = process.env.BRAND_TEMPLATE_SCREENSHOT_DIR
  || path.join(process.cwd(), "tmp", "brand-template-identity");
const baselineDir = process.env.BRAND_TEMPLATE_BASELINE_DIR
  || path.join(process.cwd(), "tests", "visual-baselines", "brand-template-identity");
const diffDir = process.env.BRAND_TEMPLATE_DIFF_DIR
  || path.join(process.cwd(), "tmp", "brand-template-diffs");
const updateBaselines = process.env.BRAND_TEMPLATE_UPDATE_BASELINES === "1";

const failures = [];
const premiumRailTemplates = new Set(["commerce-grid", "deal-promo", "category-hub"]);

const templateTargets = [
  { key: "dbmed", templateKey: "editorial-hero", heroClass: "brand-market__hero-system--editorial" },
  { key: "dbmco", templateKey: "commerce-grid", heroClass: "brand-market__hero-system--commerce" },
  { key: "dbmst", templateKey: "story-collection", heroClass: "brand-market__hero-system--story" },
  { key: "dbmcf", templateKey: "campaign-focus", heroClass: "brand-market__hero-system--campaign" },
  { key: "dbmrs", templateKey: "routine-solution", heroClass: "brand-market__hero-system--routine" },
  { key: "dbmdp", templateKey: "deal-promo", heroClass: "brand-market__hero-system--deal" },
  { key: "dbmch", templateKey: "category-hub", heroClass: "brand-market__hero-system--hub" },
];

const viewports = [
  { name: "desktop", viewport: { width: 1440, height: 2200 } },
  { name: "mobile", viewport: { width: 390, height: 1400 } },
];

const languages = ["en", "ar"];

async function requestJson(url) {
  const response = await fetch(url, {
    headers: { Authorization: "Anonymous=mada" },
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${url}: HTTP ${response.status}`);
  }

  return response.json();
}

async function resolveBrands() {
  const page = await requestJson(new URL("brands?limit=300", apiOrigin));
  const items = Array.isArray(page?.items) ? page.items : [];
  const byKey = new Map(items.map((item) => [item.key, item]));

  return templateTargets.map((target) => {
    const brand = byKey.get(target.key);
    if (!brand) {
      failures.push(`Missing brand for key ${target.key}`);
      return null;
    }

    return {
      ...target,
      brand,
      route: new URL(`/brands/${brand.slug || brand.key || brand.id}`, baseUrl).toString(),
    };
  }).filter(Boolean);
}

async function verifyVariant(browser, target, viewportConfig, language) {
  const context = await browser.newContext({
    locale: language === "ar" ? "ar-JO" : "en-US",
    viewport: viewportConfig.viewport,
  });

  await context.addInitScript(({ lang }) => {
    localStorage.setItem("isVisit", "true");
    localStorage.setItem("i18nextLng", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, { lang: language });

  const page = await context.newPage();
  const response = await page.goto(target.route, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  if (!response || !response.ok()) {
    failures.push(`${target.templateKey}/${viewportConfig.name}/${language}: route returned HTTP ${response?.status() || "no response"}`);
    await context.close();
    return;
  }

  const templateSelector = `[data-brand-template="${target.templateKey}"]`;
  const heroSelector = `[data-brand-hero="${target.templateKey}"]`;

  try {
    await page.waitForSelector(templateSelector, { timeout: 30000 });
  } catch (error) {
    failures.push(`${target.templateKey}/${viewportConfig.name}/${language}: missing data-brand-template root`);
    await context.close();
    return;
  }

  const templateRoot = page.locator(templateSelector).first();
  if (!(await templateRoot.count())) {
    failures.push(`${target.templateKey}/${viewportConfig.name}/${language}: missing data-brand-template root`);
    await context.close();
    return;
  }

  try {
    await page.waitForSelector(heroSelector, { timeout: 30000 });
  } catch (error) {
    failures.push(`${target.templateKey}/${viewportConfig.name}/${language}: missing data-brand-hero`);
    await context.close();
    return;
  }

  const hero = page.locator(heroSelector).first();
  if (!(await hero.count())) {
    failures.push(`${target.templateKey}/${viewportConfig.name}/${language}: missing data-brand-hero`);
    await context.close();
    return;
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
      }
    `,
  });
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      try {
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 2000)),
        ]);
      } catch {
        // Continue even if font resolution is flaky in the preview environment.
      }
    }

    document.querySelectorAll("video").forEach((video) => {
      try {
        video.pause();
        video.currentTime = 0;
      } catch {
        // Ignore media controls failing on unsupported sources.
      }
    });

    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((resolve) => setTimeout(resolve, 300));
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);

  const heroClassMatch = page.locator(`.${target.heroClass}`).first();
  if (!(await heroClassMatch.count())) {
    failures.push(`${target.templateKey}/${viewportConfig.name}/${language}: missing hero class ${target.heroClass}`);
  }

  const heroLayout = await hero.locator(".brand-market__hero-system-shell").first().getAttribute("data-hero-layout");
  const heroExperiment = await hero.locator(".brand-market__hero-system-shell").first().getAttribute("data-hero-experiment");
  if (!heroLayout) {
    failures.push(`${target.templateKey}/${viewportConfig.name}/${language}: missing data-hero-layout`);
  }
  if (!heroExperiment) {
    failures.push(`${target.templateKey}/${viewportConfig.name}/${language}: missing data-hero-experiment`);
  }

  const brandTitle = await page.locator(".brand-market__hero-copy h1").first().textContent();
  if (!brandTitle || !brandTitle.trim()) {
    failures.push(`${target.templateKey}/${viewportConfig.name}/${language}: missing hero title`);
  }

  if ((target.brand.brandName || "").length > 12) {
    failures.push(`${target.templateKey}: brand name exceeds 12 characters (${target.brand.brandName})`);
  }

  const pageClass = await templateRoot.getAttribute("class");
  if (!pageClass || !pageClass.includes(`brand-market--${target.templateKey}`)) {
    failures.push(`${target.templateKey}/${viewportConfig.name}/${language}: missing template page class`);
  }

  if (premiumRailTemplates.has(target.templateKey)) {
    const premiumRail = page.locator('[data-section-key="recommended"][data-rail-variant="premium"]').first();
    if (!(await premiumRail.count())) {
      failures.push(`${target.templateKey}/${viewportConfig.name}/${language}: missing premium recommended rail`);
    } else {
      const premiumLeadCard = premiumRail.locator('[data-premium-lead-card="true"]').first();
      if (!(await premiumLeadCard.count())) {
        failures.push(`${target.templateKey}/${viewportConfig.name}/${language}: missing premium lead card`);
      }
    }
  }

  await mkdir(outputDir, { recursive: true });
  await mkdir(diffDir, { recursive: true });
  await mkdir(baselineDir, { recursive: true });

  const screenshotName = `${target.templateKey}-${viewportConfig.name}-${language}.png`;
  const currentPath = path.join(outputDir, screenshotName);
  const baselinePath = path.join(baselineDir, screenshotName);
  const diffPath = path.join(diffDir, screenshotName);

  await page.screenshot({
    path: currentPath,
    fullPage: true,
  });

  await compareScreenshot({
    currentPath,
    baselinePath,
    diffPath,
    label: `${target.templateKey}/${viewportConfig.name}/${language}`,
  });

  await context.close();
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function compareScreenshot({ currentPath, baselinePath, diffPath, label }) {
  const currentBuffer = await readFile(currentPath);

  if (updateBaselines) {
    await writeFile(baselinePath, currentBuffer);
    if (await fileExists(diffPath)) {
      await unlink(diffPath);
    }
    return;
  }

  if (!(await fileExists(baselinePath))) {
    failures.push(`${label}: missing baseline ${path.relative(process.cwd(), baselinePath)}`);
    return;
  }

  const baselineBuffer = await readFile(baselinePath);
  const currentPng = PNG.sync.read(currentBuffer);
  const baselinePng = PNG.sync.read(baselineBuffer);

  if (currentPng.width !== baselinePng.width || currentPng.height !== baselinePng.height) {
    failures.push(`${label}: baseline dimensions differ from current screenshot`);
    await writeFile(diffPath, currentBuffer);
    return;
  }

  const diff = new PNG({ width: currentPng.width, height: currentPng.height });
  const diffPixels = pixelmatch(
    baselinePng.data,
    currentPng.data,
    diff.data,
    currentPng.width,
    currentPng.height,
    {
      threshold: 0.12,
      includeAA: false,
    },
  );

  if (!diffPixels) {
    if (await fileExists(diffPath)) {
      await unlink(diffPath);
    }
    return;
  }

  const mismatchRatio = diffPixels / (currentPng.width * currentPng.height);
  if (mismatchRatio > 0.0015) {
    await writeFile(diffPath, PNG.sync.write(diff));
    failures.push(
      `${label}: screenshot drifted beyond tolerance (${(mismatchRatio * 100).toFixed(2)}% mismatch)`,
    );
  }
}

const browser = await chromium.launch();

try {
  const brands = await resolveBrands();

  for (const target of brands) {
    for (const viewportConfig of viewports) {
      for (const language of languages) {
        await verifyVariant(browser, target, viewportConfig, language);
      }
    }
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error("Brand template verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Brand template verification passed.");
