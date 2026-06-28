import { MainLogo, MainLogoDark, EmptyStart } from "../../../assets/icons";
import {
  setSearchOpen,
  setSidebarOpen,
  setBrandFilterOpen,
  setSearchCategoryBrandOpen,
} from "../../../store/slices/userSidebar";
import { useDispatch, useSelector } from "react-redux";
import CloseIcon from "@mui/icons-material/Close";
import FilterIcon from "../../../assets/icons/SearchFilter.svg";
import { useRef, useState } from "react";
import BRAND_IMAGE from "../../../assets/icons/BrandIcon.png";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CustomerReview from "../../common/CustomerReview";
import { useEffect } from "react";
import {
  getBrandsCategories,
  getTopBrandStores,
} from "../../../store/slices/brandStoresSlice";
import { imageUrl } from "../../../helper/helper";

import "./SearchCategory.css";

const SearchModal = ({ isBrandStore }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const boxRef = useRef(null);
  const [query, setQuery] = useState("");
  const swiperRef = useRef(null);
  const [selectedRating, setSelectedRating] = useState(null);
  const [hoveredRating, setHoveredRating] = useState(null);
  const [openSections, setOpenSections] = useState({
    customerReview: true,
  });
  const { topBrandStores, brandsCategories } = useSelector(
    (state) => state.brandStores,
  );

  const goToSearch = (value) => {
    if (isBrandStore) {
      navigate(`/search-brand?q=${encodeURIComponent(value)}`);
      setTimeout(() => {
        dispatch(setBrandFilterOpen(true));
      }, 300);
    } else {
      navigate(`/search?q=${encodeURIComponent(value)}`);
      setQuery("");
      setTimeout(() => {
        dispatch(setSidebarOpen(true));
      }, 500);
    }
  };
  const { searchCategoryBrandOpen } = useSelector((state) => state.userSidebar);
  const [results, setResults] = useState([]);

  const BRANDS = [
    { name: "Apple", color: "#000" },
    { name: "CAT", color: "#F4C20D" },
    { name: "Diro", color: "#EEE" },
    { name: "Lenovo", color: "#E2231A" },
    { name: "Nami", color: "#FFF" },

    { name: "Apple", color: "#000" },
    { name: "CAT", color: "#F4C20D" },
    { name: "Diro", color: "#EEE" },
  ];
  const categories = [
    {
      id: 1,
      name: "Cosmetics",
      image:
        "https://t3.ftcdn.net/jpg/17/11/81/40/360_F_1711814081_ra9OUCXPYZ0nD5Tuex1Xt7ozQkLHoebo.jpg",
    },
    {
      id: 2,
      name: "Sport",
      image:
        "https://thumbs.dreamstime.com/b/full-body-muscular-man-exercising-dumbbell-white-25262142.jpg",
    },
    {
      id: 3,
      name: "Kids Toys",
      image:
        "https://thumbs.dreamstime.com/b/kids-toys-isolated-white-background-353451536.jpg",
    },

    {
      id: 1,
      name: "Cosmetics",
      image:
        "https://t3.ftcdn.net/jpg/17/11/81/40/360_F_1711814081_ra9OUCXPYZ0nD5Tuex1Xt7ozQkLHoebo.jpg",
    },
    {
      id: 2,
      name: "Sport",
      image:
        "https://thumbs.dreamstime.com/b/full-body-muscular-man-exercising-dumbbell-white-25262142.jpg",
    },
    {
      id: 3,
      name: "Kids Toys",
      image:
        "https://thumbs.dreamstime.com/b/kids-toys-isolated-white-background-353451536.jpg",
    },
  ];

  const categoriesBrandStore = [
    "Electronics",
    "Sport",
    "Kids Toys",
    "Cosmetics",
    "Home & Kitchen",
    "Automotive",
  ];

  const goToSearchCategorBrand = () => {
    navigate(`/search-category-brand`);
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    dispatch(getTopBrandStores()).unwrap();
    dispatch(getBrandsCategories()).unwrap();
  }, []);
  return (
    <div
      className={`category-account-modal ${searchCategoryBrandOpen ? "category-open" : ""} ${isBrandStore ? "category-brand-store-dark" : ""}`}
    >
      <div className="category-modal-logo">
        {isBrandStore ? (
          <MainLogoDark className="category-main-modal-logo" />
        ) : (
          <MainLogo className="category-main-modal-logo" />
        )}
        <button
          className="category-close-btn"
          onClick={() => dispatch(setSearchCategoryBrandOpen(false))}
        >
          <CloseIcon
            style={{
              color: isBrandStore ? "#FFFFFF" : "#151515",
            }}
          />
        </button>
      </div>

      <div>
        <aside className="category-sidebar-fliter">
          <div className="category-search-box" ref={boxRef}>
            <div className="category-wrapper">
              <img className="category-icon" src={FilterIcon} />
              <input
                type="text"
                placeholder="What are you looking for?"
                className="category-input"
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
              <div className="category-search-dropdown">
                {results.map((item, i) => (
                  <div
                    key={i}
                    className="category-search-item"
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
          <section
            style={{
              margin: "10px 0",
            }}
            className="category-top-brand-section"
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "14px",
              }}
            >
              <h4 className="category-section-title">Top Brand </h4>

              <img
                style={{
                  marginTop: "10px",
                  width: "19px",
                  height: "19px",
                  objectFit: "contain",
                }}
                src={BRAND_IMAGE}
              />
            </div>
            <Swiper
              ref={swiperRef}
              modules={[FreeMode]}
              slidesPerView="auto"
              freeMode={true}
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
            >
              {topBrandStores.map((b, i) => (
                <SwiperSlide>
                  <div key={i} className="category-brand-item">
                    <div
                      className="category-brand-circle"
                      // style={{ background: b.color }}
                    >
                      <img
                        src={`${imageUrl}${b?.logoId}`}
                        alt={b.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          borderRadius: "50%",
                        }}
                      />
                      {/* {b.name[0]} */}
                    </div>
                    <p>{b?.brandName}</p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </section>

          {!isBrandStore && (
            <section>
              <h4 className="category-section-title">Top Category </h4>
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
                className="category-categories-swiper"
              >
                {categories.map((cat) => (
                  <SwiperSlide key={cat.id} className="category-auto-slide">
                    <div className="category-category-card">
                      <div className="category-image-box">
                        <img src={cat.image} alt={cat.name} />
                      </div>
                      <p className="category-category-title">{cat.name}</p>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </section>
          )}
          <div className="category-brand-section">
            <div
              className="category-brand-section-title category-brand-price-header"
              onClick={() => toggleSection("customerReview")}
            >
              Customer Review
              <span className="category-brand-arrow">
                {openSections.customerReview ? (
                  <KeyboardArrowUpIcon />
                ) : (
                  <KeyboardArrowDownIcon />
                )}
              </span>
            </div>
            {openSections.customerReview && (
              <CustomerReview
                value={selectedRating ?? 0}
                onChange={setSelectedRating}
              />
            )}
          </div>
          {isBrandStore && (
            <section>
              <h4 className="category-section-title">Brand Category </h4>
              <ul className="category-brand-category-list">
                {brandsCategories.map((cat, index) => (
                  <li
                    key={cat?.id}
                    className="category-brand-category-item"
                    onClick={goToSearchCategorBrand}
                  >
                    {cat?.name_i18n?.en}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
};

export default SearchModal;
