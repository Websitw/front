import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";
import { environment } from "../../environments/environment";
import axios from "axios";

export const getGiftPackges = createAsyncThunk(
  "gift/getGiftPackges",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${environment.serverOrigin}gift-packages`, {
        headers: {
          Authorization: `Anonymous=${environment.appid}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch gift packages",
      );
    }
  },
);

export const updateItemToGift = createAsyncThunk(
  "gift/updateItemToGift",
  async ({ cartLineId, giftData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `cart-lines/${cartLineId}`,
        giftData,
        {
          headers: {
            Authorization: `Anonymous=${environment.appid}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update item to gift package",
      );
    }
  },
);

const giftSlice = createSlice({
  name: "gift",
  initialState: {
    giftPackages: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getGiftPackges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGiftPackges.fulfilled, (state, action) => {
        state.loading = false;
        state.giftPackages = action.payload?.items || [];
      })
      .addCase(getGiftPackges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    builder
      .addCase(updateItemToGift.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateItemToGift.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateItemToGift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default giftSlice.reducer;
