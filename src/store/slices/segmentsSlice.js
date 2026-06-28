import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";
import { ITEMS_PER_PAGE } from "../../helper/helper";

export const getSegments = createAsyncThunk(
  "segments/getSegments",
  async ({ page = 1, limit = 10, search = "" } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);
      if (search && search.trim() !== "") {
        params.append("q", `properties.segmentName:${search.trim()}`);
      }
      const response = await axiosInstance.get(`catalog/segments?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getSegmentsEnrich = createAsyncThunk(
  "segments/getSegmentsEnrich",
  async ({  } = {}, { rejectWithValue }) => {
    try {
      
      const response = await axiosInstance.get(`catalog/segments?enrich=true`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addSegment = createAsyncThunk(
  "segments/addSegment",
  async (segmentData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "catalog/segments",
        segmentData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteSegment = createAsyncThunk(
  "segments/deleteSegment",
  async (segmentId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`catalog/segments/${segmentId}`);
      return segmentId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateSegment = createAsyncThunk(
  "segments/updateSegment",
  async ({ segmentId, segmentData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `catalog/segments/${segmentId}`,
        segmentData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const segmentsSlice = createSlice({
  name: "segments",
  initialState: {
    segments: [],
    segmentsEnrich: [],
    totalPages: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSegments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSegments.fulfilled, (state, action) => {
        state.loading = false;
        state.segments = action.payload?.items;
        state.totalPages = Math.ceil(action.payload?.totalHits / ITEMS_PER_PAGE);
      })
      .addCase(getSegments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      }).addCase(addSegment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSegment.fulfilled, (state, action) => {
        state.loading = false;
        state.segments.push(action.payload);
      })
      .addCase(addSegment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteSegment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSegment.fulfilled, (state, action) => {
        state.loading = false;
        state.segments = state.segments.filter(
          (segment) => segment.id !== action.payload
        );
      })
      .addCase(deleteSegment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSegment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSegment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.segments.findIndex(
          (segment) => segment.id === action.payload.id
        );
        if (index !== -1) {
          state.segments[index] = action.payload;
        }
      })
      .addCase(updateSegment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    builder
      .addCase(getSegmentsEnrich.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSegmentsEnrich.fulfilled, (state, action) => {
        state.loading = false;
        state.segmentsEnrich = action.payload?.items;
      })
      .addCase(getSegmentsEnrich.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        });
  },
});

export default segmentsSlice.reducer;
