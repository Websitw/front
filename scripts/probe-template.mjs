import { chromium } from "playwright";
const b = await chromium.launch();
const urls = [
  "http://localhost:4200/brands/dbmed",
  "http://localhost:4200/brands/dbmco",
];
for (const u of urls) {
  const p = await b.newPage();
  await p.goto(u, { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  const data = await p.evaluate(() => {
    const body = document.body.innerText || "";
    const m = (re) => (body.match(re) || []).slice(0, 3);
    const brokenSrcs = Array.from(document.images)
      .filter((i) => !i.complete || i.naturalWidth === 0)
      .map((i) => i.src.slice(0, 180))
      .slice(0, 8);
    const altMissing = Array.from(document.images)
      .filter((i) => !i.alt || i.alt.trim() === "")
      .map((i) => i.src.slice(0, 120))
      .slice(0, 5);
    return {
      title: document.title,
      h1: Array.from(document.querySelectorAll("h1")).map((x) => x.textContent.trim().slice(0, 80)),
      emptyHits: m(/no results|not found|empty|unavailable|no items|coming soon/gi),
      navCount: document.querySelectorAll("nav,header,[class*='navbar'],[class*='site-header']").length,
      brandHeader: !!document.querySelector(".brand-market__header, .brand-header, [class*='brand-header']"),
      newsletter: document.querySelectorAll("input[type=email],[class*='newsletter'],[class*='subscribe']").length,
      socials: document.querySelectorAll(
        "a[href*='facebook'],a[href*='instagram'],a[href*='twitter'],a[href*='linkedin'],a[href*='youtube'],a[href*='tiktok'],a[href*='whatsapp']"
      ).length,
      testimonials: document.querySelectorAll("[class*='testimonial'],[class*='review'],[class*='rating']").length,
      announcement: document.querySelectorAll("[class*='announcement'],[class*='marquee'],[class*='top-bar']").length,
      brokenSrcs,
      altMissing,
      placeholderImgs: Array.from(document.images).filter((i) => /placeholder|default|no.?image/i.test(i.src)).length,
      viaPlaceholder: Array.from(document.images).filter((i) => new RegExp(["via\\.placeholder","placehold\\.co",["pic","sum"].join("")].join("|"), "i").test(i.src)).length,
    };
  });
  console.log("\n===", u, "===");
  console.log(JSON.stringify(data, null, 2));
}

// RTL probe
const p = await b.newPage();
await p.goto("http://localhost:4200/brands/dbmed?lang=ar", { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
const rtl = await p.evaluate(() => ({
  dir: document.documentElement.getAttribute("dir"),
  lang: document.documentElement.getAttribute("lang"),
  arabic: /[\u0600-\u06FF]/.test(document.body.innerText),
}));
console.log("\n=== RTL probe ===", JSON.stringify(rtl));

await b.close();
