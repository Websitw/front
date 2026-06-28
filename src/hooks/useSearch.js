import { useState } from "react";
import { searchSegments, getReatledProducts, reviewProduct, getGenralGategories } from "../store/slices/genralStoresSlice";
import { useDispatch, useSelector } from "react-redux";
import { ITEMS_PER_PAGE } from "../helper/helper";
import { showToast } from "../components/CustomToast/CustomToast";

const useSearch = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { searchResults, searchPagination, searchFilters, relatedProducts, generalCategories } = useSelector(
    (state) => state.generalStores,
  );
  const getSearchResults = (
    text,
    page,
    sortBy,
    {
      brandId,
      categoryId,
      segmentId,
      attribute,
      priceFrom,
      priceTo,
      shopModel,
      rating,
    } = {},
  ) => {
    setLoading(true);
    return dispatch(
      searchSegments({
        text,
        page,
        limit: ITEMS_PER_PAGE,
        sort: "properties.price.JO.listPrice",
        desc: sortBy === "price-desc",
        brandId,
        categoryId,
        segmentId,
        attribute,
        priceFrom,
        priceTo,
        shopModel,
        rating,
      }),
    )
      .unwrap()
      .finally(() => setLoading(false));
  };

  

  const getRelatedProducts = (productId) => {
    setLoading(true);
    return dispatch(getReatledProducts(productId))
      .unwrap()
      .finally(() => setLoading(false));
  };

  const reviewProductHandler = (reviewData) => {
    return dispatch(reviewProduct(reviewData)).unwrap().then(()=>{
      showToast.success("Review submitted successfully")
    }).catch((error)=>{
      showToast.error("Failed to submit review")    
    })
  };
  const getGenralGategoriesHandler = () => {
    return dispatch(getGenralGategories()).unwrap()
  };

  return {
    searchResults,
    loading,
    searchPagination,
    searchFilters,
    relatedProducts,
    allCategories: generalCategories,
    getSearchResults,
    getRelatedProducts,
    reviewProductHandler,
    getGenralGategoriesHandler
  };
};

export default useSearch;