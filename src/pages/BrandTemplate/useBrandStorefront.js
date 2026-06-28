import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams, useSearchParams } from "react-router-dom";

import { environment } from "../../environments/environment";
import {
  getDefaultBrandMarketModules,
  getDefaultHeroLayoutForTemplate,
  resolveBrandMarketTemplateKey,
  resolveConfiguredBrandMarketModules,
} from "../../helper/brandMarketConfig";
import { buildBrandMarketPath } from "../../helper/brandRoutes";
import { getBrandTemplateCopy } from "./brandTemplateCopy";

const anonymousHeaders = undefined;

const buildAnonymousRequestConfig = (config = {}) => ({
  ...config,
  headers: anonymousHeaders,
  params: {
    accessKey: environment.appid,
    ...(config?.params || {}),
  },
});

const getEditorHeaders = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const token = window.localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : null;
};

const isObjectId = (value) => /^\d{10,}$/.test(String(value || "").trim());

const ensureArray = (value) => (Array.isArray(value) ? value : []);


const resolveTemplateOverride = (value) => {
  const normalizedValue = String(value || "").trim();
  if (!normalizedValue) {
    return "";
  }

  return resolveBrandMarketTemplateKey(normalizedValue);
};

const escapeQueryValue = (value) => String(value || "").replace(/"/g, '\\"').trim();

const buildBrandLookupQueries = (brandRef) => {
  const normalizedRef = escapeQueryValue(brandRef);
  if (!normalizedRef) {
    return [];
  }

  return [
    `properties.key:${normalizedRef}`,
    `properties.key:"${normalizedRef}"`,
    `properties.slug:${normalizedRef}`,
    `properties.slug:"${normalizedRef}"`,
    `properties.brandName:"${normalizedRef.replace(/-/g, " ")}"`,
  ];
};

const findCollectionsBySection = (collections = [], sectionKeys = []) =>
  collections.filter((collection) => {
    const sectionKey = String(collection?.sectionKey || "").toLowerCase();
    return sectionKeys.some((candidate) => candidate.toLowerCase() === sectionKey);
  });

const dedupeProducts = (products = []) => {
  const seen = new Set();

  return products.filter((product) => {
    const identifier = String(product?.id || product?.productId || "").trim();
    if (!identifier || seen.has(identifier)) {
      return false;
    }

    seen.add(identifier);
    return true;
  });
};

const toRankNumber = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const sortProducts = (products = [], rankers = []) =>
  [...products].sort((left, right) => {
    for (const ranker of rankers) {
      const delta = ranker(right) - ranker(left);
      if (delta !== 0) {
        return delta;
      }
    }

    return String(left?.productTitle || left?.name || left?.id || "").localeCompare(
      String(right?.productTitle || right?.name || right?.id || ""),
    );
  });

const takeProducts = (products = [], limit = 8) => dedupeProducts(products).slice(0, limit);

const buildDerivedShelves = (collections = []) => {
  const allProducts = takeProducts(collections.flatMap((collection) => collection?.items || []), 24);
  const featuredCollections = findCollectionsBySection(collections, [
    "featured",
    "featured_collection",
    "featured-collection",
    "spotlight",
  ]);
  const storyCollections = findCollectionsBySection(collections, ["story_collection", "story-collection", "story"]);

  const bestSellerSeedCollection =
    findCollectionsBySection(collections, ["best_sellers", "best-sellers", "bestsellers"])[0] ||
    featuredCollections[0] ||
    collections[0];
  const recommendedSeedCollection =
    findCollectionsBySection(collections, ["recommended"])[0] ||
    storyCollections[0] ||
    collections.find((collection) => collection?.id !== bestSellerSeedCollection?.id) ||
    featuredCollections[0] ||
    collections[0];

  return {
    bestSellers: bestSellerSeedCollection?.items?.length
      ? takeProducts(bestSellerSeedCollection.items)
      : takeProducts(
          sortProducts(allProducts, [
            (product) => toRankNumber(product?.orderCount),
            (product) => toRankNumber(product?.ratingCount),
            (product) => toRankNumber(product?.createdAt || product?.updatedAt || product?.timestamp),
          ]),
        ),
    newArrivals: takeProducts(
      sortProducts(allProducts, [
        (product) => toRankNumber(product?.createdAt || product?.updatedAt || product?.timestamp),
        (product) => toRankNumber(product?.orderCount),
      ]),
    ),
    recommended: recommendedSeedCollection?.items?.length
      ? takeProducts(recommendedSeedCollection.items)
      : takeProducts(
          sortProducts(allProducts, [
            (product) => toRankNumber(product?.rating),
            (product) => toRankNumber(product?.ratingCount),
            (product) => toRankNumber(product?.orderCount),
            (product) => toRankNumber(product?.createdAt || product?.updatedAt || product?.timestamp),
          ]),
        ),
  };
};

const resolveShelfSection = (section, collections, sectionKeys, fallbackItems = []) => {
  if (Array.isArray(section?.items) && section.items.length > 0) {
    return {
      ...section,
      items: takeProducts(section.items),
    };
  }

  const matchedCollections = findCollectionsBySection(collections, sectionKeys);
  if (matchedCollections[0]?.items?.length) {
    return {
      source: "collection",
      items: takeProducts(matchedCollections[0].items),
      collectionId: matchedCollections[0]?.id || null,
    };
  }

  return {
    source: "fallback",
    items: takeProducts(fallbackItems),
    collectionId: null,
  };
};

export const getLocalizedField = (value, i18nValue, language, fallback = "") => {
  if (i18nValue && typeof i18nValue === "object") {
    return i18nValue[language] || i18nValue.en || value || fallback;
  }
  return value || fallback;
};

const INTERNAL_COPY_PATTERN =
  /(qa[-\s]?seed|qa\b|template preview|cloned catalog|preview assortment|mapped collections|template data active|verification|imported assortment|seeded navigation|seeded products|template-system|preview brand|storefront for full template|layout verification|live template)/i;

const buildLocalizedPair = (en, ar = en) => ({
  en,
  ar,
});

const hasInternalCopy = (value) => {
  if (Array.isArray(value)) {
    return value.some((entry) => hasInternalCopy(entry));
  }

  if (value && typeof value === "object") {
    return Object.values(value).some((entry) => hasInternalCopy(entry));
  }

  return INTERNAL_COPY_PATTERN.test(String(value || ""));
};

const uniqueList = (items = []) => [...new Set(items.filter(Boolean))];

const joinLabels = (labels = [], language = "en") => {
  const cleaned = uniqueList(labels).slice(0, 4);
  if (!cleaned.length) {
    return language === "ar"
      ? "العناية اليومية والجمال والعناية الذاتية"
      : "everyday care, beauty, and self-care";
  }

  if (cleaned.length === 1) {
    return cleaned[0];
  }

  if (cleaned.length === 2) {
    return language === "ar" ? `${cleaned[0]} و${cleaned[1]}` : `${cleaned[0]} and ${cleaned[1]}`;
  }

  const head = cleaned.slice(0, -1).join(", ");
  return language === "ar"
    ? `${head} و${cleaned[cleaned.length - 1]}`
    : `${head}, and ${cleaned[cleaned.length - 1]}`;
};

const getCategoryLabel = (category, language = "en") =>
  getLocalizedField(category?.categoryName, category?.name_i18n, language, "");

const getCollectionTitle = (
  collection,
  language = "en",
  fallback = getBrandTemplateCopy(language, "defaults.collection"),
) =>
  getLocalizedField(collection?.title, collection?.title_i18n, language, fallback);

const getProductTitle = (
  product,
  language = "en",
  fallback = getBrandTemplateCopy(language, "defaults.product"),
) =>
  getLocalizedField(
    product?.productTitle || product?.title || product?.name,
    product?.productTitle_i18n || product?.title_i18n,
    language,
    fallback,
  );

const getCollectionMediaId = (collection) =>
  collection?.mediaId || collection?.items?.[0]?.mediaList?.[0]?.mediaId || collection?.items?.[0]?.mediaId || "";

const getProductMediaId = (product) => product?.mediaList?.[0]?.mediaId || product?.mediaId || "";

const normalizeTextValue = (value, fallback = "") => {
  if (value === undefined || value === null) {
    return fallback;
  }

  return String(value);
};

const isNextGenerationStorefrontPayload = (payload) =>
  Boolean(
    payload &&
      typeof payload === "object" &&
      payload.localeContent &&
      typeof payload.localeContent === "object" &&
      (payload.themeTokens || payload.assetRefs || payload.publicationStatus),
  );

const getLocaleSection = (localeContent, locale, sectionKey) => {
  const localeDocument = localeContent?.[locale];
  const section = localeDocument?.[sectionKey];
  return section && typeof section === "object" ? section : {};
};

const buildLocalizedText = (enValue, arValue, fallback = "") => {
  const english = normalizeTextValue(enValue, fallback);
  const arabic = normalizeTextValue(arValue, english || fallback);
  return {
    value: english || fallback,
    i18n: buildLocalizedPair(english || fallback, arabic || english || fallback),
  };
};

const resolveAssetMediaId = (assetRefs = [], purposes = [], fallback = "") => {
  const normalizedPurposes = purposes.map((purpose) => String(purpose || "").trim().toLowerCase());
  const match = ensureArray(assetRefs).find((assetRef) =>
    normalizedPurposes.includes(String(assetRef?.purpose || "").trim().toLowerCase()),
  );
  return match?.assetId || fallback;
};

const mergeLocalizedAction = (enAction = {}, arAction = {}, fallbackLabel = "", fallbackUrl = "") => {
  const localizedLabel = buildLocalizedText(
    enAction?.label || enAction?.ctaLabel,
    arAction?.label || arAction?.ctaLabel,
    fallbackLabel,
  );

  return {
    label: localizedLabel.value,
    label_i18n: localizedLabel.i18n,
    url: normalizeTextValue(enAction?.url || arAction?.url, fallbackUrl),
    style: normalizeTextValue(enAction?.style || arAction?.style, "primary"),
  };
};

const mergeLocalizedLinks = (enLinks = [], arLinks = []) => {
  const itemCount = Math.max(ensureArray(enLinks).length, ensureArray(arLinks).length);

  return Array.from({ length: itemCount }, (_, index) => {
    const english = enLinks[index] || {};
    const arabic = arLinks[index] || {};
    const localizedLabel = buildLocalizedText(english?.label, arabic?.label, "");
    const url = normalizeTextValue(english?.url || arabic?.url, "");

    return {
      label: localizedLabel.value,
      label_i18n: localizedLabel.i18n,
      url,
    };
  }).filter((item) => item.label || item.url);
};

const mergeLocalizedCardItems = (enItems = [], arItems = []) => {
  const itemCount = Math.max(ensureArray(enItems).length, ensureArray(arItems).length);

  return Array.from({ length: itemCount }, (_, index) => {
    const english = enItems[index] || {};
    const arabic = arItems[index] || {};
    const eyebrow = buildLocalizedText(english?.eyebrow, arabic?.eyebrow, "");
    const title = buildLocalizedText(english?.title, arabic?.title, "");
    const description = buildLocalizedText(english?.description, arabic?.description, "");

    return {
      eyebrow: eyebrow.value,
      eyebrow_i18n: eyebrow.i18n,
      title: title.value,
      title_i18n: title.i18n,
      description: description.value,
      description_i18n: description.i18n,
      mediaId: normalizeTextValue(english?.mediaId || arabic?.mediaId, ""),
      icon: normalizeTextValue(english?.icon || arabic?.icon, ""),
    };
  }).filter((item) => item.title || item.description || item.mediaId || item.icon);
};

const mergeLocalizedSocialProofItems = (enItems = [], arItems = []) => {
  const itemCount = Math.max(ensureArray(enItems).length, ensureArray(arItems).length);

  return Array.from({ length: itemCount }, (_, index) => {
    const english = enItems[index] || {};
    const arabic = arItems[index] || {};
    const headline = buildLocalizedText(english?.headline, arabic?.headline, "");
    const label = buildLocalizedText(english?.label, arabic?.label, "");
    const description = buildLocalizedText(english?.description, arabic?.description, "");

    return {
      headline: headline.value,
      headline_i18n: headline.i18n,
      value: normalizeTextValue(english?.value || arabic?.value, ""),
      label: label.value,
      label_i18n: label.i18n,
      description: description.value,
      description_i18n: description.i18n,
      mediaId: normalizeTextValue(english?.mediaId || arabic?.mediaId, ""),
    };
  }).filter((item) => item.headline || item.label || item.value || item.description || item.mediaId);
};

const mergeLocalizedFaqItems = (enItems = [], arItems = []) => {
  const itemCount = Math.max(ensureArray(enItems).length, ensureArray(arItems).length);

  return Array.from({ length: itemCount }, (_, index) => {
    const english = enItems[index] || {};
    const arabic = arItems[index] || {};
    const question = buildLocalizedText(english?.question, arabic?.question, "");
    const answer = buildLocalizedText(english?.answer, arabic?.answer, "");

    return {
      question: question.value,
      question_i18n: question.i18n,
      answer: answer.value,
      answer_i18n: answer.i18n,
    };
  }).filter((item) => item.question || item.answer);
};

const mergeLocalizedBannerItems = (enItems = [], arItems = []) => {
  const itemCount = Math.max(ensureArray(enItems).length, ensureArray(arItems).length);

  return Array.from({ length: itemCount }, (_, index) => {
    const english = enItems[index] || {};
    const arabic = arItems[index] || {};
    const title = buildLocalizedText(english?.title, arabic?.title, "");
    const subTitle = buildLocalizedText(english?.subTitle, arabic?.subTitle, "");
    const ctaLabel = buildLocalizedText(english?.ctaLabel, arabic?.ctaLabel, "");
    const highlightValue = buildLocalizedText(english?.highlightValue, arabic?.highlightValue, "");
    const highlightLabel = buildLocalizedText(english?.highlightLabel, arabic?.highlightLabel, "");

    return {
      title: title.value,
      title_i18n: title.i18n,
      subTitle: subTitle.value,
      subTitle_i18n: subTitle.i18n,
      ctaLabel: ctaLabel.value,
      ctaLabel_i18n: ctaLabel.i18n,
      highlightValue: highlightValue.value,
      highlightValue_i18n: highlightValue.i18n,
      highlightLabel: highlightLabel.value,
      highlightLabel_i18n: highlightLabel.i18n,
      targetUrl: normalizeTextValue(english?.targetUrl || arabic?.targetUrl, ""),
      mediaId: normalizeTextValue(english?.mediaId || arabic?.mediaId, ""),
      placement: normalizeTextValue(english?.placement || arabic?.placement, "promo"),
      backgroundColor: normalizeTextValue(english?.backgroundColor || arabic?.backgroundColor, ""),
      priority: Number(english?.priority ?? arabic?.priority ?? 0),
    };
  }).filter((item) => item.title || item.subTitle || item.mediaId || item.targetUrl);
};

const normalizeNextGenerationStorefront = (storefront, brand) => {
  const localeContent = storefront?.localeContent || {};
  const assetRefs = ensureArray(storefront?.assetRefs);
  const enHero = getLocaleSection(localeContent, "en", "hero");
  const arHero = getLocaleSection(localeContent, "ar", "hero");
  const enStory = getLocaleSection(localeContent, "en", "story");
  const arStory = getLocaleSection(localeContent, "ar", "story");
  const enValueProps = getLocaleSection(localeContent, "en", "valueprops");
  const arValueProps = getLocaleSection(localeContent, "ar", "valueprops");
  const enVisualIdentity = getLocaleSection(localeContent, "en", "visualidentity");
  const arVisualIdentity = getLocaleSection(localeContent, "ar", "visualidentity");
  const enTrust = getLocaleSection(localeContent, "en", "trust");
  const arTrust = getLocaleSection(localeContent, "ar", "trust");
  const enProductHighlights = getLocaleSection(localeContent, "en", "producthighlights");
  const arProductHighlights = getLocaleSection(localeContent, "ar", "producthighlights");
  const enSocialProof = getLocaleSection(localeContent, "en", "socialproof");
  const arSocialProof = getLocaleSection(localeContent, "ar", "socialproof");
  const enFaq = getLocaleSection(localeContent, "en", "faq");
  const arFaq = getLocaleSection(localeContent, "ar", "faq");
  const enBannerAds = getLocaleSection(localeContent, "en", "bannerads");
  const arBannerAds = getLocaleSection(localeContent, "ar", "bannerads");
  const enCta = getLocaleSection(localeContent, "en", "cta");
  const arCta = getLocaleSection(localeContent, "ar", "cta");
  const enFooter = getLocaleSection(localeContent, "en", "footeressentials");
  const arFooter = getLocaleSection(localeContent, "ar", "footeressentials");
  const enService = getLocaleSection(localeContent, "en", "service");
  const arService = getLocaleSection(localeContent, "ar", "service");
  const enMobileFirst = getLocaleSection(localeContent, "en", "mobilefirst");
  const arMobileFirst = getLocaleSection(localeContent, "ar", "mobilefirst");
  const heroEyebrow = buildLocalizedText(enHero?.eyebrow, arHero?.eyebrow, "");
  const heroTitle = buildLocalizedText(enHero?.title, arHero?.title, brand?.brandName || "");
  const heroDescription = buildLocalizedText(enHero?.description, arHero?.description, "");
  const storyTitle = buildLocalizedText(enStory?.title, arStory?.title, "");
  const storyBody = buildLocalizedText(enStory?.body, arStory?.body, "");
  const promiseText = buildLocalizedText(enVisualIdentity?.promise, arVisualIdentity?.promise, "");
  const serviceTitle = buildLocalizedText(enService?.title, arService?.title, "");
  const serviceDescription = buildLocalizedText(enService?.description, arService?.description, "");
  const footerTitle = buildLocalizedText(enFooter?.title, arFooter?.title, brand?.brandName || "");
  const footerDescription = buildLocalizedText(enFooter?.description, arFooter?.description, "");
  const ctaTitle = buildLocalizedText(enCta?.title, arCta?.title, "");
  const ctaSubTitle = buildLocalizedText(enCta?.subTitle, arCta?.subTitle, "");
  const heroLayout = normalizeTextValue(
    enMobileFirst?.heroLayout || arMobileFirst?.heroLayout,
    getDefaultHeroLayoutForTemplate(storefront?.templateKey),
  );
  const templateModules = Array.isArray(enMobileFirst?.templateModules)
    ? enMobileFirst.templateModules
    : Array.isArray(arMobileFirst?.templateModules)
      ? arMobileFirst.templateModules
      : getDefaultBrandMarketModules(storefront?.templateKey);

  return {
    ...storefront,
    hero: {
      eyebrow: heroEyebrow.value,
      eyebrow_i18n: heroEyebrow.i18n,
      title: heroTitle.value,
      title_i18n: heroTitle.i18n,
      description: heroDescription.value,
      description_i18n: heroDescription.i18n,
      tagline: brand?.brandName || heroTitle.value,
      tagline_i18n: buildLocalizedPair(
        brand?.brandName || heroTitle.value,
        brand?.brandName || heroTitle.i18n?.ar || heroTitle.value,
      ),
      mediaId: normalizeTextValue(
        enHero?.mediaId || arHero?.mediaId,
        resolveAssetMediaId(assetRefs, ["hero-media", "hero"], brand?.catalogId || brand?.logoId || ""),
      ),
      mobileMediaId: normalizeTextValue(
        enHero?.mobileMediaId || arHero?.mobileMediaId,
        resolveAssetMediaId(assetRefs, ["hero-mobile-media", "mobile-hero"], ""),
      ),
      posterId: normalizeTextValue(
        enHero?.posterId || arHero?.posterId,
        resolveAssetMediaId(assetRefs, ["hero-poster"], ""),
      ),
      primaryCta: mergeLocalizedAction(
        enHero?.primaryAction || {
          label: enHero?.primaryCtaLabel,
          url: enHero?.primaryCtaUrl,
        },
        arHero?.primaryAction || {
          label: arHero?.primaryCtaLabel,
          url: arHero?.primaryCtaUrl,
        },
        "",
        "",
      ),
      secondaryCta: mergeLocalizedAction(
        enHero?.secondaryAction || {
          label: enHero?.secondaryCtaLabel,
          url: enHero?.secondaryCtaUrl,
        },
        arHero?.secondaryAction || {
          label: arHero?.secondaryCtaLabel,
          url: arHero?.secondaryCtaUrl,
        },
        "",
        "",
      ),
      heroLayout,
    },
    story: {
      title: storyTitle.value,
      title_i18n: storyTitle.i18n,
      body: storyBody.value,
      body_i18n: storyBody.i18n,
    },
    valuesBlock: {
      title: buildLocalizedText(enValueProps?.title, arValueProps?.title, "").value,
      title_i18n: buildLocalizedText(enValueProps?.title, arValueProps?.title, "").i18n,
      items: mergeLocalizedCardItems(enValueProps?.items, arValueProps?.items),
    },
    brandPromise: promiseText.value,
    brandPromise_i18n: promiseText.i18n,
    keyBenefitsBlock: {
      title: buildLocalizedText(enTrust?.title, arTrust?.title, "").value,
      title_i18n: buildLocalizedText(enTrust?.title, arTrust?.title, "").i18n,
      items: mergeLocalizedCardItems(enTrust?.items, arTrust?.items),
    },
    offerHighlightsBlock: {
      title: buildLocalizedText(enProductHighlights?.title, arProductHighlights?.title, "").value,
      title_i18n: buildLocalizedText(enProductHighlights?.title, arProductHighlights?.title, "").i18n,
      items: mergeLocalizedCardItems(enProductHighlights?.items, arProductHighlights?.items),
    },
    socialProofBlock: {
      title: buildLocalizedText(enSocialProof?.title, arSocialProof?.title, "").value,
      title_i18n: buildLocalizedText(enSocialProof?.title, arSocialProof?.title, "").i18n,
      items: mergeLocalizedSocialProofItems(enSocialProof?.items, arSocialProof?.items),
    },
    faqBlock: {
      title: buildLocalizedText(enFaq?.title, arFaq?.title, "").value,
      title_i18n: buildLocalizedText(enFaq?.title, arFaq?.title, "").i18n,
      items: mergeLocalizedFaqItems(enFaq?.items, arFaq?.items),
    },
    bannerAds: mergeLocalizedBannerItems(enBannerAds?.items, arBannerAds?.items),
    finalCta: {
      title: ctaTitle.value,
      title_i18n: ctaTitle.i18n,
      subTitle: ctaSubTitle.value,
      subTitle_i18n: ctaSubTitle.i18n,
      mediaId: normalizeTextValue(
        enCta?.mediaId || arCta?.mediaId,
        resolveAssetMediaId(assetRefs, ["final-cta-media", "cta-media"], ""),
      ),
      backgroundColor: normalizeTextValue(enCta?.backgroundColor || arCta?.backgroundColor, ""),
      primaryAction: mergeLocalizedAction(
        enCta?.primaryAction,
        arCta?.primaryAction,
        "",
        "",
      ),
      secondaryAction: mergeLocalizedAction(
        enCta?.secondaryAction,
        arCta?.secondaryAction,
        "",
        "",
      ),
    },
    footer: {
      title: footerTitle.value,
      title_i18n: footerTitle.i18n,
      description: footerDescription.value,
      description_i18n: footerDescription.i18n,
      navigationLinks: mergeLocalizedLinks(enFooter?.navigationLinks, arFooter?.navigationLinks),
      socialLinks: mergeLocalizedLinks(enFooter?.socialLinks, arFooter?.socialLinks),
      privacyUrl: normalizeTextValue(enFooter?.privacyUrl || arFooter?.privacyUrl, ""),
      termsUrl: normalizeTextValue(enFooter?.termsUrl || arFooter?.termsUrl, ""),
    },
    service: {
      title: serviceTitle.value,
      title_i18n: serviceTitle.i18n,
      description: serviceDescription.value,
      description_i18n: serviceDescription.i18n,
      email: normalizeTextValue(enService?.email || arService?.email, ""),
      phone: normalizeTextValue(enService?.phone || arService?.phone, ""),
      hours: normalizeTextValue(enService?.hours || arService?.hours, ""),
      url: normalizeTextValue(enService?.url || arService?.url, ""),
      links: mergeLocalizedLinks(enService?.links, arService?.links),
    },
    theme: storefront?.themeTokens || {},
    template: {
      ...(storefront?.template || {}),
      key: storefront?.templateKey,
      modules: templateModules,
      heroLayout,
    },
    templateModules,
    heroLayout,
  };
};

const createEmptyBlock = (block = {}) => ({
  ...block,
  title: block?.title || "",
  title_i18n: block?.title_i18n || {},
  items: [],
});

const sanitizeStorefrontForPublicRender = (data) => {
  const shouldStripInternalCopy =
    Boolean(data?.storefront?.qaSeeded) ||
    hasInternalCopy([
      data?.story,
      data?.brandPromise,
      data?.valuesBlock,
      data?.keyBenefitsBlock,
      data?.offerHighlightsBlock,
      data?.socialProofBlock,
      data?.faqBlock,
      data?.bannerAds,
      data?.service,
      data?.footer,
      data?.finalCta,
    ]);

  if (!shouldStripInternalCopy) {
    return data;
  }

  return {
    ...data,
    story: {},
    brandPromise: "",
    brandPromise_i18n: {},
    valuesBlock: createEmptyBlock(data?.valuesBlock),
    keyBenefitsBlock: createEmptyBlock(data?.keyBenefitsBlock),
    offerHighlightsBlock: createEmptyBlock(data?.offerHighlightsBlock),
    socialProofBlock: createEmptyBlock(data?.socialProofBlock),
    faqBlock: createEmptyBlock(data?.faqBlock),
    bannerAds: [],
    service: {
      ...(data?.service || {}),
      description: "",
      description_i18n: {},
    },
    footer: {
      ...(data?.footer || {}),
      navigationLinks: Array.isArray(data?.footer?.navigationLinks)
        ? data.footer.navigationLinks.filter((link) => !hasInternalCopy(link))
        : [],
    },
    finalCta: {
      ...(data?.finalCta || {}),
      title: "",
      title_i18n: {},
      subTitle: "",
      subTitle_i18n: {},
      primaryAction: data?.finalCta?.primaryAction || {},
      secondaryAction: data?.finalCta?.secondaryAction || {},
    },
  };
};

const resolveBrand = async (brandRef, fallbackBrandId) => {
  if (fallbackBrandId) {
    const { data } = await axios.get(
      `${environment.serverOrigin}brands/${fallbackBrandId}`,
      buildAnonymousRequestConfig(),
    );
    return data;
  }

  if (!brandRef) {
    return null;
  }

  if (isObjectId(brandRef)) {
    try {
      const { data } = await axios.get(
        `${environment.serverOrigin}brands/${brandRef}`,
        buildAnonymousRequestConfig(),
      );
      return data;
    } catch {
      // Fall through to query-based resolution. Numeric ids should normally resolve directly,
      // but keeping a search fallback avoids hard-failing on inconsistent public reads.
    }
  }

  let lastQueryError = null;
  for (const query of buildBrandLookupQueries(brandRef)) {
    try {
      const { data } = await axios.get(
        `${environment.serverOrigin}brands`,
        buildAnonymousRequestConfig({
          params: {
            q: query,
            limit: 1,
          },
        }),
      );

      if (data?.items?.[0]) {
        return data.items[0];
      }
    } catch (queryError) {
      lastQueryError = queryError;
    }
  }

  if (lastQueryError) {
    throw lastQueryError;
  }

  return null;
};

const extractSectionItems = (section) => (Array.isArray(section?.items) ? section.items : []);

const resolveStorefrontData = ({
  brand,
  storefront,
  collections,
  policies,
  placements,
  previewMode = false,
  templateOverride = "",
}) => {
  const normalizedStorefront = isNextGenerationStorefrontPayload(storefront)
    ? normalizeNextGenerationStorefront(storefront, brand)
    : storefront;
  const sections = normalizedStorefront?.sections || {};
  const derivedShelves = buildDerivedShelves(collections);
  const promoBlocks = Array.isArray(normalizedStorefront?.promoBlocks) ? normalizedStorefront.promoBlocks : [];
  const bannerAds = Array.isArray(normalizedStorefront?.bannerAds) ? normalizedStorefront.bannerAds : [];
  const resolvedTemplateKey = templateOverride || normalizedStorefront?.templateKey || "editorial-hero";
  const resolvedHeroLayout = templateOverride
    ? getDefaultHeroLayoutForTemplate(templateOverride)
    : normalizedStorefront?.template?.heroLayout || normalizedStorefront?.hero?.heroLayout || normalizedStorefront?.heroLayout || "";
  const resolvedTemplateModules = resolveConfiguredBrandMarketModules(
    resolvedTemplateKey,
    normalizedStorefront?.template?.modules || normalizedStorefront?.templateModules || [],
  );
  const placementCampaigns =
    placements?.filter(
      (placement) => !["hero"].includes(String(placement?.placement || "").toLowerCase()),
    ) || [];
  const featuredCollections =
    Array.isArray(sections?.featuredCollections) && sections.featuredCollections.length > 0
      ? sections.featuredCollections
      : collections.filter(
          (collection) =>
            collection?.featured ||
            ["featured", "featured_collection", "featured-collection", "spotlight"].includes(
              String(collection?.sectionKey || "").toLowerCase(),
            ),
        );

  return sanitizeStorefrontForPublicRender({
    id: normalizedStorefront?.id || "",
    status: normalizedStorefront?.status || "",
    publicationStatus: normalizedStorefront?.publicationStatus || "",
    previewMode: Boolean(previewMode || normalizedStorefront?.previewMode),
    legacyAdapter: normalizedStorefront?.legacyAdapter ?? null,
    dataSource: normalizedStorefront?.dataSource ?? null,
    publishedBy: normalizedStorefront?.publishedBy || null,
    createdAt: normalizedStorefront?.createdAt || null,
    updatedAt: normalizedStorefront?.updatedAt || null,
    brand,
    storefront: normalizedStorefront,
    collections,
    policies,
    placements,
    bannerAds,
    categories: normalizedStorefront?.categories || [],
    templateKey: resolvedTemplateKey,
    canonicalPath: buildBrandMarketPath(brand),
    hero: {
      ...(normalizedStorefront?.hero || {}),
      heroLayout: resolvedHeroLayout,
    },
    theme: normalizedStorefront?.theme || {},
    service: normalizedStorefront?.service || {},
    story: normalizedStorefront?.story || {},
    valuesBlock: normalizedStorefront?.valuesBlock || { items: normalizedStorefront?.values || [] },
    brandPromise: normalizedStorefront?.brandPromise || "",
    brandPromise_i18n: normalizedStorefront?.brandPromise_i18n || {},
    keyBenefitsBlock:
      normalizedStorefront?.keyBenefitsBlock || {
        title: normalizedStorefront?.keyBenefitsTitle || "",
        title_i18n: normalizedStorefront?.keyBenefitsTitle_i18n || {},
        items: normalizedStorefront?.keyBenefits || [],
      },
    offerHighlightsBlock:
      normalizedStorefront?.offerHighlightsBlock || {
        title: normalizedStorefront?.offerHighlightsTitle || "",
        title_i18n: normalizedStorefront?.offerHighlightsTitle_i18n || {},
        items: normalizedStorefront?.offerHighlights || [],
      },
    socialProofBlock:
      normalizedStorefront?.socialProofBlock || {
        title: normalizedStorefront?.socialProofTitle || "",
        title_i18n: normalizedStorefront?.socialProofTitle_i18n || {},
        items: normalizedStorefront?.socialProof || [],
      },
    faqBlock:
      normalizedStorefront?.faqBlock || {
        title: normalizedStorefront?.faqTitle || "",
        title_i18n: normalizedStorefront?.faqTitle_i18n || {},
        items: normalizedStorefront?.faqItems || [],
      },
    finalCta: normalizedStorefront?.finalCta || {},
    footer: normalizedStorefront?.footer || {},
    template: {
      ...(normalizedStorefront?.template || {}),
      key: resolvedTemplateKey,
      heroLayout: resolvedHeroLayout,
      modules: resolvedTemplateModules,
    },
    sections: {
      featuredCollections,
      bestSellers: resolveShelfSection(
        sections?.bestSellers,
        collections,
        ["best_sellers", "best-sellers", "bestsellers"],
        derivedShelves.bestSellers,
      ),
      newArrivals: resolveShelfSection(
        sections?.newArrivals,
        collections,
        ["new_arrivals", "new-arrivals", "newarrivals"],
        derivedShelves.newArrivals,
      ),
      recommended: resolveShelfSection(
        sections?.recommended,
        collections,
        ["recommended"],
        derivedShelves.recommended,
      ),
    },
    campaigns: [...promoBlocks, ...placementCampaigns],
  });
};

const preferNonEmptyArray = (primary, fallback = []) =>
  Array.isArray(primary) && primary.length > 0 ? primary : Array.isArray(fallback) ? fallback : [];

const unwrapStorefrontRecord = (payload) => {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  if (payload.properties && typeof payload.properties === "object") {
    return {
      ...payload.properties,
      id: payload.id || payload.properties.id || "",
      status: payload.status || payload.properties.status || "",
      createdAt: payload.createdAt || payload.properties.createdAt || null,
      updatedAt: payload.updatedAt || payload.properties.updatedAt || null,
    };
  }

  return payload;
};

const normalizePayload = (storefrontResponse, collectionsResponse, policiesResponse, placementsResponse) => {
  const storefront = unwrapStorefrontRecord(storefrontResponse?.data);
  const collections = preferNonEmptyArray(collectionsResponse?.data?.items, storefront?.collections);
  const policies = preferNonEmptyArray(policiesResponse?.data?.items, storefront?.policies);
  const placements = preferNonEmptyArray(placementsResponse?.data?.items, storefront?.placements);

  return {
    storefront,
    collections,
    policies,
    placements,
  };
};

const loadPreviewStorefront = async ({ brandId, storefrontId, headers }) => {
  if (storefrontId) {
    const { data } = await axios.get(`${environment.serverOrigin}manage/brand-storefronts/${storefrontId}`, {
      headers,
    });
    return unwrapStorefrontRecord(data);
  }

  const { data } = await axios.get(`${environment.serverOrigin}manage/brand-storefronts`, {
    headers,
    params: {
      q: `properties.brandId:${brandId}`,
      limit: 1,
    },
  });

  return unwrapStorefrontRecord(data?.items?.[0]);
};

const useBrandStorefront = () => {
  const { brandRef } = useParams();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null,
    loadingTemplateKey: "editorial-hero",
  });

  const brandIdFromQuery = searchParams.get("brandId");
  const storefrontIdFromQuery = searchParams.get("storefrontId");
  const templateOverride = resolveTemplateOverride(searchParams.get("template"));
  const previewToken = String(searchParams.get("preview") || "").trim();
  const adminPreviewMode = previewToken === "1";
  const publicPreviewMode = Boolean(previewToken) && !adminPreviewMode;
  const requestedPreviewMode = adminPreviewMode || publicPreviewMode;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setState((currentState) => ({
        ...currentState,
        loading: true,
        error: null,
      }));

      try {
        const brand = await resolveBrand(brandRef, brandIdFromQuery);

        if (!brand?.id) {
          throw new Error("Brand not found");
        }

        const editorHeaders = adminPreviewMode ? getEditorHeaders() : null;
        if (adminPreviewMode && !editorHeaders) {
          throw new Error("Preview requires an authenticated admin session");
        }

        const storefrontResponse = adminPreviewMode
          ? {
              data: await loadPreviewStorefront({
                brandId: brand.id,
                storefrontId: storefrontIdFromQuery,
                headers: editorHeaders,
              }),
            }
          : await axios.get(
              `${environment.serverOrigin}brands/${brand.id}/storefront`,
              buildAnonymousRequestConfig({
                params: publicPreviewMode
                  ? {
                      preview: previewToken,
                    }
                  : undefined,
              }),
            );

        const storefrontPayload = unwrapStorefrontRecord(storefrontResponse?.data);
        const loadingTemplateKey = templateOverride || storefrontPayload?.templateKey || "editorial-hero";

        if (!cancelled) {
          setState((currentState) => ({
            ...currentState,
            loading: true,
            error: null,
            loadingTemplateKey,
          }));
        }

        const [collectionsResponse, policiesResponse, placementsResponse] = await Promise.all([
          adminPreviewMode
            ? axios.get(`${environment.serverOrigin}brands/${brand.id}/collections`, {
                headers: editorHeaders,
              })
            : axios.get(
                `${environment.serverOrigin}brands/${brand.id}/collections`,
                buildAnonymousRequestConfig(),
              ),
          adminPreviewMode
            ? axios.get(`${environment.serverOrigin}policies/brand/${brand.id}`, {
                headers: editorHeaders,
              })
            : axios.get(
                `${environment.serverOrigin}policies/brand/${brand.id}`,
                buildAnonymousRequestConfig(),
              ),
          adminPreviewMode
            ? axios.get(`${environment.serverOrigin}ads/placements`, {
                headers: editorHeaders,
                params: {
                  scope: "brand",
                  brandId: brand.id,
                },
              })
            : axios.get(
                `${environment.serverOrigin}ads/placements`,
                buildAnonymousRequestConfig({
                  params: {
                    scope: "brand",
                    brandId: brand.id,
                  },
                }),
              ),
        ]);

        const normalized = normalizePayload(
          storefrontResponse,
          collectionsResponse,
          policiesResponse,
          placementsResponse,
        );

        if (cancelled) {
          return;
        }

        setState({
          loading: false,
          error: null,
          loadingTemplateKey,
          data: resolveStorefrontData({
            brand,
            storefront: normalized.storefront,
            collections: normalized.collections,
            policies: normalized.policies,
            placements: normalized.placements,
            previewMode: requestedPreviewMode,
            templateOverride,
          }),
          previewMode: requestedPreviewMode,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setState({
          loading: false,
          error: error?.message || "Failed to load brand storefront",
          data: null,
          loadingTemplateKey: "editorial-hero",
        });
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [brandIdFromQuery, brandRef, previewToken, adminPreviewMode, publicPreviewMode, requestedPreviewMode, storefrontIdFromQuery, templateOverride]);

  return useMemo(
    () => ({
      ...state,
      bestSellers: extractSectionItems(state.data?.sections?.bestSellers),
      newArrivals: extractSectionItems(state.data?.sections?.newArrivals),
      recommended: extractSectionItems(state.data?.sections?.recommended),
    }),
    [state],
  );
};

export default useBrandStorefront;
