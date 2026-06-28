import { createSlice } from "@reduxjs/toolkit";
import { resolveUserRole } from "../../helper/authRole";

const getInitialState = () => {
  try {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("userData");
    if (storedToken && storedUser) {
      const userData = JSON.parse(storedUser);
      return {
        isInitialized: true,
        isAuthenticated: true,
        user: userData,
        role: resolveUserRole(userData),
        token: storedToken,
      };
    }
  } catch (error) {
    console.error("Error reading auth from localStorage:", error);
  }
  return {
    isInitialized: true,
    isAuthenticated: false,
    user: null,
    role: null,
    token: null,
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.role = resolveUserRole(user);
      state.isAuthenticated = true;
      state.isInitialized = true;
    },
    logout: (state) => {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("userId");
      localStorage.removeItem("xPayId");
      localStorage.removeItem("cartID");
      localStorage.removeItem("REG_OTP_TRAIL_ID");
      localStorage.removeItem("OTP_TOKEN");
      localStorage.removeItem("USER_ID");
      localStorage.removeItem("USER_EMAIL");
      localStorage.removeItem("cartId");
      localStorage.removeItem("checkoutId");
      localStorage.removeItem("tokenRefresh");
      localStorage.removeItem("tokenExpires");
      localStorage.removeItem("lastTokenRefresh");
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
    },
    checkAuth: (state) => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("userData");
        if (storedToken && storedUser) {
          const userData = JSON.parse(storedUser);
          state.token = storedToken;
          state.user = userData;
          state.role = resolveUserRole(userData);
          state.isAuthenticated = true;
        } else {
          state.token = null;
          state.user = null;
          state.role = null;
          state.isAuthenticated = false;
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        state.token = null;
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
      }
      state.isInitialized = true;
    },
  },
});

export const { setCredentials, logout, checkAuth } = authSlice.actions;

export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsInitialized = (state) => state.auth.isInitialized;
export const selectUser = (state) => state.auth.user;
export const selectRole = (state) => state.auth.role;
export const selectToken = (state) => state.auth.token;

export default authSlice.reducer;
