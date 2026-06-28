import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";
import { environment } from "../../environments/environment";
import axios from "axios";

export const getBrands = createAsyncThunk(
  "brands/getBrands",
  async ({ page = 1, limit = 10, status = null } = {}) => {
    const filters = [];
    if (status && status !== "all") {
      filters.push(`properties.status:${status}`);
    }
    const params = { page, limit };

    if (filters.length) {
      params.q = filters.join("");
    }
    const response = await axiosInstance.get("brands", { params });
    return { data: response.data, limit };
  },
);

export const getAllBrands = createAsyncThunk(
  "brands/getAllBrands",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("brands");
      return { data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message || "Failed to fetch all brands" }
      );
    }
  },
);

export const createBrand = createAsyncThunk(
  "brands/createBrand",
  async (brandData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("brands", brandData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message || "Failed to create brand" }
      );
    }
  },
);

export const deleteBrand = createAsyncThunk(
  "brands/deleteBrand",
  async (brandId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`brands/${brandId}`);
      return brandId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message || "Failed to delete brand" }
      );
    }
  },
);

export const updateBrand = createAsyncThunk(
  "brands/updateBrand",
  async ({ brandId, brandData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`brands/${brandId}`, brandData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message || "Failed to update brand" }
      );
    }
  },
);

export const searchBrands = createAsyncThunk(
  "searchBrandResults/searchBrands",
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
        `${environment.serverOrigin}brand-search?${params.toString()}`,
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
          message: error.message || "Failed to search brands",
        },
      );
    }
  },
);

const brandsSlice = createSlice({
  name: "brands",
  initialState: {
    brandsList: [],
    allBrandList: [],
    brandsSearchResults: [],
    searchPagination: {
      totalHits: 0,
      totalPages: 0,
      lastKey: null,
      page: 1,
      limit: 10,
    },
    searchFilters: {
      brands: [],
      attributes: [],
      categories: [],
      priceRange: { minPrice: 0, maxPrice: 0 },
    },
    totalPages: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getBrands.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getBrands.fulfilled, (state, action) => {
      state.loading = false;
      state.brandsList = action.payload?.data?.items;
      state.totalPages = Math.ceil(
        action.payload?.data?.totalHits / action.payload?.limit,
      );
    });
    builder
      .addCase(getBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBrand.fulfilled, (state, action) => {
        state.loading = false;
        state.brandsList.push(action.payload);
      })
      .addCase(createBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.loading = false;
        state.brandsList = state.brandsList.filter(
          (brand) => brand.id !== action.payload,
        );
      })
      .addCase(deleteBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBrand.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.brandsList.findIndex(
          (brand) => brand.id === action.payload.id,
        );
        if (index !== -1) {
          state.brandsList[index] = action.payload;
        }
      })
      .addCase(updateBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
    builder
      .addCase(searchBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brandsSearchResults = action.payload?.result || [];

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
      .addCase(searchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      });
    builder.addCase(getAllBrands.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getAllBrands.fulfilled, (state, action) => {
      state.loading = false;
      state.allBrandList = action.payload?.data?.items || [];
    })
    .addCase(getAllBrands.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
  },
});

export default brandsSlice.reducer;