import React, { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { imageUrl } from "../../helper/helper";
import { buildBrandMarketPath } from "../../helper/brandRoutes";
import BrandMediaRail from "./BrandMediaRail";
import {
  getBrandShowcaseMediaId,
  getBrandSummary,
  getPromoSaleText,
} from "./brandStoreContent";

const BrandShowcaseSection = ({
  sectionId,
  title,
  brands = [],
  landingById = {},
  onSelectBrand,
  showSaleBadge = false,
}) => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const language = (i18n.resolvedLanguage || i18n.language || "en").startsWith("ar")
    ? "ar"
    : "en";
  const [selectedBrandId, setSelectedBrandId] = useState(brands[0]?.id || "");

  useEffect(() => {
    if (!brands.length) {
      setSelectedBrandId("");
      return;
    }

    if (!brands.some((brand) => brand.id === selectedBrandId)) {
      setSelectedBrandId(brands[0].id);
    }
  }, [brands, selectedBrandId]);

  const selectedBrand = useMemo(
    () => brands.find((brand) => brand.id === selectedBrandId) || brands[0] || null,
    [brands, selectedBrandId],
  );

  const selectedLanding = selectedBrand ? landingById[selectedBrand.id] : null;
  const selectedMediaId = getBrandShowcaseMediaId(selectedBrand, selectedLanding);
  const selectedSummary = getBrandSummary(selectedBrand, selectedLanding, language);
  const saleText = showSaleBadge ? getPromoSaleText(selectedLanding, language) : "";
  const exploreLabel = language === "ar" ? "استكشف المتجر" : "Explore Store";
  const reviewsLabel = language === "ar" ? "مراجعات" : "reviews";

  const handleSelectBrand = (brand) => {
    setSelectedBrandId(brand.id);
    onSelectBrand?.(brand);
  };

  if (!selectedBrand) {
    return null;
  }

  return (
    <section
      className="brand-showcase-section"
      data-brand-section={sectionId}
      aria-label={title}
    >
      <div className="brand-store-section__header">
        <h2 className="section-title">{title}</h2>
        {saleText ? <span className="brand-store-section__pill">{saleText}</span> : null}
      </div>

      <div className="brand-showcase-section__content">
        <article className="brand-showcase-feature">
          {selectedMediaId ? (
            <img
              src={`${imageUrl}${selectedMediaId}`}
              alt={selectedBrand.brandName}
              className="brand-showcase-feature__image"
              loading="lazy"
              draggable={false}
            />
          ) : null}

          <div className="brand-showcase-feature__overlay" />

          {saleText ? (
            <span className="brand-showcase-feature__badge">{saleText}</span>
          ) : null}

          <div className="brand-showcase-feature__content-block">
            <span className="brand-showcase-feature__eyebrow">{title}</span>
            <h3 className="brand-showcase-feature__title">{selectedBrand.brandName}</h3>

            {selectedSummary ? (
              <p className="brand-showcase-feature__summary">{selectedSummary}</p>
            ) : null}

            <div className="brand-showcase-feature__meta">
              <span className="brand-showcase-feature__rating">
                <Star size={16} fill="currentColor" strokeWidth={1.75} />
                {Number(selectedBrand.rating || 0).toFixed(1)}
              </span>
              <span className="brand-showcase-feature__reviews">
                {Number(selectedBrand.ratingCount || 0)} {reviewsLabel}
              </span>
            </div>

            <button
              type="button"
              className="brand-showcase-feature__button"
              onClick={() => navigate(buildBrandMarketPath(selectedBrand))}
            >
              {exploreLabel}
            </button>
          </div>
        </article>

        <BrandMediaRail
          brands={brands.filter((brand) => brand.id !== selectedBrand.id)}
          landingById={landingById}
          activeBrandId={selectedBrand.id}
          onSelectBrand={handleSelectBrand}
          showSaleBadge={showSaleBadge}
        />
      </div>
    </section>
  );
};

export default BrandShowcaseSection;
