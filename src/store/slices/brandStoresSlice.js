import axiosInstance from "../../config/axiosInstance";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { environment } from "../../environments/environment";
import axios from "axios";

export const getTopBrandStores = createAsyncThunk(
  "brandStores/getTopBrandStores",
  async (_arg, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${environment.serverOrigin}brands?sort=properties.rating&desc=true`,
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
          message: error.message || "Failed to fetch top brand stores",
        },
      );
    }
  },
);

export const getBrandsCategories = createAsyncThunk(
  "brandStores/getBrandsCategories",
  async (_arg, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${environment.serverOrigin}brand-categories`, {
        headers: {
          Authorization: `Anonymous=${environment.appid}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to fetch brand categories",
        },
      );
    }
  },
);

const brandStoresSlice = createSlice({
  name: "brandStores",
  initialState: {
    topBrandStores: [],
    brandsCategories: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getTopBrandStores.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getTopBrandStores.fulfilled, (state, action) => {
      state.loading = false;
      state.topBrandStores = action.payload?.items;
    });
    builder.addCase(getTopBrandStores.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || action.error.message;
    });
    builder.addCase(getBrandsCategories.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getBrandsCategories.fulfilled, (state, action) => {
      state.loading = false;
      state.brandsCategories = action.payload?.items;
    });
    builder.addCase(getBrandsCategories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || action.error.message;
    });
  },
});

export default brandStoresSlice.reducer;
