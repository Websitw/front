import axiosInstance from "../../config/axiosInstance";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchBankDetails = createAsyncThunk(
  "bankDetails/fetchBankDetails",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/merchant/bank-details");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createBankDetail = createAsyncThunk(
  "bankDetails/createBankDetail",
  async (bankDetailData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/merchant/bank-details",
        bankDetailData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateBankDetail = createAsyncThunk(
  "bankDetails/updateBankDetail",
  async ({ id, bankDetailData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `/merchant/bank-details/${id}`,
        bankDetailData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteBankDetail = createAsyncThunk(
  "bankDetails/deleteBankDetail",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/merchant/bank-details/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const bankDetailsSlice = createSlice({
  name: "bankDetails",
  initialState: {
    bankDetails: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBankDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBankDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.bankDetails = action.payload;
      })
      .addCase(fetchBankDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createBankDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBankDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.bankDetails.push(action.payload);
      })
      .addCase(createBankDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateBankDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBankDetail.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bankDetails.findIndex(
          (detail) => detail.id === action.payload.id
        );
        if (index !== -1) {
          state.bankDetails[index] = action.payload;
        }
      })
      .addCase(updateBankDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteBankDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBankDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.bankDetails = state.bankDetails.filter(
          (detail) => detail.id !== action.payload
        );
      })
      .addCase(deleteBankDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default bankDetailsSlice.reducer;
