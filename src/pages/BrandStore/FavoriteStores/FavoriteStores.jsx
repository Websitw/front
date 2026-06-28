import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import BrandFive from '../../../assets/brands/BrandFive.png'
import BrandFour from '../../../assets/brands/BrandFour.png'
import BrandOne from '../../../assets/brands/BrandOne.png'
import BrandSeven from '../../../assets/brands/BrandSeven.png'
import BrandSex from '../../../assets/brands/BrandSex.png'
import BrandThird from '../../../assets/brands/BrandThird.png'
import BrandTwo from '../../../assets/brands/BrandTwo.png';


import { FaStar } from "react-icons/fa";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite"

const brands = [
  { id: 1, name: "Dior", image: BrandSeven },
  { id: 2, name: "7Elements", image: BrandSex},
  { id: 3, name: "Four", image: BrandFive },
  { id: 4, name: "Inglot", image: BrandFour },
  { id: 5, name: "Badwe", image: BrandThird },
  { id: 6, name: "On Set", image: BrandTwo },

  { id: 7, name: "On Set", image: BrandOne },

  { id: 1, name: "Dior", image: BrandSeven },
  { id: 2, name: "7Elements", image: BrandSex},
  { id: 3, name: "Four", image: BrandFive },
  { id: 4, name: "Inglot", image: BrandFour },
];

const FavoriteStores = () => {
  return (
    <section className="brand-slider">
      <Swiper
        modules={[FreeMode]}
        slidesPerView="auto"
        freeMode
        grabCursor
        spaceBetween={16}
        breakpoints={{
          0: {
            spaceBetween: 10,
          },
          640: {
            spaceBetween: 12,
          },
          1024: {
            spaceBetween: 16,
          },
        }}
        className="brand-slider__swiper"
      >
        {brands.map((brand) => (
          <SwiperSlide key={brand.id} className="brand-slider__slide">
            <div className="brand-card">
              <img
                src={brand.image}
                alt={brand.name}
                className="brand-card__image"
                draggable={false}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default FavoriteStores;
