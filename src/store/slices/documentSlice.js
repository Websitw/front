import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";


export const fetchDocuments = createAsyncThunk(
  "agreements/fetchDocuments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/documents");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createDocument = createAsyncThunk(
  "documents/createDocument",
  async (documentData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/documents", documentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateDocument = createAsyncThunk(
  "documents/updateDocument",
  async ({ id, documentData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `/documents/${id}`,
        documentData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteDocument = createAsyncThunk(
  "documents/deleteDocument",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/documents/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const documentSlice = createSlice({
  name: "documents",
  initialState: {
    documents: [],
    loading: false,
    error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchDocuments.pending, (state) => {
            state.loading = true;
        }).addCase(fetchDocuments.fulfilled, (state, action) => {
            state.loading = false;
            state.documents = action.payload;
        }).addCase(fetchDocuments.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }).addCase(createDocument.pending, (state) => {
            state.loading = true;
        }).addCase(createDocument.fulfilled, (state, action) => {
            state.loading = false;
            state.documents.push(action.payload);
        }).addCase(createDocument.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }).addCase(updateDocument.pending, (state) => {
            state.loading = true;
        }).addCase(updateDocument.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.documents.findIndex(
                (document) => document.id === action.payload.id
            );
            if (index !== -1) {
                state.documents[index] = action.payload;
            }
        }).addCase(updateDocument.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }).addCase(deleteDocument.pending, (state) => {
            state.loading = true;
        }).addCase(deleteDocument.fulfilled, (state, action) => {
            state.loading = false;
            state.documents = state.documents.filter(
                (document) => document.id !== action.payload
            );
        }).addCase(deleteDocument.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});

export default documentSlice.reducer;