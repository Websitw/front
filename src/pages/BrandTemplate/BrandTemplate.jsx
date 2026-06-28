import React, { useEffect, useLayoutEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import BackToTop from "../../components/BackToTop/BackToTop";
import { useViewProduct } from "../../context/ViewProductContext";
import useCart from "../../hooks/useCart";
import { trackBrandMarketEvent } from "../../helper/brandMarketAnalytics";
import { imageUrl } from "../../helper/helper";

import { BrandTemplateSkeleton, BrandTemplateSystem } from "./BrandTemplateLayouts";
import { getBrandTemplateCopy } from "./brandTemplateCopy";
import useBrandStorefront from "./useBrandStorefront";
import "./BrandTemplate.css";

const spacingScale = {
  compact: "28px",
  balanced: "40px",
  airy: "56px",
};

const densityScale = {
  compact: "24px",
  balanced: "32px",
  spacious: "44px",
};

const typographyScale = {
  compact: { display: "clamp(34px, 5vw, 60px)", title: "clamp(24px, 3vw, 34px)" },
  balanced: { display: "clamp(38px, 6vw, 74px)", title: "clamp(26px, 3.4vw, 40px)" },
  expressive: { display: "clamp(42px, 7vw, 88px)", title: "clamp(28px, 4vw, 46px)" },
};

const buttonRadius = {
  rounded: "8px",
  pill: "999px",
  sharp: "0px",
};

const openExternal = (url) => {
  if (typeof window === "undefined") {
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
};

const isExternalUrl = (value) => /^(https?:)?\/\//i.test(String(value || "").trim());

const isDirectUrl = (value) =>
  /^(mailto:|tel:)/i.test(String(value || "").trim()) || isExternalUrl(value);

const BrandTemplate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const { addNewItemToCart } = useCart();
  const { openViewProduct } = useViewProduct();
  const { loading, error, data, bestSellers, newArrivals, recommended, loadingTemplateKey } =
    useBrandStorefront();

  const resolvedQueryLanguage = useMemo(() => {
    const queryLanguage = new URLSearchParams(location.search).get("lang");
    if (String(queryLanguage || "").toLowerCase().startsWith("ar")) {
      return "ar";
    }

    if (String(queryLanguage || "").toLowerCase().startsWith("en")) {
      return "en";
    }

    return null;
  }, [location.search]);
  const language =
    resolvedQueryLanguage || ((i18n.resolvedLanguage || i18n.language || "en").startsWith("ar") ? "ar" : "en");
  const copy = (key, variables) => getBrandTemplateCopy(language, key, variables);
  const pageUtilitiesLabel = language === "ar" ? "أدوات الصفحة" : "Page utilities";
  const activeTemplateKey = data?.templateKey || loadingTemplateKey || "editorial-hero";
  const previewMode = Boolean(data?.previewMode);
  const brandDisplayName = useMemo(
    () =>
      data?.brand?.name_i18n?.[language] ||
      data?.brand?.name_i18n?.en ||
      data?.brand?.brandName ||
      data?.hero?.title_i18n?.[language] ||
      data?.hero?.title ||
      getBrandTemplateCopy(language, "defaults.brandStorefront"),
    [data?.brand?.brandName, data?.brand?.name_i18n, data?.hero?.title, data?.hero?.title_i18n, language],
  );
  const brandTagline = useMemo(
    () =>
      data?.hero?.tagline_i18n?.[language] ||
      data?.hero?.tagline_i18n?.en ||
      data?.hero?.tagline ||
      data?.hero?.eyebrow_i18n?.[language] ||
      data?.hero?.eyebrow ||
      "",
    [data?.hero?.eyebrow, data?.hero?.eyebrow_i18n, data?.hero?.tagline, data?.hero?.tagline_i18n, language],
  );
  const mastheadEyebrow = useMemo(
    () =>
      brandTagline ||
      data?.brand?.categoryName_i18n?.[language] ||
      data?.brand?.categoryName_i18n?.en ||
      data?.brand?.categoryName ||
      (language === "ar" ? "الرسمية" : "Official"),
    [brandTagline, data?.brand?.categoryName, data?.brand?.categoryName_i18n, language],
  );

  useLayoutEffect(() => {
    const currentLanguage = String(i18n.resolvedLanguage || i18n.language || "").toLowerCase();
    if (language && !currentLanguage.startsWith(language)) {
      void i18n.changeLanguage(language);
    }
  }, [i18n, language]);

  useEffect(() => {
    if (!data?.canonicalPath) {
      return;
    }

    if (previewMode) {
      if (location.pathname !== data.canonicalPath) {
        navigate(`${data.canonicalPath}${location.search}`, { replace: true });
      }
      return;
    }

    if (location.pathname === data.canonicalPath) {
      return;
    }

    if (location.pathname.startsWith("/BrandTemplate") || location.search.includes("brandId=")) {
      navigate(data.canonicalPath, { replace: true });
    }
  }, [data?.canonicalPath, location.pathname, location.search, navigate, previewMode]);

  useLayoutEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const previousLang = document.documentElement.lang;
    const previousDir = document.documentElement.dir;
    const previousTitle = document.title;

    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";

    document.title = brandDisplayName;

    return () => {
      document.documentElement.lang = previousLang;
      document.documentElement.dir = previousDir;
      document.title = previousTitle;
    };
  }, [brandDisplayName, language]);

  useLayoutEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    document.documentElement.classList.add("brand-market-route");
    document.body.classList.add("brand-market-route");

    return () => {
      document.documentElement.classList.remove("brand-market-route");
      document.body.classList.remove("brand-market-route");
    };
  }, []);

  const theme = useMemo(() => data?.theme || {}, [data?.theme]);
  const resolvedThemeMode = "dark";
  const resolvedSurfaceTone = "dark";

  const pageStyle = useMemo(() => {
    const typeScale = typographyScale[theme.typographyScale] || typographyScale.balanced;
    const isDarkTheme = resolvedThemeMode === "dark";
    return {
      "--brand-accent": theme.accentColor || "#0EA5A8",
      "--brand-surface": theme.surfaceColor || (isDarkTheme ? "#0f172a" : "#F6F1EA"),
      "--brand-text": theme.textColor || (isDarkTheme ? "#F8FAFC" : "#0F172A"),
      "--brand-border": theme.borderColor || (isDarkTheme ? "rgba(148, 163, 184, 0.18)" : "rgba(15, 23, 42, 0.12)"),
      "--brand-muted": theme.mutedTextColor || (isDarkTheme ? "#CBD5E1" : "#5B6577"),
      "--brand-heading-font": theme.headingFont || "\"Sora\", \"Montserrat\", sans-serif",
      "--brand-body-font": theme.bodyFont || "\"Manrope\", \"Segoe UI\", sans-serif",
      "--brand-display-size": typeScale.display,
      "--brand-title-size": typeScale.title,
      "--brand-section-gap": spacingScale[theme.sectionSpacingScale] || spacingScale.balanced,
      "--brand-layout-padding": densityScale[theme.layoutDensity] || densityScale.balanced,
      "--brand-button-radius": buttonRadius[theme.buttonStyle] || "8px",
    };
  }, [resolvedThemeMode, theme]);

  const pageClassName = useMemo(
    () =>
      [
        "brand-market",
        `brand-market--${activeTemplateKey}`,
        `brand-market--mode-${resolvedThemeMode}`,
        `brand-market--density-${theme.layoutDensity || "balanced"}`,
        `brand-market--buttons-${theme.buttonStyle || "rounded"}`,
        `brand-market--overlay-${theme.heroOverlayStyle || "rich"}`,
        `brand-market--cards-${theme.cardTone || "soft"}`,
        `brand-market--surface-tone-${resolvedSurfaceTone}`,
        `brand-market--imagery-${theme.imageryTone || "editorial"}`,
      ].join(" "),
    [activeTemplateKey, resolvedSurfaceTone, resolvedThemeMode, theme.buttonStyle, theme.cardTone, theme.heroOverlayStyle, theme.imageryTone, theme.layoutDensity],
  );

  const openCatalog = (sectionKey = "catalog") => {
    if (!data?.brand?.id) {
      return;
    }

    trackBrandMarketEvent("brand_market_catalog_open", {
      templateKey: activeTemplateKey,
      sectionKey,
      brandId: data.brand.id,
    });

    navigate(`/search-brand?brandId=${encodeURIComponent(data.brand.id)}`);
  };

  const openCategorySearch = (category) => {
    if (!data?.brand?.id || !category) {
      return;
    }

    const categoryLabel = category?.categoryName || category?.name_i18n?.[language] || category?.name_i18n?.en || "";
    trackBrandMarketEvent("brand_market_category_click", {
      templateKey: activeTemplateKey,
      sectionKey: "category",
      brandId: data.brand.id,
      categoryId: category?.id || category?.key || "",
      categoryLabel,
    });

    const params = new URLSearchParams({
      brandId: String(data.brand.id),
    });

    const categoryIdentifier = category?.id || category?.key || "";
    if (categoryIdentifier) {
      params.append("categoryId", String(categoryIdentifier));
    }
    if (categoryLabel) {
      params.set("q", categoryLabel);
    }

    navigate(`/search-brand?${params.toString()}`);
  };

  const openCollection = (collection, sectionKey = "collections") => {
    if (!data?.brand?.id || !collection) {
      return;
    }

    const collectionLabel =
      collection?.title_i18n?.[language] || collection?.title_i18n?.en || collection?.title || "";

    trackBrandMarketEvent("brand_market_collection_click", {
      templateKey: activeTemplateKey,
      sectionKey,
      brandId: data.brand.id,
      collectionId: collection?.id || "",
      collectionLabel,
    });

    navigate(
      `/search-brand?brandId=${encodeURIComponent(data.brand.id)}${
        collectionLabel ? `&q=${encodeURIComponent(collectionLabel)}` : ""
      }`,
    );
  };

  const openProduct = (product, sectionKey = "product") => {
    if (!product) {
      return;
    }

    trackBrandMarketEvent("brand_market_product_click", {
      templateKey: activeTemplateKey,
      sectionKey,
      brandId: data?.brand?.id || "",
      productId: product?.productId || product?.id || "",
      skuId: product?.id || "",
    });

    openViewProduct(product);
  };

  const addToCart = (product, sectionKey = "product") => {
    if (!product) {
      return;
    }

    trackBrandMarketEvent("brand_market_add_to_cart", {
      templateKey: activeTemplateKey,
      sectionKey,
      brandId: data?.brand?.id || "",
      productId: product?.productId || product?.id || "",
      skuId: product?.id || "",
    });

    addNewItemToCart(product);
  };

  const openLink = (url, sectionKey = "link", metadata = {}) => {
    const nextUrl = String(url || "").trim();
    if (!nextUrl) {
      return;
    }

    trackBrandMarketEvent("brand_market_link_click", {
      templateKey: activeTemplateKey,
      sectionKey,
      brandId: data?.brand?.id || "",
      url: nextUrl,
      ...metadata,
    });

    if (isDirectUrl(nextUrl)) {
      if (isExternalUrl(nextUrl)) {
        openExternal(nextUrl);
      } else if (typeof window !== "undefined") {
        window.location.href = nextUrl;
      }
      return;
    }

    navigate(nextUrl);
  };

  const scrollToSection = (sectionKey) => {
    if (typeof document === "undefined" || !sectionKey) {
      return;
    }

    const section = document.querySelector(`[data-section="${sectionKey}"], [data-section-key="${sectionKey}"]`);
    if (!section) {
      return;
    }

    section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const currentRouteHref = useMemo(
    () => `${data?.canonicalPath || location.pathname}${location.search}`,
    [data?.canonicalPath, location.pathname, location.search],
  );

  const serviceHasContent = Boolean(
    data?.service?.description ||
      data?.service?.description_i18n?.[language] ||
      data?.service?.description_i18n?.en ||
      data?.service?.email ||
      data?.service?.phone ||
      data?.service?.hours ||
      data?.service?.url ||
      data?.service?.links?.length,
  );

  const storefrontNavItems = [
    data?.brand?.id
      ? {
          key: "catalog",
          label: copy("masthead.catalog"),
          href: `/search-brand?brandId=${encodeURIComponent(data.brand.id)}`,
          onActivate: () => openCatalog("masthead"),
        }
      : null,
    data?.collections?.length || data?.sections?.featuredCollections?.length
      ? {
          key: "collections",
          label: copy("masthead.collections"),
          href: `${currentRouteHref}#${
            data?.sections?.featuredCollections?.length ? "featured-collections" : "collections"
          }`,
          onActivate: () =>
            scrollToSection(data?.sections?.featuredCollections?.length ? "featured-collections" : "collections"),
        }
      : null,
    bestSellers?.length
      ? {
          key: "best-sellers",
          label: copy("masthead.bestSellers"),
          href: `${currentRouteHref}#best-sellers`,
          onActivate: () => scrollToSection("best-sellers"),
        }
      : null,
    data?.policies?.length
      ? {
          key: "policies",
          label: copy("masthead.policies"),
          href: `${currentRouteHref}#policies`,
          onActivate: () => scrollToSection("policies"),
        }
      : null,
    serviceHasContent
      ? {
          key: "service",
          label: copy("masthead.support"),
          href: `${currentRouteHref}#service`,
          onActivate: () => scrollToSection("service"),
        }
      : null,
    {
      key: "brand-stores",
      label: copy("masthead.brandStores"),
      href: "/brand-stores",
      onActivate: () => navigate("/brand-stores"),
    },
  ].filter(Boolean);

  if (loading) {
    return (
      <div className={pageClassName} style={pageStyle} data-brand-template={activeTemplateKey}>
        <main className="brand-market__main" aria-busy="true">
          <BrandTemplateSkeleton templateKey={activeTemplateKey} />
        </main>
      </div>
    );
  }

  if (error || !data?.brand) {
    return (
      <div className={`${pageClassName} brand-market__state`} style={pageStyle} data-brand-template={activeTemplateKey}>
        <main className="brand-market__main">
          <h2>{copy("state.loadFailureTitle")}</h2>
          <p>{error || copy("state.brandNotFound")}</p>
          <button
            type="button"
            className="brand-market__action brand-market__action--primary"
            onClick={() => navigate("/brand-stores")}
          >
            {copy("state.backToBrandStores")}
          </button>
        </main>
      </div>
    );
  }

  const storefrontStatus = String(data?.storefront?.status || "").toUpperCase();
  const brandStatus = String(data?.brand?.status || "").toUpperCase();
  const brandApproval = String(data?.brand?.approvalStatus || "").toUpperCase();
  const publicationStatus = String(data?.storefront?.publicationStatus || "").toLowerCase() || "published";
  const isLaunchingSoon =
    !previewMode &&
    ((storefrontStatus && storefrontStatus !== "ACTIVE") ||
      (brandStatus && brandStatus !== "ACTIVE") ||
      (brandApproval && brandApproval !== "APPROVED"));

  const previewLabel =
    publicationStatus === "published"
      ? copy("preview.publishedSnapshot")
      : publicationStatus === "preview"
        ? copy("preview.previewDraft")
        : copy("preview.draft");

  if (isLaunchingSoon) {
    return (
      <div className={`${pageClassName} brand-market__state`} style={pageStyle} data-brand-template={activeTemplateKey}>
        <main className="brand-market__main">
          <h2>{copy("state.launchingSoonTitle")}</h2>
          <p>{copy("state.launchingSoonDescription")}</p>
          <button
            type="button"
            className="brand-market__action brand-market__action--primary"
            onClick={() => navigate("/brand-stores")}
          >
            {copy("state.backToBrandStores")}
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className={pageClassName} style={pageStyle} data-brand-template={activeTemplateKey}>
      <header className="brand-market__masthead" data-brand-market-header="true">
        <div className="brand-market__masthead-inner">
          <div className="brand-market__masthead-brand">
            {data?.brand?.logoId ? (
              <img
                src={`${imageUrl}${data.brand.logoId}`}
                alt={brandDisplayName}
                className="brand-market__masthead-logo"
                loading="eager"
              />
            ) : null}
            <div className="brand-market__masthead-copy">
              <span className="brand-market__masthead-eyebrow">
                {previewMode ? copy("masthead.storefrontPreview") : mastheadEyebrow}
              </span>
              <strong>{brandDisplayName}</strong>
              {brandTagline && brandTagline !== brandDisplayName ? <span>{brandTagline}</span> : null}
            </div>
          </div>
          {storefrontNavItems.length ? (
            <nav
              className="brand-market__masthead-nav"
              aria-label={copy("masthead.navigationAria")}
            >
              {storefrontNavItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  className="brand-market__action brand-market__action--secondary brand-market__masthead-link"
                  onClick={(event) => {
                    event.preventDefault();
                    item.onActivate?.();
                  }}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          ) : null}
        </div>
      </header>
      <main className="brand-market__main">
        {previewMode ? (
          <div className="brand-market__preview-banner" data-preview-mode="true">
            <div>
              <span className="brand-market__preview-eyebrow">{copy("preview.internalPreview")}</span>
              <strong>{previewLabel}</strong>
            </div>
            <p>{copy("preview.description")}</p>
          </div>
        ) : null}
        <BrandTemplateSystem
          templateKey={activeTemplateKey}
          brand={data.brand}
          hero={data.hero}
          story={data.story}
          valuesBlock={data.valuesBlock}
          keyBenefitsBlock={data.keyBenefitsBlock}
          offerHighlightsBlock={data.offerHighlightsBlock}
          socialProofBlock={data.socialProofBlock}
          faqBlock={data.faqBlock}
          finalCta={data.finalCta}
          footer={data.footer}
          service={data.service}
          policies={data.policies}
          bannerAds={data.bannerAds}
          campaigns={data.campaigns}
          categories={data.categories}
          collections={data.collections}
          featuredCollections={data.sections?.featuredCollections || []}
          bestSellers={bestSellers}
          newArrivals={newArrivals}
          recommended={recommended}
          brandPromise={data.brandPromise}
          brandPromise_i18n={data.brandPromise_i18n}
          template={data.template}
          language={language}
          searchString={location.search}
          onOpenCatalog={openCatalog}
          onCategorySelect={openCategorySearch}
          onExploreCollection={openCollection}
          onOpenProduct={openProduct}
          onAddToCart={addToCart}
          onOpenLink={openLink}
        />
      </main>
      <aside className="brand-market__utilities" aria-label={pageUtilitiesLabel}>
        <BackToTop backgroundColor="#000" textColor="#FFF" />
      </aside>
    </div>
  );
};

export default BrandTemplate;
