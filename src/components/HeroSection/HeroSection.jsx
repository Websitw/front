import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import './HeroSection.css';
import axios from 'axios';
import { environment } from '../../environments/environment'
import { imageUrl } from '../../helper/helper'


const HeroSection = () => {

  const [data, setData] = useState([]);

  useEffect(() => {
    getLandingPage();
  }, []);

  const getLandingPage = async () => {
    try {
      const response = await axios.get(
        `${environment.serverOrigin}landing-page`,
        {
          headers: {
            Authorization: `Anonymous=${environment.appid}`,
          },
        }
      );

      setData(response?.data?.items?.[0]?.mainBanner || []);


    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  return (
    <div className="hero-slider-container">
      <Swiper
        modules={[Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        pagination={{
          clickable: true,
          bulletClass: 'hero-pagination-bullet',
          bulletActiveClass: 'hero-pagination-bullet-active',
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
        {data.map((slide, index) => (
          <SwiperSlide key={`slide-${index}`}>
            <div
              className="hero-slide"
              style={{
                backgroundImage: `url(${imageUrl}${slide.mediaId})`,
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroSection;