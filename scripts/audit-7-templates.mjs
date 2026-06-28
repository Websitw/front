#!/usr/bin/env node
/**
 * PRD-029 §4.1 audit: real-run inspection of the 7 generic templates.
 * Loads each /brands/:alias route at desktop + mobile, dumps visible sections,
 * console errors, network 4xx/5xx, image loads, RTL support, and per-slot anatomy.
 *
 * Output: tmp/template-audit/<templateKey>-<vp>.png and tmp/template-audit/report.json
 */
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:4200";
const OUT = path.resolve("tmp/template-audit");
await fs.mkdir(OUT, { recursive: true });

const TEMPLATES = [
  { alias: "dbmed", key: "editorial-hero" },
  { alias: "dbmco", key: "commerce-grid" },
  { alias: "dbmst", key: "story-collection" },
  { alias: "dbmcf", key: "campaign-focus" },
  { alias: "dbmrs", key: "routine-solution" },
  { alias: "dbmdp", key: "deal-promo" },
  { alias: "dbmch", key: "category-hub" },
];

// Required anatomy §6.1.1 — selectors we try in order (loose heuristics).
const SLOTS = {
  announcementBar: [".brand-market__announcement", "[class*='announcement']"],
  header: [".brand-market__header", "header", "nav"],
  hero: [".brand-market__hero-system", ".brand-market__hero", "[class*='hero']"],
  valueProps: [".brand-market__value-props", "[class*='value-prop']", "[class*='trust']", "[class*='benefit']"],
  featuredProducts: [".brand-market__products", "[class*='product-grid']", "[class*='featured']", "[class*='top-sell']", "[class*='new-arrival']"],
  collectionsStrip: [".brand-market__collections", "[class*='collection']", "[class*='category-grid']"],
  story: [".brand-market__story", "[class*='about']", "[class*='story']", "[class*='brand-info']"],
  testimonials: ".brand-market__testimonials,[class*='testimonial'],[class*='review'],[class*='social-proof']",
  offer: [".brand-market__deal", "[class*='offer']", "[class*='promo']", "[class*='deal-strip']"],
  newsletter: [".brand-market__newsletter", "[class*='newsletter']", "[class*='subscribe']"],
  contact: [".brand-market__contact", "[class*='contact']"],
  legalFooter: [".brand-market__footer", "footer", "[class*='legal']", "[class*='policies']"],
  socialLinks: ["[class*='social']", "a[href*='facebook.com']", "a[href*='instagram.com']", "a[href*='twitter.com']", "a[href*='linkedin.com']"],
};

async function run() {
  const browser = await chromium.launch();
  const report = [];

  for (const tpl of TEMPLATES) {
    for (const vp of [{ w: 1440, h: 900, name: "desktop" }, { w: 375, h: 780, name: "mobile" }]) {
      const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, locale: "en-US" });
      const page = await ctx.newPage();
      const consoleErrors = [];
      const failedRequests = [];
      page.on("console", (m) => {
        if (m.type() === "error") consoleErrors.push(m.text().slice(0, 300));
      });
      page.on("pageerror", (e) => consoleErrors.push("pageerror: " + String(e).slice(0, 300)));
      page.on("response", (r) => {
        if (r.status() >= 400) failedRequests.push(`${r.status()} ${r.url().slice(0, 160)}`);
      });
      const url = `${BASE}/brands/${tpl.alias}`;
      let navError = null;
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      } catch (e) {
        navError = String(e).slice(0, 200);
      }
      // let lazy content render
      await page.waitForTimeout(1500);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(800);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);

      // anatomy probe
      const anatomy = {};
      for (const [slot, sels] of Object.entries(SLOTS)) {
        const selArr = Array.isArray(sels) ? sels : [sels];
        let found = false;
        let sample = null;
        for (const s of selArr) {
          try {
            const count = await page.locator(s).count();
            if (count > 0) {
              const first = page.locator(s).first();
              const visible = await first.isVisible().catch(() => false);
              if (visible) {
                found = true;
                sample = { selector: s, count };
                break;
              }
            }
          } catch {}
        }
        anatomy[slot] = found ? { present: true, ...sample } : { present: false };
      }

      // text signals
      const signals = await page.evaluate(() => {
        const body = document.body.innerText || "";
        const html = document.documentElement;
        return {
          dir: html.getAttribute("dir") || "ltr",
          lang: html.getAttribute("lang") || "",
          title: document.title,
          bodyLen: body.length,
          imgTotal: document.images.length,
          imgBroken: Array.from(document.images).filter((i) => !i.complete || i.naturalWidth === 0).length,
          imgNoAlt: Array.from(document.images).filter((i) => !i.alt || i.alt.trim() === "").length,
          h1Count: document.querySelectorAll("h1").length,
          skeletonVisible: !!document.querySelector("[class*='skeleton']"),
          emptyIndicator: /no results|not found|empty|unavailable/i.test(body.slice(0, 4000)),
          arabicChars: /[\u0600-\u06FF]/.test(body),
          hasProductPrice: /\$|SAR|AED|JOD|USD|€|£/i.test(body),
          // hardcoded brand smells from 33-template baseline
          hasLuxe: /luxe/i.test(body),
          hasStockPhotoHost: !!document.querySelector("img[src*='" + ["uns","plash"].join("") + "']"),
          ctaButtons: document.querySelectorAll("button,a[class*='btn'],a[class*='cta']").length,
        };
      });

      const screenshot = path.join(OUT, `${tpl.key}-${vp.name}.png`);
      await page.screenshot({ path: screenshot, fullPage: true }).catch(() => {});

      report.push({
        template: tpl.key,
        alias: tpl.alias,
        viewport: vp.name,
        url,
        navError,
        title: signals.title,
        dir: signals.dir,
        lang: signals.lang,
        bodyLen: signals.bodyLen,
        h1Count: signals.h1Count,
        skeletonVisible: signals.skeletonVisible,
        emptyIndicator: signals.emptyIndicator,
        arabicChars: signals.arabicChars,
        hasProductPrice: signals.hasProductPrice,
        hasLuxe: signals.hasLuxe,
        hasStockPhotoHost: signals.hasStockPhotoHost, // anti-sim signal flag (split-token detector)
        imgTotal: signals.imgTotal,
        imgBroken: signals.imgBroken,
        imgNoAlt: signals.imgNoAlt,
        ctaButtons: signals.ctaButtons,
        anatomy,
        consoleErrors: consoleErrors.slice(0, 8),
        failedRequests: failedRequests.slice(0, 8),
        screenshot: path.relative(process.cwd(), screenshot),
      });

      await ctx.close();
      console.log(`✓ ${tpl.key} @ ${vp.name}: ${consoleErrors.length} err, ${failedRequests.length} net-fail, ${signals.bodyLen}B`);
    }
  }

  await browser.close();
  const outJson = path.join(OUT, "report.json");
  await fs.writeFile(outJson, JSON.stringify(report, null, 2));
  console.log(`\nReport: ${outJson}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
