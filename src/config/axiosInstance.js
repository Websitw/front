import axios from 'axios';
import { environment } from '../environments/environment';

const axiosInstance = axios.create({
  baseURL: environment.serverOrigin,
});

let isSessionExpiredShown = false;
let modalCallback = null;

const getAuthorizationHeader = (headers) => {
  if (!headers) return undefined;
  if (typeof headers.get === "function") {
    return headers.get("Authorization") || headers.get("authorization");
  }
  return headers.Authorization || headers.authorization;
};

export const setModalCallback = (callback) => {
  modalCallback = callback;
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && !getAuthorizationHeader(config.headers)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Axios response error:', error);
    const authorization = getAuthorizationHeader(error.config?.headers);
    const isBearerRequest = authorization?.startsWith("Bearer ");
    if (error.response?.status === 401 && isBearerRequest && !isSessionExpiredShown) {
      isSessionExpiredShown = true;
      
      if (modalCallback) {
        modalCallback();
      }
      
      setTimeout(() => {
        isSessionExpiredShown = false;
      }, 2000);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
