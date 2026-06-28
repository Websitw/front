import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";


export const removeCoupon = createAsyncThunk(
  "checkoutDetails/removeCoupon",
  async (couponId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`checkout/coupon/${couponId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to remove coupon");
    }
  }
);

export const getDeliveryFee = createAsyncThunk(
  "checkoutDetails/getDeliveryFee",
  async ({ countryId, cityId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`shipping-carrier?countryId=${countryId}&cityId=${cityId}&fulfillmentDays=1`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch delivery fee");
    }
  }
);


const checkoutSlice = createSlice({
  name: "checkoutDetails",
  initialState: {
    deliveryFee: [],
    loading: false,
    error: null,
  },
  reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getDeliveryFee.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getDeliveryFee.fulfilled, (state, action) => {
                state.loading = false;
                state.deliveryFee = action.payload?.items || []; 
            })
            .addCase(getDeliveryFee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch delivery fee";
            });
        }
});

export default checkoutSlice.reducer;


