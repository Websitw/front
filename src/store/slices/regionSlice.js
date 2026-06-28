import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";


export const getRegions = createAsyncThunk(
  "regions/getRegions",
  async ({ page = 1, limit = 100, status = null, search = "" } = {}) => {
    const filters = [];
    
    if (status && status !== "all") {
      filters.push(`properties.status:${status}`);
    }
    
    if (search && search.trim() !== "") {
      filters.push(`properties.regionName:${search.trim()}`);
    }
    
    const params = { page, limit };
    
    if(filters.length) {
      params.q = filters.join(" AND ");
    }
    
    const response = await axiosInstance.get('regions', { params });
    return {data: response.data, limit};
  }
);
export const getRegionsAll = createAsyncThunk(
  "regions/getRegionsAll",
  async () => {
    const response = await axiosInstance.get('regions');
    return {data: response.data};
  }
);

export const createRegion = createAsyncThunk(
  "regions/createRegion",
  async (regionData,  { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('regions', regionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteRegion = createAsyncThunk(
  "regions/deleteRegion",
  async (regionId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`regions/${regionId}`);
      return regionId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateRegion = createAsyncThunk(
  "regions/updateRegion",
  async ({ regionId, regionData }) => {
    const response = await axiosInstance.put(`regions/${regionId}`, regionData);
    return response.data;
  }
);

export const deleteRegionsBulk = createAsyncThunk(
  "regions/deleteRegionsBulk",
  async (regionIds, { rejectWithValue }) => {
    try {
      await axiosInstance.post('regions/delete', { ids: regionIds });
      return regionIds;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const regionsSlice = createSlice({
  name: "regions",
  initialState: {
    regionsList: [],
    allRegions: [],
    totalPages: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getRegions.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getRegions.fulfilled, (state, action) => {
      state.loading = false;
      state.regionsList = action.payload.data.items;
      state.totalPages = Math.ceil(action.payload.data.totalHits / action.payload.limit);
    });
    builder.addCase(getRegions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    }).addCase(createRegion.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createRegion.fulfilled, (state, action) => {
      state.regionsList.push(action.payload);
      state.loading = false;
    }).addCase(createRegion.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;

    }).addCase(deleteRegion.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(deleteRegion.fulfilled, (state, action) => {
      state.regionsList = state.regionsList.filter(region => region.id !== action.payload);
    }).addCase(deleteRegion.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    .addCase(updateRegion.pending, (state) => {
      state.loading = true;
      state.error = null;
    }).addCase(updateRegion.fulfilled, (state, action) => {
      const index = state.regionsList.findIndex(region => region.id === action.payload.id)
        if (index !== -1) { 
          state.regionsList[index] = action.payload;
        }
    }).addCase(updateRegion.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;   
    }).addCase(getRegionsAll.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getRegionsAll.fulfilled, (state, action) => {
      state.loading = false;
      state.allRegions = action.payload.data.items;
    });
    builder.addCase(getRegionsAll.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
    builder.addCase(deleteRegionsBulk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteRegionsBulk.fulfilled, (state, action) => {
      state.loading = false;
      const idsToDelete = action.payload;
      state.regionsList = state.regionsList.filter(
        (region) => !idsToDelete.includes(region.id)
      );
       
    });
    builder.addCase(deleteRegionsBulk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
  }
});

export default regionsSlice.reducer;