import React, { useEffect, useMemo, useRef, useState } from "react";

import ProductCard from "../../components/ProductCard/ProductCard";
import { getItemPrice, imageUrl } from "../../helper/helper";
import { environment } from "../../environments/environment";
import { trackBrandMarketEvent } from "../../helper/brandMarketAnalytics";

import { getBrandTemplateCopy } from "./brandTemplateCopy";
import { getLocalizedField } from "./useBrandStorefront";

const TRACK_THRESHOLD = 0.35;

const getFileUrl = (mediaId) => (mediaId ? `${environment.fileUrl}${mediaId}` : "");

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const trimValue = (value) => String(value || "").trim();

const copy = (language, key, variables) => getBrandTemplateCopy(language, key, variables);

const isTruthy = (value) => value !== undefined && value !== null && value !== "";

const buildSectionAttributes = (sectionKey) =>
  sectionKey
    ? {
        "data-section": sectionKey,
        "data-section-key": sectionKey,
      }
    : {};

const useMediaQuery = (query) => {
  const getMatches = () =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(query).matches
      : false;

  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQuery = window.matchMedia(query);
    const handler = (event) => setMatches(event.matches);
    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
};

const useSectionImpression = (eventName, payload, enabled = true) => {
  const ref = useRef(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !ref.current || trackedRef.current || typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!trackedRef.current && entry.isIntersecting && entry.intersectionRatio >= TRACK_THRESHOLD) {
            trackedRef.current = true;
            trackBrandMarketEvent(eventName, payload);
          }
        });
      },
      { threshold: [TRACK_THRESHOLD] },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [enabled, eventName, payload]);

  return ref;
};

const buildActionLink = (action, fallbackLabel, fallbackUrl) => ({
  label: trimValue(action?.label),
  label_i18n: action?.label_i18n || {},
  url: trimValue(action?.url || fallbackUrl),
  style: trimValue(action?.style || "primary") || "primary",
  fallbackLabel,
});

const resolveHeroMedia = (hero, language, isMobile) => {
  const mobileHero = hero?.mobile || {};
  const subtitleMediaIds = hero?.subtitleMediaIds || {};
  const mobileSubtitleMediaIds = hero?.mobileSubtitleMediaIds || {};
  const localizedVideoId = language === "ar" ? hero?.videoIdAr : hero?.videoIdEn;
  const localizedMobileVideoId =
    language === "ar"
      ? hero?.mobileVideoIdAr || mobileHero?.videoIdAr
      : hero?.mobileVideoIdEn || mobileHero?.videoIdEn;
  const videoId = isMobile
    ? localizedMobileVideoId || hero?.mobileVideoId || mobileHero?.videoId || localizedVideoId || hero?.videoId
    : localizedVideoId || hero?.videoId;
  const posterId = isMobile
    ? hero?.mobilePosterId || mobileHero?.posterId || hero?.posterId
    : hero?.posterId || hero?.mobilePosterId || mobileHero?.posterId;
  const imageId = isMobile
    ? hero?.mobileMediaId || mobileHero?.mediaId || hero?.mediaId
    : hero?.mediaId || hero?.mobileMediaId || mobileHero?.mediaId;
  const subtitleId = isMobile
    ? language === "ar"
      ? hero?.mobileSubtitleMediaIdAr || mobileSubtitleMediaIds?.ar || subtitleMediaIds?.ar || hero?.subtitleMediaIdAr
      : hero?.mobileSubtitleMediaIdEn || mobileSubtitleMediaIds?.en || subtitleMediaIds?.en || hero?.subtitleMediaIdEn
    : language === "ar"
      ? subtitleMediaIds?.ar || hero?.subtitleMediaIdAr || hero?.mobileSubtitleMediaIdAr
      : subtitleMediaIds?.en || hero?.subtitleMediaIdEn || hero?.mobileSubtitleMediaIdEn;

  return {
    videoId,
    posterId,
    imageId,
    subtitleId,
  };
};

