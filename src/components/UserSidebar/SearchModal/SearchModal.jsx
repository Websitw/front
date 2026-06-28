import { MainLogo, MainLogoDark } from "../../../assets/icons";
import {
  setSearchOpen,
  setSidebarOpen,
  setBrandFilterOpen,
  setSearchCategoryBrandOpen,
} from "../../../store/slices/userSidebar";
import { getBrandsCategories, getTopBrandStores } from "../../../store/slices/brandStoresSlice"; 
import { useDispatch, useSelector } from "react-redux";
import CloseIcon from "@mui/icons-material/Close";
import Trending_IMAGE from "../../../assets/icons/trandIcon.png";
import FilterIcon from "../../../assets/icons/SearchFilter.svg";
import { useEffect, useRef, useState } from "react";
import BRAND_IMAGE from "../../../assets/icons/BrandIcon.png";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import "./SearchModal.css";
import { imageUrl } from "../../../helper/helper";
import { getGenralGategories, getGenralSegments } from "../../../store/slices/genralStoresSlice";

const SearchModal = ({ isBrandStore }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
      generalCategories,
      generalSegments,
  } = useSelector((state) => state.generalStores);
  const boxRef = useRef(null);
  const [query, setQuery] = useState("");
  const swiperRef = useRef(null);

  const { searchOpen } = useSelector((state) => state.userSidebar);
  const { topBrandStores, brandsCategories } = useSelector((state) => state.brandStores);
 
  const [results, setResults] = useState([]);

  const goToSearch = (value, { brandId, categoryId, segmentId } = {}) => {
    const params = new URLSearchParams();
    if (value) params.set("q", value);
    if (brandId) params.set("brandId", brandId);
    if (categoryId) params.set("categoryId", categoryId);
    if (segmentId) params.set("segmentId", segmentId);
    if (isBrandStore) {
      navigate(`/search-brand?${params.toString()}`);
      setTimeout(() => {
        dispatch(setBrandFilterOpen(true));
      }, 300);
    } else {
      navigate(`/search?${params.toString()}`);
      setQuery("");
      setTimeout(() => {
        dispatch(setSidebarOpen(true));
      }, 500);
    }
  };

  const goToSearchCategoryBrand = () => {
    navigate(`/search-category-brand`);
    setTimeout(() => {
      dispatch(setSearchCategoryBrandOpen(true));
    }, 300);
  };

  const TRENDING = [
    "Games",
    "Cosmetics",
    "Electronics",
    "Women Fashion",
    "Men's Fashion",
    "Games",
    "Cosmetics",
    "Electronics",
    "Women Fashion",
    "Men's Fashion",
  ];



  useEffect(()=>{
    dispatch(getTopBrandStores()).unwrap()
    dispatch(getBrandsCategories()).unwrap();
    dispatch(getGenralGategories()).unwrap();
    dispatch(getGenralSegments()).unwrap();
  },[dispatch]);

  return (
    <div
      className={`search-modal ${searchOpen ? "search-modal--open" : ""} ${isBrandStore ? "search-modal--dark" : ""}`}
    >
      <div className="search-modal__header">
        {isBrandStore ? (
          <MainLogoDark className="search-modal__logo" />
        ) : (
          <MainLogo className="search-modal__logo" />
        )}
        <button
          className="search-modal__close-btn"
          onClick={() => dispatch(setSearchOpen(false))}
        >
          <CloseIcon
            style={{ color: isBrandStore ? "#FFFFFF" : "#151515" }}
          />
        </button>
      </div>

      <div className="search-modal__filter">
        <div className="search-modal__search-box" ref={boxRef}>
          <div className="search-modal__search-wrapper">
            <img className="search-modal__search-icon" src={FilterIcon} alt="filter" />
            <input
              type="text"
              placeholder="What are you looking for?"
              className="search-modal__search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) {
                  goToSearch(query);
                }
              }}
            />
          </div>

          {results.length > 0 && (
            <div className="search-modal__search-dropdown">
              {results.map((item, i) => (
                <div
                  key={i}
                  className="search-modal__search-item"
                  onClick={() => {
                    setQuery(item);
                    setResults([]);
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>

        <section style={{ margin: "10px 0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "14px",
            }}
          >
            <h4 className="search-modal__section-title">Trending</h4>
            <img
              style={{
                marginTop: "10px",
                width: "19px",
                height: "19px",
                objectFit: "contain",
              }}
              src={Trending_IMAGE}
              alt="trending"
            />
          </div>
<div className="search-modal__trending-tags">
  {generalCategories?.slice(0, 5).map((t, i) => (
    <span
      onClick={() => goToSearch("", { categoryId: t.id })}
      key={`${t?.id}-${i}`}
    >
      {t?.name_i18n?.en}
    </span>
  ))}
</div>
        </section>

        <section style={{ margin: "10px 0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "14px",
            }}
          >
            <h4 className="search-modal__section-title">Top Brand</h4>
            <img
              style={{
                marginTop: "10px",
                width: "19px",
                height: "19px",
                objectFit: "contain",
              }}
              src={BRAND_IMAGE}
              alt="brand"
            />
          </div>
          <Swiper
            ref={swiperRef}
            modules={[FreeMode]}
            slidesPerView="auto"
            freeMode={true}
            breakpoints={{
              0: { spaceBetween: 8 },
              480: { spaceBetween: 10 },
              768: { spaceBetween: 12 },
              1024: { spaceBetween: 16 },
            }}
            grabCursor={true}
          >
            {topBrandStores.map((b, i) => (
              <SwiperSlide key={i}>
                <div
                  className="search-modal__brand-item"
                  onClick={() => goToSearch("", { brandId: b.id })}
                >
                  <div className="search-modal__brand-circle">
                    <img
                      src={`${imageUrl}${b?.logoId}`}
                      alt={b.name}
                      style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "50%" }}
                    />
                  </div>
                  <p>{b.brandName}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {!isBrandStore && (
          <section>
            <h4 className="search-modal__section-title">Top Category</h4>
            <Swiper
              ref={swiperRef}
              modules={[FreeMode]}
              slidesPerView="auto"
              freeMode={true}
              grabCursor={true}
              breakpoints={{
                0: { spaceBetween: 8 },
                480: { spaceBetween: 10 },
                768: { spaceBetween: 12 },
                1024: { spaceBetween: 16 },
              }}
              className="search-modal__categories-swiper"
            >
              {generalSegments.map((cat, index) => (
                <SwiperSlide key={`${cat.id}-${index}`} style={{ width: "auto" }}>
                  <div
                    className="search-modal__category-card"
                    onClick={() => goToSearch("", { segmentId: cat.id })}
                  >
                    <div className="search-modal__image-box">
                      <img src={`${imageUrl}${cat?.imageId}`} alt={cat.name} />
                    </div>
                    <p className="search-modal__category-title">{cat.name_i18n?.en}</p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        )}

        {isBrandStore && (
          <section>
            <h4 className="search-modal__section-title">Brand Category</h4>
            <ul className="search-modal__brand-category-list">
              {brandsCategories.map((cat, index) => (
                <li key={`${cat?.id}-${index}`} onClick={goToSearchCategoryBrand}>
                  {cat?.name_i18n?.en}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

export default SearchModal;