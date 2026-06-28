import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";

const initialState = {
  merchants: [],
  loading: false,
  error: null,
};

export const fetchMerchants = createAsyncThunk(
  "merchants/fetchMerchants",
  async ({}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("merchants");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const deleteMerchant = createAsyncThunk(
  "merchants/deleteMerchant",
  async (merchantId) => {
    await axiosInstance.delete(`merchantProfile/${merchantId}`);
    return merchantId;
  },
);

const merchantsSlice = createSlice({
  name: "merchants",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMerchants.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMerchants.fulfilled, (state, action) => {
        state.loading = false;
        state.merchants = action.payload?.items;
      })
      .addCase(fetchMerchants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error;
      })
      .addCase(deleteMerchant.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteMerchant.fulfilled, (state, action) => {
        state.loading = false;
        state.merchants.items = state.merchants.items.filter(
          (merchant) => merchant.id !== action.payload,
        );
      })
      .addCase(deleteMerchant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error;
      });
  },
});

export default merchantsSlice.reducer;
