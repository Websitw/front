import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";
import "swiper/css";
import { environment } from '../../../environments/environment';
import "swiper/css/free-mode";

const BrandStoreSlider = ({ brand, activeIndex, setActiveIndex }) => {
  return (
    <section className="brand-slider">
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
        className="brand-slider__swiper"
      >
        {brand.map((brand, index) => (
          <SwiperSlide key={brand.id} className="brand-slider__slide">
            <div
              className={`brand-card ${activeIndex === index ? "active" : ""
                }`}
              onClick={() => setActiveIndex(index)}
            >

              {brand?.logoId && (
                <img
                draggable={false}
                  alt={brand.brandName}
                  className="brand-card__image"
                  src={`${environment.fileUrl}${brand.logoId}`} />
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>

  );
};

export default BrandStoreSlider;
