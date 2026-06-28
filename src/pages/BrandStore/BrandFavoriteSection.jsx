import React, { useEffect, useMemo, useState } from "react";
import { Heart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { imageUrl } from "../../helper/helper";
import { buildBrandMarketPath } from "../../helper/brandRoutes";
import BrandMediaRail from "./BrandMediaRail";
import {
  getBrandShowcaseMediaId,
  getBrandSummary,
} from "./brandStoreContent";

const BrandFavoriteSection = ({
  sectionId,
  title,
  brands = [],
  landingById = {},
  onSelectBrand,
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
  const summary = getBrandSummary(selectedBrand, selectedLanding, language);
  const shopLabel = language === "ar" ? "تسوق الآن" : "Shop Now";
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
      className="brand-favorite-section"
      data-brand-section={sectionId}
      aria-label={title}
    >
      <div className="brand-store-section__header">
        <h2 className="section-title">{title}</h2>
      </div>

      <div className="brand-favorite-section__content">
        <article className="brand-favorite-feature">
          <div className="brand-favorite-feature__media">
            {selectedMediaId ? (
              <img
                src={`${imageUrl}${selectedMediaId}`}
                alt={selectedBrand.brandName}
                className="brand-favorite-feature__image"
                loading="lazy"
                draggable={false}
              />
            ) : (
              <div className="brand-favorite-feature__fallback">
                <span>{(selectedBrand.brandName || "B").charAt(0)}</span>
              </div>
            )}
          </div>

          {summary ? (
            <p className="brand-favorite-feature__summary">{summary}</p>
          ) : null}

          <div className="brand-favorite-feature__footer">
            <div className="brand-favorite-feature__rating-row">
              <span className="brand-favorite-feature__stars">
                {[0, 1, 2, 3, 4].map((item) => (
                  <Star key={item} size={16} fill="currentColor" strokeWidth={1.6} />
                ))}
              </span>
              <span className="brand-favorite-feature__rating-text">
                {Number(selectedBrand.rating || 0).toFixed(1)} ({Number(selectedBrand.ratingCount || 0)} {reviewsLabel})
              </span>
            </div>

            <div className="brand-favorite-feature__actions">
              <button
                type="button"
                className="brand-favorite-feature__button"
                onClick={() => navigate(buildBrandMarketPath(selectedBrand))}
              >
                {shopLabel}
              </button>

              <button
                type="button"
                className="brand-favorite-feature__icon-button"
                aria-label="Select brand"
                onClick={() => onSelectBrand?.(selectedBrand)}
              >
                <Heart size={18} />
              </button>

              <button
                type="button"
                className="brand-favorite-feature__icon-button"
                aria-label="Open brand store"
                onClick={() => navigate(buildBrandMarketPath(selectedBrand))}
              >
                <Star size={18} />
              </button>
            </div>
          </div>
        </article>

        <BrandMediaRail
          brands={brands.filter((brand) => brand.id !== selectedBrand.id)}
          landingById={landingById}
          activeBrandId={selectedBrand.id}
          onSelectBrand={handleSelectBrand}
          showSaleBadge
        />
      </div>
    </section>
  );
};

export default BrandFavoriteSection;
