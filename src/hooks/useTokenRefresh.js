import { useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { environment } from "../environments/environment";
import { selectIsAuthenticated } from "../store/slices/authSlice";
import { setCredentials } from "../store/slices/authSlice";

const REFRESH_INTERVAL = 8 * 60 * 1000;
const TOKEN_LIFETIME = 10 * 60 * 1000;
const REFRESH_THRESHOLD = 5 * 60 * 1000;
const LAST_REFRESH_KEY = "lastTokenRefresh";

const useTokenRefresh = ({ onSessionExpired }) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const intervalRef = useRef(null);
  const lastRefreshRef = useRef(
    Number(localStorage.getItem(LAST_REFRESH_KEY)) || Date.now()
  );
  const onSessionExpiredRef = useRef(onSessionExpired);
  onSessionExpiredRef.current = onSessionExpired;

  const handleSessionExpired = useCallback(() => {
    clearInterval(intervalRef.current);
    onSessionExpiredRef.current?.();
  }, []);

  const refreshToken = useCallback(async () => {
    const accessToken = localStorage.getItem("token");
    if (!accessToken) return false;

    try {
      const { data } = await axios.get(
        `${environment.platformServerOrigin}jwt_auth`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const newToken = data?.jwt?.access_token;
      if (newToken) {
        localStorage.setItem("token", newToken);
        localStorage.setItem("tokenExpires", data.jwt.expires);
        localStorage.setItem("tokenRefresh", data.jwt.refresh);

        const userData = JSON.parse(localStorage.getItem("userData"));
        if (userData) {
          dispatch(setCredentials({ user: userData, token: newToken }));
        }

        const now = Date.now();
        lastRefreshRef.current = now;
        localStorage.setItem(LAST_REFRESH_KEY, String(now));

        return true;
      }
      return false;
    } catch (error) {
      if (error?.response?.status === 401) {
        handleSessionExpired();
      }
      return false;
    }
  }, [dispatch, handleSessionExpired]);

  const checkAndRefresh = useCallback(async () => {
    const elapsed = Date.now() - lastRefreshRef.current;

    if (elapsed >= TOKEN_LIFETIME) {
      handleSessionExpired();
      return;
    }

    if (elapsed >= REFRESH_THRESHOLD) {
      const success = await refreshToken();
      if (!success) handleSessionExpired();
    }
  }, [refreshToken, handleSessionExpired]);

  // Check token validity on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    const stored = Number(localStorage.getItem(LAST_REFRESH_KEY));
    if (stored) {
      lastRefreshRef.current = stored;
    }
    else {
    const now = Date.now();
    lastRefreshRef.current = now;
    localStorage.setItem(LAST_REFRESH_KEY, String(now));
  }

    checkAndRefresh();
  }, [isAuthenticated, checkAndRefresh]);

  // Set up the 8-minute refresh interval
  useEffect(() => {
    if (!isAuthenticated) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(async () => {
      const success = await refreshToken();
      if (!success) handleSessionExpired();
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalRef.current);
  }, [isAuthenticated, refreshToken, handleSessionExpired]);

  // Handle tab visibility changes
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      checkAndRefresh();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isAuthenticated, checkAndRefresh]);
};

export default useTokenRefresh;