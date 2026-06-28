import { access, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import {
  getDefaultBrandMarketModules,
  getDefaultHeroLayoutForTemplate,
} from "../src/helper/brandMarketConfig.js";

const execFile = promisify(execFileCallback);

const PUBLIC_APP_ID = "mada";
const API_ORIGIN = process.env.XAP_API_ORIGIN || "https://xapsawa.xapis.com/v1/";
const BRAND_APP_ORIGIN = process.env.BRAND_APP_ORIGIN || "https://sawa.xapis.com";
const DEFAULT_SOURCE_BRAND_REF = ["sen", "sation"].join("");
const SOURCE_BRAND_REF = process.env.SOURCE_BRAND_REF || DEFAULT_SOURCE_BRAND_REF;
const DEFAULT_PRODUCT_LIMIT = Number(process.env.PRODUCT_LIMIT || 12);
const ROOT_DIR = process.cwd();
const DEFAULT_SOURCE_WORKBOOK_BASENAME = [
  ["Sen", "sation"].join(""),
  "Marketplace",
  "Final",
  "Attributes",
  "Scored.xlsx",
].join("_");
const DEFAULT_SOURCE_WORKBOOK_PATH = path.join(
  ROOT_DIR,
  "docs",
  DEFAULT_SOURCE_WORKBOOK_BASENAME,
);
const SOURCE_WORKBOOK_PATH = process.env.SOURCE_WORKBOOK_PATH || DEFAULT_SOURCE_WORKBOOK_PATH;
const IMPORT_WORK_DIR = process.env.IMPORT_WORK_DIR || path.join(ROOT_DIR, "tmp", "brand-preview-imports");
const WORKBOOK_HELPER_PATH =
  process.env.WORKBOOK_HELPER_PATH || path.join(ROOT_DIR, "scripts", "build_brand_import_workbook.py");
const PYTHON_BIN = process.env.PYTHON_BIN || "python3";
const IMPORT_POLL_MS = Number(process.env.IMPORT_POLL_MS || 3000);
const IMPORT_WAIT_TIMEOUT_MS = Number(process.env.IMPORT_WAIT_TIMEOUT_MS || 300000);
const DEFAULT_FILE_UPLOAD_URLS = [new URL("_filestore", API_ORIGIN).toString(), new URL("_upload", API_ORIGIN).toString()];
const FILE_UPLOAD_URLS = process.env.XAP_FILE_UPLOAD_URL
  ? [process.env.XAP_FILE_UPLOAD_URL]
  : DEFAULT_FILE_UPLOAD_URLS;
const PRODUCT_SYNC_MODE = process.env.PRODUCT_SYNC_MODE || "sheet";
const KEEP_SOURCE_IDENTIFIERS =
  String(process.env.KEEP_SOURCE_IDENTIFIERS || "").trim().toLowerCase() === "true";
const MAX_PREVIEW_BRAND_NAME_LENGTH = 12;
const PREVIEW_KEY_TAG = String(process.env.PREVIEW_KEY_TAG || "")
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "");

function withPreviewTag(baseKey) {
  return PREVIEW_KEY_TAG ? `${baseKey}${PREVIEW_KEY_TAG}` : baseKey;
}

const argv = process.argv.slice(2);
const shouldApply = argv.includes("--apply");
const shouldForce = argv.includes("--force");

const previewSpecs = [
  {
    templateKey: "editorial-hero",
    suffix: "Editorial Preview",
    shortName: "SensEdit",
    key: withPreviewTag("dbmed"),
  },
  {
    templateKey: "commerce-grid",
    suffix: "Commerce Preview",
    shortName: "SensShop",
    key: withPreviewTag("dbmco"),
  },
  {
    templateKey: "story-collection",
    suffix: "Story Preview",
    shortName: "SensStory",
    key: withPreviewTag("dbmst"),
  },
  {
    templateKey: "campaign-focus",
    suffix: "Campaign Preview",
    shortName: "SensCamp",
    key: withPreviewTag("dbmcf"),
  },
  {
    templateKey: "routine-solution",
    suffix: "Routine Preview",
    shortName: "SensSolve",
    key: withPreviewTag("dbmrs"),
  },
  {
    templateKey: "deal-promo",
    suffix: "Deals Preview",
    shortName: "SensDeal",
    key: withPreviewTag("dbmdp"),
  },
  {
    templateKey: "category-hub",
    suffix: "Hub Preview",
    shortName: "SensHub",
    key: withPreviewTag("dbmch"),
  },
];

