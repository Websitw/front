import React, { useState, useEffect, useCallback, useRef } from "react";
import "./Search.css";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ProductCard from "../../components/ProductCard/ProductCard";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Filter from "./components/Filters";
import { useSelector, useDispatch } from "react-redux";
import { setSidebarOpen, setSearchOpen } from "../../store/slices/userSidebar";
import LoadingSpinner from "../../components/common/LoadingSpinner/LoadingSpinner";
import { useViewProduct } from "../../context/ViewProductContext";
import { Back } from "../../assets/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import useSearch from "../../hooks/useSearch";
import { getItemPrice, imageUrl } from "../../helper/helper";
import useCart from "../../hooks/useCart";

export default function Search() {
  const [sortBy, setSortBy] = useState("price-desc");
  const dispatch = useDispatch();
  const { openViewProduct } = useViewProduct();
  const { addNewItemToCart, fetchCartItems } = useCart();
  const { sidebarOpen } = useSelector((state) => state.userSidebar);
  const {
    searchResults,
    loading,
    searchPagination,
    searchFilters,
    getSearchResults,
  } = useSearch();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeFiltersRef = useRef({});

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

  const goToHomePage = () => {
    navigate("/");
    setTimeout(() => {
      dispatch(setSidebarOpen(false));
      dispatch(setSearchOpen(true));
    }, 500);
  };

  const handlePageChange = (newPage) => {
    getSearchResults(query, newPage, sortBy, buildFilters());
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    getSearchResults(query, 1, newSort, buildFilters());
  };

  const handleFilterChange = useCallback(
    (filters) => {
      activeFiltersRef.current = filters;
      getSearchResults(query, 1, sortBy, filters);
    },
    [query, sortBy],
  );

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
    getSearchResults(query, 1, sortBy, filters);
  }, [searchParams.toString()]);

  return (
    <div className="search-page-wrapper">
      <div className={`search-layout ${!sidebarOpen ? "full" : ""}`}>
        <Filter
          sidebarOpen={sidebarOpen}
          setSidebarOpen={(value) => dispatch(setSidebarOpen(value))}
          searchFilters={searchFilters}
          onFilterChange={handleFilterChange}
          initialFilters={initialFilters}
        />

        <main className="Search-page-wrapper">
          <section className="parcel-wrapper">
            <div className="parcel-banner">
              <div className="parcel-content">
                <h3 className="parcel-title">Parcel Delivery</h3>
                <p className="parcel-text">
                  Enjoy free parcel delivery on orders above 20 JOD across all
                  governorates, offer valid until the 17th of February 2026!
                </p>
              </div>
            </div>
          </section>

          <div className="search-page">
            <div>
              <button className="search-back-btn" onClick={goToHomePage}>
                <Back /> Back
              </button>
            </div>

            <div className="search-toolbar">
              {/* <div className="search-info">
                {totalHits} results for <strong>{query}</strong>
              </div> */}
              <div className="search-info">
                {searchResults?.length || 0} results for{" "}
                <strong>{query}</strong>
              </div>

              <div className="pagination">
                <button
                  className="page-btn btn-pagination"
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  <ArrowBackIcon style={{ fontSize: "16px" }} />
                  Previous
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`page-btn ${page === i + 1 ? "active" : ""}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  className="page-btn btn-pagination"
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                  <ArrowForwardIcon style={{ fontSize: "16px" }} />
                </button>
              </div>

              <div className="search-controls">
                <div className="sort-select-wrapper">
                  <span style={{ margin: "0 4px" }}>Sort by </span>
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="sort-select"
                  >
                    <option value="price-desc">Price: high to low</option>
                    <option value="price-asc">Price: low to high</option>
                  </select>
                  <KeyboardArrowDownIcon className="select-arrow" />
                </div>
              </div>
            </div>

            <div className="divider" />

            {loading && (
              <div className="loading-style">
                <LoadingSpinner />
              </div>
            )}

            <div className="grid-list">
              {!loading &&
                searchResults?.map((product) => {
                  const { displayPrice, originalPrice } = getItemPrice(product);
                  return (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      image={`${imageUrl}${product.mediaList?.[0]?.mediaId}`}
                      title={product.productTitle_i18n?.en}
                      rating={product.rating}
                      reviewCount={product.ratingCount}
                      currentPrice={displayPrice}
                      originalPrice={originalPrice}
                      currency={product.price?.JO?.currencyCode}
                      discountPercentage={product.price?.JO?.salePercent}
                      // stockLeft={product.stockLevel}
                      deliveryText="Deliver To Your Location"
                      product={product}
                      onAddToCart={addNewItemToCart}
                      handleOpenViewProduct={() => openViewProduct(product)}
                    />
                  );
                })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
