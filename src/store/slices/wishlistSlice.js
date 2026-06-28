import { createCrudSlice } from "../utils/crudFactory";
import { productsApi } from "./productsSlice";

const wishlistSlice = createCrudSlice({
  name: "wishlist",
  endpoint: "favorite-products",
});

export const {
  fetchItems: fetchWishlistItems,
  createItem: addToWishlist,
  deleteItem: removeFromWishlist,
} = wishlistSlice.actions;

export const invalidateProductDetails = (productId) =>
  productsApi.util.invalidateTags([{ type: "ProductDetails", id: productId }]);

export default wishlistSlice.reducer;