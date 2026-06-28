import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance';

export const getPromoCodes = createAsyncThunk(
  "prompCode/getPromoCodes",
  async ({ page = 1, limit = 10, discountType = null, status = null } = {}) => {
    const filters = [];

    if (discountType && discountType !== "all") {
      filters.push(`properties.discountType:${discountType}`);
    }

    if (status && status !== "all") {
      filters.push(`properties.status:${status}`);
    }

    const params = { page, limit };
    
    if (filters.length) {
      params.q = filters.join(" AND ");
    }

    const response = await axiosInstance.get('promocodes', { params });
    return response.data;
  }
);

export const createPromoCode = createAsyncThunk(
  'prompCode/createPromoCode', 
  async (promoCodeData) => {
    const response = await axiosInstance.post('promocodes', promoCodeData);
    return response.data;
  }
);

export const deletePromoCode = createAsyncThunk(
  'prompCode/deletePromoCode', 
  async (promoCodeId) => {
    await axiosInstance.delete(`promocodes/${promoCodeId}`);
    return promoCodeId;
  }
);

export const updatePromoCode = createAsyncThunk(
  'prompCode/updatePromoCode', 
  async ({ promoCodeId, promoCodeData }) => {
    const response = await axiosInstance.put(`promocodes/${promoCodeId}`, promoCodeData);
    return response.data;
  }
);

const promptSlice = createSlice({
  name: 'prompCode',
  initialState: {
    promoCodes: [],
    totalHits: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPromoCodes.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPromoCodes.fulfilled, (state, action) => {
        state.loading = false;
        state.promoCodes = action.payload.items;
        state.totalHits = action.payload.totalHits;
      })
      .addCase(getPromoCodes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createPromoCode.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPromoCode.fulfilled, (state, action) => {
        state.loading = false;
        state.promoCodes.push(action.payload);
      })
      .addCase(createPromoCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deletePromoCode.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePromoCode.fulfilled, (state, action) => {
        state.loading = false;
        state.promoCodes = state.promoCodes.filter(
          (promo) => promo.id !== action.payload
        );
      })
      .addCase(deletePromoCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updatePromoCode.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePromoCode.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.promoCodes.findIndex(
          (promo) => promo.id === action.payload.id
        );
        if (index !== -1) {
          state.promoCodes[index] = action.payload;
        }
      })
      .addCase(updatePromoCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default promptSlice.reducer;