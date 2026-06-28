import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import "./SawaSlider.css";
import ProductCard from "../ProductCard/ProductCard";
import { getItemPrice, imageUrl } from "../../helper/helper";

const ArrowIcon = ({ direction = "next" }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={direction === "prev" ? { transform: "rotate(180deg)" } : undefined}
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

const BestSellerSlider = ({
  title = "Best Seller",
  onViewAll,
  onAddToCart,
  onProductClick,
  handleOpenViewProduct,
  products = [],
}) => {
  const swiperRef = useRef(null);


  return (
    <section className="best-seller-section">
      <div className="best-seller-section__slider-container">
        <button
          type="button"
          className="best-seller-section__nav-btn best-seller-section__nav-btn--prev"
          onClick={() => swiperRef.current?.slidePrev()}
          aria-label={`Scroll ${title} left`}
        >
          <ArrowIcon direction="prev" />
        </button>
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          modules={[FreeMode, Mousewheel]}
          spaceBetween={16}
          slidesPerView="auto"
          freeMode={true}
          mousewheel={{
            enabled: true,
            releaseOnEdges: true,
            sensitivity: 0.8,
          }}
          breakpoints={{
            0: {
              spaceBetween: 8,
            },
            480: {
              spaceBetween: 10,
            },
            768: {
              spaceBetween: 12,
            },
            1024: {
              spaceBetween: 16,
            },
          }}
          grabCursor={true}
          watchOverflow={true}
          className="best-seller-section__swiper"
        >
          {products.map((product) => {
              const { isOnSale, displayPrice, originalPrice } =
                getItemPrice(product);
              return (
                <SwiperSlide
                  key={product.id}
                  className="best-seller-section__slide"
                >
                  <ProductCard
                    id={product.id}
                    image={`${imageUrl}${product.mediaList?.[0]?.mediaId}`}
                    title={product.productTitle_i18n?.en}
                    rating={product.rating}
                    reviewCount={product.ratingCount}
                    currentPrice={displayPrice}
                    originalPrice={originalPrice}
                    currency={product.price?.JO?.currencyCode}
                    discountPercentage={product.price?.JO?.salePercent}
                    stockLeft={product.stockLevel}
                    deliveryText={"Deliver To Your Location"}
                    // timerText={product.timerText}
                    product={product}
                    onAddToCart={onAddToCart}
                    onCardClick={onProductClick}
                    handleOpenViewProduct={() => handleOpenViewProduct(product)}
                  />
                </SwiperSlide>
              );
            })}
        </Swiper>
        <button
          type="button"
          className="best-seller-section__nav-btn best-seller-section__nav-btn--next"
          onClick={() => swiperRef.current?.slideNext()}
          aria-label={`Scroll ${title} right`}
        >
          <ArrowIcon />
        </button>
      </div>
    </section>
  );
};

export default BestSellerSlider;