const BrandSectionHeader = ({
  eyebrow,
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = "text",
}) => {
  if (!title && !description && !actionLabel) {
    return null;
  }

  return (
    <div className="brand-market__section-header">
      <div className="brand-market__section-heading">
        {eyebrow ? <span className="brand-market__section-eyebrow">{eyebrow}</span> : null}
        {title ? <h2>{title}</h2> : null}
        {description ? <p>{description}</p> : null}
      </div>
      {actionLabel && onAction ? (
        <button
          type="button"
          className={`brand-market__action brand-market__action--${actionVariant}`}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
};

const BrandMediaImage = ({
  src,
  alt,
  className,
  loading = "lazy",
  fetchPriority = "low",
  ...props
}) => (
  <img
    src={src}
    alt={alt}
    className={className}
    loading={loading}
    decoding="async"
    fetchPriority={fetchPriority}
    {...props}
  />
);

const formatBrandMarketPrice = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "";
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const getCollectionMediaId = (collection) =>
  collection?.mediaId || collection?.items?.[0]?.mediaList?.[0]?.mediaId || "";

const getCollectionItemCount = (collection) => {
  const count = Number(
    collection?.productCount ??
      collection?.itemCount ??
      ensureArray(collection?.items).length ??
      0,
  );

  return Number.isFinite(count) && count > 0 ? count : 0;
};

const getProductTitle = (product, language) =>
  getLocalizedField(
    product?.productTitle,
    product?.productTitle_i18n,
    language,
    product?.name || product?.title || "",
  );

const getProductMediaId = (product) =>
  product?.mediaList?.[0]?.mediaId || product?.heroMediaId || product?.mediaId || "";

const FeaturedProductPanel = ({
  product,
  language,
  sectionKey,
  onAddToCart,
  onOpenProduct,
  tone = "default",
  introCard = null,
}) => {
  if (!product) {
    return null;
  }

  const title = getProductTitle(product, language);
  const mediaId = getProductMediaId(product);
  const { displayPrice, originalPrice, isOnSale } = getItemPrice(product);
  const currency = product?.price?.JO?.currencyCode || "JOD";
  const reviewCount = Number(product?.ratingCount || 0);
  const stockLeft = Number(product?.inventory?.availableToSell || product?.stockLevel || 0);

  return (
    <div className={`brand-market__featured-product brand-market__featured-product--${tone}`}>
      {introCard ? (
        <article className="brand-market__rail-editorial-card">
          {introCard?.eyebrow ? (
            <span className="brand-market__rail-editorial-eyebrow">{introCard.eyebrow}</span>
          ) : null}
          {introCard?.title ? <h3>{introCard.title}</h3> : null}
          {introCard?.description ? <p>{introCard.description}</p> : null}
          {introCard?.actionLabel && introCard?.onClick ? (
            <button
              type="button"
              className="brand-market__action brand-market__action--ghost"
              onClick={introCard.onClick}
            >
              {introCard.actionLabel}
            </button>
          ) : null}
        </article>
      ) : null}

      <div className="brand-market__featured-product-shell">
        <button
          type="button"
          className="brand-market__featured-product-media"
          onClick={() => onOpenProduct?.(product, sectionKey)}
        >
          {mediaId ? (
            <BrandMediaImage src={`${imageUrl}${mediaId}`} alt={title} />
          ) : (
            <div className="brand-market__featured-product-fallback">
              <span>{(title || copy(language, "defaults.product")).charAt(0)}</span>
            </div>
          )}
          {isOnSale ? (
            <span className="brand-market__featured-product-badge">
              {copy(language, "product.liveOffer")}
            </span>
          ) : null}
        </button>

        <div className="brand-market__featured-product-copy">
          <div className="brand-market__featured-product-heading">
            <span className="brand-market__featured-product-eyebrow">
              {copy(language, "product.featuredProductEyebrow")}
            </span>
            <h3>{title}</h3>
            <p>
              {reviewCount > 0
                ? copy(language, "product.verifiedReviewSummary", { count: reviewCount })
                : copy(language, "product.featuredProductDescription")}
            </p>
          </div>

          <div className="brand-market__featured-product-meta">
            <div className="brand-market__featured-product-price">
              <strong>{`${currency} ${formatBrandMarketPrice(displayPrice)}`.trim()}</strong>
              {originalPrice ? <span>{`${currency} ${formatBrandMarketPrice(originalPrice)}`.trim()}</span> : null}
            </div>
            <div className="brand-market__featured-product-signals">
              <span>
                {Number(product?.rating || 0) > 0
                  ? `${Number(product.rating).toFixed(1)} / 5`
                  : copy(language, "product.noReviews")}
              </span>
              <span>
                {stockLeft > 0
                  ? copy(language, "product.leftCount", { count: stockLeft })
                  : copy(language, "product.available")}
              </span>
            </div>
          </div>

          <div className="brand-market__featured-product-actions">
            <button
              type="button"
              className="brand-market__action brand-market__action--primary"
              onClick={() => onOpenProduct?.(product, sectionKey)}
            >
              {copy(language, "product.viewProduct")}
            </button>
            <button
              type="button"
              className="brand-market__action brand-market__action--secondary"
              onClick={() => onAddToCart?.(product, sectionKey)}
            >
              {copy(language, "product.addToCart")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BrandHeroMedia = ({ hero, language, fallbackMediaId, className = "" }) => {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const resolvedHero = useMemo(
    () => ({
      mediaId: hero?.mediaId || "",
      mobileMediaId: hero?.mobileMediaId || hero?.mobile?.mediaId || "",
      videoId: hero?.videoId || "",
      videoIdEn: hero?.videoIdEn || "",
      videoIdAr: hero?.videoIdAr || "",
      mobileVideoId: hero?.mobileVideoId || hero?.mobile?.videoId || "",
      mobileVideoIdEn: hero?.mobileVideoIdEn || hero?.mobile?.videoIdEn || "",
      mobileVideoIdAr: hero?.mobileVideoIdAr || hero?.mobile?.videoIdAr || "",
      posterId: hero?.posterId || "",
      mobilePosterId: hero?.mobilePosterId || hero?.mobile?.posterId || "",
      subtitleMediaIdEn: hero?.subtitleMediaIdEn || "",
      subtitleMediaIdAr: hero?.subtitleMediaIdAr || "",
      mobileSubtitleMediaIdEn: hero?.mobileSubtitleMediaIdEn || "",
      mobileSubtitleMediaIdAr: hero?.mobileSubtitleMediaIdAr || "",
      mobile: hero?.mobile || {},
      subtitleMediaIds: hero?.subtitleMediaIds || {},
      mobileSubtitleMediaIds: hero?.mobileSubtitleMediaIds || {},
    }),
    [hero],
  );
  const media = resolveHeroMedia(resolvedHero, language, isMobile);
  const resolvedImage = media.imageId || fallbackMediaId;
  const posterUrl = media.posterId ? getFileUrl(media.posterId) : resolvedImage ? `${imageUrl}${resolvedImage}` : "";
  const mediaAlt =
    getLocalizedField(hero?.title, hero?.title_i18n, language, "") ||
    copy(language, "defaults.brandHeroMediaAlt");

  if (media.videoId) {
    return (
      <video
        className={`brand-market__hero-media ${className}`.trim()}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={posterUrl}
        aria-label={mediaAlt}
        title={mediaAlt}
      >
        <source src={getFileUrl(media.videoId)} type="video/mp4" />
        {media.subtitleId ? (
          <track
            kind="subtitles"
            srcLang={language}
            label={language === "ar" ? "Arabic" : "English"}
            src={getFileUrl(media.subtitleId)}
            default
          />
        ) : null}
      </video>
    );
  }

  if (resolvedImage) {
    return (
      <BrandMediaImage
        src={`${imageUrl}${resolvedImage}`}
        alt={mediaAlt}
        className={`brand-market__hero-media ${className}`.trim()}
        loading="eager"
        fetchPriority="high"
      />
    );
  }

  return <div className={`brand-market__hero-media brand-market__hero-media--fallback ${className}`.trim()} />;
};

export const BrandPromiseSection = ({
  title,
  promise,
  language,
  templateKey,
}) => {
  const localizedPromise = getLocalizedField(promise?.value, promise?.i18n, language, "");
  const sectionRef = useSectionImpression(
    "brand_market_section_view",
    {
      templateKey,
      sectionKey: "brand-promise",
      contentType: "promise",
    },
    Boolean(localizedPromise),
  );

  if (!localizedPromise) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="brand-market__module brand-market__module--promise"
      {...buildSectionAttributes("brand-promise")}
    >
      <BrandSectionHeader
        eyebrow={copy(language, "section.brandPromiseEyebrow")}
        title={title}
      />
      <div className="brand-market__promise-card">
        <p>{localizedPromise}</p>
      </div>
    </section>
  );
};

export const BrandBenefitsSection = ({
  eyebrow,
  title,
  description,
  items = [],
  language,
  templateKey,
  sectionKey,
}) => {
  const entries = ensureArray(items);
  const sectionRef = useSectionImpression(
    "brand_market_section_view",
    {
      templateKey,
      sectionKey,
      contentType: "cards",
      itemCount: entries.length,
    },
    entries.length > 0,
  );

  if (!entries.length) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="brand-market__module brand-market__module--cards"
      {...buildSectionAttributes(sectionKey)}
    >
      <BrandSectionHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="brand-market__benefit-grid">
        {entries.map((item, index) => {
          const itemTitle = getLocalizedField(
            item?.title,
            item?.title_i18n,
            language,
            `${copy(language, "defaults.card")} ${index + 1}`,
          );
          const itemDescription = getLocalizedField(item?.description, item?.description_i18n, language, "");
          const itemEyebrow = getLocalizedField(item?.eyebrow, item?.eyebrow_i18n, language, "");
          return (
            <article key={`${sectionKey}-${itemTitle}-${index}`} className="brand-market__benefit-card">
              {item?.mediaId ? (
                <BrandMediaImage
                  className="brand-market__benefit-media"
                  src={`${imageUrl}${item.mediaId}`}
                  alt={itemTitle}
                />
              ) : item?.icon ? (
                <span className="brand-market__benefit-icon" aria-hidden="true">
                  {item.icon}
                </span>
              ) : null}
              {itemEyebrow ? <span className="brand-market__benefit-eyebrow">{itemEyebrow}</span> : null}
              <h3>{itemTitle}</h3>
              {itemDescription ? <p>{itemDescription}</p> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
};

export const BrandSocialProofSection = ({
  title,
  description,
  items = [],
  language,
  templateKey,
}) => {
  const entries = ensureArray(items);
  const sectionRef = useSectionImpression(
    "brand_market_section_view",
    {
      templateKey,
      sectionKey: "social-proof",
      contentType: "proof",
      itemCount: entries.length,
    },
    entries.length > 0,
  );

  if (!entries.length) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="brand-market__module brand-market__module--proof"
      {...buildSectionAttributes("social-proof")}
    >
      <BrandSectionHeader
        eyebrow={copy(language, "section.customerVoicesEyebrow")}
        title={title}
        description={description}
      />
      <div className="brand-market__proof-grid">
        {entries.map((item, index) => {
          const headline = getLocalizedField(item?.headline, item?.headline_i18n, language, "");
          const label = getLocalizedField(item?.label, item?.label_i18n, language, "");
          const itemDescription = getLocalizedField(item?.description, item?.description_i18n, language, "");
          return (
            <article key={`proof-${headline}-${index}`} className="brand-market__proof-card brand-market__proof-card--voice">
              {item?.mediaId ? (
                <BrandMediaImage
                  className="brand-market__proof-media"
                  src={`${imageUrl}${item.mediaId}`}
                  alt={headline || label}
                />
              ) : null}
              <span className="brand-market__proof-quote-mark" aria-hidden="true">
                "
              </span>
              {headline ? <span className="brand-market__proof-headline">{headline}</span> : null}
              {item?.value ? <span className="brand-market__proof-signal">{item.value}</span> : null}
              {label ? <h3>{label}</h3> : null}
              {itemDescription ? <p>{itemDescription}</p> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
};

export const BrandFaqSection = ({
  title,
  items = [],
  language,
  templateKey,
}) => {
  const entries = ensureArray(items);
  const sectionRef = useSectionImpression(
    "brand_market_section_view",
    {
      templateKey,
      sectionKey: "faq",
      contentType: "faq",
      itemCount: entries.length,
    },
    entries.length > 0,
  );

  if (!entries.length) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="brand-market__module brand-market__module--faq"
      {...buildSectionAttributes("faq")}
    >
      <BrandSectionHeader
        eyebrow={copy(language, "section.faqEyebrow")}
        title={title}
      />
      <div className="brand-market__faq-list">
        {entries.map((item, index) => {
          const question = getLocalizedField(item?.question, item?.question_i18n, language, "");
          const answer = getLocalizedField(item?.answer, item?.answer_i18n, language, "");
          return (
            <details key={`faq-${index}`} className="brand-market__faq-item">
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          );
        })}
      </div>
    </section>
  );
};

export const BrandStorySection = ({
  eyebrow,
  title,
  story,
  language,
  templateKey,
  variant = "card",
}) => {
  const storyTitle = getLocalizedField(story?.title, story?.title_i18n, language, title);
  const storyBody = getLocalizedField(story?.body, story?.body_i18n, language, "");
  const sectionRef = useSectionImpression(
    "brand_market_section_view",
    {
      templateKey,
      sectionKey: "story",
      contentType: "story",
      variant,
    },
    Boolean(storyBody),
  );

  if (!storyBody) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className={`brand-market__module brand-market__module--story brand-market__module--story-${variant}`}
      {...buildSectionAttributes("story")}
    >
      <BrandSectionHeader eyebrow={eyebrow} title={storyTitle} />
      <div className="brand-market__story-card">
        <p>{storyBody}</p>
      </div>
    </section>
  );
};

export const BrandValueSection = ({
  title,
  items = [],
  language,
  templateKey,
}) => {
  const values = ensureArray(items);
  const sectionRef = useSectionImpression(
    "brand_market_section_view",
    {
      templateKey,
      sectionKey: "values",
      contentType: "values",
      itemCount: values.length,
    },
    values.length > 0,
  );

  if (!values.length) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="brand-market__module brand-market__module--values"
      {...buildSectionAttributes("values")}
    >
      <BrandSectionHeader eyebrow={copy(language, "section.brandValuesEyebrow")} title={title} />
      <div className="brand-market__value-grid">
        {values.map((item, index) => {
          const itemTitle = getLocalizedField(
            item?.title,
            item?.title_i18n,
            language,
            `${copy(language, "defaults.value")} ${index + 1}`,
          );
          const itemDescription = getLocalizedField(item?.description, item?.description_i18n, language, "");
          return (
            <article key={`value-${index}-${itemTitle}`} className="brand-market__value-card">
              {item?.mediaId ? (
                <BrandMediaImage
                  className="brand-market__value-media"
                  src={`${imageUrl}${item.mediaId}`}
                  alt={itemTitle}
                />
              ) : null}
              <h3>{itemTitle}</h3>
              {itemDescription ? <p>{itemDescription}</p> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
};

export const BrandCollectionGrid = ({
  title,
  description,
  collections = [],
  language,
  templateKey,
  sectionKey = "collections",
  onExploreCollection,
}) => {
  const entries = ensureArray(collections);
  const sectionRef = useSectionImpression(
    "brand_market_section_view",
    {
      templateKey,
      sectionKey,
      contentType: "collections",
      itemCount: entries.length,
    },
    entries.length > 0,
  );

  if (!entries.length) {
    return null;
  }

  const featuredCollection = entries[0];
  const supportingCollections = entries.slice(1, 5);
  const featuredTitle = getLocalizedField(
    featuredCollection?.title,
    featuredCollection?.title_i18n,
    language,
    copy(language, "defaults.collection"),
  );
  const featuredDescription = getLocalizedField(
    featuredCollection?.description,
    featuredCollection?.description_i18n,
    language,
    "",
  );
  const featuredMediaId = getCollectionMediaId(featuredCollection);
  const featuredCount = getCollectionItemCount(featuredCollection);

  return (
    <section
      ref={sectionRef}
      className="brand-market__module brand-market__module--collections"
      {...buildSectionAttributes(sectionKey)}
    >
      <BrandSectionHeader
        eyebrow={copy(language, "section.curatedCollectionsEyebrow")}
        title={title}
        description={description}
      />
      <div className="brand-market__collection-showcase">
        <button
          type="button"
          className="brand-market__collection-feature"
          onClick={() => onExploreCollection?.(featuredCollection, sectionKey)}
        >
          <div className="brand-market__collection-feature-media">
            {featuredMediaId ? (
              <BrandMediaImage src={`${imageUrl}${featuredMediaId}`} alt={featuredTitle} />
            ) : (
              <div className="brand-market__collection-fallback">{featuredTitle.slice(0, 1)}</div>
            )}
          </div>
          <div className="brand-market__collection-feature-copy">
            <span className="brand-market__collection-feature-eyebrow">
              {copy(language, "section.featuredCollectionEyebrow")}
            </span>
            <h3>{featuredTitle}</h3>
            {featuredDescription ? <p>{featuredDescription}</p> : null}
            <div className="brand-market__collection-feature-meta">
              {featuredCount > 0 ? (
                <span>
                  {language === "ar"
                    ? `${featuredCount} منتجات داخل المجموعة`
                    : `${featuredCount} products in this collection`}
                </span>
              ) : null}
              {trimValue(featuredCollection?.sectionKey) ? (
                <span>{String(featuredCollection.sectionKey).replaceAll("_", " ")}</span>
              ) : null}
            </div>
            <span className="brand-market__collection-feature-cta">
              {copy(language, "section.enterCollection")}
            </span>
          </div>
        </button>

        {supportingCollections.length ? (
          <div className="brand-market__collection-grid">
            {supportingCollections.map((collection, index) => {
              const collectionTitle = getLocalizedField(
                collection?.title,
                collection?.title_i18n,
                language,
                `${copy(language, "defaults.collection")} ${index + 2}`,
              );
              const collectionDescription = getLocalizedField(
                collection?.description,
                collection?.description_i18n,
                language,
                "",
              );
              const mediaId = getCollectionMediaId(collection);
              const collectionCount = getCollectionItemCount(collection);

              return (
                <article
                  key={collection.id || `${collectionTitle}-${index}`}
                  className="brand-market__collection-card brand-market__collection-card--supporting"
                >
                  <div className="brand-market__collection-media">
                    {mediaId ? (
                      <BrandMediaImage src={`${imageUrl}${mediaId}`} alt={collectionTitle} />
                    ) : (
                      <div className="brand-market__collection-fallback">{collectionTitle.slice(0, 1)}</div>
                    )}
                  </div>
                  <div className="brand-market__collection-body">
                    <h3>{collectionTitle}</h3>
                    {collectionDescription ? <p>{collectionDescription}</p> : null}
                    <div className="brand-market__collection-body-meta">
                      {collectionCount > 0 ? (
                        <span>
                          {language === "ar" ? `${collectionCount} منتجات` : `${collectionCount} products`}
                        </span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="brand-market__action brand-market__action--pill"
                      onClick={() => onExploreCollection?.(collection, sectionKey)}
                    >
                      {copy(language, "section.exploreCollection")}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export const BrandCollectionNavigation = ({
  title,
  collections = [],
  language,
  templateKey,
  sectionKey = "collection-navigation",
  onExploreCollection,
}) => {
  const entries = ensureArray(collections).slice(0, 6);
  const sectionRef = useSectionImpression(
    "brand_market_section_view",
    {
      templateKey,
      sectionKey: "collection-navigation",
      contentType: "collection-navigation",
      itemCount: entries.length,
    },
    entries.length > 0,
  );

  if (!entries.length) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="brand-market__module brand-market__module--collection-nav"
      {...buildSectionAttributes(sectionKey)}
    >
      <BrandSectionHeader
        eyebrow={copy(language, "section.collectionNavigationEyebrow")}
        title={title}
      />
      <div className="brand-market__collection-nav">
        {entries.map((collection, index) => {
          const collectionTitle = getLocalizedField(
            collection?.title,
            collection?.title_i18n,
            language,
            `${copy(language, "defaults.collection")} ${index + 1}`,
          );
          return (
            <button
              key={collection.id || `${collectionTitle}-${index}`}
              type="button"
              className="brand-market__collection-nav-item"
              onClick={() => onExploreCollection?.(collection, "collection-navigation")}
            >
              <span>{collectionTitle}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export const BrandCategoryHub = ({
  title,
  categories = [],
  language,
  templateKey,
  onSelectCategory,
  variant = "grid",
  sectionKey = "category-hub",
}) => {
  const entries = ensureArray(categories);
  const sectionRef = useSectionImpression(
    "brand_market_section_view",
    {
      templateKey,
      sectionKey: "category-hub",
      contentType: "categories",
      variant,
      itemCount: entries.length,
    },
    entries.length > 0,
  );

  if (!entries.length) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className={`brand-market__module brand-market__module--category-hub brand-market__module--category-hub-${variant}`}
      {...buildSectionAttributes(sectionKey)}
    >
      <BrandSectionHeader
        eyebrow={copy(language, "section.exploreCategoriesEyebrow")}
        title={title}
      />
      <div className={variant === "chips" ? "brand-market__chip-row" : "brand-market__category-grid"}>
        {entries.map((category) => {
          const label = getLocalizedField(
            category?.categoryName,
            category?.name_i18n,
            language,
            copy(language, "defaults.category"),
          );
          const imageId = category?.imageId;
          return (
            <button
              key={category.id || category.key || label}
              type="button"
              className={variant === "chips" ? "brand-market__chip" : "brand-market__category-card"}
              onClick={() => onSelectCategory?.(category)}
            >
              {variant === "grid" && imageId ? (
                <BrandMediaImage
                  src={`${imageUrl}${imageId}`}
                  alt={label}
                  className="brand-market__category-media"
                />
              ) : null}
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export const BrandMetricStrip = ({
  title,
  metrics = [],
  templateKey,
  sectionKey = "metrics",
}) => {
  const entries = ensureArray(metrics).filter((metric) => trimValue(metric?.label) && isTruthy(metric?.value));
  const sectionRef = useSectionImpression(
    "brand_market_section_view",
    {
      templateKey,
      sectionKey: "metrics",
      contentType: "metrics",
      itemCount: entries.length,
    },
    entries.length > 0,
  );

  if (!entries.length) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="brand-market__module brand-market__module--metrics"
      {...buildSectionAttributes(sectionKey)}
    >
      {title ? <BrandSectionHeader title={title} /> : null}
      <div className="brand-market__metric-strip">
        {entries.map((metric, index) => (
          <article key={`metric-${metric.label}-${index}`} className="brand-market__metric-card">
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
            {metric.description ? <p>{metric.description}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
};

export const BrandQuickJump = ({
  title,
  actions = [],
  templateKey,
  sectionKey = "quick-jump",
}) => {
  const entries = ensureArray(actions).filter((item) => trimValue(item?.label) && typeof item?.onClick === "function");
  const sectionRef = useSectionImpression(
    "brand_market_section_view",
    {
      templateKey,
      sectionKey: "quick-jump",
      contentType: "quick-jump",
      itemCount: entries.length,
    },
    entries.length > 0,
  );

  if (!entries.length) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="brand-market__module brand-market__module--quick-jump"
      {...buildSectionAttributes(sectionKey)}
    >
      {title ? <BrandSectionHeader title={title} /> : null}
      <div className="brand-market__quick-jump">
        {entries.map((action, index) => (
          <button
            key={`jump-${action.label}-${index}`}
            type="button"
            className="brand-market__quick-jump-item"
            onClick={action.onClick}
          >
            <span>{action.label}</span>
            {action.description ? <small>{action.description}</small> : null}
          </button>
        ))}
      </div>
    </section>
  );
};

export const BrandProductRail = ({
  title,
  description,
  products = [],
  onOpenAll,
  onAddToCart,
  onOpenProduct,
  language,
  templateKey,
  sectionKey,
  variant = "standard",
  leadCard = null,
}) => {
  const entries = ensureArray(products);
  const featuredProduct = entries[0];
  const supportingProducts = entries.slice(1);
  const sectionRef = useSectionImpression(
    "brand_market_section_view",
    {
      templateKey,
      sectionKey,
      contentType: "product-rail",
      itemCount: entries.length,
      railVariant: variant,
    },
    entries.length > 0,
  );

  if (!entries.length) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className={`brand-market__module brand-market__module--product-rail brand-market__module--product-rail-${variant}`}
      {...buildSectionAttributes(sectionKey)}
      data-rail-variant={variant}
    >
      <BrandSectionHeader
        title={title}
        description={description}
        actionLabel={copy(language, "product.viewAll")}
        onAction={onOpenAll}
      />
      <div className={`brand-market__rail-layout brand-market__rail-layout--${variant}`}>
        {featuredProduct ? (
          <FeaturedProductPanel
            product={featuredProduct}
            language={language}
            sectionKey={sectionKey}
            onAddToCart={onAddToCart}
            onOpenProduct={onOpenProduct}
            tone={variant}
            introCard={variant === "premium" ? leadCard : null}
          />
        ) : null}

        <div className="brand-market__rail-column">
          {!featuredProduct && variant === "premium" && leadCard?.title ? (
            <article className="brand-market__rail-editorial-card">
              {leadCard?.eyebrow ? (
                <span className="brand-market__rail-editorial-eyebrow">{leadCard.eyebrow}</span>
              ) : null}
              <h3>{leadCard.title}</h3>
              {leadCard?.description ? <p>{leadCard.description}</p> : null}
              {leadCard?.actionLabel && leadCard?.onClick ? (
                <button
                  type="button"
                  className="brand-market__action brand-market__action--ghost"
                  onClick={leadCard.onClick}
                >
                  {leadCard.actionLabel}
                </button>
              ) : null}
            </article>
          ) : null}

          {supportingProducts.length ? (
            <div className="brand-market__product-track">
              {supportingProducts.map((product) => {
                const { displayPrice, originalPrice } = getItemPrice(product);
                return (
                  <div key={product.id} className="brand-market__product-item">
                    <ProductCard
                      id={product.id}
                      image={`${imageUrl}${product.mediaList?.[0]?.mediaId || ""}`}
                      title={product.productTitle_i18n?.[language] || product.productTitle || product.name}
                      rating={product.rating}
                      reviewCount={product.ratingCount}
                      currentPrice={displayPrice}
                      originalPrice={originalPrice}
                      currency={product.price?.JO?.currencyCode || "JOD"}
                      discountPercentage={product.price?.JO?.salePercent}
                      stockLeft={product.inventory?.availableToSell || product.stockLevel}
                      stockLeftText={
                        Number(product.inventory?.availableToSell || product.stockLevel) > 0
                          ? copy(language, "product.leftCount", {
                              count: Number(product.inventory?.availableToSell || product.stockLevel),
                            })
                          : ""
                      }
                      deliveryText={copy(language, "product.deliverToLocation")}
                      noReviewsLabel={copy(language, "product.noReviews")}
                      addToCartLabel={copy(language, "product.addToCart")}
                      product={product}
                      onAddToCart={(productPayload) => onAddToCart?.(productPayload, sectionKey)}
                      handleOpenViewProduct={() => onOpenProduct?.(product, sectionKey)}
                    />
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export const BrandProductGrid = ({
  title,
  description,
  products = [],
  onOpenAll,
  onAddToCart,
  onOpenProduct,
  language,
  templateKey,
  sectionKey,
  dense = false,
}) => {
  const entries = ensureArray(products);
  const sectionRef = useSectionImpression(
    "brand_market_section_view",
    {
      templateKey,
      sectionKey,
      contentType: "product-grid",
      itemCount: entries.length,
    },
    entries.length > 0,
  );

  if (!entries.length) {
    return null;
  }

  const spotlightProduct = entries[0];
  const gridProducts = entries.slice(1);

  return (
    <section
      ref={sectionRef}
      className="brand-market__module brand-market__module--product-grid"
      {...buildSectionAttributes(sectionKey)}
    >
      <BrandSectionHeader
        title={title}
        description={description}
        actionLabel={copy(language, "product.viewAll")}
        onAction={onOpenAll}
      />
      <div className={`brand-market__product-grid-shell ${dense ? "brand-market__product-grid-shell--dense" : ""}`}>
        {spotlightProduct ? (
          <FeaturedProductPanel
            product={spotlightProduct}
            language={language}
            sectionKey={sectionKey}
            onAddToCart={onAddToCart}
            onOpenProduct={onOpenProduct}
            tone="grid"
          />
        ) : null}
        {gridProducts.length ? (
          <div className={`brand-market__product-grid ${dense ? "brand-market__product-grid--dense" : ""}`}>
            {gridProducts.map((product) => {
              const { displayPrice, originalPrice } = getItemPrice(product);
              return (
                <div key={product.id} className="brand-market__product-item">
                  <ProductCard
                    id={product.id}
                    image={`${imageUrl}${product.mediaList?.[0]?.mediaId || ""}`}
                    title={product.productTitle_i18n?.[language] || product.productTitle || product.name}
                    rating={product.rating}
                    reviewCount={product.ratingCount}
                    currentPrice={displayPrice}
                    originalPrice={originalPrice}
                    currency={product.price?.JO?.currencyCode || "JOD"}
                    discountPercentage={product.price?.JO?.salePercent}
                    stockLeft={product.inventory?.availableToSell || product.stockLevel}
                    stockLeftText={
                      Number(product.inventory?.availableToSell || product.stockLevel) > 0
                        ? copy(language, "product.leftCount", {
                            count: Number(product.inventory?.availableToSell || product.stockLevel),
                          })
                        : ""
                    }
                    deliveryText={copy(language, "product.deliverToLocation")}
                    noReviewsLabel={copy(language, "product.noReviews")}
                    addToCartLabel={copy(language, "product.addToCart")}
                    product={product}
                    onAddToCart={(productPayload) => onAddToCart?.(productPayload, sectionKey)}
                    handleOpenViewProduct={() => onOpenProduct?.(product, sectionKey)}
                  />
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export const BrandBannerAdsSection = ({
  title,
  description,
  items = [],
  language,
  templateKey,
  sectionKey = "banner-ads",
  onOpenLink,
}) => {
  const entries = ensureArray(items);
  const sectionRef = useSectionImpression(
    "brand_market_section_view",
    {
      templateKey,
      sectionKey,
      contentType: "banner-ads",
      itemCount: entries.length,
    },
    entries.length > 0,
  );

  if (!entries.length) {
    return null;
  }

  const primaryBanner = entries[0];
  const supportingBanners = entries.slice(1, 3);

  return (
    <section
      ref={sectionRef}
      className="brand-market__module brand-market__module--banners"
      {...buildSectionAttributes(sectionKey)}
    >
      <BrandSectionHeader title={title} description={description} />
      <div
        className={`brand-market__offer-mosaic ${
          supportingBanners.length
            ? "brand-market__offer-mosaic--split"
            : "brand-market__offer-mosaic--single"
        }`}
      >
        {primaryBanner ? (
          <article
            className="brand-market__banner-card brand-market__banner-card--feature"
            style={{ background: primaryBanner?.backgroundColor || undefined }}
          >
            <div className="brand-market__banner-copy">
              {getLocalizedField(primaryBanner?.highlightLabel, primaryBanner?.highlightLabel_i18n, language, "") ? (
                <span className="brand-market__banner-label">
                  {getLocalizedField(primaryBanner?.highlightLabel, primaryBanner?.highlightLabel_i18n, language, "")}
                </span>
              ) : null}
              {getLocalizedField(primaryBanner?.highlightValue, primaryBanner?.highlightValue_i18n, language, "") ? (
                <span className="brand-market__banner-value">
                  {getLocalizedField(primaryBanner?.highlightValue, primaryBanner?.highlightValue_i18n, language, "")}
                </span>
              ) : null}
              {getLocalizedField(primaryBanner?.title, primaryBanner?.title_i18n, language, "") ? (
                <h3>{getLocalizedField(primaryBanner?.title, primaryBanner?.title_i18n, language, "")}</h3>
              ) : null}
              {getLocalizedField(primaryBanner?.subTitle, primaryBanner?.subTitle_i18n, language, "") ? (
                <p>{getLocalizedField(primaryBanner?.subTitle, primaryBanner?.subTitle_i18n, language, "")}</p>
              ) : null}
              {primaryBanner?.targetUrl ? (
                <button
                  type="button"
                  className="brand-market__action brand-market__action--pill"
                  onClick={() =>
                    onOpenLink?.(primaryBanner.targetUrl, sectionKey, {
                      label: getLocalizedField(
                        primaryBanner?.ctaLabel,
                        primaryBanner?.ctaLabel_i18n,
                        language,
                        copy(language, "banner.exploreOffer"),
                      ),
                    })
                  }
                >
                  {getLocalizedField(
                    primaryBanner?.ctaLabel,
                    primaryBanner?.ctaLabel_i18n,
                    language,
                    copy(language, "banner.exploreOffer"),
                  )}
                </button>
              ) : null}
            </div>
            {primaryBanner?.mediaId ? (
              <BrandMediaImage
                className="brand-market__banner-media"
                src={`${imageUrl}${primaryBanner.mediaId}`}
                alt={getLocalizedField(primaryBanner?.title, primaryBanner?.title_i18n, language, "")}
              />
            ) : null}
          </article>
        ) : null}

        {supportingBanners.length ? (
          <div className="brand-market__banner-stack">
            {supportingBanners.map((banner, index) => {
              const bannerTitle = getLocalizedField(banner?.title, banner?.title_i18n, language, "");
              const bannerSubtitle = getLocalizedField(banner?.subTitle, banner?.subTitle_i18n, language, "");
              const ctaLabel = getLocalizedField(
                banner?.ctaLabel,
                banner?.ctaLabel_i18n,
                language,
                copy(language, "banner.shopNow"),
              );
              return (
                <article
                  key={`banner-${index}`}
                  className="brand-market__banner-card brand-market__banner-card--supporting"
                  style={{ background: banner?.backgroundColor || undefined }}
                >
                  <div className="brand-market__banner-copy">
                    {bannerTitle ? <h3>{bannerTitle}</h3> : null}
                    {bannerSubtitle ? <p>{bannerSubtitle}</p> : null}
                    {banner?.targetUrl ? (
                      <button
                        type="button"
                        className="brand-market__action brand-market__action--ghost"
                        onClick={() => onOpenLink?.(banner.targetUrl, sectionKey, { label: ctaLabel })}
                      >
                        {ctaLabel}
                      </button>
                    ) : null}
                  </div>
                  {banner?.mediaId ? (
                    <BrandMediaImage
                      className="brand-market__banner-media"
                      src={`${imageUrl}${banner.mediaId}`}
                      alt={bannerTitle || ctaLabel}
                    />
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export const BrandCampaignSection = ({
  title,
  items = [],
  language,
  templateKey,
  onOpenLink,
  sectionKey = "campaigns",
}) => {
  const entries = ensureArray(items);
  const sectionRef = useSectionImpression(
    "brand_market_section_view",
    {
      templateKey,
      sectionKey: "campaigns",
      contentType: "campaigns",
      itemCount: entries.length,
    },
    entries.length > 0,
  );

  if (!entries.length) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="brand-market__module brand-market__module--campaigns"
      {...buildSectionAttributes(sectionKey)}
    >
      <BrandSectionHeader
        eyebrow={copy(language, "section.brandCampaignsEyebrow")}
        title={title}
      />
      <div className="brand-market__campaign-grid">
        {entries.map((placement, index) => {
          const placementTitle = getLocalizedField(
            placement?.title,
            placement?.title_i18n,
            language,
            `${copy(language, "defaults.campaign")} ${index + 1}`,
          );
          const subtitle = getLocalizedField(placement?.subTitle, placement?.subTitle_i18n, language, "");
          const ctaLabel = getLocalizedField(
            placement?.ctaLabel,
            placement?.ctaLabel_i18n,
            language,
            copy(language, "banner.explore"),
          );
          return (
            <article
              key={`${placement?.placement || "campaign"}-${index}`}
              className="brand-market__campaign-card"
              style={{ background: placement?.backgroundColor || undefined }}
            >
              {placement?.mediaId ? (
                <BrandMediaImage
                  className="brand-market__campaign-media"
                  src={`${imageUrl}${placement.mediaId}`}
                  alt={placementTitle}
                />
              ) : null}
              <div className="brand-market__campaign-body">
                <h3>{placementTitle}</h3>
                {subtitle ? <p>{subtitle}</p> : null}
                {placement?.targetUrl ? (
                  <button
                    type="button"
                    className="brand-market__action brand-market__action--pill"
                    onClick={() => onOpenLink?.(placement.targetUrl, "campaigns", { label: ctaLabel })}
                  >
                    {ctaLabel}
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export const BrandPoliciesSection = ({
  title,
  policies = [],
  language,
  templateKey,
  sectionKey = "policies",
}) => {
  const entries = ensureArray(policies);
  const sectionRef = useSectionImpression(
    "brand_market_section_view",
    {
      templateKey,
      sectionKey: "policies",
      contentType: "policies",
      itemCount: entries.length,
    },
    entries.length > 0,
  );

  if (!entries.length) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="brand-market__module brand-market__module--policies"
      {...buildSectionAttributes(sectionKey)}
    >
      <BrandSectionHeader
        eyebrow={copy(language, "section.policiesEyebrow")}
        title={title}
      />
      <div className="brand-market__policy-grid">
        {entries.map((policy, index) => {
          const policyTitle = getLocalizedField(
            policy?.title,
            policy?.title_i18n,
            language,
            policy?.category || `${copy(language, "defaults.policy")} ${index + 1}`,
          );
          const policyDescription = getLocalizedField(policy?.description, policy?.description_i18n, language, "");
          const policyContent = getLocalizedField(policy?.content, policy?.content_i18n, language, "");
          return (
            <article key={policy.id || `${policyTitle}-${index}`} className="brand-market__policy-card">
              {policy?.category ? <span className="brand-market__policy-eyebrow">{policy.category}</span> : null}
              <h3>{policyTitle}</h3>
              {policyDescription ? <p>{policyDescription}</p> : null}
              {policyContent ? <div className="brand-market__policy-content">{policyContent}</div> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
};

export const BrandServiceSection = ({
  title,
  service,
  language,
  templateKey,
  onOpenLink,
  sectionKey = "service",
}) => {
  const description = getLocalizedField(service?.description, service?.description_i18n, language, "");
  const links = ensureArray(service?.links);
  const hasContent =
    description ||
    trimValue(service?.email) ||
    trimValue(service?.phone) ||
    trimValue(service?.hours) ||
    trimValue(service?.url) ||
    links.length > 0;

  const sectionRef = useSectionImpression(
    "brand_market_section_view",
    {
      templateKey,
      sectionKey: "service",
      contentType: "service",
    },
    Boolean(hasContent),
  );

  if (!hasContent) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="brand-market__module brand-market__module--service"
      {...buildSectionAttributes(sectionKey)}
    >
      <BrandSectionHeader
        eyebrow={copy(language, "section.serviceSupportEyebrow")}
        title={title}
      />
      <div className="brand-market__service-card">
        {description ? <p className="brand-market__service-description">{description}</p> : null}
        <div className="brand-market__service-meta">
          {service?.email ? <span>{service.email}</span> : null}
          {service?.phone ? <span>{service.phone}</span> : null}
          {service?.hours ? <span>{service.hours}</span> : null}
        </div>
        <div className="brand-market__service-links">
          {service?.url ? (
            <button
              type="button"
              className="brand-market__action brand-market__action--pill"
              onClick={() => onOpenLink?.(service.url, "service", { label: title })}
            >
              {copy(language, "footer.servicePortal")}
            </button>
          ) : null}
          {links.map((link, index) => {
            const label = getLocalizedField(
              link?.label,
              link?.label_i18n,
              language,
              `${copy(language, "defaults.link")} ${index + 1}`,
            );
            return link?.url ? (
              <button
                key={`${label}-${index}`}
                type="button"
                className="brand-market__action brand-market__action--ghost"
                onClick={() => onOpenLink?.(link.url, "service-links", { label })}
              >
                {label}
              </button>
            ) : null;
          })}
        </div>
      </div>
    </section>
  );
};

export const BrandFinalCtaSection = ({
  finalCta,
  language,
  templateKey,
  onOpenLink,
  sectionKey = "final-cta",
}) => {
  const title = getLocalizedField(finalCta?.title, finalCta?.title_i18n, language, "");
  const description = getLocalizedField(finalCta?.subTitle, finalCta?.subTitle_i18n, language, "");
  const primaryAction = buildActionLink(
    finalCta?.primaryAction,
    copy(language, "hero.startShopping"),
    "",
  );
  const secondaryAction = buildActionLink(
    finalCta?.secondaryAction,
    copy(language, "cta.learnMore"),
    "",
  );
  const hasContent = title || description || primaryAction.url || secondaryAction.url || finalCta?.mediaId;
  const sectionRef = useSectionImpression(
    "brand_market_section_view",
    {
      templateKey,
      sectionKey: "final-cta",
      contentType: "cta",
    },
    Boolean(hasContent),
  );

  if (!hasContent) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="brand-market__module brand-market__module--final-cta"
      {...buildSectionAttributes(sectionKey)}
    >
      <div
        className="brand-market__final-cta"
        style={{ background: finalCta?.backgroundColor || undefined }}
      >
        <div className="brand-market__final-cta-copy">
          {title ? <h2>{title}</h2> : null}
          {description ? <p>{description}</p> : null}
          <div className="brand-market__hero-actions">
            {primaryAction.url ? (
              <button
                type="button"
                className="brand-market__action brand-market__action--primary"
                onClick={() =>
                  onOpenLink?.(primaryAction.url, "final-cta", {
                    label: getLocalizedField(
                      primaryAction.label,
                      primaryAction.label_i18n,
                      language,
                      primaryAction.fallbackLabel,
                    ),
                  })
                }
              >
                {getLocalizedField(
                  primaryAction.label,
                  primaryAction.label_i18n,
                  language,
                  primaryAction.fallbackLabel,
                )}
              </button>
            ) : null}
            {secondaryAction.url ? (
              <button
                type="button"
                className="brand-market__action brand-market__action--secondary"
                onClick={() =>
                  onOpenLink?.(secondaryAction.url, "final-cta", {
                    label: getLocalizedField(
                      secondaryAction.label,
                      secondaryAction.label_i18n,
                      language,
                      secondaryAction.fallbackLabel,
                    ),
                  })
                }
              >
                {getLocalizedField(
                  secondaryAction.label,
                  secondaryAction.label_i18n,
                  language,
                  secondaryAction.fallbackLabel,
                )}
              </button>
            ) : null}
          </div>
        </div>
        {finalCta?.mediaId ? (
          <BrandMediaImage
            className="brand-market__final-cta-media"
            src={`${imageUrl}${finalCta.mediaId}`}
            alt={title || copy(language, "defaults.finalCtaAlt")}
          />
        ) : null}
      </div>
    </section>
  );
};

export const BrandFooterSection = ({
  brand,
  footer,
  service,
  language,
  templateKey,
  onOpenLink,
}) => {
  const footerTitle = getLocalizedField(footer?.title, footer?.title_i18n, language, brand?.brandName || "");
  const footerDescription = getLocalizedField(footer?.description, footer?.description_i18n, language, "");
  const socialLinks = ensureArray(footer?.socialLinks);
  const navigationLinks = ensureArray(footer?.navigationLinks);
  const sectionRef = useSectionImpression(
    "brand_market_section_view",
    {
      templateKey,
      sectionKey: "footer",
      contentType: "footer",
    },
    Boolean(footerTitle || footerDescription || socialLinks.length || navigationLinks.length),
  );

  return (
    <footer ref={sectionRef} className="brand-market__footer" {...buildSectionAttributes("footer")}>
      <div className="brand-market__footer-main">
        <div className="brand-market__footer-brand">
          <h2>{footerTitle || brand?.brandName}</h2>
          {footerDescription ? <p>{footerDescription}</p> : null}
          <div className="brand-market__footer-contact">
            {service?.email ? <span>{service.email}</span> : null}
            {service?.phone ? <span>{service.phone}</span> : null}
            {service?.hours ? <span>{service.hours}</span> : null}
          </div>
        </div>
        <div className="brand-market__footer-links">
          {navigationLinks.length ? (
            <div className="brand-market__footer-column">
              <h3>{copy(language, "footer.navigate")}</h3>
              {navigationLinks.map((link, index) => {
                const label = getLocalizedField(
                  link?.label,
                  link?.label_i18n,
                  language,
                  `${copy(language, "defaults.link")} ${index + 1}`,
                );
                return link?.url ? (
                  <a
                    key={`nav-${index}`}
                    href={link.url}
                    className="brand-market__footer-link"
                    onClick={(event) => {
                      event.preventDefault();
                      onOpenLink?.(link.url, "footer-navigation", { label });
                    }}
                  >
                    {label}
                  </a>
                ) : null;
              })}
            </div>
          ) : null}
          {socialLinks.length ? (
            <div className="brand-market__footer-column">
              <h3>{copy(language, "footer.follow")}</h3>
              {socialLinks.map((link, index) => {
                const label = getLocalizedField(
                  link?.label,
                  link?.label_i18n,
                  language,
                  `${copy(language, "defaults.social")} ${index + 1}`,
                );
                return link?.url ? (
                  <a
                    key={`social-${index}`}
                    href={link.url}
                    className="brand-market__footer-link"
                    onClick={(event) => {
                      event.preventDefault();
                      onOpenLink?.(link.url, "footer-social", { label });
                    }}
                  >
                    {label}
                  </a>
                ) : null;
              })}
            </div>
          ) : null}
        </div>
      </div>
      <div className="brand-market__footer-legal">
        {footer?.privacyUrl ? (
          <a
            href={footer.privacyUrl}
            className="brand-market__footer-link"
            onClick={(event) => {
              event.preventDefault();
              onOpenLink?.(footer.privacyUrl, "footer-legal", {
                label: copy(language, "footer.privacyPolicy"),
              });
            }}
          >
            {copy(language, "footer.privacyPolicy")}
          </a>
        ) : null}
        {footer?.termsUrl ? (
          <a
            href={footer.termsUrl}
            className="brand-market__footer-link"
            onClick={(event) => {
              event.preventDefault();
              onOpenLink?.(footer.termsUrl, "footer-legal", {
                label: copy(language, "footer.termsAndConditions"),
              });
            }}
          >
            {copy(language, "footer.termsAndConditions")}
          </a>
        ) : null}
      </div>
    </footer>
  );
};
