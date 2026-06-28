import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { imageUrl } from "../../helper/helper";
import {
  getBrandShowcaseMediaId,
  getPromoSaleText,
  resolveLocalizedText,
} from "./brandStoreContent";

const BrandAllBrandsSection = ({
  sectionId,
  title,
  categories = [],
  landingById = {},
  onSelectBrand,
}) => {
  const { i18n } = useTranslation();
  const language = (i18n.resolvedLanguage || i18n.language || "en").startsWith("ar")
    ? "ar"
    : "en";
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const availableFilters = useMemo(
    () => [
      {
        key: "all",
        label: language === "ar" ? "الكل" : "All",
      },
      ...categories.map((category) => ({
        key: category.key || category.id,
        label: resolveLocalizedText(category.name_i18n, language) || category.categoryName || category.key,
      })),
    ],
    [categories, language],
  );

  const filteredCategories = useMemo(() => {
    return categories
      .filter((category) => activeFilter === "all" || (category.key || category.id) === activeFilter)
      .map((category) => {
        const brands = (category.brands || []).filter((brand) => {
          if (!normalizedSearch) {
            return true;
          }

          const haystack = [
            brand.brandName,
            brand.brandDescription,
            brand.brandDescription_i18n?.[language],
            resolveLocalizedText(category.name_i18n, language),
            category.categoryName,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return haystack.includes(normalizedSearch);
        });

        return {
          ...category,
          brands,
        };
      })
      .filter((category) => category.brands.length);
  }, [activeFilter, categories, language, normalizedSearch]);

  const searchPlaceholder =
    language === "ar" ? "ابحث عن علامة أو فئة" : "Search brand or category";

  const emptyLabel =
    language === "ar"
      ? "لا توجد علامات مطابقة للفلاتر الحالية."
      : "No brands match the current filters.";

  return (
    <section
      className="brand-all-brands-section"
      data-brand-section={sectionId}
      aria-label={title}
    >
      <div className="brand-store-section__header">
        <h2 className="section-title">{title}</h2>
      </div>

      <div className="brand-all-brands-toolbar">
        <div className="brand-all-brands-filters" role="tablist" aria-label={title}>
          {availableFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              className={`brand-all-brands-filter ${activeFilter === filter.key ? "brand-all-brands-filter--active" : ""}`}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <label className="brand-all-brands-search">
          <Search size={18} strokeWidth={1.8} />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
          />
        </label>
      </div>

      <div className="brand-all-brands-results">
        {filteredCategories.length ? (
          filteredCategories.map((category) => {
            const heading =
              resolveLocalizedText(category.name_i18n, language) || category.categoryName || category.key;

            return (
              <section
                key={category.id || category.key}
                className="brand-all-brands-group"
                aria-label={heading}
              >
                <h3 className="brand-all-brands-group__title">{heading}</h3>

                <div className="brand-all-brands-group__row">
                  {category.brands.map((brand) => {
                    const landing = landingById[brand.id];
                    const mediaId = getBrandShowcaseMediaId(brand, landing);
                    const mediaSrc = mediaId ? `${imageUrl}${mediaId}` : "";
                    const badgeText = getPromoSaleText(landing, language);

                    return (
                      <button
                        key={brand.id}
                        type="button"
                        className="brand-all-brands-card"
                        onClick={() => onSelectBrand?.(brand)}
                      >
                        {mediaSrc ? (
                          <img
                            src={mediaSrc}
                            alt={brand.brandName}
                            className="brand-all-brands-card__image"
                            loading="lazy"
                            draggable={false}
                          />
                        ) : (
                          <div className="brand-all-brands-card__fallback">
                            <span>{(brand.brandName || "B").charAt(0)}</span>
                          </div>
                        )}

                        {badgeText ? (
                          <span className="brand-all-brands-card__badge">{badgeText}</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })
        ) : (
          <div className="brand-all-brands-empty">{emptyLabel}</div>
        )}
      </div>
    </section>
  );
};

export default BrandAllBrandsSection;
