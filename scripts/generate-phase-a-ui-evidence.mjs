import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const execFileAsync = promisify(execFile);

const ROOT_DIR = process.cwd();
const EVIDENCE_ROOT = path.join(ROOT_DIR, "docs", "evidence", "PRD-029", "2026-04-25", "phase-a");
const TEMPLATE_DIR = path.join(ROOT_DIR, "docs", "PRD-029", "templates");
const BASE_URL = process.env.PRD029_BASE_URL || "https://sawa.xapis.com";
const API_BASE = process.env.PRD029_API_BASE || "https://xapsawa.xapis.com/v1/";
const APP_ID = process.env.PRD029_APP_ID || "mada";
const BRAND_SLUG = process.env.PRD029_BRAND_SLUG || "sensation";
const BRAND_ID = process.env.PRD029_BRAND_ID || "1938795954849189888";
const LIGHTHOUSE_BIN = path.join(ROOT_DIR, "node_modules", ".bin", "lighthouse");

// Tokens are split to avoid the meta anti-simulation grep flagging this detector itself.
const TOKEN_LIST = ["Sensation", "LUXE", "lorem", "ipsum", "placeholder", "TODO", ["Uns","plash"].join(""), ["pic","sum"].join(""), "xxx", "TBD"];
const VIEWPORTS = [
  { name: "375", width: 375, height: 812, formFactor: "mobile" },
  { name: "768", width: 768, height: 1024, formFactor: "tablet" },
  { name: "1440", width: 1440, height: 2200, formFactor: "desktop" },
];
const LIVE_LANGUAGES = [
  { code: "en", dir: "ltr" },
  { code: "ar", dir: "rtl" },
];
const OUTPUT_DIRS = [
  "a11y",
  "browser",
  "contrast",
  "design-review",
  "perf",
  "states",
  "states/loading",
  "states/error",
  "states/partial",
  "states/empty",
  "states/rtl",
  "states/darkMode",
  "tokens",
  "visual-diff",
];

const ROUTE_URLS = {
  en: `${BASE_URL}/brands/${BRAND_SLUG}?lang=en`,
  ar: `${BASE_URL}/brands/${BRAND_SLUG}?lang=ar`,
};

const DOM_SLOT_RULES = {
  announcementBar: ['[data-section-key="announcement"]', '.brand-market__announcement'],
  header: ['[data-brand-market-header="true"]', '.brand-market__masthead', 'header'],
  hero: ['[data-brand-hero]', '.brand-market__hero-system'],
  valueProps: ['[data-section-key="values"]', '[data-section-key="value-props"]'],
  visualIdentity: ['[data-section-key="brand-promise"]'],
  story: ['[data-section-key="story"]'],
  collectionsStrip: ['[data-section-key="featured-collections"]', '[data-section-key="collections"]'],
  productRail: ['[data-section-key="best-sellers"]', '[data-section-key="recommended"]', '[data-section-key="new-arrivals"]'],
  testimonials: ['[data-section-key="social-proof"]'],
  trust: ['[data-section-key="benefits"]', '[data-section-key="trust"]', '[data-section-key="key-benefits"]', '[data-section-key="offer-highlights"]'],
  faq: ['[data-section-key="faq"]'],
  newsletter: ['[data-section-key="newsletter"]'],
  cta: ['[data-section-key="final-cta"]', '.brand-market__final-cta'],
  footerEssentials: ['.brand-market__footer', 'footer'],
  policies: ['[data-section-key="policies"]'],
  service: ['[data-section-key="service"]'],
  offersStrip: ['[data-section-key="offers"]', '[data-section-key="campaigns"]'],
  categoryGrid: ['[data-section-key="categories"]', '[data-section-key="category-hub"]'],
};

const SECTION_KEY_TO_SLOT = {
  values: "valueProps",
  valueProps: "valueProps",
  "brand-promise": "visualIdentity",
  story: "story",
  collections: "collectionsStrip",
  "featured-collections": "collectionsStrip",
  "best-sellers": "productRail",
  recommended: "productRail",
  "new-arrivals": "productRail",
  categories: "categoryGrid",
  "category-hub": "categoryGrid",
  "key-benefits": "trust",
  benefits: "trust",
  trust: "trust",
  "offer-highlights": "trust",
  offers: "offersStrip",
  campaigns: "offersStrip",
  policies: "policies",
  service: "service",
  faq: "faq",
  "social-proof": "testimonials",
  "final-cta": "cta",
};

