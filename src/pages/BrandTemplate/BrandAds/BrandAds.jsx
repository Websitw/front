


import { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "../BrandTemplate.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import {environment} from '../../../environments/environment'


const imageUrl = `${environment.serverOrigin}_xfilestore/mada/`;

const BrandAds = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const brandId = searchParams.get("brandId");

  const [slides, setSlides] = useState([]);

 
  const fetchBrandBanners = async () => {
    try {
      const res = await axios.get(
        `${environment.serverOrigin}brand-landing?q=properties.brandId:${brandId}`,
        {
          headers: {
            Authorization: `Anonymous=${environment.appid}`,
          },
        }
      );
  
      const items = res?.data?.items || [];
  
      if (items.length > 0) {
        const mainBanner = items[0]?.mainBanner || [];
  
        const formattedSlides = mainBanner.map((item, index) => ({
          id: index,
          image: `${imageUrl}${item.mediaId}`,
        }));
  
        setSlides(formattedSlides);
      }
    } catch (error) {
      console.error("Error fetching brand banners:", error);
    }
  };


  useEffect(() => {
    if (brandId) {
      fetchBrandBanners();
    }
  }, [brandId]);


  return (
    <div className="brand-template-hero-slider-container">
      <Swiper
        modules={[Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        pagination={{
          clickable: true,
          bulletClass: "hero-pagination-bullet",
          bulletActiveClass: "hero-pagination-bullet-active",
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        effect="fade"
        speed={800}
        loop={true}
        className="hero-swiper"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={`slide-${index}`}>
            <div
              className="hero-slide"
              style={{
                width: "100%",
                backgroundImage: `url(${slide.image})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "100%",
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <button
        onClick={() => {
          navigate("/brand-stores");
        }}
        style={{
          position: "absolute",
          color: "var(--color-white)",
          backgroundColor: "var(--color-primary)",
          padding: "10px 40px",
          insetInlineEnd: "20px",
          top: "20px",
          zIndex: "10",
          border: "none",
          borderRadius: "37px",
          cursor: "pointer",
          fontSize: "18px",
          fontWeight: "400",
        }}
        className="back-brand-button"
      >
        Back
      </button>
    </div>
  );
};

export default BrandAds;
