import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";
import { environment } from "../../environments/environment";

export const sendForgetPasswordEmail = createAsyncThunk(
  "forgetPassword/sendEmail",
  async (email, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `_passwdRes/user`,
        {
          appid: environment.appid,
          verType: "otp",
          verWay: "E",
          otpType: "F",
        },
        {
          params: {
            by: `identifier:"${email}"`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const verifyOtpForPasswordReset = createAsyncThunk(
  "forgetPassword/verifyOtp",
  async ({ email, otp, password, newPassword }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `_passwdRes/verify`,
        {
          appid: environment.appid,
          password: password,
          newpasswd: newPassword,
          verType: "otp",
          restPassToken: localStorage.getItem("RESET_PASS_TOKEN"),
          otpKey: localStorage.getItem("OTP_KEY"),
          otp: otp,
        },
        {
          params: {
            by: `identifier:"${email}"`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const activeAdminUser = createAsyncThunk(
  "forgetPassword/activeAdminUser",
  async (
    { identifier, otp, password, newPassword, vToken, otpKey },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post(
        `_actUser`,
        {
          appid: environment.appid,
          password: password,
          rpassword: newPassword,
          // verType: "otp",
          vToken: vToken,
          otpKey: otpKey,
          otp: otp,
        },
        {
          headers: {
            Authorization: `Anonymous=${environment.appid}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const resendOTP = createAsyncThunk(
  "forgetPassword/resendOTP",
  async ({ identifier, otpType }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `_passwdRes/user`,
        {
          appid: environment.appid,
          verType: "otp",
          verWay: "E",
          otpType: otpType,
        },
        {
          params: {
            by: `identifier:"${identifier}"`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const forgetPasswordSlice = createSlice({
  name: "forgetPassword",
  initialState: {
    loading: false,
    error: null,
    success: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sendForgetPasswordEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(sendForgetPasswordEmail.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(sendForgetPasswordEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export default forgetPasswordSlice.reducer;
