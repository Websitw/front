import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";

export const createAdmin = createAsyncThunk(
  "admin/createAdmin",
  async (adminData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("_crtUser", adminData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateAdmin = createAsyncThunk(
  "admin/updateAdmin",
  async ({ adminId, adminData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`user/${adminId}`, adminData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const deleteAdmin = createAsyncThunk(
  "admin/deleteAdmin",
  async (adminId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`user/${adminId}`);
      return adminId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getAdmins = createAsyncThunk(
  "admin/getAdmins",
  async ({ page = 1, limit = 10, search = "", lastKey = null } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);

      if (lastKey) {
        params.append("lastKey", lastKey);
      }

      if (search && search.trim() !== "") {
        params.append("q", `properties.name:${search.trim()}`);
      }
      params.append("q", "programCode:admin");
      const response = await axiosInstance.get(`user?${params.toString()}`);
      // Include the requested limit and UI page in the response for pagination calculation
      return { ...response.data, limit, requestedPage: page };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    admins: [],
    loading: false,
    error: null,
    lastKey: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAdmins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdmins.fulfilled, (state, action) => {
        state.loading = false;
        state.admins = action.payload?.items || [];
        state.lastKey = action.payload?.lastKey || null;
        const totalHits = action.payload?.totalHits || 0;
        const limit = action.payload?.limit || 10;
        const totalPages = Math.ceil(totalHits / limit);

        state.pagination = {
          currentPage: action.payload?.requestedPage || 1,
          totalPages: totalPages,
          totalItems: totalHits,
          itemsPerPage: limit,
        };
      })
      .addCase(getAdmins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.admins.push(action.payload);
      })
      .addCase(createAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdmin.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.admins.findIndex(
          (admin) => admin.id === action.payload.id
        );
        if (index !== -1) {
          state.admins[index] = action.payload;
        }
      })
      .addCase(updateAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.admins = state.admins.filter(
          (admin) => admin.id !== action.payload
        );
      })
      .addCase(deleteAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default adminSlice.reducer;
