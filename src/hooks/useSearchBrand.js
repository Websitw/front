import { useState } from "react";
import {
  searchBrands,
  getAllBrands,
  createBrand,
  deleteBrand,
  updateBrand,
} from "../store/slices/brandsSlice";
import { useDispatch, useSelector } from "react-redux";
import { ITEMS_PER_PAGE } from "../helper/helper";
import { showToast } from "../components/CustomToast/CustomToast";

const useSearch = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { brandsSearchResults, searchPagination, searchFilters, allBrandList } =
    useSelector((state) => state.brands);

  const getSearchBrandResults = (
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
    setError(null);
    return dispatch(
      searchBrands({
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
      .catch((err) => {
        const msg = err?.message || "Failed to search brands";
        setError(msg);
        showToast.error(msg);
        throw err;
      })
      .finally(() => setLoading(false));
  };

  const fetchAllBrands = () => {
    setLoading(true);
    setError(null);
    return dispatch(getAllBrands())
      .unwrap()
      .catch((err) => {
        const msg = err?.message || "Failed to fetch all brands";
        setError(msg);
        showToast.error(msg);
        throw err;
      })
      .finally(() => setLoading(false));
  };

  const addBrand = (brandData) => {
    setLoading(true);
    setError(null);
    return dispatch(createBrand(brandData))
      .unwrap()
      .catch((err) => {
        const msg = err?.message || "Failed to create brand";
        setError(msg);
        showToast.error(msg);
        throw err;
      })
      .finally(() => setLoading(false));
  };

  const removeBrand = (brandId) => {
    setLoading(true);
    setError(null);
    return dispatch(deleteBrand(brandId))
      .unwrap()
      .catch((err) => {
        const msg = err?.message || "Failed to delete brand";
        setError(msg);
        showToast.error(msg);
        throw err;
      })
      .finally(() => setLoading(false));
  };

  const editBrand = (brandId, brandData) => {
    setLoading(true);
    setError(null);
    return dispatch(updateBrand({ brandId, brandData }))
      .unwrap()
      .catch((err) => {
        const msg = err?.message || "Failed to update brand";
        setError(msg);
        showToast.error(msg);
        throw err;
      })
      .finally(() => setLoading(false));
  };

  return {
    brandsSearchResults,
    loading,
    error,
    searchPagination,
    searchFilters,
    getSearchBrandResults,
    fetchAllBrands,
    addBrand,
    removeBrand,
    editBrand,
    allBrandList,
  };
};

export default useSearch;