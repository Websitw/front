import "./SearchCategoryBrand.css";
import SearchCategory from "../../components/UserSidebar/SearchCategory/SearchCategory";
import { useNavigate } from "react-router-dom";
import { Timer, LocationB } from "../../assets/icons";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import BrandFive from "../../assets/brands/BrandFive.png";
import BrandFour from "../../assets/brands/BrandFour.png";
import BrandOne from "../../assets/brands/BrandOne.png";
import BrandSeven from "../../assets/brands/BrandSeven.png";
// import BrandSex from '../../assets/brands/BrandSex.png'
import BrandThird from "../../assets/brands/BrandThird.png";
import BrandTwo from "../../assets/brands/BrandTwo.png";
import { useDispatch } from "react-redux";
import { setSearchOpen, setSearchCategoryBrandOpen } from "../../store/slices/userSidebar";
const SearchCategoryBrand = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const brands = [
    { id: 1, name: "Dior", image: BrandSeven },
    { id: 2, name: "7Elements", image: BrandThird },
    { id: 3, name: "Four", image: BrandFive },
    { id: 4, name: "Inglot", image: BrandFour },
    { id: 5, name: "Badwe", image: BrandThird },
    { id: 6, name: "On Set", image: BrandTwo },

    { id: 7, name: "On Set", image: BrandOne },

    { id: 1, name: "Dior", image: BrandSeven },
    { id: 2, name: "7Elements", image: BrandThird },
    { id: 3, name: "Four", image: BrandFive },
    { id: 4, name: "Inglot", image: BrandFour },
  ];
  return (
    <div className="search-category-brand-main">
      <SearchCategory isBrandStore={true} />
      <div
        style={{
          padding: "30px",
        }}
      >
        <div className="search-header">
          <div className="header-left">
            <span
              onClick={() => {
                navigate("/brand-stores");
                setTimeout(() => {
                  dispatch(setSearchOpen(true));
                  dispatch(setSearchCategoryBrandOpen(false));
                }, 300);
              }}
              className="back-link"
            >
              ← Back
            </span>

            <div>
              <span className="results-text">
                1-16 of 41 results for{" "}
                <span className="highlight">'cosmetics'</span>
              </span>
            </div>
          </div>
        </div>

        <div className="categroy-output">
          <h2>Jewelry & Accessories</h2>

          <section className="brand-slider">
            <Swiper
              modules={[FreeMode]}
              slidesPerView="auto"
              freeMode
              grabCursor
              spaceBetween={0}
              breakpoints={{
                0: { spaceBetween: 0 },
                640: { spaceBetween: 0 },
                1024: { spaceBetween: 0 },
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
        </div>

        <div className="categroy-output">
          <h2>Women Fashion</h2>

          <section className="brand-slider">
            <Swiper
              modules={[FreeMode]}
              slidesPerView="auto"
              freeMode
              grabCursor
              spaceBetween={0}
              breakpoints={{
                0: { spaceBetween: 0 },
                640: { spaceBetween: 0 },
                1024: { spaceBetween: 0 },
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
        </div>
      </div>
      {/* <h1>Search Category Brand Page</h1> */}
    </div>
  );
};

export default SearchCategoryBrand;
