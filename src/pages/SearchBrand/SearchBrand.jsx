import React, {
  useMemo,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import "./SearchBrand.css";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Swiper, SwiperSlide } from "swiper/react";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import "swiper/css";
import { Timer, LocationB } from "../../assets/icons";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { FreeMode } from "swiper/modules";
import BrandFilter from "./components/BrandFilter";
import { useSelector, useDispatch } from "react-redux";
import StarIcon from "@mui/icons-material/Star";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import StarBorderIcon from "@mui/icons-material/StarBorder";

import ProductCard from "../../components/ProductCard/ProductCard";

import { useViewProduct } from "../../context/ViewProductContext";

import useCart from "../../hooks/useCart";

import { imageUrl } from "../../helper/helper";

import {
  setSidebarOpen,
  setSearchOpen,
  setBrandFilterOpen,
  setSearchCategoryBrandOpen,
} from "../../store/slices/userSidebar";
import BrandFive from "../../assets/brands/BrandFive.png";
import { useNavigate, useSearchParams } from "react-router-dom";
import useSearchBrand from "../../hooks/useSearchBrand";
import { getItemPrice } from "../../helper/helper";
import StarRating from "../../components/common/StarRating/StarRating";
export default function SearchBrand() {
  const swiperRef = useRef(null);
  const dispatch = useDispatch();
  const { addNewItemToCart, fetchCartItems } = useCart();
  const { openViewProduct } = useViewProduct();

  const [sortBy, setSortBy] = useState("price-desc");

  const { sidebarOpen, brandFilterOpen } = useSelector(
    (state) => state.userSidebar,
  );
  const navigate = useNavigate();
  const {
    brandsSearchResults,
    loading,
    searchPagination,
    searchFilters,
    getSearchBrandResults,
  } = useSearchBrand();
  const activeFiltersRef = useRef({});

  const [searchParams] = useSearchParams();

  const query = searchParams.get("q") || "";
  const brandId = searchParams.getAll("brandId");
  const categoryId = searchParams.getAll("categoryId");
  const segmentId = searchParams.get("segmentId") || "";
  const attribute = searchParams.getAll("attribute");
  const priceFrom = searchParams.get("priceFrom") || undefined;
  const priceTo = searchParams.get("priceTo") || undefined;
  const shopModel = searchParams.getAll("shopModel");
  const rating = searchParams.get("rating") || undefined;

  const initialFilters = {
    brandId: brandId.length > 0 ? brandId : [],
    categoryId: categoryId.length > 0 ? categoryId : [],
    segmentId: segmentId || undefined,
    attribute: attribute.length > 0 ? attribute : [],
    priceFrom,
    priceTo,
    shopModel: shopModel.length > 0 ? shopModel : [],
    rating: rating ? Number(rating) : undefined,
  };

  const { page, totalPages, totalHits } = searchPagination;

  const buildFilters = useCallback(() => {
    return { ...activeFiltersRef.current };
  }, []);

  useEffect(() => {
    const filters = {
      brandId: brandId.length > 0 ? brandId : undefined,
      categoryId: categoryId.length > 0 ? categoryId : undefined,
      segmentId: segmentId || undefined,
      attribute: attribute.length > 0 ? attribute : undefined,
      priceFrom,
      priceTo,
      shopModel: shopModel.length > 0 ? shopModel : undefined,
      rating: rating ? Number(rating) : undefined,
    };
    activeFiltersRef.current = filters;
    getSearchBrandResults(query, 1, sortBy, filters);
  }, [searchParams.toString()]);

  const handleFilterChange = useCallback(
    (filters) => {
      activeFiltersRef.current = filters;
      getSearchBrandResults(query, 1, sortBy, filters);
    },
    [query, sortBy],
  );

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    getSearchBrandResults(query, 1, newSort, buildFilters());
  };

  return (
    <div className="search-brand-page">
      <div className="brand-search-page-wrapper">
        <div
          className={`brand-search-layout ${!brandFilterOpen ? "brand-full" : ""}`}
        >
          <BrandFilter
            brandFilterOpen={brandFilterOpen}
            initialFilters={initialFilters}
            setBrandFilterOpen={(value) => dispatch(setBrandFilterOpen(value))}
            onFilterChange={handleFilterChange}
            searchFilters={searchFilters}
          />
          <div className="search-container">
            <div 
            className="search-header">
              <div className="header-left"
             
              style={{
                marginBottom:'20px'
              }}
              >
                <span
                  onClick={() => {
                    navigate("/brand-stores");
                    setTimeout(() => {
                      dispatch(setSearchOpen(true));
                      dispatch(setBrandFilterOpen(false));
                      dispatch(setSearchCategoryBrandOpen(false));
                    }, 300);
                  }}
                  className="back-link"
                >
                  ← Back
                </span>

                <div>
                  <span className="results-text">
                    {totalHits > 0 && (
                      <>
                        {totalHits} results
                        {query && (
                          <>
                            {" "}
                            for{" "}
                            <span className="highlight">"{query}"</span>
                          </>
                        )}
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div 
              
              style={{
                marginBottom:'20px'
              }}
              className="sort-wrapper">
                <span className="sort-label">Sort By</span>

                <div className="select-container">
                  <select
                    className="sort-select"
                    value={sortBy}
                    onChange={handleSortChange}
                  >
                    <option value="price-desc">Price : high to low</option>
                    <option value="price-asc">Price : low to high</option>
                  </select>

                  <KeyboardArrowDownIcon className="select-icon" />
                </div>
              </div>
            </div>

            {brandsSearchResults?.map((section, index) => {
              const brand = section.brand;
              const skus = section.skus;
              return (
                <div className="search-content" key={brand?.id || index}>
                  <div>
                    <div
                      className="brand-banner"
                      style={{
                        backgroundImage: `url(${brand?.logoId ? imageUrl + brand.logoId : BrandFive})`,
                      }}
                    ></div>

                    <div className="search-brand-card">
                      <div className="search-brand-description">
                        <p className="search-brand-description-title">
                          {brand?.brandDescription_i18n?.en}
                        </p>
                      </div>

                      <div className="rating">
                        <StarRating rating={brand?.rating} ratingCount={brand?.ratingCount}/>
                        {/* <div className="stars">
                          {[1, 2, 3, 4, 5].map((star) =>
                            star <= Math.round(brand?.rating || 0) ? (
                              <StarIcon key={star} />
                            ) : (
                              <StarBorderIcon key={star} />
                            ),
                          )}
                        </div>

                        <span className="rating-value">
                          {brand?.rating} ({brand?.ratingCount})
                        </span> */}
                      </div>

                      <div className="brand-card-footer">
                        <div className="actions">
                          <div>
                            <button className="shop-btn">Shop Now</button>
                          </div>

                          <div style={{ display: "flex", gap: "5px" }}>
                            <button className="icon-btn">
                              <FavoriteBorderIcon />
                            </button>

                            <button className="icon-btn">
                              <StarBorderIcon />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="products-swiper-wrapper">
                    <Swiper
                      modules={[FreeMode]}
                      slidesPerView="auto"
                      spaceBetween={16}
                      freeMode={true}
                      grabCursor={true}
                      className="products-swiper"
                    >
                      {skus?.map((product) => {
                        const { displayPrice, originalPrice } = getItemPrice(product);
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
                              currentPrice={
                              displayPrice
                              }
                              originalPrice={originalPrice}
                              currency={product.price?.JO?.currencyCode}
                              discountPercentage={
                                product.price?.JO?.salePercent
                              }
                              // stockLeft={
                              //   product?.inventory?.availableToSell
                              // }
                              deliveryText={"Deliver To Your Location"}
                              product={product}
                              handleOpenViewProduct={() =>
                                openViewProduct(product)
                              }
                              onAddToCart={addNewItemToCart}
                            />
                          </SwiperSlide>
                        );
                      })}
                    </Swiper>
                  </div>
                </div>
              );
            })}

            {!loading && brandsSearchResults?.length === 0 && (
              <div className="search-no-results">
                <p>No results found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}