const bearerToken = process.env.XAP_TOKEN || "";
const explicitMerchantId = process.env.MERCHANT_ID || "";
const explicitOwnerId = process.env.OWNER_ID || explicitMerchantId;
const explicitStoreId = process.env.STORE_ID || "";
const explicitTargetBrandIds = (process.env.TARGET_BRAND_IDS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const explicitTargetBrandRefs = (process.env.TARGET_BRAND_REFS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const explicitTargetTemplateKeys = (process.env.TARGET_TEMPLATE_KEYS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const usage = `
Usage:
  node scripts/seed-brand-preview.mjs
  XAP_TOKEN=... OWNER_ID=... MERCHANT_ID=... STORE_ID=... node scripts/seed-brand-preview.mjs --apply
  XAP_TOKEN=... TARGET_BRAND_IDS=id1,id2,id3 MERCHANT_ID=... STORE_ID=... node scripts/seed-brand-preview.mjs --apply
  XAP_TOKEN=... TARGET_BRAND_REFS=lovely_care,7elements TARGET_TEMPLATE_KEYS=editorial-hero,commerce-grid MERCHANT_ID=... STORE_ID=... node scripts/seed-brand-preview.mjs --apply

Environment:
  XAP_TOKEN         Bearer token for write operations
  OWNER_ID          Brand owner id for preview brand creation
  MERCHANT_ID       Merchant id used on cloned products
  STORE_ID          Store id used on cloned products
  TARGET_BRAND_IDS  Optional comma-separated brand ids to reuse instead of creating preview brands
  TARGET_BRAND_REFS Optional comma-separated brand refs (id/key/slug) to reuse instead of creating preview brands
  TARGET_TEMPLATE_KEYS Optional comma-separated template keys aligned with TARGET_BRAND_IDS or TARGET_BRAND_REFS
  SOURCE_BRAND_REF  Optional source brand ref or id (default: ${DEFAULT_SOURCE_BRAND_REF})
  PRODUCT_LIMIT     Optional max source products to clone per preview brand (default: 12)
  PRODUCT_SYNC_MODE Product sync mode: sheet or rest (default: sheet)
  PREVIEW_KEY_TAG   Optional suffix appended to preview brand keys to create an isolated preview set
  SOURCE_WORKBOOK_PATH  Source workbook used in sheet mode
  XAP_FILE_UPLOAD_URL   File upload endpoint used in sheet mode (default tries: ${DEFAULT_FILE_UPLOAD_URLS.join(", ")})
  IMPORT_WORK_DIR       Local output directory for generated import workbooks
  PYTHON_BIN            Python executable with openpyxl installed (default: python3)
  KEEP_SOURCE_IDENTIFIERS  true to preserve Product key / SKU / Barcode values in sheet mode

Notes:
  - Without --apply the script is read-only and prints the preview plan.
  - The safe path is to create or reuse isolated preview brands; do not overwrite real brands.
`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function buildHeaders({ auth } = {}) {
  if (auth === "bearer") {
    return {
      Authorization: `Bearer ${bearerToken}`,
      "Content-Type": "application/json",
    };
  }

  return {
    Authorization: `Anonymous=${PUBLIC_APP_ID}`,
    "Content-Type": "application/json",
  };
}

function normalizeResponse(payload) {
  return payload?.result || payload?.data || payload?.item || payload;
}

function normalizeImportJobStatus(payload) {
  return payload?.importJob || payload?.result?.importJob || payload?.data?.importJob || payload?.result || payload?.data;
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function localized(en, ar = en) {
  return {
    en,
    ar,
  };
}

function isTruthy(value) {
  return value !== undefined && value !== null && value !== "";
}

function take(items, limit) {
  return items.slice(0, limit);
}

function dedupeBy(items, selector) {
  const seen = new Set();
  return items.filter((item) => {
    const key = selector(item);
    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function buildBrandPath(brand) {
  const ref = brand?.slug || brand?.key || brand?.id || "";
  return ref ? `/brands/${encodeURIComponent(ref)}` : "/brand-stores";
}

function buildBrandRouteUrl(brand) {
  return `${BRAND_APP_ORIGIN}${buildBrandPath(brand)}`;
}

function getProductLabel(product, locale = "en") {
  return (
    product?.title_i18n?.[locale] ||
    product?.productTitle_i18n?.[locale] ||
    product?.title ||
    product?.productTitle ||
    product?.name ||
    "Product"
  );
}

function normalizeArrayFromSource(sourceItems = [], fallbackItems = []) {
  return ensureArray(sourceItems).length ? ensureArray(sourceItems) : ensureArray(fallbackItems);
}

function buildActionLink(labelEn, labelAr, url, style = "primary") {
  return {
    label: labelEn,
    label_i18n: localized(labelEn, labelAr),
    url,
    style,
  };
}

function buildBenefitCard(titleEn, titleAr, descriptionEn, descriptionAr, eyebrowEn = "", eyebrowAr = "", mediaId = "", icon = "") {
  return {
    eyebrow: eyebrowEn,
    eyebrow_i18n: localized(eyebrowEn, eyebrowAr || eyebrowEn),
    title: titleEn,
    title_i18n: localized(titleEn, titleAr),
    description: descriptionEn,
    description_i18n: localized(descriptionEn, descriptionAr),
    mediaId,
    icon,
  };
}

function buildSocialProofItem(headlineEn, headlineAr, value, labelEn, labelAr, descriptionEn = "", descriptionAr = "", mediaId = "") {
  return {
    headline: headlineEn,
    headline_i18n: localized(headlineEn, headlineAr),
    value,
    label: labelEn,
    label_i18n: localized(labelEn, labelAr),
    description: descriptionEn,
    description_i18n: localized(descriptionEn, descriptionAr),
    mediaId,
  };
}

function buildFaqItem(questionEn, questionAr, answerEn, answerAr) {
  return {
    question: questionEn,
    question_i18n: localized(questionEn, questionAr),
    answer: answerEn,
    answer_i18n: localized(answerEn, answerAr),
  };
}

function buildLinkItem(labelEn, labelAr, url) {
  return {
    label: labelEn,
    label_i18n: localized(labelEn, labelAr),
    url,
  };
}

function buildSeededStorefrontFields({ templateKey, sourceWorkspace, sourceProducts, targetBrand }) {
  const leadProduct = sourceProducts[0] || {};
  const sourceStorefront = sourceWorkspace.storefront || {};
  const brandName = targetBrand.brandName || sourceWorkspace.brand.brandName;
  const sourceBannerMediaId =
    sourceStorefront?.heroMediaId ||
    sourceWorkspace.brand?.catalogId ||
    sourceWorkspace.brand?.logoId ||
    sourceWorkspace.collections?.[0]?.mediaId ||
    "";

  return {
    heroEyebrow: sourceStorefront.heroEyebrow || "",
    heroEyebrow_i18n: sourceStorefront.heroEyebrow_i18n || localized("", ""),
    heroTitle: sourceStorefront.heroTitle || brandName,
    heroTitle_i18n: sourceStorefront.heroTitle_i18n || localized(brandName, brandName),
    heroDescription: sourceStorefront.heroDescription || "",
    heroDescription_i18n: sourceStorefront.heroDescription_i18n || localized("", ""),
    storyTitle: sourceStorefront.storyTitle || "",
    storyTitle_i18n: sourceStorefront.storyTitle_i18n || localized("", ""),
    storyBody: sourceStorefront.storyBody || "",
    storyBody_i18n: sourceStorefront.storyBody_i18n || localized("", ""),
    brandPromise: sourceStorefront.brandPromise || "",
    brandPromise_i18n: sourceStorefront.brandPromise_i18n || localized("", ""),
    valuesTitle: "",
    valuesTitle_i18n: localized("", ""),
    keyBenefitsTitle: "",
    keyBenefitsTitle_i18n: localized("", ""),
    offerHighlightsTitle: "",
    offerHighlightsTitle_i18n: localized("", ""),
    socialProofTitle: "",
    socialProofTitle_i18n: localized("", ""),
    faqTitle: "",
    faqTitle_i18n: localized("", ""),
    heroPrimaryCtaLabel: "",
    heroPrimaryCtaLabel_i18n: localized("", ""),
    heroPrimaryCtaUrl: "",
    heroSecondaryCtaLabel: "",
    heroSecondaryCtaLabel_i18n: localized("", ""),
    heroSecondaryCtaUrl: "",
    mobileHeroMediaId: leadProduct?.mediaList?.[0]?.mediaId || sourceBannerMediaId,
    serviceTitle: sourceStorefront.serviceTitle || "",
    serviceTitle_i18n: sourceStorefront.serviceTitle_i18n || localized("", ""),
    serviceDescription: sourceStorefront.serviceDescription || "",
    serviceDescription_i18n: sourceStorefront.serviceDescription_i18n || localized("", ""),
    serviceHours: sourceStorefront.serviceHours || "",
    socialLinks: [],
    footerTitle: sourceStorefront.footerTitle || brandName,
    footerTitle_i18n: sourceStorefront.footerTitle_i18n || localized(brandName, brandName),
    footerDescription: sourceStorefront.footerDescription || "",
    footerDescription_i18n: sourceStorefront.footerDescription_i18n || localized("", ""),
    privacyUrl: "",
    termsUrl: "",
    footerNavigationLinks: [],
    values: [],
    finalCta: {
      title: "",
      title_i18n: localized("", ""),
      subTitle: "",
      subTitle_i18n: localized("", ""),
      mediaId: leadProduct?.mediaList?.[0]?.mediaId || sourceBannerMediaId,
      backgroundColor: sourceStorefront.finalCta?.backgroundColor || "#111827",
      primaryAction: buildActionLink("", "", "", "primary"),
      secondaryAction: buildActionLink("", "", "", "secondary"),
    },
    keyBenefits: [],
    offerHighlights: [],
    socialProof: [],
    faqItems: [],
    bannerAds: [],
    heroLayout: getDefaultHeroLayoutForTemplate(templateKey),
    templateModules: getDefaultBrandMarketModules(templateKey),
    qaTag: sourceStorefront.qaTag || "",
    qaSeeded: Boolean(sourceStorefront.qaSeeded),
  };
}

function rewriteTargetUrl(url, sourceBrand, targetBrand) {
  if (!url) {
    return url;
  }

  const replacements = [
    [sourceBrand?.id, targetBrand?.id],
    [sourceBrand?.key, targetBrand?.key],
    [sourceBrand?.slug, targetBrand?.key || targetBrand?.slug],
  ].filter(([from, to]) => from && to);

  let nextUrl = String(url);
  for (const [from, to] of replacements) {
    nextUrl = nextUrl.split(String(from)).join(String(to));
  }

  if (nextUrl.includes("/search-brand") && targetBrand?.id) {
    return `${BRAND_APP_ORIGIN}${buildBrandPath(targetBrand)}`;
  }

  return nextUrl;
}

async function request(path, { method = "GET", auth = "public", params, body } = {}) {
  const url = new URL(path, API_ORIGIN);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") {
        continue;
      }
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url, {
    method,
    headers: buildHeaders({ auth }),
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = payload?.message || payload?.error || `${method} ${url.pathname} failed`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveBrandByRef(brandRef, auth = "public") {
  const directIdPattern = /^\d{10,}$/;
  if (directIdPattern.test(String(brandRef || ""))) {
    return request(`brands/${brandRef}`, { auth });
  }

  const queries = [
    `properties.key:${brandRef}`,
    `properties.key:"${brandRef}"`,
    `properties.slug:${brandRef}`,
    `properties.slug:"${brandRef}"`,
    `properties.brandName:"${String(brandRef).replace(/-/g, " ")}"`,
  ];

  for (const query of queries) {
    const page = await request("brands", {
      auth,
      params: { q: query, limit: 1 },
    });

    if (page?.items?.[0]) {
      return page.items[0];
    }
  }

  throw new Error(`Unable to resolve source brand "${brandRef}"`);
}

function buildExplicitTargetDefinitions(sourceTemplateKey) {
  if (explicitTargetBrandIds.length && explicitTargetBrandRefs.length) {
    throw new Error("Use either TARGET_BRAND_IDS or TARGET_BRAND_REFS, not both");
  }

  const rawTargets = explicitTargetBrandRefs.length ? explicitTargetBrandRefs : explicitTargetBrandIds;
  if (!rawTargets.length) {
    return [];
  }

  if (explicitTargetTemplateKeys.length && explicitTargetTemplateKeys.length !== rawTargets.length) {
    throw new Error("TARGET_TEMPLATE_KEYS must align with the number of explicit target brands");
  }

  return rawTargets.map((ref, index) => ({
    ref,
    templateKey:
      explicitTargetTemplateKeys[index] ||
      previewSpecs[index]?.templateKey ||
      sourceTemplateKey ||
      "commerce-grid",
  }));
}

async function getSourceWorkspace(sourceBrand) {
  const [brand, storefront, collections] = await Promise.all([
    request(`brands/${sourceBrand.id}`, { auth: "public" }),
    request(`brands/${sourceBrand.id}/storefront`, { auth: "public" }),
    request(`brands/${sourceBrand.id}/collections`, { auth: "public" }),
  ]);

  return {
    brand,
    storefront,
    collections: ensureArray(collections?.items),
  };
}

async function getSourceProducts(sourceCollections, productLimit) {
  const productRefs = dedupeBy(
    sourceCollections.flatMap((collection) => ensureArray(collection.items)),
    (item) => item?.productId,
  );

  const selectedRefs = take(productRefs, productLimit);
  const products = [];

  for (const item of selectedRefs) {
    const product = await request(`products/${item.productId}`, {
      auth: "public",
      params: { countryCode: "JO" },
    });
    products.push(product);
    await sleep(50);
  }

  return products;
}

function buildBrandCreatePayload(sourceBrand, previewSpec) {
  const mediaList = ensureArray(sourceBrand.mediaList).map((media, index) => ({
    mediaId: media.mediaId,
    type: media.type || "IMAGE",
    altText: media.altText || `${sourceBrand.brandName} preview`,
    sortOrder: media.sortOrder || index + 1,
  }));

  const fallbackCatalogId =
    sourceBrand.catalogId ||
    sourceBrand.logoId ||
    sourceBrand.mediaList?.[0]?.mediaId ||
    "";
  const previewBrandName = buildPreviewBrandName(previewSpec);

  return {
    brandName: previewBrandName,
    brandDescription: sourceBrand.brandDescription,
    brandDescription_i18n: sourceBrand.brandDescription_i18n,
    countryOfRegistrationId: sourceBrand.countryOfRegistrationId || "JO",
    trademarkStatus: sourceBrand.trademarkStatus || "REGISTERED",
    trademarkRegistrationNumber: `${sourceBrand.trademarkRegistrationNumber || "PREVIEW"}-${previewSpec.templateKey.toUpperCase()}`,
    brandDocumentId: sourceBrand.brandDocumentId || sourceBrand.logoId || "",
    ownerId: explicitOwnerId,
    creatorType: "ADMIN",
    approvalStatus: "APPROVED",
    comment: `Seeded from ${sourceBrand.brandName} for dedicated brand market template preview`,
    logoId: sourceBrand.logoId,
    catalogId: fallbackCatalogId,
    mediaList,
    key: previewSpec.key,
  };
}

function buildPreviewBrandName(previewSpec) {
  const previewNameTag = PREVIEW_KEY_TAG ? PREVIEW_KEY_TAG.slice(-1).toUpperCase() : "";
  return `${previewSpec.shortName || "SawaBrand"}${previewNameTag}`.slice(0, MAX_PREVIEW_BRAND_NAME_LENGTH);
}

function buildStorefrontPayload(sourceStorefront, targetBrandId, templateKey, sourceBrand, targetBrand, sourceWorkspace, sourceProducts) {
  const seeded = buildSeededStorefrontFields({
    templateKey,
    sourceWorkspace,
    sourceProducts,
    targetBrand,
  });

  return {
    brandId: targetBrandId,
    discoverySummary: sourceStorefront.discoverySummary || "",
    discoverySummary_i18n: sourceStorefront.discoverySummary_i18n || {},
    tagline: sourceStorefront.tagline || "",
    tagline_i18n: sourceStorefront.tagline_i18n || {},
    templateKey,
    heroEyebrow: sourceStorefront.heroEyebrow || seeded.heroEyebrow || "",
    heroEyebrow_i18n: sourceStorefront.heroEyebrow_i18n || seeded.heroEyebrow_i18n || {},
    heroTitle: sourceStorefront.heroTitle || seeded.heroTitle || "",
    heroTitle_i18n: sourceStorefront.heroTitle_i18n || seeded.heroTitle_i18n || {},
    heroDescription: sourceStorefront.heroDescription || seeded.heroDescription || "",
    heroDescription_i18n: sourceStorefront.heroDescription_i18n || seeded.heroDescription_i18n || {},
    heroMediaId: sourceStorefront.heroMediaId || sourceBrand.catalogId || sourceBrand.logoId || "",
    heroVideoId: sourceStorefront.heroVideoId || "",
    heroVideoIdEn: sourceStorefront.heroVideoIdEn || "",
    heroVideoIdAr: sourceStorefront.heroVideoIdAr || "",
    heroPosterId: sourceStorefront.heroPosterId || "",
    mobileHeroMediaId: sourceStorefront.mobileHeroMediaId || seeded.mobileHeroMediaId || sourceStorefront.heroMediaId || "",
    mobileHeroVideoId: sourceStorefront.mobileHeroVideoId || "",
    mobileHeroVideoIdEn: sourceStorefront.mobileHeroVideoIdEn || "",
    mobileHeroVideoIdAr: sourceStorefront.mobileHeroVideoIdAr || "",
    mobileHeroPosterId: sourceStorefront.mobileHeroPosterId || sourceStorefront.heroPosterId || "",
    heroSubtitleMediaIdEn: sourceStorefront.heroSubtitleMediaIdEn || "",
    heroSubtitleMediaIdAr: sourceStorefront.heroSubtitleMediaIdAr || "",
    heroPrimaryCtaLabel: sourceStorefront.heroPrimaryCtaLabel || seeded.heroPrimaryCtaLabel || "",
    heroPrimaryCtaLabel_i18n:
      sourceStorefront.heroPrimaryCtaLabel_i18n || seeded.heroPrimaryCtaLabel_i18n || {},
    heroPrimaryCtaUrl:
      rewriteTargetUrl(sourceStorefront.heroPrimaryCtaUrl, sourceBrand, targetBrand) ||
      seeded.heroPrimaryCtaUrl ||
      "",
    heroSecondaryCtaLabel: sourceStorefront.heroSecondaryCtaLabel || seeded.heroSecondaryCtaLabel || "",
    heroSecondaryCtaLabel_i18n:
      sourceStorefront.heroSecondaryCtaLabel_i18n || seeded.heroSecondaryCtaLabel_i18n || {},
    heroSecondaryCtaUrl:
      rewriteTargetUrl(sourceStorefront.heroSecondaryCtaUrl, sourceBrand, targetBrand) ||
      seeded.heroSecondaryCtaUrl ||
      "",
    storyTitle: sourceStorefront.storyTitle || seeded.storyTitle || "",
    storyTitle_i18n: sourceStorefront.storyTitle_i18n || seeded.storyTitle_i18n || {},
    storyBody: sourceStorefront.storyBody || seeded.storyBody || "",
    storyBody_i18n: sourceStorefront.storyBody_i18n || seeded.storyBody_i18n || {},
    valuesTitle: sourceStorefront.valuesTitle || seeded.valuesTitle || "",
    valuesTitle_i18n: sourceStorefront.valuesTitle_i18n || seeded.valuesTitle_i18n || {},
    brandPromise: sourceStorefront.brandPromise || seeded.brandPromise || "",
    brandPromise_i18n: sourceStorefront.brandPromise_i18n || seeded.brandPromise_i18n || {},
    keyBenefitsTitle: sourceStorefront.keyBenefitsTitle || seeded.keyBenefitsTitle || "",
    keyBenefitsTitle_i18n:
      sourceStorefront.keyBenefitsTitle_i18n || seeded.keyBenefitsTitle_i18n || {},
    offerHighlightsTitle: sourceStorefront.offerHighlightsTitle || seeded.offerHighlightsTitle || "",
    offerHighlightsTitle_i18n:
      sourceStorefront.offerHighlightsTitle_i18n || seeded.offerHighlightsTitle_i18n || {},
    socialProofTitle: sourceStorefront.socialProofTitle || seeded.socialProofTitle || "",
    socialProofTitle_i18n:
      sourceStorefront.socialProofTitle_i18n || seeded.socialProofTitle_i18n || {},
    faqTitle: sourceStorefront.faqTitle || seeded.faqTitle || "",
    faqTitle_i18n: sourceStorefront.faqTitle_i18n || seeded.faqTitle_i18n || {},
    featured: Boolean(sourceStorefront.featured),
    spotlight: Boolean(sourceStorefront.spotlight),
    launchDate: sourceStorefront.launchDate || null,
    featuredOrder: sourceStorefront.featuredOrder || 0,
    editorialOrder: sourceStorefront.editorialOrder || 0,
    launchOrder: sourceStorefront.launchOrder || 0,
    accentColor: sourceStorefront.accentColor || "#2BA9A8",
    surfaceColor: sourceStorefront.surfaceColor || "#0F1315",
    textColor: sourceStorefront.textColor || "#FFFFFF",
    borderColor: sourceStorefront.borderColor || "#D6E6E6",
    mutedTextColor: sourceStorefront.mutedTextColor || "#8CA0A8",
    themeMode: sourceStorefront.themeMode || "dark",
    headingFont: sourceStorefront.headingFont || "",
    bodyFont: sourceStorefront.bodyFont || "",
    typographyScale: sourceStorefront.typographyScale || "balanced",
    sectionSpacingScale: sourceStorefront.sectionSpacingScale || "balanced",
    layoutDensity: sourceStorefront.layoutDensity || "balanced",
    buttonStyle: sourceStorefront.buttonStyle || "rounded",
    heroOverlayStyle: sourceStorefront.heroOverlayStyle || "rich",
    cardTone: sourceStorefront.cardTone || "elevated",
    surfaceTone: sourceStorefront.surfaceTone || "dark",
    imageryTone: sourceStorefront.imageryTone || "editorial",
    heroLayout: sourceStorefront.heroLayout || seeded.heroLayout || getDefaultHeroLayoutForTemplate(templateKey),
    serviceTitle: sourceStorefront.serviceTitle || seeded.serviceTitle || "",
    serviceTitle_i18n: sourceStorefront.serviceTitle_i18n || seeded.serviceTitle_i18n || {},
    serviceDescription: sourceStorefront.serviceDescription || seeded.serviceDescription || "",
    serviceDescription_i18n:
      sourceStorefront.serviceDescription_i18n || seeded.serviceDescription_i18n || {},
    serviceEmail: sourceStorefront.serviceEmail || "",
    servicePhone: sourceStorefront.servicePhone || "",
    serviceHours: sourceStorefront.serviceHours || seeded.serviceHours || "",
    serviceUrl: sourceStorefront.serviceUrl || "",
    seoTitle: sourceStorefront.seoTitle || "",
    seoTitle_i18n: sourceStorefront.seoTitle_i18n || {},
    seoDescription: sourceStorefront.seoDescription || "",
    seoDescription_i18n: sourceStorefront.seoDescription_i18n || {},
    values: normalizeArrayFromSource(sourceStorefront.values, seeded.values).map((value) => ({
      title: value.title || "",
      title_i18n: value.title_i18n || {},
      description: value.description || "",
      description_i18n: value.description_i18n || {},
      mediaId: value.mediaId || "",
    })),
    keyBenefits: normalizeArrayFromSource(sourceStorefront.keyBenefits, seeded.keyBenefits).map((item) => ({
      eyebrow: item.eyebrow || "",
      eyebrow_i18n: item.eyebrow_i18n || {},
      title: item.title || "",
      title_i18n: item.title_i18n || {},
      description: item.description || "",
      description_i18n: item.description_i18n || {},
      mediaId: item.mediaId || "",
      icon: item.icon || "",
    })),
    offerHighlights: normalizeArrayFromSource(sourceStorefront.offerHighlights, seeded.offerHighlights).map((item) => ({
      eyebrow: item.eyebrow || "",
      eyebrow_i18n: item.eyebrow_i18n || {},
      title: item.title || "",
      title_i18n: item.title_i18n || {},
      description: item.description || "",
      description_i18n: item.description_i18n || {},
      mediaId: item.mediaId || "",
      icon: item.icon || "",
    })),
    socialProof: normalizeArrayFromSource(sourceStorefront.socialProof, seeded.socialProof).map((item) => ({
      headline: item.headline || "",
      headline_i18n: item.headline_i18n || {},
      value: item.value || "",
      label: item.label || "",
      label_i18n: item.label_i18n || {},
      description: item.description || "",
      description_i18n: item.description_i18n || {},
      mediaId: item.mediaId || "",
    })),
    faqItems: normalizeArrayFromSource(sourceStorefront.faqItems, seeded.faqItems).map((item) => ({
      question: item.question || "",
      question_i18n: item.question_i18n || {},
      answer: item.answer || "",
      answer_i18n: item.answer_i18n || {},
    })),
    finalCta: {
      ...(sourceStorefront.finalCta || seeded.finalCta || {}),
      primaryAction: {
        ...((sourceStorefront.finalCta || seeded.finalCta || {}).primaryAction || {}),
        url: rewriteTargetUrl(
          (sourceStorefront.finalCta || seeded.finalCta || {}).primaryAction?.url,
          sourceBrand,
          targetBrand,
        ),
      },
      secondaryAction: {
        ...((sourceStorefront.finalCta || seeded.finalCta || {}).secondaryAction || {}),
        url: rewriteTargetUrl(
          (sourceStorefront.finalCta || seeded.finalCta || {}).secondaryAction?.url,
          sourceBrand,
          targetBrand,
        ),
      },
    },
    promoBlocks: ensureArray(sourceStorefront.promoBlocks).map((block) => ({
      backgroundColor: block.backgroundColor || "",
      title: block.title || "",
      title_i18n: block.title_i18n || {},
      subTitle: block.subTitle || "",
      subTitle_i18n: block.subTitle_i18n || {},
      ctaLabel: block.ctaLabel || "",
      ctaLabel_i18n: block.ctaLabel_i18n || {},
      mediaId: block.mediaId || "",
      placement: block.placement || "",
      targetUrl: rewriteTargetUrl(block.targetUrl, sourceBrand, targetBrand),
      priority: block.priority || 0,
    })),
    bannerAds: normalizeArrayFromSource(sourceStorefront.bannerAds, seeded.bannerAds).map((banner) => ({
      title: banner.title || "",
      title_i18n: banner.title_i18n || {},
      subTitle: banner.subTitle || "",
      subTitle_i18n: banner.subTitle_i18n || {},
      ctaLabel: banner.ctaLabel || "",
      ctaLabel_i18n: banner.ctaLabel_i18n || {},
      highlightValue: banner.highlightValue || "",
      highlightValue_i18n: banner.highlightValue_i18n || {},
      highlightLabel: banner.highlightLabel || "",
      highlightLabel_i18n: banner.highlightLabel_i18n || {},
      targetUrl: rewriteTargetUrl(banner.targetUrl, sourceBrand, targetBrand) || banner.targetUrl || "",
      mediaId: banner.mediaId || "",
      placement: banner.placement || "promo",
      backgroundColor: banner.backgroundColor || "#111827",
      priority: banner.priority || 0,
    })),
    serviceLinks: normalizeArrayFromSource(sourceStorefront.serviceLinks, []).map((link) => ({
      label: link.label || "",
      label_i18n: link.label_i18n || {},
      url: rewriteTargetUrl(link.url, sourceBrand, targetBrand),
    })),
    socialLinks: normalizeArrayFromSource(sourceStorefront.socialLinks, seeded.socialLinks).map((link) => ({
      label: link.label || "",
      label_i18n: link.label_i18n || {},
      url: rewriteTargetUrl(link.url, sourceBrand, targetBrand),
    })),
    footerTitle: sourceStorefront.footerTitle || seeded.footerTitle || "",
    footerTitle_i18n: sourceStorefront.footerTitle_i18n || seeded.footerTitle_i18n || {},
    footerDescription: sourceStorefront.footerDescription || seeded.footerDescription || "",
    footerDescription_i18n:
      sourceStorefront.footerDescription_i18n || seeded.footerDescription_i18n || {},
    privacyUrl: rewriteTargetUrl(sourceStorefront.privacyUrl, sourceBrand, targetBrand) || seeded.privacyUrl || "",
    termsUrl: rewriteTargetUrl(sourceStorefront.termsUrl, sourceBrand, targetBrand) || seeded.termsUrl || "",
    footerNavigationLinks: normalizeArrayFromSource(
      sourceStorefront.footerNavigationLinks,
      seeded.footerNavigationLinks,
    ).map((link) => ({
      label: link.label || "",
      label_i18n: link.label_i18n || {},
      url: rewriteTargetUrl(link.url, sourceBrand, targetBrand),
    })),
    templateModules: normalizeArrayFromSource(sourceStorefront.templateModules, seeded.templateModules),
    qaTag: sourceStorefront.qaTag || seeded.qaTag || "",
    qaSeeded: sourceStorefront.qaSeeded ?? seeded.qaSeeded ?? false,
    mediaGallery: ensureArray(sourceStorefront.mediaGallery).map((media, index) => ({
      mediaId: media.mediaId,
      type: media.type || "IMAGE",
      altText: media.altText || "",
      sortOrder: media.sortOrder || index + 1,
    })),
  };
}

function buildCollectionPayload(sourceCollection, targetBrand, sourceBrand, clonedProductIds) {
  return {
    brandId: targetBrand.id,
    title: sourceCollection.title || "",
    title_i18n: sourceCollection.title_i18n || {},
    description: sourceCollection.description || "",
    description_i18n: sourceCollection.description_i18n || {},
    sectionKey: sourceCollection.sectionKey || "",
    categoryId: sourceCollection.categoryId || "",
    productIds: clonedProductIds,
    searchQuery: `properties.brandId:${targetBrand.id}`,
    mediaId: sourceCollection.mediaId || "",
    ctaLabel: sourceCollection.ctaLabel || "",
    ctaLabel_i18n: sourceCollection.ctaLabel_i18n || {},
    ctaUrl: rewriteTargetUrl(sourceCollection.ctaUrl, sourceBrand, targetBrand),
    sortField: sourceCollection.sortField || "createdAt",
    sortDesc: sourceCollection.sortDesc !== false,
    displayOrder: sourceCollection.displayOrder || 0,
    maxProducts: sourceCollection.maxProducts || 8,
    featured: Boolean(sourceCollection.featured),
  };
}

function stripStorefrontSystemFields(storefront) {
  const {
    id,
    timestamp,
    type,
    appid,
    creatorid,
    updated,
    name,
    votes,
    version,
    stored,
    indexed,
    cached,
    objectURI,
    plural,
    createdAt,
    createdBy,
    modifiedAt,
    modifiedBy,
    ...properties
  } = storefront || {};

  return properties;
}

function buildProductPayload(sourceProduct, targetBrandId, merchantId, storeId) {
  const cleanPriceMap = Object.fromEntries(
    Object.entries(sourceProduct.skus?.[0]?.price || {}).map(([countryCode, price]) => [
      countryCode,
      {
        countryCode,
        listPrice: price.listPrice ?? 0,
        costPrice: price.costPrice ?? 0,
        salePercent: price.salePercent ?? 0,
        saleStart: price.saleStart || null,
        saleEnd: price.saleEnd || null,
        wholesalePriceList: ensureArray(price.wholesalePriceList).map((tier) => ({
          minQty: tier.minQty,
          price: tier.price,
          priceType: tier.priceType || "VALUE",
        })),
      },
    ]),
  );

  return {
    brandId: targetBrandId,
    merchantId,
    segmentId: sourceProduct.segmentId,
    categoryId: sourceProduct.categoryId,
    taxId: sourceProduct.taxId,
    priceIncludesTax: true,
    allowGiftWrap: Boolean(sourceProduct.allowGiftWrap),
    allowBackOrder: Boolean(sourceProduct.allowBackOrder),
    fulfillBy: sourceProduct.fulfillBy || "MERCHANT",
    fulfillmentTimeInDays: sourceProduct.fulfillmentTimeInDays ?? 0,
    storeId,
    title: sourceProduct.title_i18n?.en || sourceProduct.title || "",
    title_i18n: sourceProduct.title_i18n || { en: sourceProduct.title || "", ar: sourceProduct.title || "" },
    description: sourceProduct.description || null,
    description_i18n: sourceProduct.description_i18n || null,
    status: sourceProduct.status || "PUBLISHED",
    comment: sourceProduct.comment || null,
    shippableCountries: ensureArray(sourceProduct.shippableCountries).length
      ? sourceProduct.shippableCountries
      : ["JO"],
    hsCode: sourceProduct.hsCode || null,
    metaTitle: sourceProduct.metaTitle || null,
    metaTitle_i18n: sourceProduct.metaTitle_i18n || null,
    metaDescription: sourceProduct.metaDescription || null,
    metaDescription_i18n: sourceProduct.metaDescription_i18n || null,
    catalogId: sourceProduct.catalogId || null,
    tags: ensureArray(sourceProduct.tags).length ? sourceProduct.tags : null,
    originCountryCode: sourceProduct.originCountryCode || "JO",
    isActive: sourceProduct.isActive !== false,
    shippingInstructions: ensureArray(sourceProduct.shippingInstructions).length
      ? sourceProduct.shippingInstructions
      : null,
    productType: sourceProduct.productType || null,
    returnable: sourceProduct.returnable !== false,
    isCouponApplicable: sourceProduct.isCouponApplicable !== false,
    mediaList: ensureArray(sourceProduct.mediaList).map((media, index) => ({
      mediaId: media.mediaId,
      type: media.type || "IMAGE",
      altText: media.altText || "",
      sortOrder: media.sortOrder || index + 1,
    })),
    productSectionList: ensureArray(sourceProduct.productSectionList).length
      ? sourceProduct.productSectionList.map((section) => ({
          title: section.title || "",
          title_i18n: section.title_i18n || {},
          description: section.description || "",
          description_i18n: section.description_i18n || {},
        }))
      : null,
    skus: ensureArray(sourceProduct.skus).map((sku) => ({
      code: sku.code || null,
      barcode: sku.barcode || null,
      moq: sku.moq || 1,
      packQty: sku.packQty || 1,
      dimensions: {
        length: sku.dimensions?.length || 0,
        width: sku.dimensions?.width || 0,
        height: sku.dimensions?.height || 0,
        unit: sku.dimensions?.unit || "cm",
      },
      weight: {
        value: sku.weight?.value || 0,
        unit: sku.weight?.unit || "kg",
      },
      status: sku.status || "PUBLISHED",
      comment: sku.comment || null,
      mediaList: ensureArray(sku.mediaList).map((media, index) => ({
        mediaId: media.mediaId,
        type: media.type || "IMAGE",
        altText: media.altText || "",
        sortOrder: media.sortOrder || index + 1,
      })),
      attributeValues: sku.attributeValues || null,
      price: Object.keys(cleanPriceMap).length ? cleanPriceMap : null,
      inventory: {
        onHand: sku.inventory?.onHand || 0,
        reserved: sku.inventory?.reserved || 0,
        safetyStock: sku.inventory?.safetyStock || 0,
        reorderPoint: sku.inventory?.reorderPoint || 0,
      },
    })),
  };
}

async function getExistingBrandByKey(key) {
  const authMode = bearerToken ? "bearer" : "public";
  const candidateQueries = [
    `properties.key:${key}`,
    `properties.key:"${key}"`,
    explicitOwnerId ? `properties.ownerId:${explicitOwnerId}` : null,
  ].filter(Boolean);

  for (const query of candidateQueries) {
    const page = await request("brands", {
      auth: authMode,
      params: { q: query, limit: 100 },
    });

    const exactMatch =
      ensureArray(page?.items).find((item) => item?.key === key) ||
      ensureArray(page?.items).find((item) => item?.slug === key) ||
      ensureArray(page?.items).find((item) => item?.id === key);

    if (exactMatch) {
      return exactMatch;
    }
  }

  return null;
}

async function upsertStorefront(targetBrand, sourceWorkspace, templateKey) {
  const existingPage = await request("manage/brand-landing", {
    auth: "bearer",
    params: {
      limit: 200,
    },
  });
  const existing = ensureArray(existingPage?.items).find((item) => item?.brandId === targetBrand.id);

  const payload = buildStorefrontPayload(
    sourceWorkspace.storefront,
    targetBrand.id,
    templateKey,
    sourceWorkspace.brand,
    targetBrand,
    sourceWorkspace,
    sourceWorkspace.sourceProducts || [],
  );

  if (existing?.id) {
    const updated = await request(`manage/brand-landing/${existing.id}`, {
      method: "PUT",
      auth: "bearer",
      body: payload,
    });

    if (updated?.templateKey !== templateKey) {
      return request(`mpbrandstorelandingpage/${existing.id}`, {
        method: "PUT",
        auth: "bearer",
        body: {
          ...stripStorefrontSystemFields(updated),
          templateKey,
        },
      });
    }

    return updated;
  }

  const created = await request("manage/brand-landing", {
    method: "POST",
    auth: "bearer",
    body: payload,
  });

  if (created?.id && created?.templateKey !== templateKey) {
    return request(`mpbrandstorelandingpage/${created.id}`, {
      method: "PUT",
      auth: "bearer",
      body: {
        ...stripStorefrontSystemFields(created),
        templateKey,
      },
    });
  }

  return created;
}

async function upsertCollections(targetBrand, sourceWorkspace, sourceToTargetProductIds) {
  const existingPage = await request("manage/brand-collections", {
    auth: "bearer",
    params: {
      q: `properties.brandId:${targetBrand.id}`,
      limit: 100,
    },
  });

  const existingBySectionKey = new Map(
    ensureArray(existingPage?.items).map((collection) => [collection.sectionKey, collection]),
  );

  const results = [];
  for (const sourceCollection of sourceWorkspace.collections) {
    const clonedProductIds = take(
      ensureArray(sourceCollection.items)
        .map((item) => sourceToTargetProductIds.get(item.productId))
        .filter(Boolean),
      sourceCollection.maxProducts || 8,
    );

    const payload = buildCollectionPayload(
      sourceCollection,
      targetBrand,
      sourceWorkspace.brand,
      clonedProductIds,
    );

    const existing = existingBySectionKey.get(sourceCollection.sectionKey);
    if (existing?.id) {
      results.push(
        await request(`manage/brand-collections/${existing.id}`, {
          method: "PUT",
          auth: "bearer",
          body: payload,
        }),
      );
      continue;
    }

    results.push(
      await request("manage/brand-collections", {
        method: "POST",
        auth: "bearer",
        body: payload,
      }),
    );
  }

  return results;
}

async function createOrReuseTargetBrands(sourceWorkspace) {
  const explicitTargets = buildExplicitTargetDefinitions(sourceWorkspace.storefront.templateKey);
  if (explicitTargets.length) {
    const authMode = bearerToken ? "bearer" : "public";
    const targetBrands = [];
    for (const target of explicitTargets) {
      const brand = await resolveBrandByRef(target.ref, authMode);
      targetBrands.push({
        ...brand,
        templateKey: target.templateKey,
      });
    }
    return targetBrands;
  }

  if (!shouldApply) {
    return previewSpecs.map((spec) => ({
      id: null,
      key: spec.key,
      brandName: buildPreviewBrandName(spec),
      templateKey: spec.templateKey,
    }));
  }

  if (!bearerToken || !explicitOwnerId) {
    throw new Error("XAP_TOKEN and OWNER_ID are required to create preview brands");
  }

  const targetBrands = [];
  for (const spec of previewSpecs) {
    const existing = await getExistingBrandByKey(spec.key);
    if (existing && !shouldForce) {
      targetBrands.push({
        ...existing,
        templateKey: spec.templateKey,
      });
      continue;
    }

    if (existing && shouldForce) {
      targetBrands.push({
        ...existing,
        templateKey: spec.templateKey,
      });
      continue;
    }

    const payload = buildBrandCreatePayload(sourceWorkspace.brand, spec);
    const created = await request("brands", {
      method: "POST",
      auth: "bearer",
      body: payload,
    });
    targetBrands.push({
      ...created,
      templateKey: spec.templateKey,
    });
  }

  return targetBrands;
}

async function getTargetBrandProductCount(brandId) {
  const page = await request("products/skus", {
    auth: "public",
    params: {
      q: `properties.brandId:${brandId}`,
      limit: 1,
    },
  });
  return Number(page?.totalHits || 0);
}

async function targetBrandHasProducts(brandId) {
  return (await getTargetBrandProductCount(brandId)) > 0;
}

async function waitForBrandProductCount(brandId, expectedCount, label) {
  const deadline = Date.now() + IMPORT_WAIT_TIMEOUT_MS;
  let lastCount = -1;

  while (Date.now() < deadline) {
    const count = await getTargetBrandProductCount(brandId);

    if (count !== lastCount) {
      console.log(`[import] ${label}: detected ${count}/${expectedCount} products on target brand`);
      lastCount = count;
    }

    if (count >= expectedCount) {
      return count;
    }

    await sleep(IMPORT_POLL_MS);
  }

  throw new Error(`Timed out waiting for ${expectedCount} imported products on ${label}`);
}

async function cloneProductsIntoBrand(targetBrand, sourceProducts) {
  if (PRODUCT_SYNC_MODE === "sheet") {
    return importWorkbookIntoBrand(targetBrand, sourceProducts);
  }

  if (!bearerToken) {
    throw new Error("XAP_TOKEN is required to clone products");
  }

  const merchantId = explicitMerchantId || sourceProducts[0]?.merchantId;
  const storeId = explicitStoreId || sourceProducts[0]?.storeId;

  if (!merchantId || !storeId) {
    throw new Error("MERCHANT_ID and STORE_ID are required when source products do not expose usable values");
  }

  const existingProducts = await targetBrandHasProducts(targetBrand.id);
  if (existingProducts && !shouldForce) {
    return new Map();
  }

  const sourceToTargetProductIds = new Map();
  for (const product of sourceProducts) {
    const payload = buildProductPayload(product, targetBrand.id, merchantId, storeId);
    const created = await request("manage/products", {
      method: "POST",
      auth: "bearer",
      body: payload,
    });
    sourceToTargetProductIds.set(product.id, created.id);
    await sleep(150);
  }

  return sourceToTargetProductIds;
}

async function buildImportWorkbook(targetBrand) {
  const outputWorkbookPath = path.join(IMPORT_WORK_DIR, `${targetBrand.key || targetBrand.id}.xlsx`);
  const manifestPath = path.join(IMPORT_WORK_DIR, `${targetBrand.key || targetBrand.id}.json`);

  await mkdir(IMPORT_WORK_DIR, { recursive: true });

  const args = [
    WORKBOOK_HELPER_PATH,
    "--input",
    SOURCE_WORKBOOK_PATH,
    "--output",
    outputWorkbookPath,
    "--manifest",
    manifestPath,
    "--target-brand-key",
    targetBrand.key,
    "--product-limit",
    String(DEFAULT_PRODUCT_LIMIT),
    "--identifier-prefix",
    targetBrand.key,
  ];

  if (KEEP_SOURCE_IDENTIFIERS) {
    args.push("--keep-source-identifiers");
  }

  const { stdout, stderr } = await execFile(PYTHON_BIN, args, {
    cwd: ROOT_DIR,
    maxBuffer: 1024 * 1024 * 8,
  });

  if (stderr?.trim()) {
    console.error(stderr.trim());
  }

  const manifest = JSON.parse(stdout || "{}");
  return {
    outputWorkbookPath,
    manifestPath,
    manifest,
  };
}

function resolveUploadedFileId(payload) {
  const normalized = normalizeResponse(payload);
  return (
    normalized?.id ||
    normalized?.fileId ||
    normalized?.sheetId ||
    payload?.id ||
    payload?.fileId ||
    payload?.sheetId ||
    null
  );
}

function resolveJobId(payload) {
  const normalized = normalizeResponse(payload);
  return (
    normalized?.jobId ||
    payload?.jobId ||
    (typeof normalized === "string" ? normalized : null) ||
    (typeof payload?.result === "string" ? payload.result : null) ||
    (typeof payload?.data === "string" ? payload.data : null) ||
    null
  );
}

async function uploadWorkbook(workbookPath) {
  const fileBuffer = await readFile(workbookPath);
  let lastError = null;

  for (const uploadUrl of FILE_UPLOAD_URLS) {
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
      body: fileBuffer,
    });

    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const error = new Error(payload?.message || `Upload failed with status ${response.status}`);
      error.status = response.status;
      error.payload = payload;
      lastError = error;

      if (![404, 415].includes(response.status)) {
        throw error;
      }

      continue;
    }

    const fileId = resolveUploadedFileId(payload);
    if (!fileId) {
      const error = new Error("Upload succeeded but did not return a file id");
      error.payload = payload;
      throw error;
    }

    return {
      fileId,
      payload,
      uploadUrl,
    };
  }

  throw lastError || new Error("Workbook upload failed");
}

async function validateImportSheet(sheetId, merchantId, storeId) {
  return request("import-sheet/validate", {
    method: "POST",
    auth: "bearer",
    body: {
      sheetId,
      merchantId,
      storeId,
    },
  });
}

async function startImportJob(sheetId, merchantId, storeId) {
  const payload = await request("import-sheet", {
    method: "POST",
    auth: "bearer",
    body: {
      sheetId,
      merchantId,
      storeId,
    },
  });

  const jobId = resolveJobId(payload);
  if (!jobId) {
    const error = new Error("Import request succeeded but did not return a job id");
    error.payload = payload;
    throw error;
  }

  return {
    jobId,
    payload,
  };
}

async function waitForImportJob(jobId, label = jobId) {
  let lastStatus = null;
  while (true) {
    let payload;
    try {
      payload = await request(`import/status/${jobId}`, {
        auth: "bearer",
      });
    } catch (error) {
      error.message = `Import status check failed for job ${jobId} (${label}): ${error.message}`;
      throw error;
    }
    const job = normalizeImportJobStatus(payload);
    const status = String(job?.status || job?.properties?.status || "").toUpperCase();

    if (status && status !== lastStatus) {
      console.log(`[import] ${label}: job ${jobId} status=${status}`);
      lastStatus = status;
    }

    if (["COMPLETED", "FAILED"].includes(status)) {
      return {
        job,
        status,
      };
    }

    await sleep(IMPORT_POLL_MS);
  }
}

async function importWorkbookIntoBrand(targetBrand, sourceProducts) {
  if (!bearerToken) {
    throw new Error("XAP_TOKEN is required to import products from workbook");
  }

  const merchantId = explicitMerchantId || sourceProducts[0]?.merchantId;
  const storeId = explicitStoreId || sourceProducts[0]?.storeId;

  if (!merchantId || !storeId) {
    throw new Error("MERCHANT_ID and STORE_ID are required to import workbook previews");
  }

  const workbookExists = await fileExists(SOURCE_WORKBOOK_PATH);
  if (!workbookExists) {
    throw new Error(`Workbook not found: ${SOURCE_WORKBOOK_PATH}`);
  }

  const existingProducts = await targetBrandHasProducts(targetBrand.id);
  if (existingProducts && !shouldForce) {
    return new Map();
  }

  const { outputWorkbookPath, manifest } = await buildImportWorkbook(targetBrand);
  const uploadResult = await uploadWorkbook(outputWorkbookPath);
  await validateImportSheet(uploadResult.fileId, merchantId, storeId);

  const { jobId } = await startImportJob(uploadResult.fileId, merchantId, storeId);
  const targetLabel = targetBrand.brandName || targetBrand.key || targetBrand.id;
  const expectedCount = Math.min(sourceProducts.length, DEFAULT_PRODUCT_LIMIT);
  console.log(`[import] ${targetLabel}: started job ${jobId} via ${uploadResult.uploadUrl}`);
  let statusResult;

  try {
    statusResult = await waitForImportJob(jobId, targetLabel);
  } catch (error) {
    console.warn(`[import] ${targetLabel}: status polling failed (${error.message}). Falling back to product-count verification.`);
    await waitForBrandProductCount(targetBrand.id, expectedCount, targetLabel);
    return manifest;
  }

  const { status, job } = statusResult;

  if (status !== "COMPLETED") {
    const error = new Error(`Import job failed for ${targetBrand.brandName || targetBrand.key}`);
    error.payload = job;
    throw error;
  }

  const failureCount = Number(job?.properties?.failureCount || 0);
  const successCount = Number(job?.properties?.successCount || 0);

  console.log(
    `[import] ${targetBrand.brandName || targetBrand.key}: ${successCount} products processed from workbook ${path.basename(outputWorkbookPath)}`,
  );

  if (failureCount > 0) {
    console.warn(
      `[import] ${targetBrand.brandName || targetBrand.key}: completed with ${failureCount} failures`,
    );
  }

  if (manifest?.productsWritten) {
    console.log(
      `[import] ${targetBrand.brandName || targetBrand.key}: prepared ${manifest.productsWritten} product groups for import`,
    );
  }

  return new Map();
}

function printPlan(sourceWorkspace, sourceProducts, targetBrands) {
  console.log("Source brand:");
    console.log(`- ${sourceWorkspace.brand.brandName} (${sourceWorkspace.brand.id})`);
    console.log(`- template: ${sourceWorkspace.storefront.templateKey}`);
    console.log(`- collections: ${sourceWorkspace.collections.length}`);
    console.log(`- selected products: ${sourceProducts.length}`);
    console.log(`- product sync mode: ${PRODUCT_SYNC_MODE}`);
  if (PRODUCT_SYNC_MODE === "sheet") {
    console.log(`- source workbook: ${SOURCE_WORKBOOK_PATH}`);
    console.log(`- upload endpoint(s): ${FILE_UPLOAD_URLS.join(", ")}`);
  }
  console.log("");
  console.log("Preview targets:");
  for (const targetBrand of targetBrands) {
    console.log(
      `- ${targetBrand.brandName || targetBrand.key} | template=${targetBrand.templateKey} | key=${targetBrand.key || "(pending)"}`,
    );
  }
  console.log("");
  console.log("Preview routes:");
  for (const targetBrand of targetBrands) {
    const brandPath = targetBrand.id
      ? `${BRAND_APP_ORIGIN}${buildBrandPath(targetBrand)}`
      : `${BRAND_APP_ORIGIN}/brands/${targetBrand.key}`;
    console.log(`- ${targetBrand.templateKey}: ${brandPath}`);
  }
}

async function main() {
  if (argv.includes("--help")) {
    console.log(usage.trim());
    return;
  }

  const sourceBrand = await resolveBrandByRef(SOURCE_BRAND_REF);
  const sourceWorkspace = await getSourceWorkspace(sourceBrand);
  const sourceProducts = await getSourceProducts(sourceWorkspace.collections, DEFAULT_PRODUCT_LIMIT);
  sourceWorkspace.sourceProducts = sourceProducts;
  const targetBrands = await createOrReuseTargetBrands(sourceWorkspace);

  if (!shouldApply) {
    printPlan(sourceWorkspace, sourceProducts, targetBrands);
    return;
  }

  const previewSummary = [];
  for (const targetBrand of targetBrands) {
    const sourceToTargetProductIds = await cloneProductsIntoBrand(targetBrand, sourceProducts);

    if (!sourceToTargetProductIds.size && !shouldForce) {
      console.log(
        `[skip] ${targetBrand.brandName}: target brand already has products, leaving existing product set in place`,
      );
    }

    await upsertCollections(targetBrand, sourceWorkspace, sourceToTargetProductIds);
    await upsertStorefront(targetBrand, sourceWorkspace, targetBrand.templateKey);

    previewSummary.push({
      brandName: targetBrand.brandName,
      templateKey: targetBrand.templateKey,
      route: `${BRAND_APP_ORIGIN}${buildBrandPath(targetBrand)}`,
    });
  }

  console.log("Preview brands ready:");
  for (const item of previewSummary) {
    console.log(`- ${item.templateKey}: ${item.brandName} -> ${item.route}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  if (error.payload) {
    console.error(JSON.stringify(error.payload, null, 2));
  }
  process.exit(1);
});
