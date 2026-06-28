import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";


export const fetchAgreements = createAsyncThunk(
  "agreements/fetchAgreements",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/agreements");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createAgreement = createAsyncThunk(
  "agreements/createAgreement",
  async (agreementData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/agreements", agreementData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateAgreement = createAsyncThunk(
  "agreements/updateAgreement",
  async ({ id, agreementData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `/agreements/${id}`,
        agreementData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteAgreement = createAsyncThunk(
  "agreements/deleteAgreement",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/agreements/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const agreementSlice = createSlice({
  name: "agreements",
  initialState: {
    agreements: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgreements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgreements.fulfilled, (state, action) => {
        state.loading = false;
        state.agreements = action.payload;
      })
      .addCase(fetchAgreements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      }).addCase(createAgreement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAgreement.fulfilled, (state, action) => {
        state.loading = false;
        state.agreements.push(action.payload);
      })
      .addCase(createAgreement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAgreement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAgreement.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.agreements.findIndex(
          (agreement) => agreement.id === action.payload.id
        );
        if (index !== -1) {
          state.agreements[index] = action.payload;
        }
      })
      .addCase(updateAgreement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteAgreement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAgreement.fulfilled, (state, action) => {
        state.loading = false;
        state.agreements = state.agreements.filter(
          (agreement) => agreement.id !== action.payload
        );
      })
      .addCase(deleteAgreement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });   
  },
});

export default agreementSlice.reducer;