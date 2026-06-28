import React, { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "./BrandSlider.css";
import { useNavigate } from "react-router-dom";
import { imageUrl } from "../../helper/helper";
import { useDispatch, useSelector } from "react-redux";


import {setSidebarOpen} from '../../store/slices/userSidebar'

const ArrowRightIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 18L15 12L9 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);


const BrandSlider = ({ title , categories }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();



  const goToSearch = (value, { brandId, categoryId } = {}) => {
    const params = new URLSearchParams();
    if (value) params.set("q", value);
    if (brandId) params.set("brandId", brandId);
    if (categoryId) params.set("categoryId", categoryId);

       navigate(`/search?${params.toString()}`);
      // setQuery("");
      setTimeout(() => {
        dispatch(setSidebarOpen(true));
      }, 500);

    // if (isBrandStore) {
    //   navigate(`/search-brand?${params.toString()}`);
    //   setTimeout(() => {
    //     dispatch(setBrandFilterOpen(true));
    //   }, 300);
    // } else {
    //   navigate(`/search?${params.toString()}`);
    //   setQuery("");
    //   setTimeout(() => {
    //     dispatch(setSidebarOpen(true));
    //   }, 500);
    // }
  };


  return (
    <div className="top-sawa-categories">
      <div className="categories-section">
        <div style={{
          display:'flex',
          alignItems:'center',
          justifyContent:'space-between',
        }}>

        <h2 className="categories-section-title">{title}</h2>
        {/* <button
        onClick={()=>{
        }}
          className="best-seller-section__view-all"
        >
        View All
          <ArrowRightIcon />
        </button> */}

        </div>


        <Swiper
          style={{ overflow: "visible" }}
          modules={[FreeMode]}
          spaceBetween={32}
          slidesPerView="auto"
          freeMode={true}
          grabCursor={true}
          breakpoints={{
            320: { slidesPerView: 2.5 },
            480: { slidesPerView: 3.5 },
            768: { slidesPerView: 5 },
            1024: { slidesPerView: 6 },
            1280: { slidesPerView: 8 },
          }}
          className="categories-slider"
        >
          {categories.map((category) => (
            <SwiperSlide key={category?.id}>
              <div 

onClick={(e) => 
  {
    e.stopPropagation(); 
    goToSearch("", { brandId: category.id })
  }
}
              className="category-card">
                <div className="category-icon">
                  <img
                    src={`${imageUrl}${category?.logoId}`}
                    alt={category?.brandName}
                  />
                </div>
                <span className="category-slider-name">
                  {category?.brandName}
                </span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default BrandSlider;


