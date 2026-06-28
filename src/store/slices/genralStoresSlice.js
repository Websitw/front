import axiosInstance from "../../config/axiosInstance";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { environment } from "../../environments/environment";
import axios from "axios";

export const getGenralGategories = createAsyncThunk(
  "brandStores/getGenralGategories",
  async (_arg, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${environment.serverOrigin}catalog/categories`,
        {
          headers: {
            Authorization: `Anonymous=${environment.appid}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to fetch general categories",
        },
      );
    }
  },
);

export const getGenralSegments = createAsyncThunk(
  "brandStores/getGenralSegments",
  async (_arg, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${environment.serverOrigin}catalog/segments`,
        {
          headers: {
            Authorization: `Anonymous=${environment.appid}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to fetch general segments",
        },
      );
    }
  },
);

export const searchSegments = createAsyncThunk(
  "generalStores/searchSegments",
  async (
    {
      text = "",
      limit = 10,
      page = 1,
      sort = "",
      desc = true,
      brandId,
      categoryId,
      segmentId,
      attribute,
      priceFrom,
      priceTo,
      shopModel,
      rating,
      countryCode = "JO",
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams();

      if (text) params.append("text", text);
      if (segmentId) {
        (Array.isArray(segmentId) ? segmentId : [segmentId]).forEach((id) =>
          params.append("segmentId", id),
        );
      }
      if (priceFrom !== undefined && priceFrom !== null)
        params.append("priceFrom", priceFrom);
      if (priceTo !== undefined && priceTo !== null)
        params.append("priceTo", priceTo);
      if (rating) params.append("rating", rating);
      if (countryCode) params.append("countryCode", countryCode);

      if (brandId) {
        (Array.isArray(brandId) ? brandId : [brandId]).forEach((id) =>
          params.append("brandId", id),
        );
      }
      if (categoryId) {
        (Array.isArray(categoryId) ? categoryId : [categoryId]).forEach((id) =>
          params.append("categoryId", id),
        );
      }
      if (attribute) {
        (Array.isArray(attribute) ? attribute : [attribute]).forEach((attr) =>
          params.append("attribute", attr),
        );
      }
      if (shopModel) {
        (Array.isArray(shopModel) ? shopModel : [shopModel]).forEach((m) =>
          params.append("shopModel", m),
        );
      }

      // params.append("page", page);
      // params.append("limit", limit);
      if (sort) params.append("sort", sort);
      params.append("desc", desc);

      const response = await axios.get(
        `${environment.serverOrigin}segment-search?${params.toString()}`,
        {
          headers: {
            Authorization: `Anonymous=${environment.appid}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to search segments",
        },
      );
    }
  },
);

export const getReatledProducts = createAsyncThunk(
  "generalStores/getReatledProducts",
  async ({ productId }, { rejectWithValue }) => {
    try {
      
      const response = await axios.get(
        `${environment.serverOrigin}products/${productId}/related`,
        {
          headers: {
            Authorization: `Anonymous=${environment.appid}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to fetch related products",
        },
      );
    }
  },
);
export const reviewProduct = createAsyncThunk(
  "generalStores/reviewProduct",
  async (reviewData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${environment.serverOrigin}product-reviews`, reviewData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to submit product review",
        },
      );
    }
  },
);
const generalStoresSlice = createSlice({
  name: "generalStores",
  initialState: {
    generalCategories: [],
    generalSegments: [],
    relatedProducts: [],
    searchResults: [],
    searchFilters: {
      brands: [],
      attributes: [],
      categories: [],
      priceRange: { minPrice: 0, maxPrice: 0 },
    },
    searchPagination: {
      totalHits: 0,
      totalPages: 0,
      lastKey: null,
      page: 1,
      limit: 10,
    },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getGenralGategories.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getGenralGategories.fulfilled, (state, action) => {
      state.loading = false;
      state.generalCategories = action.payload?.items;
    });
    builder.addCase(getGenralGategories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || action.error.message;
    });
    builder.addCase(getGenralSegments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getGenralSegments.fulfilled, (state, action) => {
      state.loading = false;
      state.generalSegments = action.payload?.items;
    });
    builder.addCase(getGenralSegments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || action.error.message;
    });
    builder
      .addCase(searchSegments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchSegments.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload?.result || [];

        const filters = action.payload?.filters;
        if (filters) {
          state.searchFilters = {
            brands: filters.brands || [],
            attributes: filters.attributes || [],
            categories: filters.categories || [],
            priceRange: filters.priceRange || { minPrice: 0, maxPrice: 0 },
          };
        }

        const totalHits = action.payload?.totalHits || 0;
        const limit = state.searchPagination.limit;

        state.searchPagination = {
          ...state.searchPagination,
          totalHits,
          totalPages: Math.ceil(totalHits / limit),
          lastKey: action.payload?.lastKey || null,
          page: action.payload?.page || 1,
        };
      })
      .addCase(searchSegments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      });
    builder
      .addCase(getReatledProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReatledProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.relatedProducts = action.payload?.items || [];
      })
      .addCase(getReatledProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      });
  },
});

export default generalStoresSlice.reducer;
