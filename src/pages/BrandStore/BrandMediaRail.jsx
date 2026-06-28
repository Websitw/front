import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import { imageUrl } from "../../helper/helper";
import { getBrandShowcaseMediaId, getPromoSaleText } from "./brandStoreContent";

const BrandMediaRail = ({
  brands = [],
  landingById = {},
  onSelectBrand,
  showSaleBadge = false,
  activeBrandId = "",
}) => {
  if (!brands.length) {
    return null;
  }

  return (
    <section className="brand-media-rail">
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
        spaceBetween={16}
        className="brand-media-rail__swiper"
      >
        {brands.map((brand) => {
          const landing = landingById[brand.id];
          const mediaId = getBrandShowcaseMediaId(brand, landing);
          const mediaSrc = mediaId ? `${imageUrl}${mediaId}` : "";
          const isActive = activeBrandId === brand.id;
          const badgeText = showSaleBadge ? getPromoSaleText(landing) : "";
          const shouldShowBadge = Boolean(badgeText);

          return (
            <SwiperSlide key={brand.id} className="brand-media-rail__slide">
              <button
                type="button"
                className={`brand-media-card ${isActive ? "brand-media-card--active" : ""}`}
                onClick={() => onSelectBrand?.(brand)}
              >
                {mediaSrc ? (
                  <img
                    src={mediaSrc}
                    alt={brand.brandName}
                    className="brand-media-card__image"
                    loading="lazy"
                    draggable={false}
                  />
                ) : (
                  <div className="brand-media-card__fallback">
                    <span>{(brand.brandName || "B").charAt(0)}</span>
                  </div>
                )}

                {shouldShowBadge ? (
                  <span className="brand-media-card__badge">{badgeText}</span>
                ) : null}
              </button>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
};

export default BrandMediaRail;
