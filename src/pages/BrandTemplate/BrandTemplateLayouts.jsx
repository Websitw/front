import React from "react";
import { imageUrl } from "../../helper/helper";
import { resolveBrandMarketExperimentState } from "../../helper/brandMarketConfig";

import {
  BrandBannerAdsSection,
  BrandBenefitsSection,
  BrandCampaignSection,
  BrandCategoryHub,
  BrandCollectionGrid,
  BrandCollectionNavigation,
  BrandFinalCtaSection,
  BrandFooterSection,
  BrandHeroMedia,
  BrandPoliciesSection,
  BrandProductGrid,
  BrandProductRail,
  BrandPromiseSection,
  BrandQuickJump,
  BrandServiceSection,
  BrandSocialProofSection,
  BrandStorySection,
  BrandValueSection,
  BrandFaqSection,
} from "./BrandTemplateSections";
import { getBrandTemplateCopy } from "./brandTemplateCopy";
import { getLocalizedField } from "./useBrandStorefront";

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const trimValue = (value) => String(value || "").trim();

const copy = (language, key, variables) => getBrandTemplateCopy(language, key, variables);

const templateCopy = (language, templateKey, key, variables) =>
  copy(language, `template.${templateKey}.${key}`, variables);

const localizedCopy = (value, valueI18n, language, key, variables) =>
  getLocalizedField(value, valueI18n, language, copy(language, key, variables));

const localizedTemplateCopy = (value, valueI18n, language, templateKey, key, variables) =>
  getLocalizedField(value, valueI18n, language, templateCopy(language, templateKey, key, variables));

const hasModule = (modules, moduleKey) => ensureArray(modules).includes(moduleKey);

const findCollectionBySectionKeys = (collections = [], sectionKeys = []) =>
  ensureArray(collections).find((collection) =>
    sectionKeys.includes(String(collection?.sectionKey || "").toLowerCase()),
  );

const buildPremiumRailLeadCard = ({
  language,
  collections = [],
  hero,
  bannerAds = [],
  fallbackTitle,
  fallbackDescription,
  sectionKey,
  onOpenAll,
  onExploreCollection,
  onOpenLink,
}) => {
  const recommendedCollection =
    findCollectionBySectionKeys(collections, ["recommended"]) ||
    findCollectionBySectionKeys(collections, ["featured", "featured_collection", "featured-collection"]) ||
    findCollectionBySectionKeys(collections, ["story_collection", "story-collection", "story"]);
  const featuredBanner = ensureArray(bannerAds)[0];

  if (recommendedCollection) {
    const title =
      getLocalizedField(
        recommendedCollection?.title,
        recommendedCollection?.title_i18n,
        language,
        fallbackTitle,
      ) || fallbackTitle;
    const description =
      getLocalizedField(
        recommendedCollection?.description,
        recommendedCollection?.description_i18n,
        language,
        fallbackDescription,
      ) || fallbackDescription;
    const actionLabel =
      getLocalizedField(
        recommendedCollection?.ctaLabel,
        recommendedCollection?.ctaLabel_i18n,
        language,
        copy(language, "hero.shopCollection"),
      ) || copy(language, "hero.shopCollection");

    return {
      eyebrow: copy(language, "section.curatedShelfEyebrow"),
      title,
      description,
      mediaId: recommendedCollection?.mediaId || hero?.mediaId || "",
      actionLabel,
      onClick: () => {
        if (typeof onExploreCollection === "function") {
          onExploreCollection(recommendedCollection, `${sectionKey}-lead`);
          return;
        }

        onOpenAll?.(sectionKey);
      },
    };
  }

  if (featuredBanner) {
    const title =
      getLocalizedField(featuredBanner?.title, featuredBanner?.title_i18n, language, fallbackTitle) ||
      fallbackTitle;
    const description =
      getLocalizedField(
        featuredBanner?.subTitle,
        featuredBanner?.subTitle_i18n,
        language,
        fallbackDescription,
      ) || fallbackDescription;
    const actionLabel =
      getLocalizedField(
        featuredBanner?.ctaLabel,
        featuredBanner?.ctaLabel_i18n,
        language,
        copy(language, "banner.exploreOffer"),
      ) || copy(language, "banner.exploreOffer");

    return {
      eyebrow: copy(language, "section.featuredStoryEyebrow"),
      title,
      description,
      mediaId: featuredBanner?.mediaId || hero?.mediaId || "",
      actionLabel,
      onClick: () =>
        featuredBanner?.targetUrl
          ? onOpenLink?.(featuredBanner.targetUrl, `${sectionKey}-lead`, { label: title })
          : onOpenAll?.(sectionKey),
    };
  }

  const heroTitle = getLocalizedField(hero?.title, hero?.title_i18n, language, fallbackTitle) || fallbackTitle;
  const heroDescription =
    getLocalizedField(hero?.description, hero?.description_i18n, language, fallbackDescription) ||
    fallbackDescription;

  if (!heroTitle && !heroDescription) {
    return null;
  }

  return {
    eyebrow: copy(language, "section.recommendedEyebrow"),
    title: heroTitle,
    description: heroDescription,
    mediaId: hero?.mediaId || hero?.mobileMediaId || "",
    actionLabel: copy(language, "product.viewAll"),
    onClick: () => onOpenAll?.(sectionKey),
  };
};

const resolveTemplateRuntime = (props) =>
  resolveBrandMarketExperimentState({
    searchString: props.searchString,
    templateKey: props.templateKey,
    templateModules: props.template?.modules,
    heroLayout: props.template?.heroLayout || props.hero?.heroLayout,
  });

const getHeroLabel = (action, language, fallback) =>
  getLocalizedField(action?.label, action?.label_i18n, language, fallback);

const HeroActions = ({
  hero,
  language,
  onActionClick,
  primaryFallback,
  secondaryFallback,
  onPrimaryAction,
  onSecondaryAction,
}) => {
  const primaryLabel = getHeroLabel(hero?.primaryCta, language, primaryFallback);
  const secondaryLabel = getHeroLabel(hero?.secondaryCta, language, secondaryFallback);
  const hasPrimary = trimValue(hero?.primaryCta?.url) || typeof onPrimaryAction === "function";
  const hasSecondary = trimValue(hero?.secondaryCta?.url) || typeof onSecondaryAction === "function";

  return (
    <div className="brand-market__hero-actions">
      {hasPrimary ? (
        <button
          type="button"
          className="brand-market__action brand-market__action--primary"
          onClick={() =>
            trimValue(hero?.primaryCta?.url)
              ? onActionClick(hero.primaryCta.url, "hero-primary", { label: primaryLabel })
              : onPrimaryAction?.()
          }
        >
          {primaryLabel}
        </button>
      ) : null}
      {hasSecondary ? (
        <button
          type="button"
          className="brand-market__action brand-market__action--secondary"
          onClick={() =>
            trimValue(hero?.secondaryCta?.url)
              ? onActionClick(hero.secondaryCta.url, "hero-secondary", { label: secondaryLabel })
              : onSecondaryAction?.()
          }
        >
          {secondaryLabel}
        </button>
      ) : null}
    </div>
  );
};

const BrandIdentity = ({ brand, hero, language }) => {
  const tagline = getLocalizedField(hero?.tagline, hero?.tagline_i18n, language, brand?.brandName || "");
  const eyebrow = getLocalizedField(hero?.eyebrow, hero?.eyebrow_i18n, language, "");
  const title = getLocalizedField(hero?.title, hero?.title_i18n, language, brand?.brandName || "");
  const description = getLocalizedField(hero?.description, hero?.description_i18n, language, "");

  return { tagline, eyebrow, title, description };
};

const EditorialHero = ({ brand, hero, language, heroExperiment, heroLayout, onActionClick, onPrimaryAction, onSecondaryAction }) => {
  const identity = BrandIdentity({ brand, hero, language });
  return (
    <section className="brand-market__hero-system brand-market__hero-system--editorial" data-brand-hero="editorial-hero">
      <div
        className="brand-market__hero-system-shell brand-market__hero-system-shell--editorial"
        data-hero-experiment={heroExperiment}
        data-hero-layout={heroLayout}
      >
        <div className="brand-market__hero-copy">
          {identity.eyebrow ? <span className="brand-market__hero-eyebrow">{identity.eyebrow}</span> : null}
          <div className="brand-market__hero-brandline">
            {brand?.logoId ? (
              <img src={`${imageUrl}${brand.logoId}`} alt={brand.brandName} className="brand-market__hero-logo" />
            ) : null}
            <span>{identity.tagline || brand?.brandName}</span>
          </div>
          <h1>{identity.title}</h1>
          {identity.description ? <p>{identity.description}</p> : null}
          <HeroActions
            hero={hero}
            language={language}
            onActionClick={onActionClick}
            primaryFallback={copy(language, "hero.discoverBrand")}
            secondaryFallback={copy(language, "hero.shopCollection")}
            onPrimaryAction={onPrimaryAction}
            onSecondaryAction={onSecondaryAction}
          />
        </div>
        <div className="brand-market__hero-media-frame">
          <BrandHeroMedia hero={hero} language={language} fallbackMediaId={brand?.catalogId || brand?.logoId} />
        </div>
      </div>
    </section>
  );
};

