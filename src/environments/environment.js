const DEFAULT_APP_ID = "mada";
const DEFAULT_APP_ORIGIN = "https://sawa.xapis.com";
const DEFAULT_SERVER_ORIGIN = "https://xapsawa.xapis.com/v1/";
const DEFAULT_PLATFORM_SERVER_ORIGIN = "https://xapsawa.xapis.com/";
const DEFAULT_UPLOAD_FILE_URL = `${DEFAULT_SERVER_ORIGIN}_upload`;
const DEFAULT_FILE_URL = `${DEFAULT_SERVER_ORIGIN}_xfilestore/${DEFAULT_APP_ID}/`;

export const environment = {
    baseUrl: import.meta.env.VITE_BASE_URL,
    serverOrigin: import.meta.env.VITE_SERVER_ORIGIN || DEFAULT_SERVER_ORIGIN,
    platformServerOrigin: import.meta.env.VITE_PLATFORM_SERVER_ORIGIN || DEFAULT_PLATFORM_SERVER_ORIGIN,
    production: import.meta.env.VITE_PRODUCTION,
    fileUrl: import.meta.env.VITE_FILE_URL || DEFAULT_FILE_URL,
    marketPlaceAPI: import.meta.env.VITE_MARKETPLACE_API,
    appid: import.meta.env.VITE_APP_ID || DEFAULT_APP_ID,
    appOrigin: import.meta.env.VITE_APP_ORIGIN || DEFAULT_APP_ORIGIN,
    facebookAppId: import.meta.env.VITE_FACEBOOK_APP_ID,
    uploadeFileUrl: import.meta.env.VITE_UPLOAD_FILE_URL || DEFAULT_UPLOAD_FILE_URL,
    dlivUrl: import.meta.env.VITE_DLIV_URL,
    bnplUrl: import.meta.env.VITE_BNPL_URL,
    fileUrlApi: import.meta.env.VITE_FILE_URL_API,
    fileUrlApiV2: import.meta.env.VITE_FILE_URL_API_V2,
  };
