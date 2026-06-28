import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";

const initialState = {
  users: [],
  companyStatus: null,
  profileData: null,
  loading: false,
  error: null,
};

export const gethUsers = createAsyncThunk("users/fetchUsers", async () => {
  const response = await axiosInstance.get("users");
  return response.data;
});

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (userId) => {
    await axiosInstance.delete(`users/${userId}`);
    return userId;
  },
);

export const updateUserProfile = createAsyncThunk(
  "users/updateUserProfile",
  async ({ userId, profileData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `profile`,
        profileData,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const userCompanyStatus = createAsyncThunk(
  "users/userCompanyStatus",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `companies?q=properties.userId:${id}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(gethUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(gethUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(gethUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error;
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.items = state.users.items.filter(
          (user) => user.id !== action.payload,
        );
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error;
      });
    builder
      .addCase(userCompanyStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userCompanyStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.companyStatus = action.payload?.items[0]?.status;
        state.profileData = action.payload?.items[0];
      })
      .addCase(userCompanyStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default usersSlice.reducer;
