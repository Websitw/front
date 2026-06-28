import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";


export const fetchFavoriteBrands = createAsyncThunk(
  "favoriteBrands/fetchFavoriteBrands",
  async ({ userId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`favorite-brands?q=properties.userId:${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch favorite brands");
    }
  }
);



export const addFavoriteBrand = createAsyncThunk(
  "favoriteBrands/addFavoriteBrand",
  async (favoriteBrandData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("favorite-brands", favoriteBrandData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to add favorite brand");
    }
  }
);

export const removeFavoriteBrand = createAsyncThunk(
  "favoriteBrands/removeFavoriteBrand",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`favorite-brands/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to remove favorite brand");
    }
  }
);

const favoriteBrandSlice = createSlice({
  name: "favoriteBrands",
  initialState: {
    brands: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavoriteBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavoriteBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload?.items;
      })
      .addCase(fetchFavoriteBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    builder.addCase(addFavoriteBrand.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(addFavoriteBrand.fulfilled, (state, action) => {
      state.loading = false;
      state.brands.push(action.payload);
    })
    .addCase(addFavoriteBrand.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export default favoriteBrandSlice.reducer;