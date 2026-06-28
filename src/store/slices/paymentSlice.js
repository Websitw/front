import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { environment } from "../../environments/environment";

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const getXPayId = () => localStorage.getItem("xPayId");

export const fetchPaymentMethods = createAsyncThunk(
  "payment/fetchPaymentMethods",
  async (_, { rejectWithValue }) => {
    try {
      const url = `${environment.serverOrigin}xPayAccounts/${getXPayId()}/getpaymentmethods?withPluginInfo=true&includedDeleted=false&audit=NONE`;
      const response = await axios.get(url, { headers: getHeaders() });
      const cards = response.data.result;
      return cards.map((item) => ({
        paymentMethodId: item.paymentMethodId,
        properties: item.pluginInfo.properties,
      }));
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch payment methods",
      );
    }
  },
);

export const addPaymentMethod = createAsyncThunk(
  "payment/addPaymentMethod",
  async (body, { rejectWithValue }) => {
    try {
      const xPayId = getXPayId();
      const url = `${environment.serverOrigin}xPayStripe/xpay-stripe/checkout?kbAccountId=${xPayId}&paymentMethodTypes=card`;
      const response = await axios.post(url, body, { headers: getHeaders() });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add payment method",
      );
    }
  },
);

export const savePaymentMethod = createAsyncThunk(
  "payment/savePaymentMethod",
  async (_, { rejectWithValue }) => {
    try {
      const sessionId = localStorage.getItem("SESSION_ID");
      if (!sessionId) return null;

      const url = `${environment.serverOrigin}xPayAccounts/${getXPayId()}/paymentMethod/${sessionId}`;
      const response = await axios.post(
        url,
        { pluginName: "xpay-stripe", isDefault: false },
        { headers: getHeaders() },
      );
      localStorage.removeItem("SESSION_ID");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to save payment method",
      );
    }
  },
);

export const removePaymentMethod = createAsyncThunk(
  "payment/removePaymentMethod",
  async (paymentMethodId, { rejectWithValue }) => {
    try {
      const url = `${environment.serverOrigin}xPayPaymentMethods/${paymentMethodId}`;
      await axios.delete(url, { headers: getHeaders() });
      return paymentMethodId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove payment method",
      );
    }
  },
);

export const addXPayAccount = createAsyncThunk(
  "payment/addXPayAccount",
  async ({xpayAccount, token}, { rejectWithValue }) => {
    console.log("Adding XPay account with body:", xpayAccount, "and token:", token);
    try {
      const url = `${environment.serverOrigin}xPayAccounts`;
      const response = await axios.post(url, xpayAccount, { headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add XPay account",
      );
    }
  },
);

const initialState = {
  paymentMethods: [],
  selectedPaymentMethodId: "",
  isLoading: false,
  isAddingCard: false,
  isRemoving: false,
  error: null,
  selectedDateFilter: "All Dates",
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    setSelectedPaymentMethod: (state, action) => {
      state.selectedPaymentMethodId = action.payload;
    },
    setSelectedDateFilter: (state, action) => {
      state.selectedDateFilter = action.payload;
    },
    clearPaymentError: (state) => {
      state.error = null;
    },
    resetPaymentState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentMethods = action.payload;
        if (action.payload.length > 0 && !state.selectedPaymentMethodId) {
          state.selectedPaymentMethodId = action.payload[0].paymentMethodId;
        }
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(addPaymentMethod.pending, (state) => {
        state.isAddingCard = true;
        state.error = null;
      })
      .addCase(addPaymentMethod.fulfilled, (state) => {
        state.isAddingCard = false;
      })
      .addCase(addPaymentMethod.rejected, (state, action) => {
        state.isAddingCard = false;
        state.error = action.payload;
      })

      .addCase(savePaymentMethod.fulfilled, (state) => {
        state.error = null;
      })

      .addCase(removePaymentMethod.pending, (state) => {
        state.isRemoving = true;
      })
      .addCase(removePaymentMethod.fulfilled, (state, action) => {
        state.isRemoving = false;
        state.paymentMethods = state.paymentMethods.filter(
          (method) => method.paymentMethodId !== action.payload,
        );
        if (state.selectedPaymentMethodId === action.payload) {
          state.selectedPaymentMethodId =
            state.paymentMethods[0]?.paymentMethodId || "";
        }
      })
      .addCase(removePaymentMethod.rejected, (state, action) => {
        state.isRemoving = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedPaymentMethod,
  setSelectedDateFilter,
  clearPaymentError,
  resetPaymentState,
} = paymentSlice.actions;

export default paymentSlice.reducer;