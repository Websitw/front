import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";

export const getCurrencies = createAsyncThunk(
  "currencies/getCurrencies",
  async ({ page = 1, limit = 20, search = "" } = {}) => {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);

    if (search && search.trim() !== "") {
      params.append("q", `properties.currencyName:${search.trim()}`);
    }

    const response = await axiosInstance.get(`currencies?${params.toString()}`);
    return { data: response.data, limit };
  }
);
export const getCurrenciesAll = createAsyncThunk(
  "currencies/getCurrenciesAll",
  async () => {
    const response = await axiosInstance.get(`currencies`);
    return { data: response.data };
  }
);

export const createCurrency = createAsyncThunk(
  "currencies/createCurrency",
  async (currencyData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("currencies", currencyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateCurrency = createAsyncThunk(
  "currencies/updateCurrency",
  async ({ currencyId, currencyData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `currencies/${currencyId}`,
        currencyData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteCurrency = createAsyncThunk(
  "currencies/deleteCurrency",
  async (currencyId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`currencies/${currencyId}`);
      return currencyId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const deleteCurrenciesBulk = createAsyncThunk(
  "currencies/deleteCurrenciesBulk",
  async (currencyIds, { rejectWithValue }) => {
    try {
      await axiosInstance.post(`currencies/delete`, { ids: currencyIds });
      return currencyIds;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const currenciesSlice = createSlice({
  name: "currencies",
  initialState: {
    currencies: {
      items: [],
      allCurrencies: [],
      totalHits: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      lastKey: null,
    },
    currency: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCurrencies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrencies.fulfilled, (state, action) => {
        state.loading = false;
        state.currencies.items = action.payload.data.items;
        state.currencies.totalHits = action.payload.data.totalHits;
        state.currencies.page = action.payload.data.page;
        state.currencies.limit = action.payload.limit;
        state.currencies.totalPages = Math.ceil(
          action.payload.data.totalHits / action.payload.limit
        );
        state.currencies.lastKey = action.payload.data.lastKey;
      })
      .addCase(getCurrencies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createCurrency.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCurrency.fulfilled, (state, action) => {
        state.loading = false;
        state.currencies.items.push(action.payload);
        state.currencies.totalHits += 1;
      })
      .addCase(createCurrency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateCurrency.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCurrency.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.currencies.items.findIndex(
          (currency) => currency.id === action.payload.id
        );
        if (index !== -1) {
          state.currencies.items[index] = action.payload;
        }
      })
      .addCase(updateCurrency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteCurrency.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCurrency.fulfilled, (state, action) => {
        state.loading = false;
        state.currencies.items = state.currencies.items.filter(
          (currency) => currency.id !== action.payload
        );
        state.currencies.totalHits = Math.max(
          0,
          state.currencies.totalHits - 1
        );
        state.currencies.totalPages = Math.ceil(
          state.currencies.totalHits / state.currencies.limit
        );
      })
      .addCase(deleteCurrency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(getCurrenciesAll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrenciesAll.fulfilled, (state, action) => {
        state.loading = false;
        state.currencies.allCurrencies = action.payload.data.items;
      })
      .addCase(getCurrenciesAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
    builder
      .addCase(deleteCurrenciesBulk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCurrenciesBulk.fulfilled, (state, action) => {
        state.loading = false;
        const idsToDelete = action.payload;
        state.currencies.items = state.currencies.items.filter(
          (currency) => !idsToDelete.includes(currency.id)
        );
      })
      .addCase(deleteCurrenciesBulk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default currenciesSlice.reducer;
