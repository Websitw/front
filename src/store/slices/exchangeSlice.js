import axiosInstance from "../../config/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ITEMS_PER_PAGE } from "../../helper/helper";

export const fetchExchangeRates = createAsyncThunk(
  "exchange/fetchExchangeRates",
  async ({ page = 1, limit = 30, search = "" } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);

      if (search && search.trim() !== "") {
        params.append("q", `properties.name:${search.trim()}`);
      }

      const response = await axiosInstance.get(
        `exchange-rates?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addExchangeRate = createAsyncThunk(
  "exchange/addExchangeRate",
  async (exchangeRateData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "exchange-rates",
        exchangeRateData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteExchangeRate = createAsyncThunk(
  "exchange/deleteExchangeRate",
  async (exchangeRateId) => {
    await axiosInstance.delete(`exchange-rates/${exchangeRateId}`);
    return exchangeRateId;
  }
);
export const updateExchangeRate = createAsyncThunk(
  "exchange/updateExchangeRate",
  async ({ exchangeRateId, exchangeRateData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `exchange-rates/${exchangeRateId}`,
        exchangeRateData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteExchangeRatesBulk = createAsyncThunk(
  "exchange/deleteExchangeRatesBulk",
  async (exchangeRateIds, { rejectWithValue }) => {
    try { 
    await axiosInstance
      .post("exchange-rates/delete", {
        ids: exchangeRateIds,
      })
      
    return exchangeRateIds;
  }
    catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const exchangeSlice = createSlice({
  name: "exchange",
  initialState: {
    rates: [],
    totalPages: 0,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExchangeRates.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchExchangeRates.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.rates = action.payload.items;
        state.totalPages = Math.ceil(action.payload.totalHits / ITEMS_PER_PAGE);
      })
      .addCase(fetchExchangeRates.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addExchangeRate.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addExchangeRate.fulfilled, (state, action) => {
        state.rates.push(action.payload);
      })
      .addCase(addExchangeRate.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(deleteExchangeRate.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteExchangeRate.fulfilled, (state, action) => {
        state.rates = state.rates.filter((rate) => rate.id !== action.payload);
      })
      .addCase(deleteExchangeRate.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(updateExchangeRate.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateExchangeRate.fulfilled, (state, action) => {
        const index = state.rates.findIndex(
          (rate) => rate.id === action.payload.id
        );
        if (index !== -1) {
          state.rates[index] = action.payload;
        }
      })
      .addCase(updateExchangeRate.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
    builder.addCase(deleteExchangeRatesBulk.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(deleteExchangeRatesBulk.fulfilled, (state, action) => {
      state.rates = state.rates.filter(
        (rate) => !action.payload.includes(rate.id)
      );
    });
    builder.addCase(deleteExchangeRatesBulk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || action.error.message;
    });
  },
});

export default exchangeSlice.reducer;
