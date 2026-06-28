import { chromium } from "@playwright/test";

const baseUrl = process.env.BRAND_STORE_BASE_URL || "http://127.0.0.1:4173";
const browser = await chromium.launch();
const failures = [];

const requiredSections = [
  "whats-new",
  "top-brand-store",
  "favorite-stores",
  "recommended-stores",
  "todays-deals",
  "all-brands",
];

const railChecks = [
  { sectionId: "whats-new", swiperSelector: ".brand-slider__swiper", minSlides: 2 },
  { sectionId: "top-brand-store", swiperSelector: ".brand-media-rail__swiper", minSlides: 5 },
  { sectionId: "favorite-stores", swiperSelector: ".brand-media-rail__swiper", minSlides: 4 },
  { sectionId: "recommended-stores", swiperSelector: ".brand-media-rail__swiper", minSlides: 5 },
  { sectionId: "todays-deals", swiperSelector: ".brand-deals-section__swiper", minSlides: 5 },
];

try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 2400 },
  });
  await context.addInitScript(() => {
    localStorage.setItem("isVisit", "true");
  });

  const page = await context.newPage();
  const response = await page.goto(new URL("/brand-stores", baseUrl).toString(), {
    waitUntil: "networkidle",
    timeout: 30000,
  });

  if (!response || !response.ok()) {
    throw new Error(`brand-stores returned HTTP ${response?.status() || "no response"}`);
  }

  const positions = [];

  for (const sectionId of requiredSections) {
    const locator = page.locator(`[data-brand-section="${sectionId}"]`).first();
    const count = await locator.count();

    if (!count) {
      failures.push(`Missing section ${sectionId}`);
      continue;
    }

    const box = await locator.boundingBox();

    if (!box) {
      failures.push(`Section ${sectionId} is not visible`);
      continue;
    }

    positions.push({ sectionId, y: box.y });
  }

  for (let index = 1; index < positions.length; index += 1) {
    if (positions[index].y <= positions[index - 1].y) {
      failures.push(
        `Section order is wrong: ${positions[index].sectionId} appears before ${positions[index - 1].sectionId}`,
      );
    }
  }

  const topBrandCards = await page.locator('[data-brand-section="top-brand-store"] .brand-media-card').count();
  if (topBrandCards < 2) {
    failures.push("Top Brand Store is missing media cards");
  }

  const favoriteFeatureCount = await page
    .locator('[data-brand-section="favorite-stores"] .brand-favorite-feature')
    .count();
  const favoriteRailCount = await page
    .locator('[data-brand-section="favorite-stores"] .brand-media-card')
    .count();

  if (!favoriteFeatureCount) {
    failures.push("favorite-stores is missing the featured brand card");
  }

  if (!favoriteRailCount) {
    failures.push("favorite-stores is missing the supporting media rail");
  }

  const recommendedFeatureCount = await page
    .locator('[data-brand-section="recommended-stores"] .brand-favorite-feature')
    .count();
  const recommendedRailCount = await page
    .locator('[data-brand-section="recommended-stores"] .brand-media-card')
    .count();

  if (recommendedFeatureCount) {
    failures.push("recommended-stores should not render the featured brand card");
  }

  if (!recommendedRailCount) {
    failures.push("recommended-stores is missing the compact media rail");
  }

  const dealsFeatureCount = await page
    .locator('[data-brand-section="todays-deals"] .brand-showcase-feature')
    .count();
  const dealsRailCount = await page
    .locator('[data-brand-section="todays-deals"] .brand-deals-card')
    .count();
  const dealsPillCount = await page
    .locator('[data-brand-section="todays-deals"] .brand-deals-section__pill')
    .count();
  const dealsBadgeCount = await page
    .locator('[data-brand-section="todays-deals"] .brand-deals-card__badge')
    .count();

  if (dealsFeatureCount) {
    failures.push("todays-deals should not render the featured showcase card");
  }

  if (!dealsRailCount) {
    failures.push("todays-deals is missing the deals rail cards");
  }

  if (dealsBadgeCount && !dealsPillCount) {
    failures.push("todays-deals is missing the inline header sale pill");
  }

  const allBrandsFilters = await page
    .locator('[data-brand-section="all-brands"] .brand-all-brands-filter')
    .count();
  const allBrandsSearch = await page
    .locator('[data-brand-section="all-brands"] .brand-all-brands-search input')
    .count();
  const allBrandsGroups = await page
    .locator('[data-brand-section="all-brands"] .brand-all-brands-group')
    .count();
  const allBrandsCards = await page
    .locator('[data-brand-section="all-brands"] .brand-all-brands-card')
    .count();
  const allBrandsLeadCards = await page
    .locator('[data-brand-section="all-brands"] .brand-all-brands-card--lead')
    .count();
  const allBrandsLogos = await page
    .locator('[data-brand-section="all-brands"] .brand-all-brands-card__logo')
    .count();
  const allBrandsTitles = await page
    .locator('[data-brand-section="all-brands"] .brand-all-brands-group__title')
    .allTextContents();

  if (allBrandsFilters < 2) {
    failures.push("all-brands is missing the filters toolbar");
  }

  if (!allBrandsSearch) {
    failures.push("all-brands is missing the search input");
  }

  if (!allBrandsGroups) {
    failures.push("all-brands is missing grouped brand shelves");
  }

  if (!allBrandsCards) {
    failures.push("all-brands is missing the grouped brand cards");
  }

  if (allBrandsLeadCards) {
    failures.push("all-brands should not render a larger first card in each group");
  }

  if (allBrandsLogos) {
    failures.push("all-brands should not render the bottom logo plate");
  }

  const normalizedTitles = allBrandsTitles.map((title) => title.trim()).filter(Boolean);
  if (!normalizedTitles.includes("Jewelry & Accessories") || !normalizedTitles.includes("Women Fashion")) {
    failures.push("all-brands is missing the expected Figma category headings");
  }

  for (const { sectionId, swiperSelector, minSlides } of railChecks) {
    const section = page.locator(`[data-brand-section="${sectionId}"]`).first();
    const swiper = section.locator(swiperSelector).first();
    const wrapper = swiper.locator(".swiper-wrapper").first();
    const slides = wrapper.locator(":scope > .swiper-slide");
    const slideCount = await slides.count();

    if (slideCount < minSlides) {
      failures.push(`${sectionId} is rendering only ${slideCount} slides; expected at least ${minSlides}`);
      continue;
    }

    const { scrollWidth, clientWidth, beforeTransform } = await wrapper.evaluate((element) => ({
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
      beforeTransform: getComputedStyle(element).transform,
    }));

    if (scrollWidth <= clientWidth) {
      failures.push(`${sectionId} rail does not overflow horizontally`);
      continue;
    }

    await swiper.scrollIntoViewIfNeeded();
    const box = await swiper.boundingBox();
    if (!box) {
      failures.push(`${sectionId} rail swiper is not visible`);
      continue;
    }

    await swiper.hover();
    await page.mouse.wheel(800, 0);
    await page.waitForTimeout(250);

    const afterWheelTransform = await wrapper.evaluate((element) => getComputedStyle(element).transform);
    if (beforeTransform === afterWheelTransform) {
      failures.push(`${sectionId} rail did not move after wheel interaction`);
      continue;
    }

    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(250);

    const afterTransform = await wrapper.evaluate((element) => getComputedStyle(element).transform);
    if (afterWheelTransform === afterTransform) {
      failures.push(`${sectionId} rail did not move after drag interaction`);
    }
  }

  await context.close();
} finally {
  await browser.close();
}

if (failures.length) {
  console.error("Brand store verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Brand store verification passed.");
