import { createSlice } from "@reduxjs/toolkit";

const userSidebarSlice = createSlice({
  name: "userSidebar",
  initialState: {
    searchOpen: false,
    searchCategoryBrandOpen: false,
    sidebarOpen: false,
    brandFilterOpen: false,
    loginOpen: false,
    cartOpen: false,
  },
  reducers: {
    setSearchOpen: (state, action) => {
      state.searchOpen = action.payload;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setBrandFilterOpen: (state, action) => {
      console.log("Setting brandFilterOpen to:", action.payload); // Debug log
      state.brandFilterOpen = action.payload;
      console.log("Updated state.brandFilterOpen:", state.brandFilterOpen); // Debug log
    },
    setSearchCategoryBrandOpen: (state, action) => {
      state.searchCategoryBrandOpen = action.payload;
    },
    setLoginOpen: (state, action) => {
      state.loginOpen = action.payload;
    },
    setCartOpen: (state, action) => {
      state.cartOpen = action.payload;
    },
  },
});

export const {
  setSearchOpen,
  setSidebarOpen,
  setBrandFilterOpen,
  setSearchCategoryBrandOpen,
  setLoginOpen,
  setCartOpen,
} = userSidebarSlice.actions;

export default userSidebarSlice.reducer;
