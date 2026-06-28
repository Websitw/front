import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { environment } from "../../environments/environment";
import axios from "axios";
const baseURL = environment.fileUrlApiV2;
const fileURl = environment.fileUrlApi;

export const uploadFile = createAsyncThunk(
  "uploadedFiles/uploadFile",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(baseURL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const validateFile = createAsyncThunk(
  "uploadedFiles/validateFile",
  async (fileData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${fileURl}import-sheet/validate`,
        fileData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const uploadedFileData = createAsyncThunk(
  "uploadedFiles/uploadedFileData",
  async (fileData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${fileURl}import-sheet`,
        fileData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

const uploadedFilesSlice = createSlice({
  name: "uploadedFiles",
  initialState: {
    files: [],
    validateData: [],
    uploadedData: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(uploadFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.loading = false;
        state.files.push(action.payload);
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to upload file";
      });
    builder
      .addCase(validateFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateFile.fulfilled, (state, action) => {
        state.loading = false;
        state.validateData = action.payload;
      })
      .addCase(validateFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to validate file";
      });
    builder
      .addCase(uploadedFileData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadedFileData.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadedData = action.payload;
      })
      .addCase(uploadedFileData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to upload file data";
      });
  },
});

export default uploadedFilesSlice.reducer;
