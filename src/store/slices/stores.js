import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";

export const getStores = createAsyncThunk(
  "merchants/getStores",
  async ({ page = 1, limit = 10, status = null } = {}) => {
    const filters = [];
    if (status && status !== "all") {
      filters.push(`properties.status:${status}`);
    }
    const params = { page, limit };

    if(filters.length) {
      params.q = filters.join("");
    }
    console.log("Fetching stores with params:", params);
    const response = await axiosInstance.get('stores', { params });
    return {data: response.data, limit};
  }
);

const storesSlice = createSlice({
  name: "stores",
  initialState: {
    stores: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getStores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStores.fulfilled, (state, action) => {
        state.loading = false;
        const { data, limit } = action.payload;
        const totalHits = data.totalHits || 0;
        state.stores = {
          items: data.items || [],
          totalHits: totalHits,
          page: data.page || 1,
          limit: limit,
          totalPages: Math.ceil(totalHits / limit),
          lastKey: data.lastKey || null,
        }
      })
      .addCase(getStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default storesSlice.reducer;