import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";

export const getShippingInstructions = createAsyncThunk(
  "addProduct/getShippingInstructions",
  async ({}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("shipping-instructions");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const moveProductToStore = createAsyncThunk(
  "addProduct/moveProductToStore",
  async ({ productId, storeId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `manage/products/${productId}`,
        {
          storeId,
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const moveMultipleProductsToStore = createAsyncThunk(
  "addProduct/moveMultipleProductsToStore",
  async ({ productIds, storeId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`manage/products/move`, {
        productIds,
        storeId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const deleteSkuProduct = createAsyncThunk(
  "addProduct/deleteSkuProduct",
  async ({ productId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `manage/products/skus/${productId}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const deleteMultipleProducts = createAsyncThunk(
  "addProduct/deleteMultipleProducts",
  async ({ productIds }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `manage/products`,
        productIds,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const addProduct = createAsyncThunk(
  "addProduct/addProduct",
  async ({ productData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`manage/products`, productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const editProduct = createAsyncThunk(
  "addProduct/editProduct",
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `manage/products/${productId}`,
        productData,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const deleteProduct = createAsyncThunk(
  "addProduct/deleteProduct",
  async ({ productId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `manage/products/${productId}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);


export const editSkuProduct = createAsyncThunk(
    "addProduct/editSkuProduct",
    async ({ skuId, skuData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(
                `manage/products/skus/${skuId}`,
                skuData,
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    },
);

const addProductSlice = createSlice({
  name: "addProduct",
  initialState: {
    loading: false,
    error: null,
    success: false,
    shippingInstructions: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getShippingInstructions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getShippingInstructions.fulfilled, (state, action) => {
        state.loading = false;
        state.shippingInstructions = action.payload?.items || [];
      })
      .addCase(getShippingInstructions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch shipping instructions";
      });
    builder
      .addCase(moveProductToStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moveProductToStore.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(moveProductToStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to move product to store";
      });
    builder
      .addCase(moveMultipleProductsToStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moveMultipleProductsToStore.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(moveMultipleProductsToStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to move products to store";
      });
    builder
      .addCase(deleteSkuProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSkuProduct.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(deleteSkuProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete product";
      });
    builder
      .addCase(deleteMultipleProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMultipleProducts.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(deleteMultipleProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete products";
      });
    builder
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add product";
      });
    builder
      .addCase(editProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editProduct.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(editProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to edit product";
      });
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete product";
      });
    builder
      .addCase(editSkuProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editSkuProduct.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(editSkuProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to edit SKU product";
      });
  },
});

export default addProductSlice.reducer;
