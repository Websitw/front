import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";

export const getCategories = createAsyncThunk(
  "merchantStores/getCategories",
  async () => {
    const response = await axiosInstance.get('details/shopCategoriesTab');
    return response.data;
  }
);

export const getCountries = createAsyncThunk(
  "merchantStores/getCountries",
  async () => {
    const response = await axiosInstance.get('countries');
    return response.data;
  }
);

export const createStore = createAsyncThunk(
    "merchantStores/createStore",
    async (storeData) => {
        const response = await axiosInstance.post('stores', storeData);
        return response.data;
    }
);

export const getStores = createAsyncThunk(
    "merchantStores/getStores",
    async ({page = 1, limit = 10, status = null}={}) => {
        const filters = [];
        if (status && status !== "all") {
            filters.push(`properties.status:${status}`);
        }
        const params = {page, limit};
        
        if (filters.length) {
            params.q = filters.join("");
        }
        const response = await axiosInstance.get('stores', { params });
        return {data: response.data, limit};
    }
);

export const editStore = createAsyncThunk(
    "merchantStores/editStore",
    async ({ storeId, storeData }) => {
        const response = await axiosInstance.put(`stores/${storeId}`, storeData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
);

export const deleteStore = createAsyncThunk(
    "merchantStores/deleteStore",
    async (storeId) => {
        await axiosInstance.delete(`stores/${storeId}`);
        return storeId;
    }
);

const merchantStoresSlice = createSlice({
  name: "merchantStores",
  initialState: {
    merchantStores: [],
    categories: [],
    totalPages: 0,
    countries: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCategories.pending, (state) => {
        state.loading = true;
    },
        )
        .addCase(getCategories.fulfilled, (state, action) => {
            state.loading = false;
            state.categories = action.payload?.items;
        },
        )
        .addCase(getCategories.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error;
        },
        )
        .addCase(getCountries.pending, (state) => {
            state.loading = true;
        },
        )
        .addCase(getCountries.fulfilled, (state, action) => {
            state.loading = false;
            state.countries = action.payload?.items;
        },
        )
        .addCase(getCountries.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error;
        },
        ).addCase(createStore.pending, (state) => {
            state.loading = true;
        },
        )
        .addCase(createStore.fulfilled, (state, action) => {
            state.loading = false;
            state.merchantStores.push(action.payload);
        },
        )
        .addCase(createStore.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error;
        },
        ).addCase(getStores.pending, (state) => {
            state.loading = true;
        },
        )
        .addCase(getStores.fulfilled, (state, action) => {
            state.loading = false;
            const userData = JSON.parse(localStorage.getItem("userData"));
            const userId = userData?.id;
            const limit = action.payload?.limit;
            const totalHits = action.payload?.data.totalHits || 0;
            state.totalPages = Math.ceil(totalHits / limit);
            const filteredStores = action.payload?.data.items.filter(
                (store) => store.creatorid === userId
            );
            state.merchantStores = filteredStores;
        },
        )
        .addCase(getStores.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error;
        },
        ).addCase(editStore.pending, (state) => {
            state.loading = true;
        },
        )
        .addCase(editStore.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.merchantStores.findIndex(store => store.id === action.payload.id);
            if (index !== -1) {
                state.merchantStores[index] = action.payload;
            }
        },
        )
        .addCase(editStore.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error;
        },
        ).addCase(deleteStore.pending, (state) => {
            state.loading = true;
        },
        )
        .addCase(deleteStore.fulfilled, (state, action) => {
            state.loading = false;
            state.merchantStores = state.merchantStores.filter(
                (store) => store.id !== action.payload
            );
        },
        )
        .addCase(deleteStore.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error;
        },
        );
    }
});

export default merchantStoresSlice.reducer;