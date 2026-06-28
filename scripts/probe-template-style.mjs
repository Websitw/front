import { chromium } from "playwright";
const b = await chromium.launch();
const templates = [
  { alias: "dbmed", key: "editorial-hero" },
  { alias: "dbmco", key: "commerce-grid" },
  { alias: "dbmst", key: "story-collection" },
  { alias: "dbmcf", key: "campaign-focus" },
  { alias: "dbmrs", key: "routine-solution" },
  { alias: "dbmdp", key: "deal-promo" },
  { alias: "dbmch", key: "category-hub" },
];

const out = [];
for (const t of templates) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(`http://localhost:4200/brands/${t.alias}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const data = await p.evaluate(() => {
    const pick = (sel, props) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const cs = getComputedStyle(el);
      const o = {};
      for (const p of props) o[p] = cs.getPropertyValue(p);
      return o;
    };
    const root = document.querySelector(".brand-market");
    const rootVars = {};
    if (root) {
      const cs = getComputedStyle(root);
      for (const v of [
        "--brand-accent", "--brand-surface", "--brand-text", "--brand-border",
        "--brand-radius-md", "--brand-radius-lg", "--brand-button-radius",
        "--brand-section-gap", "--brand-layout-padding",
        "--brand-heading-font", "--brand-body-font",
      ]) rootVars[v] = cs.getPropertyValue(v).trim();
    }
    const hero = pick(".brand-market__hero-system-shell", ["grid-template-columns", "min-height", "padding", "border-radius", "background-color", "background-image"]);
    const card = pick(".brand-market__module, .brand-market__card, [class*='product-card']", ["border-radius", "background-color", "border", "box-shadow"]);
    const button = pick("button, a[class*='btn'], a[class*='cta']", ["border-radius", "background-color", "color", "font-family", "padding"]);
    const heading = pick("h1", ["font-family", "font-size", "font-weight", "letter-spacing", "color", "text-transform"]);
    const body = pick("body", ["font-family", "font-size", "color"]);
    // count distinct accent-ish colors to measure consistency
    const colorHits = new Set();
    document.querySelectorAll("*").forEach((el) => {
      const cs = getComputedStyle(el);
      for (const k of ["color", "background-color", "border-top-color", "border-bottom-color"]) {
        const v = cs.getPropertyValue(k);
        if (v && /rgb/.test(v) && !/rgba?\(0, ?0, ?0, ?0\)/.test(v)) colorHits.add(v);
      }
    });
    const radiusHits = new Set();
    document.querySelectorAll("*").forEach((el) => {
      const r = getComputedStyle(el).getPropertyValue("border-radius");
      if (r && r !== "0px") radiusHits.add(r);
    });
    const fontHits = new Set();
    document.querySelectorAll("*").forEach((el) => {
      const f = getComputedStyle(el).getPropertyValue("font-family");
      if (f) fontHits.add(f.split(",")[0].trim().replace(/['"]/g, ""));
    });
    return {
      rootVars,
      hero,
      card,
      button,
      heading,
      body,
      distinctColors: colorHits.size,
      distinctRadii: Array.from(radiusHits).slice(0, 20),
      distinctFonts: Array.from(fontHits).slice(0, 15),
      hasVideoHero: !!document.querySelector(".brand-market__hero-media[autoplay], video.brand-market__hero-media, video[class*='hero']"),
      heroShellClasses: (document.querySelector(".brand-market__hero-system-shell")?.className || "").slice(0, 300),
    };
  });
  out.push({ template: t.key, ...data });
  await p.close();
}
console.log(JSON.stringify(out, null, 2));
await b.close();
