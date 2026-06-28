import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import wishlistReducer from "./slices/wishlistSlice";
import usersReducer from "./slices/usersSlice";
import merchantsReducer from "./slices/merchants";
import adsReducer from "./slices/adsSlice";
import prompteReducer from "./slices/prompCodeSlice";
import storesReducer from "./slices//stores";
import merchantReducer from "./slices/merchantsuser";
import merchantStoresReducer from "./slices/merchantStores";
import brandSlice from "./slices/brandsSlice";
import currenciesSlice from "./slices/currenciesSlice";
import countriesSlice from "./slices/counteriesSlice";
import taxSlice from "./slices/taxSlice";
import regionSlice from "./slices/regionSlice";
import citySlice from "./slices/citiesSlice";
import exchangeRateSlice from "./slices/exchangeSlice";
import segmentSlice from "./slices/segmentsSlice";
import bankDeailsSlice from "./slices/bankDeatilsSlice";
import contactSlice from "./slices/contactSlice";
import addressSlice from "./slices/addressSlice";
import agreementSlice from "./slices/agreementSlice";
import billingSlice from "./slices/billingSlice";
import documentSlice from "./slices//documentSlice";
import limitSlice from "./slices/limitSlice";
import documentCounterySlice from "./slices/documentCounterySlice";
import storeAgreements from "./slices/storeAgree";
import languageSlice from "./slices/languageSlice";
import authRegsiterReducer from "./slices/authReducer";
import industriesReducer from "./slices/industriesSlice";
import companiesSlice from "./slices/companySlice";
import forgetPasswordSlice from "./slices/forgetPassword";
import counteryConfige from "./slices/counteryConfig";
import adminSlice from "./slices/adminSlice";
import adminRoles from "./slices/adminRolesSlice";
import adminModules from "./slices/adminModules";
import userRoles from "./slices/userRoles";
import userSidebar from "./slices/userSidebar";
import brandStores from "./slices/brandStoresSlice";
import genralStores from "./slices/genralStoresSlice";
import { productsApi } from "./slices/productsSlice";
import giftSlice from "./slices/giftSlice";
import favoriteBrandSlice from './slices/favoriteBrandSlice';
import checkoutSlice from './slices/checkOutSlice';
import checkoutDetails from './slices/checkoutDetails'
import paymentReducer from './slices/paymentSlice';
import ordersSlice from './slices/ordersSlice';
import uploadeSlice from './slices/uploadeFiles';
import addProductSlice from './slices/addProduct';
import inventorySlice from './slices/inventorySlice'
// Global Redux store configuration for the whole app.
// Each key in the "reducer" object represents a slice of the global state tree.
// Example: state.auth, state.cart, state.wishlist, etc.

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    ads: adsReducer,
    wishlist: wishlistReducer,
    users: usersReducer,
    merchants: merchantsReducer,
    promocode: prompteReducer,
    stores: storesReducer,
    merchantsUser: merchantReducer,
    merchantStores: merchantStoresReducer,
    brands: brandSlice,
    currencies: currenciesSlice,
    countries: countriesSlice,
    tax: taxSlice,
    exchangeRate: exchangeRateSlice,
    regions: regionSlice,
    cities: citySlice,
    segments: segmentSlice,
    bankDetails: bankDeailsSlice,
    contacts: contactSlice,
    addresses: addressSlice,
    agreements: agreementSlice,
    billings: billingSlice,
    documents: documentSlice,
    limits: limitSlice,
    documentCountery: documentCounterySlice,
    storeAgreements: storeAgreements,
    languages: languageSlice,
    authRegister: authRegsiterReducer,
    industries: industriesReducer,
    companies: companiesSlice,
    forgetPassword: forgetPasswordSlice,
    countriesConfig: counteryConfige,
    admin: adminSlice,
    adminRoles: adminRoles,
    adminModules: adminModules,
    userRoles: userRoles,
    userSidebar: userSidebar,
    brandStores: brandStores,
    generalStores: genralStores,
    gift: giftSlice,
    favoriteBrands: favoriteBrandSlice,
    checkout: checkoutSlice,
    checkoutDetails: checkoutDetails,
    payment: paymentReducer,
    orders: ordersSlice,
    inventory: inventorySlice,
    uploadedFiles: uploadeSlice,
    addProduct: addProductSlice,
    [productsApi.reducerPath]: productsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(productsApi.middleware),
});
