import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { environment } from "../../environments/environment";
import axiosInstance from "../../config/axiosInstance";

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${environment.platformServerOrigin}jwt_auth`,
        userData,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const additionalInfo = createAsyncThunk(
  "auth/additionalInfo",
  async ({ profileData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `user-information`,
        profileData,
        {
          headers: {
            Authorization: `Anonymous=${environment.appid}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const getDataProfile = createAsyncThunk(
  "auth/getDataProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`profile`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async ({ profileData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`profile`, profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

const authReducer = createSlice({
  name: "authReducer",
  initialState: {
    user: null,
    additionalInfo: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
    builder
      .addCase(getDataProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDataProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.additionalInfo = action.payload;
      })
      .addCase(getDataProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default authReducer.reducer;
