import axiosInstance from "../../config/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ITEMS_PER_PAGE } from "../../helper/helper";
import axios from "axios";
import { environment } from "../../environments/environment";

export const getCities = createAsyncThunk(
  "cities/getCities",
  async ({ page = 1, limit = 30, search = "" } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);

      if (search && search.trim() !== "") {
        params.append("q", `properties.cityName:${search.trim()}`);
      }

      const response = await axiosInstance.get(`cities?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const fetchAllCities = createAsyncThunk(
  "cities/fetchAllCities",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${environment.serverOrigin}cities`, {
        headers: {
            "Authorization": `Anonymous=${environment.appid}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);


export const createCity = createAsyncThunk(
  "cities/createCity",
  async (cityData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("cities", cityData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const deleteCity = createAsyncThunk(
  "cities/deleteCity",
  async (cityId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`cities/${cityId}`);
      return cityId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const updateCity = createAsyncThunk(
  "cities/updateCity",
  async ({ cityId, cityData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`cities/${cityId}`, cityData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const deleteCitiesBulk = createAsyncThunk(
  "cities/deleteCitiesBulk",
  async (cityIds, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`cities/delete`, {
        ids: cityIds,
      });
      return cityIds;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

const citiesSlice = createSlice({
  name: "cities",
  initialState: {
    citiesList: [],
    allCities: [],
    loading: false,
    error: null,
    totalHits: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCities.fulfilled, (state, action) => {
        state.loading = false;
        state.citiesList = action.payload.items;
        state.totalHits = action.payload.totalHits;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.totalPages = Math.ceil(action.payload.totalHits / ITEMS_PER_PAGE);
      })
      .addCase(getCities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(createCity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCity.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createCity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(updateCity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCity.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateCity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteCity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCity.fulfilled, (state, action) => {
        state.loading = false;
        state.citiesList = state.citiesList.filter(
          (city) => city.id !== action.payload,
        );
      })
      .addCase(deleteCity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchAllCities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCities.fulfilled, (state, action) => {
        state.loading = false;
        state.allCities = action.payload.items;
      })
      .addCase(fetchAllCities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
    builder
      .addCase(deleteCitiesBulk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCitiesBulk.fulfilled, (state, action) => {
        state.loading = false;
        state.citiesList = state.citiesList.filter(
          (city) => !action.payload.includes(city.id),
        );
      })
      .addCase(deleteCitiesBulk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default citiesSlice.reducer;
