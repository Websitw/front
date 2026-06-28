import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance';

export const createCrudSlice = ({
  name,
  endpoint,
  selectId = '',
  transformResponse,
}) => {
  // Thunks
  const fetchItems = createAsyncThunk(
    `${name}/fetchItems`,
    async (params = {}, { rejectWithValue }) => {
      try {
        const response = await axiosInstance.get(endpoint, { params });
        return transformResponse ? transformResponse(response.data) : response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data);
      }
    }
  );

  const createItem = createAsyncThunk(
    `${name}/createItem`,
    async (data, { rejectWithValue }) => {
      try {
        const response = await axiosInstance.post(endpoint, data);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data);
      }
    }
  );

  const updateItem = createAsyncThunk(
    `${name}/updateItem`,
    async ({ id, data }, { rejectWithValue }) => {
      try {
        const response = await axiosInstance.put(`${endpoint}/${id}`, data);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data);
      }
    }
  );

  const deleteItem = createAsyncThunk(
    `${name}/deleteItem`,
    async (id, { rejectWithValue }) => {
      try {
        await axiosInstance.delete(`${endpoint}/${id}`);
        return id;
      } catch (error) {
        return rejectWithValue(error.response?.data);
      }
    }
  );

  const deleteItemsBulk = createAsyncThunk(
    `${name}/deleteItemsBulk`,
    async (ids, { rejectWithValue }) => {
      try {
        await axiosInstance.post(`${endpoint}/delete`, { ids: ids });
        return ids;
      } catch (error) {
        return rejectWithValue(error.response?.data);
      }
    }
  );
  const getItem = createAsyncThunk(
    `${name}/getItem`,
    async (id, { rejectWithValue }) => {
      try {
        const response = await axiosInstance.get(`${endpoint}/${id}`);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data);
      }
    }
  );

  const patchItem = createAsyncThunk(
    `${name}/patchItem`,
    async ({ id, data }, { rejectWithValue }) => {
      try {
        const response = await axiosInstance.patch(`${endpoint}/${id}`, data);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data);
      }
    }
  );

  // Slice
  const slice = createSlice({
    name,
    initialState: {
      items: [],
      item:[],
      loading: false,
      error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
      // Fetch
      builder
        .addCase(fetchItems.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchItems.fulfilled, (state, action) => {
          state.loading = false;
          state.items = action.payload?.items;
        })
        .addCase(fetchItems.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });

      // Create
      builder
        .addCase(createItem.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(createItem.fulfilled, (state, action) => {
          state.loading = false;
          state.items.push(action.payload);
        })
        .addCase(createItem.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });

      // Update
      builder
        .addCase(updateItem.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(updateItem.fulfilled, (state, action) => {
          state.loading = false;
          const index = state.items.findIndex(
            (item) => item[selectId] === action.payload[selectId]
          );
          if (index !== -1) {
            state.items[index] = action.payload;
          }
        })
        .addCase(updateItem.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });

      // Delete
      builder
        .addCase(deleteItem.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(deleteItem.fulfilled, (state, action) => {
          state.loading = false;
          state.items = state.items.filter(
            (item) => item[selectId] !== action.payload
          );
        })
        .addCase(deleteItem.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
      // Bulk Delete
      builder
        .addCase(deleteItemsBulk.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(deleteItemsBulk.fulfilled, (state, action) => {
          state.loading = false;
          const idsToDelete = action.payload;
          state.items = state.items.filter(
            (item) => !idsToDelete.includes(item[selectId])
          );
        })
        .addCase(deleteItemsBulk.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
      // Get Item
      builder
        .addCase(getItem.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(getItem.fulfilled, (state, action) => {
          state.loading = false;
          state.item = action.payload;
        })
        .addCase(getItem.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
    },
  });

  return {
    reducer: slice.reducer,
    actions: {
      ...slice.actions,
      fetchItems,
      createItem,
      updateItem,
      deleteItem,
      getItem,
      deleteItemsBulk,
      patchItem,
    },
  };
};