import axiosInstance from "../../config/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Async thunk to fetch countries from the server
export const fetchTaxList = createAsyncThunk(
    "tax/fetchTaxList",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("tax-groups");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const createTax = createAsyncThunk(
    "tax/createTax",
    async (taxData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("tax-groups", taxData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const deleteTax = createAsyncThunk(
    "tax/deleteTax",
    async (taxId, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`tax-groups/${taxId}`);
            return taxId;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const updateTax = createAsyncThunk(
    "tax/updateTax",
    async ({ taxId, taxData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`tax-groups/${taxId}`, taxData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const deleteTaxesBulk = createAsyncThunk(
    "tax/deleteTaxesBulk",
    async (taxIds, { rejectWithValue }) => {
        try {
            await axiosInstance.post("tax-groups/delete", { ids: taxIds });
            return taxIds;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const taxSlice = createSlice({
    name: "tax",
    initialState: {
        taxList: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTaxList.pending, (state) => {
                state.loading = true;
                state.error = null;
                
            })
            .addCase(fetchTaxList.fulfilled, (state, action) => {
                state.loading = false;
                state.taxList = action.payload?.items;
            })
            .addCase(fetchTaxList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            .addCase(createTax.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createTax.fulfilled, (state, action) => {
                state.loading = false;
                state.taxList.push(action.payload);
            })
            .addCase(createTax.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            .addCase(deleteTax.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteTax.fulfilled, (state, action) => {
                state.loading = false;
                state.taxList = state.taxList.filter(tax => tax.id !== action.payload);
            })
            .addCase(deleteTax.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            .addCase(updateTax.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateTax.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.taxList.findIndex(tax => tax.id === action.payload.id);
                if (index !== -1) {
                    state.taxList[index] = action.payload;
                }
            })
            .addCase(updateTax.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            });
            builder.addCase(deleteTaxesBulk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteTaxesBulk.fulfilled, (state, action) => {
                state.loading = false;
                state.taxList = state.taxList.filter(
                    (tax) => !action.payload.includes(tax.id)
                );
            })
            .addCase(deleteTaxesBulk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            });
    },
});

export default taxSlice.reducer;