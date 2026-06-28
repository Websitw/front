import axiosInstance from "../../config/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ITEMS_PER_PAGE } from "../../helper/helper";
import axios from "axios";
import { environment } from "../../environments/environment";

export const fetchCountriesListAnonymous = createAsyncThunk(
  "countries/fetchCountriesListAnonymous",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${environment.serverOrigin}countries?limit=100`,{
        headers:{
          Authorization:`Anonymous=${environment.appid}`
        }
      });
      
      // const countries = response.data.items || response.data;
      //   console.log("Fetched countries:", countries);
      // const countriesWithFlags = await Promise.all(
      //   countries.map(async (country) => {
      //     try {
      //       const flagResponse = await axios.get(
      //         `https://restcountries.com/v3.1/alpha/${country.countryCode}`
      //       );
            
      //       return {
      //         id: country?.countryCodeNumeric || country.id,
      //         countryName: country.countryName || country.properties?.countryName,
      //         countryCode: country.countryCode,
      //         flag: flagResponse.data[0].flags.svg,
      //         flagPng: flagResponse.data[0].flags.png,
      //         flagEmoji: flagResponse.data[0].flag
      //       };
      //     } catch (error) {
      //       console.error(`Failed to fetch flag for ${country.countryCode}:`, error);
      //       return {
      //         id: country.id,
      //         countryName: country.countryName || country.properties?.countryName,
      //         countryCode: country.countryCode,
      //         flag: null
      //       };
      //     }
      //   })
      // );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCountries = createAsyncThunk(
  "countries/fetchCountries",
  async ({ page = 1, limit = 30, search = "" } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);
      
      if (search && search.trim() !== "") {
        params.append("q", `properties.countryName:${search.trim()}`);
      }
    
      const response = await axiosInstance.get(
        `countries?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchAllCountries = createAsyncThunk(
  "countries/fetchAllCountries",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`countries?limit=100`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createCountry = createAsyncThunk(
  "countries/createCountry",
  async (countryData, { rejectWithValue }) => {
    try {
      console.log("Creating country with data:", countryData);
      const response = await axiosInstance.post(
        "countries",
        countryData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteCountry = createAsyncThunk(
  "countries/deleteCountry",
  async (countryId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `countries/${countryId}`
      );
      return countryId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateCountry = createAsyncThunk(
  "countries/updateCountry",
  async ({ countryId, countryData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `countries/${countryId}`,
        countryData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteCountriesBulk = createAsyncThunk(
  "countries/deleteCountriesBulk",
  async (countryIds, { rejectWithValue }) => {
    try {
      await axiosInstance.post(`countries/delete`, { ids: countryIds });
      return countryIds;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);


const countriesSlice = createSlice({
  name: "countries",
  initialState: {
    countriesList: [],
    allCountriesList: [],
    loading: false,
    error: null,
    totalPages: 0,
    page: 1,
    totalHits: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.loading = false;
        state.countriesList = action.payload;
        state.totalHits = action.payload.totalHits;
        state.totalPages = Math.ceil(action.payload.totalHits / ITEMS_PER_PAGE);
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch countries";
      })
      .addCase(createCountry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCountry.fulfilled, (state, action) => {
        state.loading = false;
        state.countriesList?.items.push(action.payload);
      })
      .addCase(createCountry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create country";
      })
      .addCase(deleteCountry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCountry.fulfilled, (state, action) => {
        state.loading = false;
        state.countriesList.items = state.countriesList.items.filter(
          (country) => country.id !== action.payload
        );
      })
      .addCase(deleteCountry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete country";
      })
      .addCase(updateCountry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCountry.fulfilled, (state, action) => {
        state.loading = false;
        if(!state.countriesList.items?.length===0){
        const index = state.countriesList.items.findIndex(
          (country) => country.id === action.payload
        );
        if (index !== -1) {
          state.countriesList.items[index] = {
            ...state.countriesList.items[index],
            ...action.meta.arg.countryData,
          };
        }
      }
      else{
        const index = state.allCountriesList.findIndex(
          (country) => country.id === action.payload
        );
        if (index !== -1) {
          state.allCountriesList[index] = {
            ...state.allCountriesList[index],
            ...action.meta.arg.countryData,
          };
        }
      }
      })
      .addCase(updateCountry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update country";
      })
      .addCase(fetchAllCountries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCountries.fulfilled, (state, action) => {
        state.loading = false;
        state.allCountriesList = action.payload?.items;
      })
      .addCase(fetchAllCountries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch all countries";
      }).addCase(fetchCountriesListAnonymous.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCountriesListAnonymous.fulfilled, (state, action) => {
        state.loading = false;
        state.allCountriesList = action.payload?.items;
      })
      .addCase(fetchCountriesListAnonymous.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch all countries anonymously";
      }).addCase(deleteCountriesBulk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCountriesBulk.fulfilled, (state, action) => {
        state.loading = false;
        state.countriesList.items = state.countriesList.items.filter(
          (country) => !action.payload.includes(country.id)
        );
      })
      .addCase(deleteCountriesBulk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete countries in bulk";
      });
  },
});

export default countriesSlice.reducer;