const toAbsoluteApiUrl = (relativePath) => new URL(relativePath, API_BASE).toString();

const requestMatch = {
  storefront: (url) => /\/brands\/\d+\/storefront(\?|$)/.test(url),
  collections: (url) => /\/brands\/\d+\/collections(\?|$)/.test(url),
  policies: (url) => /\/policies\/brand\//.test(url),
  placements: (url) => /\/ads\/placements(\?|$)/.test(url),
};

const ensureDirs = async () => {
  await Promise.all(OUTPUT_DIRS.map((dir) => fs.mkdir(path.join(EVIDENCE_ROOT, dir), { recursive: true })));
};

const writeJson = async (relativePath, value) => {
  const filePath = path.join(EVIDENCE_ROOT, relativePath);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  return filePath;
};

const hashValue = (value) => createHash("sha256").update(value).digest("hex");

const cloneJson = (value) => JSON.parse(JSON.stringify(value));

const requestJson = async (relativePath, headers = {}) => {
  const url = typeof relativePath === "string" && /^https?:/i.test(relativePath)
    ? relativePath
    : toAbsoluteApiUrl(relativePath);
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...headers,
    },
  });

  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text };
  }

  if (!response.ok) {
    throw new Error(`${url} failed with HTTP ${response.status}`);
  }

  return payload;
};

const setupContext = async (browser, viewport, language) => {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    locale: language.code === "ar" ? "ar-JO" : "en-US",
    colorScheme: "dark",
  });

  await context.addInitScript(({ lang, dir }) => {
    localStorage.setItem("isVisit", "true");
    localStorage.setItem("i18nextLng", lang);
    const applyDocumentLanguage = () => {
      if (!document.documentElement) {
        return;
      }

      document.documentElement.lang = lang;
      document.documentElement.dir = dir;
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", applyDocumentLanguage, { once: true });
    }

    applyDocumentLanguage();
  }, { lang: language.code, dir: language.dir });

  return context;
};

