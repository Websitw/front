import React, { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "./CategoriesSlider.css";


import { useNavigate } from "react-router-dom";
import { imageUrl } from "../../helper/helper";
import { useDispatch, useSelector } from "react-redux";
import { getGenralSegments } from "../../store/slices/genralStoresSlice";

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


const CategoriesSlider = ({ title , categories, goToSearch }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    loading,
    error,
  } = useSelector((state) => state.generalStores);

  if (loading) {
    return (
      <div className="top-sawa-categories">
        <div className="categories-section">
          <h2 className="categories-section-title">{title}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: "spin 1s linear infinite" }}
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <p>Loading categories...</p>
          </div>
        </div>
  
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  if (error) {
    return (
      <div className="top-sawa-categories">
        <div className="categories-section">
          <h2 className="categories-section-title">{title}</h2>
          <p>Failed to load categories</p>
          <button  onClick={() => dispatch(getGenralSegments())}>
            Retry
          </button>
        </div>
      </div>
    );
    
  }

  if (!categories.length) {
    return null;
  }

  return (
    <div className="top-sawa-categories">
      <div className="categories-section">
        <div className="header-categories">

        <h2 className="categories-section-title">{title}</h2>
        <button
        onClick={()=>{
          navigate('/SegmentCategories')
        }}
          className="best-seller-section__view-all"
        >
        View All Categories
          <ArrowRightIcon />
        </button>

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
              <div className="category-card" onClick={() => goToSearch(category.id)}>
                <div className="category-icon">
                  <img
                    src={`${imageUrl}${category?.imageId}`}
                    alt={category?.segmentName}
                  />
                </div>
                <span className="category-slider-name">
                  {category?.segmentName}
                </span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default CategoriesSlider;


