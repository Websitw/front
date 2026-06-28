import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";

export const getAdsById = createAsyncThunk("ads/getAdsById", async (adId) => {
  const response = await axiosInstance.get(`ads/${adId}`);
  return response.data;
});

export const getAds = createAsyncThunk(
  "ads/getAds",
  async ({ page = 1, limit = 10, mediaType = null } = {}) => {
    const params = new URLSearchParams();

    params.append("page", page);
    params.append("limit", limit);

    if (mediaType && mediaType !== "all") {
      params.append("q", `properties.media_type:${mediaType}`);
    }

    const response = await axiosInstance.get(`ads?${params.toString()}`);
    return { data: response.data, limit };
  }
);

export const deleteAd = createAsyncThunk("ads/deleteAd", async (adId) => {
  await axiosInstance.delete(`ads/${adId}`);
  return adId;
});

export const addAds = createAsyncThunk("ads/addAds", async (adData) => {
  const response = await axiosInstance.post('ads', adData);
  return response.data;
});

export const updateAd = createAsyncThunk(
  "ads/updateAd",
  async ({ adId, adData }) => {
    const response = await axiosInstance.put(`ads/${adId}`, adData);
    return response.data;
  }
);

const adsSlice = createSlice({
  name: "ads",
  initialState: {
    ads: {
      items: [],
      totalHits: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      lastKey: null,
    },
    ad: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAds.fulfilled, (state, action) => {
        state.loading = false;
        const { data, limit } = action.payload;
        const totalHits = data.totalHits || 0;
        state.ads = {
          items: data.items || [],
          totalHits: totalHits,
          page: data.page || 1,
          limit: limit,
          totalPages: Math.ceil(totalHits / limit),
          lastKey: data.lastKey || null,
        };
      })
      .addCase(getAds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteAd.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAd.fulfilled, (state, action) => {
        state.loading = false;
        state.ads.items = state.ads.items.filter(
          (ad) => ad.id !== action.payload
        );
        state.ads.totalHits = Math.max(0, state.ads.totalHits - 1);
        state.ads.totalPages = Math.ceil(state.ads.totalHits / state.ads.limit);
      })
      .addCase(deleteAd.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addAds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAds.fulfilled, (state, action) => {
        state.loading = false;
        state.ads.items.unshift(action.payload);
        state.ads.totalHits += 1;
        state.ads.totalPages = Math.ceil(state.ads.totalHits / state.ads.limit);
      })
      .addCase(addAds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateAd.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAd.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.ads.items.findIndex(
          (ad) => ad.id === action.payload.id
        );
        if (index !== -1) {
          state.ads.items[index] = action.payload;
        }
      })
      .addCase(updateAd.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(getAdsById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdsById.fulfilled, (state, action) => {
        state.loading = false;
        state.ad = action.payload;
      })
      .addCase(getAdsById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default adsSlice.reducer;