import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';
import './SAWADealsSlider.css';
import DealCard from '../DealCard/DealCard';


const SAWADealsSlider = ({
  dealCards = [],
  onDealClick,
}) => {
  const swiperRef = useRef(null);


  return (
    <section className="sawa-deals-section">
      <div className="sawa-deals-section__slider-container">
     
        <Swiper
        style={{
            overflow:'hidden'
        }}
           breakpoints={{
          320: { slidesPerView: 1 },
          480: { slidesPerView: 1 },
          768: { slidesPerView: 1.5 },
          1024: { slidesPerView: 2 },
          1280: { slidesPerView: 2 },
        }}
          ref={swiperRef}
          modules={[FreeMode]}
          spaceBetween={22}
          slidesPerView="auto"
          freeMode={{
            enabled: true,
            sticky: false,
          }}
          grabCursor={true}
          className="sawa-deals-section__swiper"
        >
          {dealCards.map((deal) => (
            <SwiperSlide key={deal.id} className="sawa-deals-section__slide">
              <DealCard
                id={deal.id}
                image={deal.image}
                imageAlt={deal.imageAlt}
                title={deal.title}
                description={deal.description}
                footerColor={deal.footerColor}
                onClick={() => onDealClick && onDealClick(deal.id)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};


export default SAWADealsSlider;