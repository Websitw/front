import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";
import { useTranslation } from "react-i18next";

import "swiper/css";
import "swiper/css/free-mode";

import { imageUrl } from "../../helper/helper";
import {
  getBrandShowcaseMediaId,
  getPromoSaleText,
} from "./brandStoreContent";

const BrandDealsSection = ({
  sectionId,
  title,
  brands = [],
  landingById = {},
  onSelectBrand,
}) => {
  const { i18n } = useTranslation();
  const language = (i18n.resolvedLanguage || i18n.language || "en").startsWith("ar")
    ? "ar"
    : "en";

  if (!brands.length) {
    return null;
  }

  const headerSaleText =
    brands.map((brand) => getPromoSaleText(landingById[brand.id], language)).find(Boolean) || "";

  return (
    <section
      className="brand-deals-section"
      data-brand-section={sectionId}
      aria-label={title}
    >
      <div className="brand-deals-section__header">
        <h2 className="section-title">{title}</h2>
        {headerSaleText ? (
          <span className="brand-deals-section__pill">{headerSaleText}</span>
        ) : null}
      </div>

      <div className="brand-deals-section__rail">
        <Swiper
          modules={[FreeMode, Mousewheel]}
          slidesPerView="auto"
          freeMode={{ enabled: true, momentum: true }}
          grabCursor
          mousewheel={{
            enabled: true,
            forceToAxis: true,
            releaseOnEdges: true,
            sensitivity: 0.9,
          }}
          spaceBetween={22}
          className="brand-deals-section__swiper"
        >
          {brands.map((brand) => {
            const landing = landingById[brand.id];
            const mediaId = getBrandShowcaseMediaId(brand, landing);
            const mediaSrc = mediaId ? `${imageUrl}${mediaId}` : "";
            const badgeText = getPromoSaleText(landing, language);

            return (
              <SwiperSlide key={brand.id} className="brand-deals-section__slide">
                <button
                  type="button"
                  className="brand-deals-card"
                  onClick={() => onSelectBrand?.(brand)}
                >
                  {mediaSrc ? (
                    <img
                      src={mediaSrc}
                      alt={brand.brandName}
                      className="brand-deals-card__image"
                      loading="lazy"
                      draggable={false}
                    />
                  ) : (
                    <div className="brand-deals-card__fallback">
                      <span>{(brand.brandName || "B").charAt(0)}</span>
                    </div>
                  )}

                  {badgeText ? (
                    <span className="brand-deals-card__badge">{badgeText}</span>
                  ) : null}
                </button>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
};

export default BrandDealsSection;