const CommerceHero = ({ brand, hero, language, heroExperiment, heroLayout, quickJumpActions, onActionClick, onPrimaryAction, onSecondaryAction }) => {
  const identity = BrandIdentity({ brand, hero, language });
  return (
    <section className="brand-market__hero-system brand-market__hero-system--commerce" data-brand-hero="commerce-grid">
      <div
        className="brand-market__hero-system-shell brand-market__hero-system-shell--commerce"
        data-hero-experiment={heroExperiment}
        data-hero-layout={heroLayout}
      >
        <div className="brand-market__hero-copy">
          {identity.eyebrow ? <span className="brand-market__hero-eyebrow">{identity.eyebrow}</span> : null}
          <h1>{identity.title}</h1>
          {identity.description ? <p>{identity.description}</p> : null}
          <HeroActions
            hero={hero}
            language={language}
            onActionClick={onActionClick}
            primaryFallback={copy(language, "hero.browseProducts")}
            secondaryFallback={copy(language, "hero.exploreCategories")}
            onPrimaryAction={onPrimaryAction}
            onSecondaryAction={onSecondaryAction}
          />
          <BrandQuickJump title="" actions={quickJumpActions} templateKey="commerce-grid" />
        </div>
        <div className="brand-market__hero-side">
          <BrandHeroMedia hero={hero} language={language} fallbackMediaId={brand?.catalogId || brand?.logoId} />
        </div>
      </div>
    </section>
  );
};