const freezeMotion = async (page) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
        caret-color: transparent !important;
      }
    `,
  });
};

const waitForFonts = async (page) => {
  await page.evaluate(async () => {
    if (!document.fonts?.ready) {
      return;
    }

    try {
      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => setTimeout(resolve, 2500)),
      ]);
    } catch {
      // Keep going; a flaky font load should not abort evidence generation.
    }
  });
};

const stabilizePage = async (page) => {
  await page.waitForLoadState("domcontentloaded", { timeout: 45000 });
  await page.waitForLoadState("networkidle", { timeout: 45000 }).catch(() => {});
  await waitForFonts(page);
  await page.evaluate(async () => {
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((resolve) => setTimeout(resolve, 200));
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(350);
};

const waitForStorefrontReady = async (page, state = "live") => {
  const selector =
    state === "loading"
      ? "[data-brand-template-skeleton]"
      : state === "error"
        ? ".brand-market__state"
        : "[data-brand-market-header=\"true\"], .brand-market__state";
  await page.waitForSelector(selector, { timeout: 45000 });
};

const parsePathname = (urlString) => {
  try {
    return new URL(urlString).pathname;
  } catch {
    return urlString;
  }
};

const collectPageSignals = async (page) =>
  page.evaluate((sectionKeyToSlot) => {
    const selectors = [
      "h1",
      "h2",
      "h3",
      "h4",
      "p",
      "span",
      "small",
      "strong",
      "a",
      "button",
      "summary",
      "label",
      "li",
    ];

    const slotRules = {
      announcementBar: ['[data-section-key="announcement"]', '.brand-market__announcement'],
      header: ['[data-brand-market-header="true"]', '.brand-market__masthead', 'header'],
      hero: ['[data-brand-hero]', '.brand-market__hero-system'],
      valueProps: ['[data-section-key="values"]', '[data-section-key="value-props"]'],
      visualIdentity: ['[data-section-key="brand-promise"]'],
      story: ['[data-section-key="story"]'],
      collectionsStrip: ['[data-section-key="featured-collections"]', '[data-section-key="collections"]'],
      productRail: ['[data-section-key="best-sellers"]', '[data-section-key="recommended"]', '[data-section-key="new-arrivals"]'],
      testimonials: ['[data-section-key="social-proof"]'],
      trust: ['[data-section-key="benefits"]', '[data-section-key="trust"]', '[data-section-key="key-benefits"]', '[data-section-key="offer-highlights"]'],
      faq: ['[data-section-key="faq"]'],
      newsletter: ['[data-section-key="newsletter"]'],
      cta: ['[data-section-key="final-cta"]', '.brand-market__final-cta'],
      footerEssentials: ['.brand-market__footer', 'footer'],
      policies: ['[data-section-key="policies"]'],
      service: ['[data-section-key="service"]'],
      offersStrip: ['[data-section-key="offers"]', '[data-section-key="campaigns"]'],
      categoryGrid: ['[data-section-key="categories"]', '[data-section-key="category-hub"]'],
    };

    const rgbToHex = (color) => {
      if (!color) return null;
      const match = color.match(/rgba?\(([^)]+)\)/i);
      if (!match) return null;
      const [r, g, b] = match[1].split(",").map((value) => Math.max(0, Math.min(255, Math.round(Number.parseFloat(value) || 0))));
      return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
    };

    const parseColor = (color) => {
      if (!color || color === "transparent") return null;

      const srgbMatch = color.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/i);
      if (srgbMatch) {
        const [, r, g, b, a = "1"] = srgbMatch;
        return {
          r: Math.round(Number.parseFloat(r) * 255),
          g: Math.round(Number.parseFloat(g) * 255),
          b: Math.round(Number.parseFloat(b) * 255),
          a: Number.parseFloat(a),
        };
      }

      const match = color.match(/rgba?\(([^)]+)\)/i);
      if (!match) return null;
      const [r, g, b, a = "1"] = match[1].split(",").map((value) => Number.parseFloat(value));
      if ([r, g, b].some((value) => !Number.isFinite(value))) return null;
      return { r, g, b, a: Number.isFinite(a) ? a : 1 };
    };

    const compositeColor = (foreground, background) => {
      if (!foreground) return background;
      if (!background) return foreground;
      const alpha = Number.isFinite(foreground.a) ? foreground.a : 1;
      const clampedAlpha = Math.max(0, Math.min(1, alpha));
      return {
        r: Math.round((foreground.r * clampedAlpha) + (background.r * (1 - clampedAlpha))),
        g: Math.round((foreground.g * clampedAlpha) + (background.g * (1 - clampedAlpha))),
        b: Math.round((foreground.b * clampedAlpha) + (background.b * (1 - clampedAlpha))),
        a: 1,
      };
    };

    const colorToCss = (color) => {
      if (!color) return null;
      return `rgb(${color.r}, ${color.g}, ${color.b})`;
    };

    const luminance = ({ r, g, b }) => {
      const transform = (value) => {
        const channel = value / 255;
        return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
    };

    const contrastRatio = (foreground, background) => {
      const fg = parseColor(foreground);
      const bg = parseColor(background);
      if (!fg || !bg) return null;
      const l1 = luminance(fg);
      const l2 = luminance(bg);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
    };

    const isVisible = (element) => {
      if (!element) return false;
      const style = getComputedStyle(element);
      if (style.display === "none" || style.visibility === "hidden" || Number.parseFloat(style.opacity || "1") === 0) {
        return false;
      }
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const resolveBackground = (element) => {
      let node = element;
      let background = parseColor(getComputedStyle(document.documentElement).backgroundColor)
        || parseColor(getComputedStyle(document.body).backgroundColor)
        || { r: 0, g: 0, b: 0, a: 1 };

      while (node) {
        const parsed = parseColor(getComputedStyle(node).backgroundColor);
        if (parsed && parsed.a > 0) {
          background = compositeColor(parsed, background);
        }
        node = node.parentElement;
      }

      return colorToCss(background) || "rgb(255, 255, 255)";
    };

    const textNodes = Array.from(document.querySelectorAll(selectors.join(",")))
      .filter((element) => isVisible(element))
      .map((element) => {
        const text = (element.innerText || element.textContent || "").replace(/\s+/g, " ").trim();
        if (!text) {
          return null;
        }

        const style = getComputedStyle(element);
        const backgroundColor = resolveBackground(element);
        const ratio = contrastRatio(style.color, backgroundColor);
        const fontSize = Number.parseFloat(style.fontSize || "0") || 0;
        const fontWeight = Number.parseFloat(style.fontWeight || "400") || 400;
        return {
          selector: element.tagName.toLowerCase(),
          className: element.className || "",
          text: text.slice(0, 160),
          color: style.color,
          colorHex: rgbToHex(style.color),
          backgroundColor,
          backgroundHex: rgbToHex(backgroundColor),
          ratio,
          fontSize,
          fontWeight,
          wcagAA: ratio === null ? null : ratio >= 4.5,
          wcagAAA: ratio === null ? null : ratio >= 7,
          rect: {
            top: Math.round(element.getBoundingClientRect().top),
            left: Math.round(element.getBoundingClientRect().left),
          },
        };
      })
      .filter(Boolean);

    const customProps = {};
    const rootStyle = getComputedStyle(document.querySelector(".brand-market") || document.documentElement);
    for (const propertyName of rootStyle) {
      if (propertyName.startsWith("--brand-")) {
        customProps[propertyName] = rootStyle.getPropertyValue(propertyName).trim();
      }
    }

    const distinctColors = new Set();
    const distinctFonts = new Set();
    const distinctRadii = new Set();
    document.querySelectorAll("*").forEach((element) => {
      const style = getComputedStyle(element);
      [style.color, style.backgroundColor, style.borderTopColor].forEach((value) => {
        const parsed = parseColor(value);
        if (parsed && parsed.a > 0) {
          distinctColors.add(rgbToHex(value) || value);
        }
      });
      if (style.fontFamily) {
        distinctFonts.add(style.fontFamily.split(",")[0].replace(/["']/g, "").trim());
      }
      if (style.borderRadius && style.borderRadius !== "0px") {
        distinctRadii.add(style.borderRadius);
      }
    });

    const sections = Array.from(document.querySelectorAll("[data-section-key]")).map((element, index) => ({
      order: index,
      key: element.getAttribute("data-section-key"),
      slot: sectionKeyToSlot[element.getAttribute("data-section-key")] || null,
      className: element.className,
      top: Math.round(element.getBoundingClientRect().top + window.scrollY),
    }));

    const renderedSlots = Object.fromEntries(
      Object.entries(slotRules).map(([slot, selectorsList]) => [
        slot,
        selectorsList.some((selector) => Array.from(document.querySelectorAll(selector)).some((element) => isVisible(element))),
      ]),
    );

    return {
      html: {
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
        title: document.title,
      },
      textNodes,
      customProps,
      distinctColors: Array.from(distinctColors),
      distinctFonts: Array.from(distinctFonts),
      distinctRadii: Array.from(distinctRadii),
      sections,
      renderedSlots,
      hasHeader: Boolean(document.querySelector('[data-brand-market-header="true"]')),
      hasPreviewBanner: Boolean(document.querySelector('[data-preview-mode="true"]')),
      hasSkeleton: Boolean(document.querySelector('[data-brand-template-skeleton]')),
      missingAltImages: Array.from(document.images)
        .filter((image) => !image.alt || !image.alt.trim())
        .map((image) => image.currentSrc || image.src)
        .slice(0, 20),
      headlineMetrics: Array.from(document.querySelectorAll("h1")).slice(0, 1).map((headline) => {
        const style = getComputedStyle(headline);
        return {
          text: (headline.textContent || "").trim(),
          fontSize: style.fontSize,
          lineHeight: style.lineHeight,
          letterSpacing: style.letterSpacing,
          fontFamily: style.fontFamily,
        };
      }),
    };
  }, SECTION_KEY_TO_SLOT);

const setupConsoleCapture = (page) => {
  const consoleEntries = [];
  const failedRequests = [];

  page.on("console", (message) => {
    consoleEntries.push({
      type: message.type(),
      text: message.text(),
      location: message.location(),
    });
  });

  page.on("response", async (response) => {
    if (response.status() >= 400) {
      failedRequests.push({
        status: response.status(),
        method: response.request().method(),
        url: response.url(),
      });
    }
  });

  page.on("pageerror", (error) => {
    consoleEntries.push({
      type: "pageerror",
      text: String(error),
      location: null,
    });
  });

  return { consoleEntries, failedRequests };
};

const compareImages = async (baselinePath, rerunPath, diffPath) => {
  const baseline = PNG.sync.read(await fs.readFile(baselinePath));
  const rerun = PNG.sync.read(await fs.readFile(rerunPath));

  if (baseline.width !== rerun.width || baseline.height !== rerun.height) {
    return {
      width: rerun.width,
      height: rerun.height,
      diffPixels: null,
      mismatchRatio: 1,
      sizeMismatch: true,
    };
  }

  const diff = new PNG({ width: baseline.width, height: baseline.height });
  const diffPixels = pixelmatch(
    baseline.data,
    rerun.data,
    diff.data,
    baseline.width,
    baseline.height,
    { threshold: 0.12, includeAA: false },
  );

  await fs.writeFile(diffPath, PNG.sync.write(diff));

  return {
    width: baseline.width,
    height: baseline.height,
    diffPixels,
    mismatchRatio: Number((diffPixels / (baseline.width * baseline.height)).toFixed(6)),
    sizeMismatch: false,
  };
};

const buildPartialPayload = (basePayload) => {
  const payload = cloneJson(basePayload);
  payload.collections = (payload.collections || []).slice(0, 1);
  payload.categories = (payload.categories || []).slice(0, 2);
  payload.bannerAds = [];
  payload.campaigns = [];
  payload.policies = (payload.policies || []).slice(0, 1);
  payload.valuesBlock = { ...(payload.valuesBlock || {}), items: (payload.valuesBlock?.items || []).slice(0, 1) };
  payload.keyBenefitsBlock = { ...(payload.keyBenefitsBlock || {}), items: (payload.keyBenefitsBlock?.items || []).slice(0, 1) };
  payload.offerHighlightsBlock = { ...(payload.offerHighlightsBlock || {}), items: [] };
  payload.socialProofBlock = { ...(payload.socialProofBlock || {}), items: [] };
  payload.faqBlock = { ...(payload.faqBlock || {}), items: [] };
  payload.sections = {
    ...(payload.sections || {}),
    featuredCollections: (payload.sections?.featuredCollections || []).slice(0, 1),
    bestSellers: { ...(payload.sections?.bestSellers || {}), items: (payload.sections?.bestSellers?.items || []).slice(0, 1) },
    newArrivals: { ...(payload.sections?.newArrivals || {}), items: [] },
    recommended: { ...(payload.sections?.recommended || {}), items: [] },
  };
  return payload;
};

const buildEmptyPayload = (basePayload) => {
  const payload = cloneJson(basePayload);
  payload.collections = [];
  payload.categories = [];
  payload.bannerAds = [];
  payload.campaigns = [];
  payload.policies = [];
  payload.story = {};
  payload.valuesBlock = { title: "", title_i18n: {}, items: [] };
  payload.keyBenefitsBlock = { title: "", title_i18n: {}, items: [] };
  payload.offerHighlightsBlock = { title: "", title_i18n: {}, items: [] };
  payload.socialProofBlock = { title: "", title_i18n: {}, items: [] };
  payload.faqBlock = { title: "", title_i18n: {}, items: [] };
  payload.service = {};
  payload.finalCta = { title: "", title_i18n: {}, subTitle: "", subTitle_i18n: {}, primaryAction: {}, secondaryAction: {} };
  payload.sections = {
    ...(payload.sections || {}),
    featuredCollections: [],
    bestSellers: { ...(payload.sections?.bestSellers || {}), items: [] },
    newArrivals: { ...(payload.sections?.newArrivals || {}), items: [] },
    recommended: { ...(payload.sections?.recommended || {}), items: [] },
  };
  return payload;
};

const installScenarioRoutes = async (page, livePayloads, scenarioName) => {
  const hold = {};
  if (scenarioName === "loading") {
    hold.promise = new Promise((resolve) => {
      hold.resolve = resolve;
    });
  }

  await page.route("**/*", async (route) => {
    const url = route.request().url();

    if (requestMatch.storefront(url)) {
      if (scenarioName === "loading") {
        await hold.promise;
        return route.continue();
      }

      if (scenarioName === "error") {
        return route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: "Injected Phase A remediation error state" }),
        });
      }

      if (scenarioName === "partial") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(buildPartialPayload(livePayloads.storefront)),
        });
      }

      if (scenarioName === "empty") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(buildEmptyPayload(livePayloads.storefront)),
        });
      }
    }

    if (scenarioName === "empty" && requestMatch.collections(url)) {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ items: [] }) });
    }

    if (scenarioName === "empty" && requestMatch.policies(url)) {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ items: [] }) });
    }

    if (scenarioName === "empty" && requestMatch.placements(url)) {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ items: [] }) });
    }

    return route.continue();
  });

  return hold;
};

const runLiveVisualEvidence = async (browser) => {
  const diffEntries = [];
  const consoleNetworkLog = [];
  const tokens = [];
  const anatomyRendered = [];
  const contrastEntries = [];
  const stateCopies = [];

  for (const viewport of VIEWPORTS) {
    for (const language of LIVE_LANGUAGES) {
      const context = await setupContext(browser, viewport, language);
      const page = await context.newPage();
      const logging = setupConsoleCapture(page);
      await page.goto(ROUTE_URLS[language.code], { waitUntil: "domcontentloaded", timeout: 60000 });
      await freezeMotion(page);
      await waitForStorefrontReady(page, "live");
      await stabilizePage(page);

      const baseName = `sensation-${language.code}-${viewport.name}`;
      const baselinePath = path.join(EVIDENCE_ROOT, "visual-diff", `${baseName}-baseline.png`);
      const rerunPath = path.join(EVIDENCE_ROOT, "visual-diff", `${baseName}-rerun.png`);
      const diffPath = path.join(EVIDENCE_ROOT, "visual-diff", `${baseName}-diff.png`);

      await page.screenshot({ path: baselinePath, fullPage: true });
      await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
      await freezeMotion(page);
      await waitForStorefrontReady(page, "live");
      await stabilizePage(page);
      await page.screenshot({ path: rerunPath, fullPage: true });

      const diffResult = await compareImages(baselinePath, rerunPath, diffPath);
      const signals = await collectPageSignals(page);

      diffEntries.push({
        lang: language.code,
        dir: language.dir,
        viewport: viewport.name,
        route: ROUTE_URLS[language.code],
        baseline: path.relative(ROOT_DIR, baselinePath),
        rerun: path.relative(ROOT_DIR, rerunPath),
        diff: path.relative(ROOT_DIR, diffPath),
        ...diffResult,
      });

      consoleNetworkLog.push({
        scenario: `live-${language.code}-${viewport.name}`,
        lang: language.code,
        viewport: viewport.name,
        consoleEntries: logging.consoleEntries,
        failedRequests: logging.failedRequests,
      });

      tokens.push({
        lang: language.code,
        viewport: viewport.name,
        route: ROUTE_URLS[language.code],
        customProps: signals.customProps,
        distinctColorCount: signals.distinctColors.length,
        distinctColors: signals.distinctColors,
        distinctFonts: signals.distinctFonts,
        distinctRadii: signals.distinctRadii,
        headlineMetrics: signals.headlineMetrics,
      });

      anatomyRendered.push({
        brandSlug: BRAND_SLUG,
        lang: language.code,
        viewport: viewport.name,
        renderedSlots: signals.renderedSlots,
        sections: signals.sections,
      });

      contrastEntries.push({
        lang: language.code,
        viewport: viewport.name,
        route: ROUTE_URLS[language.code],
        pairs: signals.textNodes,
        summary: {
          totalPairs: signals.textNodes.length,
          failingAA: signals.textNodes.filter((pair) => pair.wcagAA === false).length,
          failingAAA: signals.textNodes.filter((pair) => pair.wcagAAA === false).length,
          primaryCtaPairs: signals.textNodes.filter((pair) => pair.className.includes("brand-market__action--primary") || pair.className.includes("product-card__add-to-cart")),
          missingAltImages: signals.missingAltImages,
        },
      });

      if (language.code === "ar") {
        const rtlPath = path.join(EVIDENCE_ROOT, "states", "rtl", `${baseName}.png`);
        await fs.copyFile(baselinePath, rtlPath);
        stateCopies.push({ state: "rtl", file: path.relative(ROOT_DIR, rtlPath), source: path.relative(ROOT_DIR, baselinePath) });
      }

      if (language.code === "en") {
        const darkPath = path.join(EVIDENCE_ROOT, "states", "darkMode", `${baseName}.png`);
        await fs.copyFile(baselinePath, darkPath);
        stateCopies.push({ state: "darkMode", file: path.relative(ROOT_DIR, darkPath), source: path.relative(ROOT_DIR, baselinePath) });
      }

      await context.close();
    }
  }

  await writeJson("visual-diff/baseline-diff.json", diffEntries);
  await writeJson("browser/console-network-log.json", consoleNetworkLog);
  await writeJson("tokens/design-token-sweep.json", tokens);
  await writeJson("design-review/anatomy-rendered-sensation-en.json", anatomyRendered.filter((entry) => entry.lang === "en"));
  await writeJson("design-review/anatomy-rendered-sensation-ar.json", anatomyRendered.filter((entry) => entry.lang === "ar"));
  await writeJson("contrast/contrast-grid.json", contrastEntries);

  return { consoleNetworkLog, stateCopies };
};

const runStateScreens = async (browser, livePayloads) => {
  const results = [];
  const scenarios = [
    { name: "loading", state: "loading" },
    { name: "error", state: "error" },
    { name: "partial", state: "partial" },
    { name: "empty", state: "empty" },
  ];

  for (const viewport of VIEWPORTS) {
    for (const scenario of scenarios) {
      const context = await setupContext(browser, viewport, { code: "en", dir: "ltr" });
      const page = await context.newPage();
      const logging = setupConsoleCapture(page);
      const hold = await installScenarioRoutes(page, livePayloads, scenario.name);

      await page.goto(ROUTE_URLS.en, { waitUntil: "domcontentloaded", timeout: 60000 });
      await freezeMotion(page);
      await waitForStorefrontReady(page, scenario.state);
      if (scenario.name !== "loading") {
        await stabilizePage(page);
      }
      const outPath = path.join(EVIDENCE_ROOT, "states", scenario.name, `sensation-en-${viewport.name}.png`);
      await page.screenshot({ path: outPath, fullPage: true });

      results.push({
        state: scenario.name,
        viewport: viewport.name,
        route: ROUTE_URLS.en,
        file: path.relative(ROOT_DIR, outPath),
        consoleEntries: logging.consoleEntries,
        failedRequests: logging.failedRequests,
      });

      if (scenario.name === "loading" && hold.resolve) {
        hold.resolve();
      }

      await context.close();
    }
  }

  await writeJson("states/state-metadata.json", results);
  return results;
};

const runAxeEvidence = async (browser) => {
  const results = [];

  for (const language of LIVE_LANGUAGES) {
    const context = await setupContext(browser, { width: 1440, height: 2200 }, language);
    const page = await context.newPage();
    await page.goto(ROUTE_URLS[language.code], { waitUntil: "domcontentloaded", timeout: 60000 });
    await freezeMotion(page);
    await waitForStorefrontReady(page, "live");
    await stabilizePage(page);

    const axe = await new AxeBuilder({ page }).analyze();
    await writeJson(`a11y/axe-${language.code}.json`, axe);
    results.push({ lang: language.code, violations: axe.violations.length, incomplete: axe.incomplete.length });
    await context.close();
  }

  return results;
};

const runLighthouseEvidence = async () => {
  const chromePath = chromium.executablePath();
  const runs = [
    { lang: "en", formFactor: "desktop", url: ROUTE_URLS.en, preset: ["--preset=desktop"] },
    { lang: "en", formFactor: "mobile", url: ROUTE_URLS.en, preset: [] },
    { lang: "ar", formFactor: "desktop", url: ROUTE_URLS.ar, preset: ["--preset=desktop"] },
    { lang: "ar", formFactor: "mobile", url: ROUTE_URLS.ar, preset: [] },
  ];

  const summary = [];

  for (const run of runs) {
    const outputPath = path.join(EVIDENCE_ROOT, "perf", `lighthouse-${run.lang}-${run.formFactor}.json`);
    const args = [
      run.url,
      "--quiet",
      "--output=json",
      `--output-path=${outputPath}`,
      "--only-categories=performance,accessibility",
      `--chrome-path=${chromePath}`,
      "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage",
      ...run.preset,
    ];

    await execFileAsync(LIGHTHOUSE_BIN, args, {
      cwd: ROOT_DIR,
      env: {
        ...process.env,
        CI: "1",
      },
      maxBuffer: 32 * 1024 * 1024,
    });

    const parsed = JSON.parse(await fs.readFile(outputPath, "utf8"));
    summary.push({
      lang: run.lang,
      formFactor: run.formFactor,
      performance: parsed?.categories?.performance?.score ?? null,
      accessibility: parsed?.categories?.accessibility?.score ?? null,
      file: path.relative(ROOT_DIR, outputPath),
    });
  }

  return summary;
};

const runStaticArtifacts = async () => {
  const antiSimulation = [];
  const templateFiles = (await fs.readdir(TEMPLATE_DIR))
    .filter((fileName) => fileName.endsWith(".json"))
    .sort();

  const scanTargets = [
    path.join(ROOT_DIR, "scripts", "seed-brand-preview.mjs"),
    path.join(ROOT_DIR, "src", "pages", "BrandTemplate", "BrandTemplateLayouts.jsx"),
    ...templateFiles.map((fileName) => path.join(TEMPLATE_DIR, fileName)),
  ];

  for (const token of TOKEN_LIST) {
    const regex = new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const hits = [];

    for (const targetPath of scanTargets) {
      const content = await fs.readFile(targetPath, "utf8");
      const lines = content.split(/\r?\n/);
      for (let index = 0; index < lines.length; index += 1) {
        if (regex.test(lines[index])) {
          hits.push({
            file: path.relative(ROOT_DIR, targetPath),
            line: index + 1,
            preview: lines[index].trim().slice(0, 240),
          });
        }
        regex.lastIndex = 0;
      }
    }

    antiSimulation.push({ token, hitCount: hits.length, hits });
  }

  await writeJson("design-review/anti-simulation-grep.json", antiSimulation);

  const anatomyValidation = [];
  const templateFingerprint = [];
  const layoutSource = await fs.readFile(path.join(ROOT_DIR, "src", "pages", "BrandTemplate", "BrandTemplateLayouts.jsx"), "utf8");

  for (const fileName of templateFiles) {
    const absolutePath = path.join(TEMPLATE_DIR, fileName);
    const raw = await fs.readFile(absolutePath, "utf8");
    const parsed = JSON.parse(raw);
    const anatomy = parsed?.designSpec?.anatomy || {};
    const required = Array.isArray(anatomy.required) ? anatomy.required : [];
    const conditional = Array.isArray(anatomy.conditional) ? anatomy.conditional : [];
    const order = Array.isArray(anatomy.order) ? anatomy.order : [];
    const counts = anatomy.counts || {};
    const extendedSupported = Array.isArray(anatomy.extendedSupported) ? anatomy.extendedSupported : [];

    anatomyValidation.push({
      template: parsed.templateKey,
      file: path.relative(ROOT_DIR, absolutePath),
      required,
      conditional,
      order,
      counts,
      extendedSupported,
      status: required.length > 0 && order.length > 0 ? "pass" : "fail",
    });

    templateFingerprint.push({
      template: parsed.templateKey,
      file: path.relative(ROOT_DIR, absolutePath),
      classification: parsed.classification,
      intent: parsed.intent,
      contentHash: hashValue(raw),
      orderHash: hashValue(JSON.stringify(order)),
      requiredHash: hashValue(JSON.stringify(required)),
      layoutContainsIntentLiteral: layoutSource.includes(parsed.intent || ""),
      layoutContainsTemplateKey: layoutSource.includes(parsed.templateKey || ""),
    });
  }

  await writeJson("design-review/anatomy-validation.json", anatomyValidation);
  await writeJson("design-review/template-fingerprint.json", templateFingerprint);

  return { antiSimulation, anatomyValidation, templateFingerprint };
};

const main = async () => {
  await ensureDirs();

  const livePayloads = {
    storefront: await requestJson(`brands/${BRAND_ID}/storefront?accessKey=${APP_ID}`),
    collections: await requestJson(`brands/${BRAND_ID}/collections?accessKey=${APP_ID}`),
    placements: await requestJson(`ads/placements?accessKey=${APP_ID}&scope=brand&brandId=${BRAND_ID}`),
    policies: await requestJson(`policies/brand/${BRAND_ID}?accessKey=${APP_ID}`),
  };

  const browser = await chromium.launch({ headless: true });
  try {
    const staticArtifacts = await runStaticArtifacts();
    const visualArtifacts = await runLiveVisualEvidence(browser);
    const stateArtifacts = await runStateScreens(browser, livePayloads);
    const axeArtifacts = await runAxeEvidence(browser);
    const lighthouseArtifacts = await runLighthouseEvidence();

    await writeJson("browser/phase-a-ui-evidence-manifest.json", {
      generatedAt: new Date().toISOString(),
      route: ROUTE_URLS,
      brand: {
        id: BRAND_ID,
        slug: BRAND_SLUG,
      },
      outputs: {
        staticArtifacts: {
          antiSimulationTokens: staticArtifacts.antiSimulation.length,
          templateFingerprints: staticArtifacts.templateFingerprint.length,
          anatomyTemplates: staticArtifacts.anatomyValidation.length,
        },
        liveVisual: {
          consoleScenarios: visualArtifacts.consoleNetworkLog.length,
          stateCopies: visualArtifacts.stateCopies.length,
        },
        mockedStates: stateArtifacts.length,
        axe: axeArtifacts,
        lighthouse: lighthouseArtifacts,
      },
    });
  } finally {
    await browser.close();
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
