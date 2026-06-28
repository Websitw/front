import React, { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";

import "swiper/css";
import "swiper/css/free-mode";

import "./Newestbrandtemplateitems.css";
import { imageUrl } from "../../../helper/helper";
import { ImageNotFound } from "../../../assets/icons";
import useCart from "../../../hooks/useCart";
import { useViewProduct } from "../../../context/ViewProductContext";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";

const StarRating = ({ rating, count }) => {
  return (
    <div className="rating">
      <span className="stars">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`star ${i <= Math.round(rating) ? "filled" : ""}`}
          >
            ★
          </span>
        ))}
      </span>
      <span className="rating-text">
        {rating}
        <span
          style={{
            color: "#707070",
            fontWeight: "600",
            fontSize: "14px",
            margin: "0 5px",
          }}
        >
          ({count})
        </span>
      </span>
    </div>
  );
};

const Newestbrandtemplateitems = ({ items, loading }) => {
  const swiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { addNewItemToCart } = useCart();

  const { openViewProduct } = useViewProduct();

  return (
    <div className="Newest-brand-template-items">
      <div className="slider-wrapper">
        <Swiper
          ref={swiperRef}
          modules={[FreeMode]}
          centeredSlides={true}
          slidesPerView="auto"
          spaceBetween={16}
          freeMode={false}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          grabCursor={true}
          className="custom-swiper"
        >
          {loading && <LoadingSpinner />}
          {!loading &&
            items?.map((product, index) => {
              const isActive = index === activeIndex;
              const priceInfo = product.price?.JO;

              return (
                <SwiperSlide
                  key={product.id}
                  className={`slide ${isActive ? "active-slide" : ""}`}
                  onClick={() => swiperRef.current?.swiper.slideTo(index)}
                >
                  <div className="slide-inner">
                    <div className={`card ${isActive ? "active" : ""}`}>
                      {isActive && <div className="dots-bg" />}

                      <div className="card-content">
                        <div className="image-wrapper">
                          <img
                            src={
                              product.mediaList[0]?.mediaId
                                ? `${imageUrl}${product.mediaList[0]?.mediaId}`
                                : ImageNotFound
                            }
                            alt={product.productTitle_i18n?.en}
                          />
                        </div>

                        {isActive && (
                          <>
                            <h3 className="title">
                              {product.productTitle_i18n?.en}
                            </h3>

                            <StarRating
                              rating={product.rating}
                              count={product.ratingCount}
                            />

                            <div className="delivery">
                              Deliver To Your Location
                            </div>

                            <div className="price-row">
                              <span className="current-price">
                                {priceInfo?.currencyCode}{" "}
                                {priceInfo?.salePrice ?? priceInfo?.listPrice}
                              </span>
                              {priceInfo?.salePrice && (
                                <span className="original-price">
                                  {priceInfo?.currencyCode}{" "}
                                  {priceInfo?.listPrice}
                                </span>
                              )}
                              {product.inventory?.displayLowStockAlert && (
                                <span className="stock-badge">
                                  Only {product.inventory?.availableToSell} Left
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {isActive && (
                      <div className="actions">
                        <button
                          onClick={() => addNewItemToCart(product)}
                          className="btn btn-cart"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={() => openViewProduct(product)}
                          className="btn btn-details"
                        >
                          Details
                        </button>
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              );
            })}
        </Swiper>
          {!items && !loading && (
            <div className="no-products">
              <h3>No products found in this brand.</h3>
            </div>
          )}
      </div>
    </div>
  );
};

export default Newestbrandtemplateitems;
