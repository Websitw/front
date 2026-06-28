import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";

export const getMerchantUserStatus = createAsyncThunk(
  "merchantsUser/getStatus",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`merchantProfile?q=${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const getCountries = createAsyncThunk(
  "merchantsUser/getCountries",
  async () => {
    const response = await axiosInstance.get("countries");
    return response.data;
  },
);

export const completeMerchantProfile = createAsyncThunk(
  "merchantsUser/completeProfile",
  async ({ profileData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "merchants/onboarding",
        profileData,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const getMerchantProducts = createAsyncThunk(
  "merchantsUser/getMerchantProducts",
  async (merchantId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `products?q=properties.merchantId:${merchantId} AND properties.status:DRAFT`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

const merchantsUserSlice = createSlice({
  name: "merchantsUser",
  initialState: {
    merchantsUser: null,
    loading: false,
    productsLoading: false,
    countries: [],
    merchantProducts: [],
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getMerchantUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMerchantUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.merchantsUser = action.payload;
      })
      .addCase(getMerchantUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(getCountries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCountries.fulfilled, (state, action) => {
        state.loading = false;
        state.countries = action.payload?.items;
      })
      .addCase(getCountries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(completeMerchantProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeMerchantProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.merchantsUser = action.payload;
      })
      .addCase(completeMerchantProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(getMerchantProducts.pending, (state) => {
        state.productsLoading = true;
        state.error = null;
      })
      .addCase(getMerchantProducts.fulfilled, (state, action) => {
        state.productsLoading = false;
        state.merchantProducts = action.payload?.items || [];
      })
      .addCase(getMerchantProducts.rejected, (state, action) => {
        state.productsLoading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default merchantsUserSlice.reducer;
