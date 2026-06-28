import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";
import { environment } from "../../environments/environment";
import axios from "axios";

export const getActiveCart = createAsyncThunk(
  "cart/getActiveCart",
  async ({ userId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${environment.serverOrigin}carts?q=properties.userId:${userId}&properties.status:ACTIVE`,
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

export const getActiveCartBySession = createAsyncThunk(
  "cart/getActiveCartBySession",
  async ({ sessionId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${environment.serverOrigin}carts?q=properties.sessionId:${sessionId}&properties.status:ACTIVE`,
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

export const createCart = createAsyncThunk(
  "cart/createCart",
  async ({ sessionId, userId = "" }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${environment.serverOrigin}carts`,
        {
          userId,
          sessionId,
          countryCode: "JO",
          currencyCode: "JOD",
        },
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

export const updateCart = createAsyncThunk(
  "cart/updateCart",
  async ({ cartId, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${environment.serverOrigin}carts/${cartId}`, data, {
        headers: {
          Authorization: `Anonymous=${environment.appid}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const mergeCarts = createAsyncThunk(
  "cart/mergeCarts",
  async ({ cartId, cartLineIds }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${environment.serverOrigin}carts/merge`,
        {
          cartId,
          cartLineIds,
        },
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

export const addItemToCart = createAsyncThunk(
  "cart/addItemToCart",
  async ({ productData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${environment.serverOrigin}cart-lines`, productData, {
        headers: {
          Authorization: `Anonymous=${environment.appid}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const updateItemInCart = createAsyncThunk(
  "cart/updateItemInCart",
  async ({ itemId, productData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${environment.serverOrigin}cart-lines/${itemId}`,
        productData,
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

export const removeItemFromCart = createAsyncThunk(
  "cart/removeItemFromCart",
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${environment.serverOrigin}cart-lines/${itemId}`, {
        headers: {
          Authorization: `Anonymous=${environment.appid}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const removeAllItemsFromCart = createAsyncThunk(
  "cart/removeAllItemsFromCart",
  async (ids, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${environment.serverOrigin}batch-delete`,
        { ids: ids },
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

export const getCartItems = createAsyncThunk(
  "cart/getCartItems",
  async ({ cartId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${environment.serverOrigin}carts/${cartId}`, {
        headers: {
          Authorization: `Anonymous=${environment.appid}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const addCartItem = createAsyncThunk(
  "cart/addCartItem",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${environment.serverOrigin}carts`,
        {
          productId,
          quantity,
        },
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

export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async (ids, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${environment.serverOrigin}batch-delete`,
        { ids: ids },
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

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    activeCart: null,
    cartItems: [],
    error: null,
  },
  reducers: {
    setCartItems: (state, action) => {
      state.cartItems = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getActiveCart.pending, (state) => {
        state.activeCart = null;
      })
      .addCase(getActiveCart.fulfilled, (state, action) => {
        state.activeCart = action.payload;
      })
      .addCase(getActiveCart.rejected, (state) => {
        state.activeCart = null;
      })
      .addCase(getActiveCartBySession.fulfilled, (state, action) => {
        state.activeCart = action.payload;
      })
      .addCase(createCart.fulfilled, (state, action) => {
        state.activeCart = action.payload;
      })
      .addCase(updateCart.fulfilled, (state, action) => {
        state.activeCart = action.payload;
      })
      .addCase(mergeCarts.fulfilled, (state, action) => {
        state.activeCart = action.payload;
      })
      .addCase(getCartItems.pending, (state) => {
        state.cartItems = [];
      })
      .addCase(getCartItems.fulfilled, (state, action) => {
        state.cartItems = action.payload || [];
      })
      .addCase(getCartItems.rejected, (state) => {
        state.cartItems = [];
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        state.cartItems.push(action.payload);
      })
      .addCase(addCartItem.rejected, (state) => {
        state.error = "Failed to add item to cart";
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        const removedIds = action.payload.ids;
        state.cartItems = state.cartItems.filter(
          (item) => !removedIds.includes(item.id),
        );
      })
      .addCase(removeCartItem.rejected, (state) => {
        state.error = "Failed to remove item from cart";
      });
  },
});

export const { setCartItems } = cartSlice.actions;
export default cartSlice.reducer;