const StoryCollectionHero = ({
  brand,
  hero,
  language,
  heroExperiment,
  heroLayout,
  collections,
  onExploreCollection,
  onActionClick,
  onPrimaryAction,
  onSecondaryAction,
}) => {
  const identity = BrandIdentity({ brand, hero, language });
  return (
    <section className="brand-market__hero-system brand-market__hero-system--story" data-brand-hero="story-collection">
      <div
        className="brand-market__hero-system-shell brand-market__hero-system-shell--story"
        data-hero-experiment={heroExperiment}
        data-hero-layout={heroLayout}
      >
        <div className="brand-market__hero-copy">
          {identity.eyebrow ? <span className="brand-market__hero-eyebrow">{identity.eyebrow}</span> : null}
          <h1>{identity.title}</h1>
          {identity.description ? <p>{identity.description}</p> : null}
          <HeroActions
            hero={hero}
            language={language}
            onActionClick={onActionClick}
            primaryFallback={copy(language, "hero.exploreStories")}
            secondaryFallback={copy(language, "hero.shopCollections")}
            onPrimaryAction={onPrimaryAction}
            onSecondaryAction={onSecondaryAction}
          />
        </div>
        <div className="brand-market__hero-story-rail">
          <BrandHeroMedia hero={hero} language={language} fallbackMediaId={brand?.catalogId || brand?.logoId} />
          <div className="brand-market__hero-story-cards">
            {ensureArray(collections)
              .slice(0, 3)
              .map((collection, index) => {
                const title = localizedCopy(
                  collection?.title,
                  collection?.title_i18n,
                  language,
                  "defaults.collectionNumber",
                  { count: index + 1 },
                );
                return (
                  <button
                    key={collection.id || `${title}-${index}`}
                    type="button"
                    className="brand-market__hero-story-card"
                    onClick={() => onExploreCollection(collection, "hero-story-collection")}
                  >
                    <span>{title}</span>
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    </section>
  );
};

const CampaignFocusHero = ({
  brand,
  hero,
  language,
  heroExperiment,
  heroLayout,
  bannerAds,
  onActionClick,
  onOpenLink,
  onPrimaryAction,
  onSecondaryAction,
}) => {
  const identity = BrandIdentity({ brand, hero, language });
  const leadBanner = ensureArray(bannerAds)[0];

  return (
    <section className="brand-market__hero-system brand-market__hero-system--campaign" data-brand-hero="campaign-focus">
      <div
        className="brand-market__hero-system-shell brand-market__hero-system-shell--campaign"
        data-hero-experiment={heroExperiment}
        data-hero-layout={heroLayout}
      >
        <div className="brand-market__hero-copy">
          {identity.eyebrow ? <span className="brand-market__hero-eyebrow">{identity.eyebrow}</span> : null}
          <h1>{identity.title}</h1>
          {identity.description ? <p>{identity.description}</p> : null}
          <HeroActions
            hero={hero}
            language={language}
            onActionClick={onActionClick}
            primaryFallback={copy(language, "hero.viewCampaign")}
            secondaryFallback={copy(language, "hero.shopOffers")}
            onPrimaryAction={onPrimaryAction}
            onSecondaryAction={onSecondaryAction}
          />
        </div>
        <div className="brand-market__hero-campaign-side">
          <BrandHeroMedia hero={hero} language={language} fallbackMediaId={brand?.catalogId || brand?.logoId} />
          {leadBanner ? (
            <button
              type="button"
              className="brand-market__hero-offer-card"
              onClick={() =>
                leadBanner?.targetUrl
                  ? onOpenLink(leadBanner.targetUrl, "hero-campaign-offer", {
                      label: localizedCopy(leadBanner?.ctaLabel, leadBanner?.ctaLabel_i18n, language, "defaults.offer"),
                    })
                  : undefined
              }
            >
              <span>{getLocalizedField(leadBanner?.highlightValue, leadBanner?.highlightValue_i18n, language, "")}</span>
              <strong>{getLocalizedField(leadBanner?.title, leadBanner?.title_i18n, language, "")}</strong>
              <small>{getLocalizedField(leadBanner?.subTitle, leadBanner?.subTitle_i18n, language, "")}</small>
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
};

const RoutineSolutionHero = ({ brand, hero, language, heroExperiment, heroLayout, steps, onActionClick, onPrimaryAction, onSecondaryAction }) => {
  const identity = BrandIdentity({ brand, hero, language });

  return (
    <section className="brand-market__hero-system brand-market__hero-system--routine" data-brand-hero="routine-solution">
      <div
        className="brand-market__hero-system-shell brand-market__hero-system-shell--routine"
        data-hero-experiment={heroExperiment}
        data-hero-layout={heroLayout}
      >
        <div className="brand-market__hero-copy">
          {identity.eyebrow ? <span className="brand-market__hero-eyebrow">{identity.eyebrow}</span> : null}
          <h1>{identity.title}</h1>
          {identity.description ? <p>{identity.description}</p> : null}
          <HeroActions
            hero={hero}
            language={language}
            onActionClick={onActionClick}
            primaryFallback={copy(language, "hero.startRoutine")}
            secondaryFallback={copy(language, "hero.exploreSolutions")}
            onPrimaryAction={onPrimaryAction}
            onSecondaryAction={onSecondaryAction}
          />
        </div>
        <div className="brand-market__hero-routine-side">
          <BrandHeroMedia hero={hero} language={language} fallbackMediaId={brand?.catalogId || brand?.logoId} />
          <div className="brand-market__hero-routine-steps">
            {ensureArray(steps)
              .slice(0, 3)
              .map((step, index) => (
                <article key={`routine-step-${index}`} className="brand-market__hero-routine-step">
                  <span>{index + 1}</span>
                  <strong>
                    {localizedCopy(step?.title, step?.title_i18n, language, "defaults.stepNumber", {
                      count: index + 1,
                    })}
                  </strong>
                </article>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const DealPromoHero = ({ brand, hero, language, heroExperiment, heroLayout, bannerAds, onActionClick, onPrimaryAction, onSecondaryAction }) => {
  const identity = BrandIdentity({ brand, hero, language });
  const offers = ensureArray(bannerAds).slice(0, 2);

  return (
    <section className="brand-market__hero-system brand-market__hero-system--deal" data-brand-hero="deal-promo">
      <div
        className="brand-market__hero-system-shell brand-market__hero-system-shell--deal"
        data-hero-experiment={heroExperiment}
        data-hero-layout={heroLayout}
      >
        <div className="brand-market__hero-copy">
          {identity.eyebrow ? <span className="brand-market__hero-eyebrow">{identity.eyebrow}</span> : null}
          <h1>{identity.title}</h1>
          {identity.description ? <p>{identity.description}</p> : null}
          <HeroActions
            hero={hero}
            language={language}
            onActionClick={onActionClick}
            primaryFallback={copy(language, "hero.getOffer")}
            secondaryFallback={copy(language, "hero.seeAllDeals")}
            onPrimaryAction={onPrimaryAction}
            onSecondaryAction={onSecondaryAction}
          />
        </div>
        <div className="brand-market__hero-deal-side">
          <BrandHeroMedia hero={hero} language={language} fallbackMediaId={brand?.catalogId || brand?.logoId} />
          <div className="brand-market__hero-deal-stack">
            {offers.map((offer, index) => (
              <article key={`deal-${index}`} className="brand-market__hero-deal-card">
                <span>{getLocalizedField(offer?.highlightValue, offer?.highlightValue_i18n, language, "")}</span>
                <strong>{getLocalizedField(offer?.title, offer?.title_i18n, language, "")}</strong>
                <small>{getLocalizedField(offer?.highlightLabel, offer?.highlightLabel_i18n, language, "")}</small>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const CategoryHubHero = ({
  brand,
  hero,
  language,
  heroExperiment,
  heroLayout,
  categories,
  onSelectCategory,
  onActionClick,
  onPrimaryAction,
  onSecondaryAction,
}) => {
  const identity = BrandIdentity({ brand, hero, language });
  const topCategories = ensureArray(categories).slice(0, 6);

  return (
    <section className="brand-market__hero-system brand-market__hero-system--hub" data-brand-hero="category-hub">
      <div
        className="brand-market__hero-system-shell brand-market__hero-system-shell--hub"
        data-hero-experiment={heroExperiment}
        data-hero-layout={heroLayout}
      >
        <div className="brand-market__hero-copy">
          {identity.eyebrow ? <span className="brand-market__hero-eyebrow">{identity.eyebrow}</span> : null}
          <h1>{identity.title}</h1>
          {identity.description ? <p>{identity.description}</p> : null}
          <HeroActions
            hero={hero}
            language={language}
            onActionClick={onActionClick}
            primaryFallback={copy(language, "hero.startShopping")}
            secondaryFallback={copy(language, "hero.exploreCategories")}
            onPrimaryAction={onPrimaryAction}
            onSecondaryAction={onSecondaryAction}
          />
        </div>
        <div className="brand-market__hero-hub-side">
          <BrandHeroMedia hero={hero} language={language} fallbackMediaId={brand?.catalogId || brand?.logoId} />
          <div className="brand-market__hero-hub-grid">
            {topCategories.map((category) => {
              const label = localizedCopy(category?.categoryName, category?.name_i18n, language, "defaults.category");
              return (
                <button
                  key={category.id || category.key || label}
                  type="button"
                  className="brand-market__hero-hub-card"
                  onClick={() => onSelectCategory(category)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

const BrandNarrativeIntro = ({
  templateKey,
  language,
  promiseTitle,
  promise,
  promiseI18n,
  story,
  storyEyebrow,
  storyTitle,
  storyVariant = "card",
  valuesBlock,
  valuesTitle,
  keyBenefitsBlock,
  keyBenefitsEyebrow,
  keyBenefitsTitle,
  keyBenefitsSectionKey = "key-benefits",
}) => (
  <>
    <BrandPromiseSection
      title={promiseTitle}
      promise={{ value: promise, i18n: promiseI18n }}
      language={language}
      templateKey={templateKey}
    />
    <BrandStorySection
      eyebrow={storyEyebrow}
      title={storyTitle}
      story={story}
      language={language}
      templateKey={templateKey}
      variant={storyVariant}
    />
    <BrandValueSection
      title={valuesTitle}
      items={valuesBlock?.items}
      language={language}
      templateKey={templateKey}
    />
    <BrandBenefitsSection
      eyebrow={keyBenefitsEyebrow}
      title={keyBenefitsTitle}
      items={keyBenefitsBlock?.items}
      language={language}
      templateKey={templateKey}
      sectionKey={keyBenefitsSectionKey}
    />
  </>
);

const EditorialHeroTemplate = (props) => {
  const { brand, hero, story, valuesBlock, keyBenefitsBlock, categories, featuredCollections, bestSellers, newArrivals, recommended, bannerAds, offerHighlightsBlock, socialProofBlock, faqBlock, finalCta, footer, service, policies, language, onOpenCatalog, onExploreCollection, onAddToCart, onOpenProduct, onCategorySelect, onOpenLink } = props;
  const runtime = resolveTemplateRuntime(props);
  const modules = runtime.modules;
  const faqSection = (
    <BrandFaqSection
      title={localizedCopy(faqBlock?.title, faqBlock?.title_i18n, language, "template.common.faqTitle")}
      items={faqBlock?.items}
      language={language}
      templateKey="editorial-hero"
    />
  );
  return (
    <>
      <EditorialHero
        brand={brand}
        hero={hero}
        language={language}
        heroExperiment={runtime.heroExperiment}
        heroLayout={runtime.heroLayout}
        onActionClick={onOpenLink}
        onPrimaryAction={onOpenCatalog}
        onSecondaryAction={() => onExploreCollection(featuredCollections?.[0], "hero-secondary")}
      />
      <div
        className="brand-market__content brand-market__content--editorial"
        data-brand-above-fold="editorial-hero"
        data-brand-module-density={runtime.moduleDensity}
      >
        <BrandNarrativeIntro
          templateKey="editorial-hero"
          language={language}
          promiseTitle={templateCopy(language, "editorialHero", "promiseTitle")}
          promise={props.brandPromise}
          promiseI18n={props.brandPromise_i18n}
          story={story}
          storyEyebrow={templateCopy(language, "editorialHero", "storyEyebrow")}
          storyTitle={localizedTemplateCopy(story?.title, story?.title_i18n, language, "editorialHero", "storyTitle")}
          storyVariant="editorial"
          valuesBlock={valuesBlock}
          valuesTitle={localizedTemplateCopy(valuesBlock?.title, valuesBlock?.title_i18n, language, "editorialHero", "valuesTitle")}
          keyBenefitsBlock={keyBenefitsBlock}
          keyBenefitsEyebrow={templateCopy(language, "editorialHero", "keyBenefitsEyebrow")}
          keyBenefitsTitle={localizedTemplateCopy(
            keyBenefitsBlock?.title,
            keyBenefitsBlock?.title_i18n,
            language,
            "editorialHero",
            "keyBenefitsTitle",
          )}
        />
        <BrandCategoryHub
          title={templateCopy(language, "editorialHero", "categoryHubTitle")}
          categories={categories}
          language={language}
          templateKey="editorial-hero"
          onSelectCategory={onCategorySelect}
          variant="chips"
        />
        <BrandCollectionGrid
          title={templateCopy(language, "editorialHero", "featuredCollectionsTitle")}
          collections={featuredCollections}
          language={language}
          templateKey="editorial-hero"
          onExploreCollection={onExploreCollection}
        />
        {hasModule(modules, "collection-navigation") ? (
          <BrandCollectionNavigation
            title={templateCopy(language, "editorialHero", "collectionNavigationTitle")}
            collections={featuredCollections}
            language={language}
            templateKey="editorial-hero"
            onExploreCollection={onExploreCollection}
          />
        ) : null}
        <BrandProductGrid
          title={templateCopy(language, "editorialHero", "bestSellersTitle")}
          products={bestSellers}
          onOpenAll={onOpenCatalog}
          onAddToCart={onAddToCart}
          onOpenProduct={onOpenProduct}
          language={language}
          templateKey="editorial-hero"
          sectionKey="best-sellers"
          dense
        />
        <BrandBannerAdsSection
          title={templateCopy(language, "editorialHero", "bannerAdsTitle")}
          items={bannerAds}
          language={language}
          templateKey="editorial-hero"
          onOpenLink={onOpenLink}
        />
        <BrandProductRail
          title={templateCopy(language, "editorialHero", "newArrivalsTitle")}
          products={newArrivals}
          onOpenAll={onOpenCatalog}
          onAddToCart={onAddToCart}
          onOpenProduct={onOpenProduct}
          language={language}
          templateKey="editorial-hero"
          sectionKey="new-arrivals"
        />
        <BrandBenefitsSection
          eyebrow={templateCopy(language, "editorialHero", "offerHighlightsEyebrow")}
          title={localizedTemplateCopy(
            offerHighlightsBlock?.title,
            offerHighlightsBlock?.title_i18n,
            language,
            "editorialHero",
            "offerHighlightsTitle",
          )}
          items={offerHighlightsBlock?.items}
          language={language}
          templateKey="editorial-hero"
          sectionKey="offer-highlights"
        />
        <BrandProductRail
          title={templateCopy(language, "editorialHero", "recommendedTitle")}
          products={recommended}
          onOpenAll={onOpenCatalog}
          onAddToCart={onAddToCart}
          onOpenProduct={onOpenProduct}
          language={language}
          templateKey="editorial-hero"
          sectionKey="recommended"
        />
        <BrandSocialProofSection
          title={localizedTemplateCopy(
            socialProofBlock?.title,
            socialProofBlock?.title_i18n,
            language,
            "editorialHero",
            "socialProofTitle",
          )}
          items={socialProofBlock?.items}
          language={language}
          templateKey="editorial-hero"
        />
        {hasModule(modules, "faq-strip") ? faqSection : null}
        <BrandPoliciesSection
          title={copy(language, "template.common.policiesTitle")}
          policies={policies}
          language={language}
          templateKey="editorial-hero"
        />
        <BrandServiceSection
          title={localizedCopy(service?.title, service?.title_i18n, language, "template.common.serviceTitle")}
          service={service}
          language={language}
          templateKey="editorial-hero"
          onOpenLink={onOpenLink}
        />
        {!hasModule(modules, "faq-strip") ? faqSection : null}
        <BrandFinalCtaSection finalCta={finalCta} language={language} templateKey="editorial-hero" onOpenLink={onOpenLink} />
      </div>
      <BrandFooterSection brand={brand} footer={footer} service={service} language={language} templateKey="editorial-hero" onOpenLink={onOpenLink} />
    </>
  );
};

const CommerceGridTemplate = (props) => {
  const { brand, hero, story, valuesBlock, keyBenefitsBlock, categories, featuredCollections, bestSellers, newArrivals, recommended, offerHighlightsBlock, socialProofBlock, faqBlock, footer, service, policies, finalCta, language, onOpenCatalog, onExploreCollection, onAddToCart, onOpenProduct, onCategorySelect, onOpenLink } = props;
  const runtime = resolveTemplateRuntime(props);
  const modules = runtime.modules;
  const quickJumpActions = [
    {
      label: templateCopy(language, "commerceGrid", "quickJumpBestSellersLabel"),
      description: templateCopy(language, "commerceGrid", "quickJumpBestSellersDescription"),
      onClick: onOpenCatalog,
    },
    {
      label: templateCopy(language, "commerceGrid", "quickJumpCategoriesLabel"),
      description: templateCopy(language, "commerceGrid", "quickJumpCategoriesDescription"),
      onClick: () => onCategorySelect(categories?.[0]),
    },
  ].filter((item) => typeof item.onClick === "function");

  return (
    <>
      <CommerceHero
        brand={brand}
        hero={hero}
        language={language}
        heroExperiment={runtime.heroExperiment}
        heroLayout={runtime.heroLayout}
        quickJumpActions={hasModule(modules, "commerce-quick-jump") ? quickJumpActions : []}
        onActionClick={onOpenLink}
        onPrimaryAction={onOpenCatalog}
        onSecondaryAction={() => onCategorySelect(categories?.[0])}
      />
      <div
        className="brand-market__content brand-market__content--commerce"
        data-brand-above-fold="commerce-grid"
        data-brand-module-density={runtime.moduleDensity}
      >
        {hasModule(modules, "commerce-quick-jump") ? (
          <BrandQuickJump
            title={templateCopy(language, "commerceGrid", "quickJumpTitle")}
            actions={quickJumpActions}
            templateKey="commerce-grid"
          />
        ) : null}
        <BrandNarrativeIntro
          templateKey="commerce-grid"
          language={language}
          promiseTitle={templateCopy(language, "commerceGrid", "promiseTitle")}
          promise={props.brandPromise}
          promiseI18n={props.brandPromise_i18n}
          story={story}
          storyEyebrow={templateCopy(language, "commerceGrid", "storyEyebrow")}
          storyTitle={localizedTemplateCopy(story?.title, story?.title_i18n, language, "commerceGrid", "storyTitle")}
          storyVariant="feature"
          valuesBlock={valuesBlock}
          valuesTitle={localizedTemplateCopy(valuesBlock?.title, valuesBlock?.title_i18n, language, "commerceGrid", "valuesTitle")}
          keyBenefitsBlock={keyBenefitsBlock}
          keyBenefitsEyebrow={templateCopy(language, "commerceGrid", "keyBenefitsEyebrow")}
          keyBenefitsTitle={localizedTemplateCopy(
            keyBenefitsBlock?.title,
            keyBenefitsBlock?.title_i18n,
            language,
            "commerceGrid",
            "keyBenefitsTitle",
          )}
        />
        <BrandCategoryHub
          title={templateCopy(language, "commerceGrid", "categoryHubTitle")}
          categories={categories}
          language={language}
          templateKey="commerce-grid"
          onSelectCategory={onCategorySelect}
          variant="chips"
        />
        <BrandProductGrid
          title={templateCopy(language, "commerceGrid", "bestSellersTitle")}
          description={templateCopy(language, "commerceGrid", "bestSellersDescription")}
          products={bestSellers}
          onOpenAll={onOpenCatalog}
          onAddToCart={onAddToCart}
          onOpenProduct={onOpenProduct}
          language={language}
          templateKey="commerce-grid"
          sectionKey="best-sellers"
          dense
        />
        <BrandBannerAdsSection
          title={templateCopy(language, "commerceGrid", "bannerAdsTitle")}
          items={props.bannerAds}
          language={language}
          templateKey="commerce-grid"
          sectionKey="commerce-banner-ads"
          onOpenLink={onOpenLink}
        />
        <BrandProductRail
          title={templateCopy(language, "commerceGrid", "newArrivalsTitle")}
          products={newArrivals}
          onOpenAll={onOpenCatalog}
          onAddToCart={onAddToCart}
          onOpenProduct={onOpenProduct}
          language={language}
          templateKey="commerce-grid"
          sectionKey="new-arrivals"
        />
        {hasModule(modules, "collection-navigation") ? (
          <BrandCollectionNavigation
            title={templateCopy(language, "commerceGrid", "collectionNavigationTitle")}
            collections={featuredCollections}
            language={language}
            templateKey="commerce-grid"
            onExploreCollection={onExploreCollection}
          />
        ) : null}
        <BrandProductRail
          title={templateCopy(language, "commerceGrid", "recommendedTitle")}
          products={recommended}
          onOpenAll={onOpenCatalog}
          onAddToCart={onAddToCart}
          onOpenProduct={onOpenProduct}
          language={language}
          templateKey="commerce-grid"
          sectionKey="recommended"
        />
        <BrandBenefitsSection
          eyebrow={templateCopy(language, "commerceGrid", "offerHighlightsEyebrow")}
          title={localizedTemplateCopy(
            offerHighlightsBlock?.title,
            offerHighlightsBlock?.title_i18n,
            language,
            "commerceGrid",
            "offerHighlightsTitle",
          )}
          items={offerHighlightsBlock?.items}
          language={language}
          templateKey="commerce-grid"
          sectionKey="offer-highlights"
        />
        <BrandSocialProofSection
          title={localizedTemplateCopy(
            socialProofBlock?.title,
            socialProofBlock?.title_i18n,
            language,
            "commerceGrid",
            "socialProofTitle",
          )}
          items={socialProofBlock?.items}
          language={language}
          templateKey="commerce-grid"
        />
        <BrandPoliciesSection
          title={copy(language, "template.common.policiesTitle")}
          policies={policies}
          language={language}
          templateKey="commerce-grid"
        />
        <BrandServiceSection
          title={localizedCopy(service?.title, service?.title_i18n, language, "template.common.serviceTitle")}
          service={service}
          language={language}
          templateKey="commerce-grid"
          onOpenLink={onOpenLink}
        />
        <BrandFaqSection
          title={localizedCopy(faqBlock?.title, faqBlock?.title_i18n, language, "template.common.faqTitle")}
          items={faqBlock?.items}
          language={language}
          templateKey="commerce-grid"
        />
        <BrandFinalCtaSection finalCta={finalCta} language={language} templateKey="commerce-grid" onOpenLink={onOpenLink} />
      </div>
      <BrandFooterSection brand={brand} footer={footer} service={service} language={language} templateKey="commerce-grid" onOpenLink={onOpenLink} />
    </>
  );
};

const StoryCollectionTemplate = (props) => {
  const { brand, hero, story, valuesBlock, keyBenefitsBlock, featuredCollections, recommended, bestSellers, newArrivals, offerHighlightsBlock, socialProofBlock, faqBlock, footer, service, policies, finalCta, language, onOpenCatalog, onExploreCollection, onAddToCart, onOpenProduct, onCategorySelect, categories, onOpenLink } = props;
  const runtime = resolveTemplateRuntime(props);
  const modules = runtime.modules;
  const faqSection = (
    <BrandFaqSection
      title={localizedCopy(faqBlock?.title, faqBlock?.title_i18n, language, "template.common.faqTitle")}
      items={faqBlock?.items}
      language={language}
      templateKey="story-collection"
    />
  );

  return (
    <>
      <StoryCollectionHero
        brand={brand}
        hero={hero}
        language={language}
        heroExperiment={runtime.heroExperiment}
        heroLayout={runtime.heroLayout}
        collections={featuredCollections}
        onExploreCollection={onExploreCollection}
        onActionClick={onOpenLink}
        onPrimaryAction={() => onExploreCollection(featuredCollections?.[0], "hero-primary")}
        onSecondaryAction={onOpenCatalog}
      />
      <div
        className="brand-market__content brand-market__content--story"
        data-brand-above-fold="story-collection"
        data-brand-module-density={runtime.moduleDensity}
      >
        <BrandCategoryHub
          title={templateCopy(language, "storyCollection", "categoryHubTitle")}
          categories={categories}
          language={language}
          templateKey="story-collection"
          onSelectCategory={onCategorySelect}
          variant="chips"
        />
        <BrandNarrativeIntro
          templateKey="story-collection"
          language={language}
          promiseTitle={templateCopy(language, "storyCollection", "promiseTitle")}
          promise={props.brandPromise}
          promiseI18n={props.brandPromise_i18n}
          story={story}
          storyEyebrow={templateCopy(language, "storyCollection", "storyEyebrow")}
          storyTitle={localizedTemplateCopy(story?.title, story?.title_i18n, language, "storyCollection", "storyTitle")}
          storyVariant="feature"
          valuesBlock={valuesBlock}
          valuesTitle={localizedTemplateCopy(valuesBlock?.title, valuesBlock?.title_i18n, language, "storyCollection", "valuesTitle")}
          keyBenefitsBlock={keyBenefitsBlock}
          keyBenefitsEyebrow={templateCopy(language, "storyCollection", "keyBenefitsEyebrow")}
          keyBenefitsTitle={localizedTemplateCopy(
            keyBenefitsBlock?.title,
            keyBenefitsBlock?.title_i18n,
            language,
            "storyCollection",
            "keyBenefitsTitle",
          )}
        />
        <BrandCollectionGrid
          title={templateCopy(language, "storyCollection", "featuredCollectionsTitle")}
          collections={featuredCollections}
          language={language}
          templateKey="story-collection"
          sectionKey="featured-collections"
          onExploreCollection={onExploreCollection}
        />
        {hasModule(modules, "collection-navigation") ? (
          <BrandCollectionNavigation
            title={templateCopy(language, "storyCollection", "collectionNavigationTitle")}
            collections={featuredCollections}
            language={language}
            templateKey="story-collection"
            onExploreCollection={onExploreCollection}
          />
        ) : null}
        <BrandProductRail
          title={templateCopy(language, "storyCollection", "recommendedTitle")}
          products={recommended}
          onOpenAll={onOpenCatalog}
          onAddToCart={onAddToCart}
          onOpenProduct={onOpenProduct}
          language={language}
          templateKey="story-collection"
          sectionKey="recommended"
        />
        <BrandBannerAdsSection
          title={templateCopy(language, "storyCollection", "bannerAdsTitle")}
          items={props.bannerAds}
          language={language}
          templateKey="story-collection"
          onOpenLink={onOpenLink}
        />
        <BrandProductRail
          title={templateCopy(language, "storyCollection", "bestSellersTitle")}
          products={bestSellers}
          onOpenAll={onOpenCatalog}
          onAddToCart={onAddToCart}
          onOpenProduct={onOpenProduct}
          language={language}
          templateKey="story-collection"
          sectionKey="best-sellers"
        />
        <BrandProductRail
          title={templateCopy(language, "storyCollection", "newArrivalsTitle")}
          products={newArrivals}
          onOpenAll={onOpenCatalog}
          onAddToCart={onAddToCart}
          onOpenProduct={onOpenProduct}
          language={language}
          templateKey="story-collection"
          sectionKey="new-arrivals"
        />
        <BrandBenefitsSection
          eyebrow={templateCopy(language, "storyCollection", "offerHighlightsEyebrow")}
          title={localizedTemplateCopy(
            offerHighlightsBlock?.title,
            offerHighlightsBlock?.title_i18n,
            language,
            "storyCollection",
            "offerHighlightsTitle",
          )}
          items={offerHighlightsBlock?.items}
          language={language}
          templateKey="story-collection"
          sectionKey="offer-highlights"
        />
        <BrandSocialProofSection
          title={localizedTemplateCopy(
            socialProofBlock?.title,
            socialProofBlock?.title_i18n,
            language,
            "storyCollection",
            "socialProofTitle",
          )}
          items={socialProofBlock?.items}
          language={language}
          templateKey="story-collection"
        />
        <BrandPoliciesSection
          title={copy(language, "template.common.policiesTitle")}
          policies={policies}
          language={language}
          templateKey="story-collection"
        />
        <BrandServiceSection
          title={localizedCopy(service?.title, service?.title_i18n, language, "template.common.serviceTitle")}
          service={service}
          language={language}
          templateKey="story-collection"
          onOpenLink={onOpenLink}
        />
        {faqSection}
        <BrandFinalCtaSection finalCta={finalCta} language={language} templateKey="story-collection" onOpenLink={onOpenLink} />
      </div>
      <BrandFooterSection brand={brand} footer={footer} service={service} language={language} templateKey="story-collection" onOpenLink={onOpenLink} />
    </>
  );
};

const CampaignFocusTemplate = (props) => {
  const { brand, hero, story, valuesBlock, keyBenefitsBlock, bannerAds, campaigns, offerHighlightsBlock, categories, featuredCollections, recommended, bestSellers, newArrivals, socialProofBlock, faqBlock, footer, service, policies, finalCta, language, onOpenCatalog, onExploreCollection, onAddToCart, onOpenProduct, onCategorySelect, onOpenLink } = props;
  const runtime = resolveTemplateRuntime(props);
  const modules = runtime.modules;
  return (
    <>
      <CampaignFocusHero
        brand={brand}
        hero={hero}
        language={language}
        heroExperiment={runtime.heroExperiment}
        heroLayout={runtime.heroLayout}
        bannerAds={bannerAds}
        onActionClick={onOpenLink}
        onOpenLink={onOpenLink}
        onPrimaryAction={() =>
          campaigns?.[0]?.targetUrl || bannerAds?.[0]?.targetUrl
            ? onOpenLink(campaigns?.[0]?.targetUrl || bannerAds?.[0]?.targetUrl, "hero-primary", {
                label: copy(language, "defaults.campaign"),
              })
            : onOpenCatalog()
        }
        onSecondaryAction={onOpenCatalog}
      />
      <div
        className="brand-market__content brand-market__content--campaign"
        data-brand-above-fold="campaign-focus"
        data-brand-module-density={runtime.moduleDensity}
      >
        <BrandNarrativeIntro
          templateKey="campaign-focus"
          language={language}
          promiseTitle={templateCopy(language, "campaignFocus", "promiseTitle")}
          promise={props.brandPromise}
          promiseI18n={props.brandPromise_i18n}
          story={story}
          storyEyebrow={templateCopy(language, "campaignFocus", "storyEyebrow")}
          storyTitle={localizedTemplateCopy(story?.title, story?.title_i18n, language, "campaignFocus", "storyTitle")}
          storyVariant="feature"
          valuesBlock={valuesBlock}
          valuesTitle={localizedTemplateCopy(valuesBlock?.title, valuesBlock?.title_i18n, language, "campaignFocus", "valuesTitle")}
          keyBenefitsBlock={keyBenefitsBlock}
          keyBenefitsEyebrow={templateCopy(language, "campaignFocus", "keyBenefitsEyebrow")}
          keyBenefitsTitle={localizedTemplateCopy(
            keyBenefitsBlock?.title,
            keyBenefitsBlock?.title_i18n,
            language,
            "campaignFocus",
            "keyBenefitsTitle",
          )}
        />
        <BrandCategoryHub
          title={templateCopy(language, "campaignFocus", "categoryHubTitle")}
          categories={categories}
          language={language}
          templateKey="campaign-focus"
          onSelectCategory={onCategorySelect}
          variant="chips"
        />
        <BrandCollectionGrid
          title={templateCopy(language, "campaignFocus", "featuredCollectionsTitle")}
          collections={featuredCollections}
          language={language}
          templateKey="campaign-focus"
          sectionKey="featured-collections"
          onExploreCollection={onExploreCollection}
        />
        <BrandCollectionNavigation
          title={templateCopy(language, "campaignFocus", "collectionNavigationTitle")}
          collections={featuredCollections}
          language={language}
          templateKey="campaign-focus"
          onExploreCollection={onExploreCollection}
        />
        <BrandBannerAdsSection
          title={templateCopy(language, "campaignFocus", "bannerAdsTitle")}
          items={bannerAds}
          language={language}
          templateKey="campaign-focus"
          sectionKey="campaign-banners"
          onOpenLink={onOpenLink}
        />
        {hasModule(modules, "campaign-highlight") ? (
          <BrandCampaignSection
            title={templateCopy(language, "campaignFocus", "liveCampaignsTitle")}
            items={campaigns}
            language={language}
            templateKey="campaign-focus"
            onOpenLink={onOpenLink}
          />
        ) : null}
        <BrandBenefitsSection
          eyebrow={templateCopy(language, "campaignFocus", "offerHighlightsEyebrow")}
          title={localizedTemplateCopy(
            offerHighlightsBlock?.title,
            offerHighlightsBlock?.title_i18n,
            language,
            "campaignFocus",
            "offerHighlightsTitle",
          )}
          items={offerHighlightsBlock?.items}
          language={language}
          templateKey="campaign-focus"
          sectionKey="offer-highlights"
        />
        <BrandProductRail
          title={templateCopy(language, "campaignFocus", "recommendedTitle")}
          products={recommended}
          onOpenAll={onOpenCatalog}
          onAddToCart={onAddToCart}
          onOpenProduct={onOpenProduct}
          language={language}
          templateKey="campaign-focus"
          sectionKey="recommended"
        />
        <BrandProductGrid
          title={templateCopy(language, "campaignFocus", "bestSellersTitle")}
          products={bestSellers}
          onOpenAll={onOpenCatalog}
          onAddToCart={onAddToCart}
          onOpenProduct={onOpenProduct}
          language={language}
          templateKey="campaign-focus"
          sectionKey="best-sellers"
          dense
        />
        <BrandProductRail
          title={templateCopy(language, "campaignFocus", "newArrivalsTitle")}
          products={newArrivals}
          onOpenAll={onOpenCatalog}
          onAddToCart={onAddToCart}
          onOpenProduct={onOpenProduct}
          language={language}
          templateKey="campaign-focus"
          sectionKey="new-arrivals"
        />
        <BrandSocialProofSection
          title={localizedTemplateCopy(
            socialProofBlock?.title,
            socialProofBlock?.title_i18n,
            language,
            "campaignFocus",
            "socialProofTitle",
          )}
          items={socialProofBlock?.items}
          language={language}
          templateKey="campaign-focus"
        />
        <BrandPoliciesSection
          title={copy(language, "template.common.policiesTitle")}
          policies={policies}
          language={language}
          templateKey="campaign-focus"
        />
        <BrandServiceSection
          title={localizedCopy(service?.title, service?.title_i18n, language, "template.common.serviceTitle")}
          service={service}
          language={language}
          templateKey="campaign-focus"
          onOpenLink={onOpenLink}
        />
        <BrandFaqSection
          title={localizedCopy(faqBlock?.title, faqBlock?.title_i18n, language, "template.common.faqTitle")}
          items={faqBlock?.items}
          language={language}
          templateKey="campaign-focus"
        />
        <BrandFinalCtaSection finalCta={finalCta} language={language} templateKey="campaign-focus" onOpenLink={onOpenLink} />
      </div>
      <BrandFooterSection brand={brand} footer={footer} service={service} language={language} templateKey="campaign-focus" onOpenLink={onOpenLink} />
    </>
  );
};

const RoutineSolutionTemplate = (props) => {
  const { brand, hero, story, valuesBlock, keyBenefitsBlock, offerHighlightsBlock, brandPromise, brandPromise_i18n, categories, featuredCollections, bestSellers, newArrivals, recommended, socialProofBlock, faqBlock, footer, service, policies, finalCta, bannerAds, language, onOpenCatalog, onExploreCollection, onAddToCart, onOpenProduct, onCategorySelect, onOpenLink } = props;
  const runtime = resolveTemplateRuntime(props);
  const modules = runtime.modules;
  const routineActions = ensureArray(keyBenefitsBlock?.items)
    .slice(0, 4)
    .map((item, index) => ({
      label: localizedCopy(item?.title, item?.title_i18n, language, "defaults.stepNumber", {
        count: index + 1,
      }),
      description: getLocalizedField(item?.description, item?.description_i18n, language, ""),
      onClick: onOpenCatalog,
    }));
  return (
    <>
      <RoutineSolutionHero
        brand={brand}
        hero={hero}
        language={language}
        heroExperiment={runtime.heroExperiment}
        heroLayout={runtime.heroLayout}
        steps={keyBenefitsBlock?.items}
        onActionClick={onOpenLink}
        onPrimaryAction={() => onExploreCollection(featuredCollections?.[0], "hero-primary")}
        onSecondaryAction={onOpenCatalog}
      />
      <div
        className="brand-market__content brand-market__content--routine"
        data-brand-above-fold="routine-solution"
        data-brand-module-density={runtime.moduleDensity}
      >
        {hasModule(modules, "routine-steps") ? (
          <BrandQuickJump
            title={templateCopy(language, "routineSolution", "quickJumpTitle")}
            actions={routineActions}
            templateKey="routine-solution"
          />
        ) : null}
        <BrandCategoryHub
          title={templateCopy(language, "routineSolution", "categoryHubTitle")}
          categories={categories}
          language={language}
          templateKey="routine-solution"
          onSelectCategory={onCategorySelect}
          variant="chips"
        />
        <BrandNarrativeIntro
          templateKey="routine-solution"
          language={language}
          promiseTitle={templateCopy(language, "routineSolution", "promiseTitle")}
          promise={brandPromise}
          promiseI18n={brandPromise_i18n}
          story={story}
          storyEyebrow={templateCopy(language, "routineSolution", "storyEyebrow")}
          storyTitle={localizedTemplateCopy(story?.title, story?.title_i18n, language, "routineSolution", "storyTitle")}
          storyVariant="feature"
          valuesBlock={valuesBlock}
          valuesTitle={localizedTemplateCopy(valuesBlock?.title, valuesBlock?.title_i18n, language, "routineSolution", "valuesTitle")}
          keyBenefitsBlock={keyBenefitsBlock}
          keyBenefitsEyebrow={templateCopy(language, "routineSolution", "keyBenefitsEyebrow")}
          keyBenefitsTitle={localizedTemplateCopy(
            keyBenefitsBlock?.title,
            keyBenefitsBlock?.title_i18n,
            language,
            "routineSolution",
            "keyBenefitsTitle",
          )}
        />
        <BrandBenefitsSection
          eyebrow={templateCopy(language, "routineSolution", "offerHighlightsEyebrow")}
          title={localizedTemplateCopy(
            offerHighlightsBlock?.title,
            offerHighlightsBlock?.title_i18n,
            language,
            "routineSolution",
            "offerHighlightsTitle",
          )}
          items={offerHighlightsBlock?.items}
          language={language}
          templateKey="routine-solution"
          sectionKey="offer-highlights"
        />
        <BrandCollectionGrid
          title={templateCopy(language, "routineSolution", "featuredCollectionsTitle")}
          collections={featuredCollections}
          language={language}
          templateKey="routine-solution"
          sectionKey="routine-collections"
          onExploreCollection={onExploreCollection}
        />
        {hasModule(modules, "collection-navigation") ? (
          <BrandCollectionNavigation
            title={templateCopy(language, "routineSolution", "collectionNavigationTitle")}
            collections={featuredCollections}
            language={language}
            templateKey="routine-solution"
            onExploreCollection={onExploreCollection}
          />
        ) : null}
        <BrandBannerAdsSection
          title={templateCopy(language, "routineSolution", "bannerAdsTitle")}
          items={bannerAds}
          language={language}
          templateKey="routine-solution"
          sectionKey="routine-banners"
          onOpenLink={onOpenLink}
        />
        <BrandProductRail
          title={templateCopy(language, "routineSolution", "bestSellersTitle")}
          products={bestSellers}
          onOpenAll={onOpenCatalog}
          onAddToCart={onAddToCart}
          onOpenProduct={onOpenProduct}
          language={language}
          templateKey="routine-solution"
          sectionKey="best-sellers"
        />
        <BrandProductRail
          title={templateCopy(language, "routineSolution", "newArrivalsTitle")}
          products={newArrivals}
          onOpenAll={onOpenCatalog}
          onAddToCart={onAddToCart}
          onOpenProduct={onOpenProduct}
          language={language}
          templateKey="routine-solution"
          sectionKey="new-arrivals"
        />
        <BrandProductRail
          title={templateCopy(language, "routineSolution", "recommendedTitle")}
          products={recommended}
          onOpenAll={onOpenCatalog}
          onAddToCart={onAddToCart}
          onOpenProduct={onOpenProduct}
          language={language}
          templateKey="routine-solution"
          sectionKey="recommended"
        />
        <BrandSocialProofSection
          title={localizedTemplateCopy(
            socialProofBlock?.title,
            socialProofBlock?.title_i18n,
            language,
            "routineSolution",
            "socialProofTitle",
          )}
          items={socialProofBlock?.items}
          language={language}
          templateKey="routine-solution"
        />
        <BrandPoliciesSection
          title={copy(language, "template.common.policiesTitle")}
          policies={policies}
          language={language}
          templateKey="routine-solution"
        />
        <BrandServiceSection
          title={localizedCopy(service?.title, service?.title_i18n, language, "template.common.serviceTitle")}
          service={service}
          language={language}
          templateKey="routine-solution"
          onOpenLink={onOpenLink}
        />
        <BrandFaqSection
          title={localizedCopy(faqBlock?.title, faqBlock?.title_i18n, language, "template.common.faqTitle")}
          items={faqBlock?.items}
          language={language}
          templateKey="routine-solution"
        />
        <BrandFinalCtaSection finalCta={finalCta} language={language} templateKey="routine-solution" onOpenLink={onOpenLink} />
      </div>
      <BrandFooterSection brand={brand} footer={footer} service={service} language={language} templateKey="routine-solution" onOpenLink={onOpenLink} />
    </>
  );
};

const DealPromoTemplate = (props) => {
  const { brand, hero, story, valuesBlock, keyBenefitsBlock, bannerAds, categories, featuredCollections, bestSellers, newArrivals, recommended, socialProofBlock, faqBlock, footer, service, policies, finalCta, offerHighlightsBlock, language, onOpenCatalog, onExploreCollection, onAddToCart, onOpenProduct, onCategorySelect, onOpenLink } = props;
  const runtime = resolveTemplateRuntime(props);
  const modules = runtime.modules;
  const faqSection = (
    <BrandFaqSection
      title={localizedCopy(faqBlock?.title, faqBlock?.title_i18n, language, "template.common.faqTitle")}
      items={faqBlock?.items}
      language={language}
      templateKey="deal-promo"
    />
  );
  return (
    <>
      <DealPromoHero
        brand={brand}
        hero={hero}
        language={language}
        heroExperiment={runtime.heroExperiment}
        heroLayout={runtime.heroLayout}
        bannerAds={bannerAds}
        onActionClick={onOpenLink}
        onPrimaryAction={() =>
          bannerAds?.[0]?.targetUrl
            ? onOpenLink(bannerAds?.[0]?.targetUrl, "hero-primary", { label: copy(language, "defaults.offer") })
            : onOpenCatalog()
        }
        onSecondaryAction={onOpenCatalog}
      />
      <div
        className="brand-market__content brand-market__content--deal"
        data-brand-above-fold="deal-promo"
        data-brand-module-density={runtime.moduleDensity}
      >
        <BrandNarrativeIntro
          templateKey="deal-promo"
          language={language}
          promiseTitle={templateCopy(language, "dealPromo", "promiseTitle")}
          promise={props.brandPromise}
          promiseI18n={props.brandPromise_i18n}
          story={story}
          storyEyebrow={templateCopy(language, "dealPromo", "storyEyebrow")}
          storyTitle={localizedTemplateCopy(story?.title, story?.title_i18n, language, "dealPromo", "storyTitle")}
          storyVariant="card"
          valuesBlock={valuesBlock}
          valuesTitle={localizedTemplateCopy(valuesBlock?.title, valuesBlock?.title_i18n, language, "dealPromo", "valuesTitle")}
          keyBenefitsBlock={keyBenefitsBlock}
          keyBenefitsEyebrow={templateCopy(language, "dealPromo", "keyBenefitsEyebrow")}
          keyBenefitsTitle={localizedTemplateCopy(
            keyBenefitsBlock?.title,
            keyBenefitsBlock?.title_i18n,
            language,
            "dealPromo",
            "keyBenefitsTitle",
          )}
        />
        <BrandCategoryHub
          title={templateCopy(language, "dealPromo", "categoryHubTitle")}
          categories={categories}
          language={language}
          templateKey="deal-promo"
          onSelectCategory={onCategorySelect}
          variant="chips"
        />
        <BrandCollectionGrid
          title={templateCopy(language, "dealPromo", "featuredCollectionsTitle")}
          collections={featuredCollections}
          language={language}
          templateKey="deal-promo"
          sectionKey="featured-collections"
          onExploreCollection={onExploreCollection}
        />
        <BrandCollectionNavigation
          title={templateCopy(language, "dealPromo", "collectionNavigationTitle")}
          collections={featuredCollections}
          language={language}
          templateKey="deal-promo"
          onExploreCollection={onExploreCollection}
        />
        <BrandBannerAdsSection
          title={templateCopy(language, "dealPromo", "bannerAdsTitle")}
          items={bannerAds}
          language={language}
          templateKey="deal-promo"
          sectionKey="deal-banners"
          onOpenLink={onOpenLink}
        />
        <BrandProductGrid
          title={templateCopy(language, "dealPromo", "bestDealPicksTitle")}
          products={bestSellers}
          onOpenAll={onOpenCatalog}
          onAddToCart={onAddToCart}
          onOpenProduct={onOpenProduct}
          language={language}
          templateKey="deal-promo"
          sectionKey="best-sellers"
          dense
        />
        <BrandProductRail
          title={templateCopy(language, "dealPromo", "newArrivalsTitle")}
          products={newArrivals}
          onOpenAll={onOpenCatalog}
          onAddToCart={onAddToCart}
          onOpenProduct={onOpenProduct}
          language={language}
          templateKey="deal-promo"
          sectionKey="new-arrivals"
        />
        <BrandProductRail
          title={templateCopy(language, "dealPromo", "recommendedTitle")}
          products={recommended}
          onOpenAll={onOpenCatalog}
          onAddToCart={onAddToCart}
          onOpenProduct={onOpenProduct}
          language={language}
          templateKey="deal-promo"
          sectionKey="recommended"
        />
        <BrandBenefitsSection
          eyebrow={templateCopy(language, "dealPromo", "offerHighlightsEyebrow")}
          title={localizedTemplateCopy(
            offerHighlightsBlock?.title,
            offerHighlightsBlock?.title_i18n,
            language,
            "dealPromo",
            "offerHighlightsTitle",
          )}
          items={offerHighlightsBlock?.items}
          language={language}
          templateKey="deal-promo"
          sectionKey="offer-highlights"
        />
        <BrandSocialProofSection
          title={localizedTemplateCopy(
            socialProofBlock?.title,
            socialProofBlock?.title_i18n,
            language,
            "dealPromo",
            "socialProofTitle",
          )}
          items={socialProofBlock?.items}
          language={language}
          templateKey="deal-promo"
        />
        {hasModule(modules, "faq-strip") ? faqSection : null}
        <BrandPoliciesSection
          title={copy(language, "template.common.policiesTitle")}
          policies={policies}
          language={language}
          templateKey="deal-promo"
        />
        <BrandServiceSection
          title={localizedCopy(service?.title, service?.title_i18n, language, "template.common.serviceTitle")}
          service={service}
          language={language}
          templateKey="deal-promo"
          onOpenLink={onOpenLink}
        />
        {!hasModule(modules, "faq-strip") ? faqSection : null}
        <BrandFinalCtaSection finalCta={finalCta} language={language} templateKey="deal-promo" onOpenLink={onOpenLink} />
      </div>
      <BrandFooterSection brand={brand} footer={footer} service={service} language={language} templateKey="deal-promo" onOpenLink={onOpenLink} />
    </>
  );
};

const CategoryHubTemplate = (props) => {
  const { brand, hero, story, valuesBlock, keyBenefitsBlock, categories, featuredCollections, bestSellers, newArrivals, recommended, bannerAds, offerHighlightsBlock, socialProofBlock, faqBlock, footer, service, policies, finalCta, collections, language, onOpenCatalog, onAddToCart, onOpenProduct, onCategorySelect, onExploreCollection, onOpenLink } = props;
  const runtime = resolveTemplateRuntime(props);
  const modules = runtime.modules;
  return (
    <>
      <CategoryHubHero
        brand={brand}
        hero={hero}
        language={language}
        heroExperiment={runtime.heroExperiment}
        heroLayout={runtime.heroLayout}
        categories={categories}
        onSelectCategory={onCategorySelect}
        onActionClick={onOpenLink}
        onPrimaryAction={onOpenCatalog}
        onSecondaryAction={() => onCategorySelect(categories?.[0])}
      />
      <div
        className="brand-market__content brand-market__content--hub"
        data-brand-above-fold="category-hub"
        data-brand-module-density={runtime.moduleDensity}
      >
        <BrandNarrativeIntro
          templateKey="category-hub"
          language={language}
          promiseTitle={templateCopy(language, "categoryHub", "promiseTitle")}
          promise={props.brandPromise}
          promiseI18n={props.brandPromise_i18n}
          story={story}
          storyEyebrow={templateCopy(language, "categoryHub", "storyEyebrow")}
          storyTitle={localizedTemplateCopy(story?.title, story?.title_i18n, language, "categoryHub", "storyTitle")}
          storyVariant="feature"
          valuesBlock={valuesBlock}
          valuesTitle={localizedTemplateCopy(valuesBlock?.title, valuesBlock?.title_i18n, language, "categoryHub", "valuesTitle")}
          keyBenefitsBlock={keyBenefitsBlock}
          keyBenefitsEyebrow={templateCopy(language, "categoryHub", "keyBenefitsEyebrow")}
          keyBenefitsTitle={localizedTemplateCopy(
            keyBenefitsBlock?.title,
            keyBenefitsBlock?.title_i18n,
            language,
            "categoryHub",
            "keyBenefitsTitle",
          )}
        />
        {hasModule(modules, "category-hub") ? (
          <BrandCategoryHub
            title={templateCopy(language, "categoryHub", "allCategoriesTitle")}
            categories={categories}
            language={language}
            templateKey="category-hub"
            onSelectCategory={onCategorySelect}
          />
        ) : null}
        {hasModule(modules, "collection-navigation") ? (
          <BrandCollectionNavigation
            title={templateCopy(language, "categoryHub", "collectionNavigationTitle")}
            collections={featuredCollections}
            language={language}
            templateKey="category-hub"
            onExploreCollection={onExploreCollection}
          />
        ) : null}
        <BrandProductRail
          title={templateCopy(language, "categoryHub", "bestSellersTitle")}
          products={bestSellers}
          onOpenAll={onOpenCatalog}
          onAddToCart={onAddToCart}
          onOpenProduct={onOpenProduct}
          language={language}
          templateKey="category-hub"
          sectionKey="best-sellers"
        />
        <BrandProductRail
          title={templateCopy(language, "categoryHub", "newArrivalsTitle")}
          products={newArrivals}
          onOpenAll={onOpenCatalog}
          onAddToCart={onAddToCart}
          onOpenProduct={onOpenProduct}
          language={language}
          templateKey="category-hub"
          sectionKey="new-arrivals"
        />
        <BrandProductRail
          title={templateCopy(language, "categoryHub", "recommendedTitle")}
          description={templateCopy(language, "categoryHub", "recommendedDescription")}
          products={recommended}
          onOpenAll={onOpenCatalog}
          onAddToCart={onAddToCart}
          onOpenProduct={onOpenProduct}
          language={language}
          templateKey="category-hub"
          sectionKey="recommended"
        />
        <BrandBannerAdsSection
          title={templateCopy(language, "categoryHub", "bannerAdsTitle")}
          items={bannerAds}
          language={language}
          templateKey="category-hub"
          sectionKey="category-banners"
          onOpenLink={onOpenLink}
        />
        <BrandBenefitsSection
          eyebrow={templateCopy(language, "categoryHub", "offerHighlightsEyebrow")}
          title={localizedTemplateCopy(
            offerHighlightsBlock?.title,
            offerHighlightsBlock?.title_i18n,
            language,
            "categoryHub",
            "offerHighlightsTitle",
          )}
          items={offerHighlightsBlock?.items}
          language={language}
          templateKey="category-hub"
          sectionKey="offer-highlights"
        />
        <BrandSocialProofSection
          title={localizedTemplateCopy(
            socialProofBlock?.title,
            socialProofBlock?.title_i18n,
            language,
            "categoryHub",
            "socialProofTitle",
          )}
          items={socialProofBlock?.items}
          language={language}
          templateKey="category-hub"
        />
        <BrandPoliciesSection
          title={copy(language, "template.common.policiesTitle")}
          policies={policies}
          language={language}
          templateKey="category-hub"
        />
        <BrandServiceSection
          title={localizedCopy(service?.title, service?.title_i18n, language, "template.common.serviceTitle")}
          service={service}
          language={language}
          templateKey="category-hub"
          onOpenLink={onOpenLink}
        />
        <BrandFaqSection
          title={localizedCopy(faqBlock?.title, faqBlock?.title_i18n, language, "template.common.faqTitle")}
          items={faqBlock?.items}
          language={language}
          templateKey="category-hub"
        />
        <BrandFinalCtaSection finalCta={finalCta} language={language} templateKey="category-hub" onOpenLink={onOpenLink} />
      </div>
      <BrandFooterSection brand={brand} footer={footer} service={service} language={language} templateKey="category-hub" onOpenLink={onOpenLink} />
    </>
  );
};

export const BrandTemplateSystem = (props) => {
  switch (props.templateKey) {
    case "commerce-grid":
      return <CommerceGridTemplate {...props} />;
    case "story-collection":
      return <StoryCollectionTemplate {...props} />;
    case "campaign-focus":
      return <CampaignFocusTemplate {...props} />;
    case "routine-solution":
      return <RoutineSolutionTemplate {...props} />;
    case "deal-promo":
      return <DealPromoTemplate {...props} />;
    case "category-hub":
      return <CategoryHubTemplate {...props} />;
    case "editorial-hero":
    default:
      return <EditorialHeroTemplate {...props} />;
  }
};

export const BrandTemplateSkeleton = ({ templateKey = "editorial-hero" }) => (
  <div className={`brand-market__skeleton brand-market__skeleton--${templateKey}`} data-brand-template-skeleton={templateKey}>
    <div className={`brand-market__skeleton-hero brand-market__skeleton-hero--${templateKey}`}>
      <div className="brand-market__skeleton-copy">
        <span />
        <strong />
        <strong />
        <small />
      </div>
      <div className="brand-market__skeleton-media" />
    </div>
    <div className="brand-market__skeleton-content">
      {templateKey === "commerce-grid" ? <div className="brand-market__skeleton-block brand-market__skeleton-block--toolbar" /> : null}
      {templateKey === "campaign-focus" || templateKey === "deal-promo" ? (
        <div className="brand-market__skeleton-block brand-market__skeleton-block--banner" />
      ) : null}
      <div className="brand-market__skeleton-block brand-market__skeleton-block--wide" />
      <div className="brand-market__skeleton-grid">
        <div className="brand-market__skeleton-block" />
        <div className="brand-market__skeleton-block" />
        <div className="brand-market__skeleton-block" />
      </div>
      {(templateKey === "story-collection" || templateKey === "category-hub") && (
        <div className="brand-market__skeleton-block brand-market__skeleton-block--nav" />
      )}
      <div className="brand-market__skeleton-rail">
        <div className="brand-market__skeleton-card" />
        <div className="brand-market__skeleton-card" />
        <div className="brand-market__skeleton-card" />
      </div>
    </div>
  </div>
);
