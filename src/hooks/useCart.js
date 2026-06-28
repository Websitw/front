import { useDispatch, useSelector } from "react-redux";
import {
  getActiveCart,
  getActiveCartBySession,
  getCartItems,
  addCartItem,
  removeCartItem,
  addItemToCart,
  removeItemFromCart as removeCartItemFromApi,
  updateItemInCart as updateCartItem,
  removeAllItemsFromCart,
  createCart,
  updateCart,
  mergeCarts,
  setCartItems
} from "../store/slices/cartSlice";
import { showToast } from "../components/CustomToast/CustomToast";
import { useState } from "react";
import { getOrCreateSessionId } from "../helper/helper";
import {
  updateItemToGift,
  getGiftPackges,
} from '../store/slices/giftSlice'


const useCart = () => {
  const dispatch = useDispatch();
  const { activeCart, cartItems, error } = useSelector((state) => state.cart);
  const { giftPackages } = useSelector((state) => state.gift);
  const [loading, setLoading] = useState(false);

  const fetchActiveCart = (userId) => dispatch(getActiveCart({ userId }));

  
  const fetchCartItems = () => {
    setLoading(true);
    const cartId = localStorage.getItem("cartId");
    if (!cartId) {
      setLoading(false);
      dispatch(setCartItems([])); // Clear cart items if no cartId found
      return Promise.resolve({ success: false, error: "No cartId found" });
    }
    return dispatch(getCartItems({ cartId }))
      .unwrap()
      .then((response) => {
        setLoading(false);
        return { success: true, data: response };
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to fetch cart items");
        console.error("Error fetching cart items:", error);
        setLoading(false);
        return { success: false, error };
      });
  };

  const deleteAllItemsFromCart = (ids) => {
    setLoading(true);
    return dispatch(removeAllItemsFromCart(ids))
      .unwrap()
      .then((response) => {
        setLoading(false);
        return { success: true, data: response };
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to clear cart");
        console.error("Error clearing cart:", error);
        setLoading(false);
        return { success: false, error };
      });
  };

  const addItem = (productId, quantity) =>
    dispatch(addCartItem({ productId, quantity }));

  const removeItems = (ids) => dispatch(removeCartItem(ids));

  const addNewItemToCart = async (product) => {
  let cartId = localStorage.getItem("cartId");

  if (!cartId) {
    const cart = await initCart();
    cartId = cart?.id || localStorage.getItem("cartId");
  }

  const productData = {
    
    cartId,
    skuId: product?.id,
    lineQuantity: product?.lineQuantity || 1,
    lineType: "RETAIL",
    // merchantId: product?.merchantId,
    // storeId: product?.inventory?.physicalStoreId,
  };

  return dispatch(addItemToCart({ productData }))
    .unwrap()
    .then((response) => {
      fetchCartItems();
      showToast.success("Item added to cart");
      return { success: true, data: response };
    })
    .catch((error) => {
      showToast.error(
        error?.message || "Failed to add item to cart. Please try again."
      );
      return { success: false, error };
    });
};


  const removeItemFromCart = (itemId) => {
    return dispatch(removeCartItemFromApi(itemId))
      .unwrap()
      .then((response) => {
        return { success: true, data: response };
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to remove cart item");
        console.error("Error removing cart item:", error);
        return { success: false, error };
      });
  };

  const updateItemInCart = (itemId, productData) => {
    return dispatch(updateCartItem({ itemId, productData }))
      .unwrap()
      .then((response) => {
        return { success: true, data: response };
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to update cart item");
        console.error("Error updating cart item:", error);
        return { success: false, error };
      });
  };

  const initCart = async () => {
    setLoading(true);
    try {
      const sessionId = getOrCreateSessionId();
      const cartId = localStorage.getItem("cartId");

      if (cartId) {
        try {
          const result = await dispatch(getCartItems({ cartId })).unwrap();
          if (result?.status === "ACTIVE") {
            setLoading(false);
            return result;
          }
        } catch {
          localStorage.removeItem("cartId");
        }
      }

      const activeResult = await dispatch(
        getActiveCartBySession({ sessionId }),
      ).unwrap();

      const existingCart = activeResult?.items?.[0];

      if (existingCart) {
        localStorage.setItem("cartId", existingCart.id);
        const cartData = await dispatch(
          getCartItems({ cartId: existingCart.id }),
        ).unwrap();
        setLoading(false);
        return cartData;
      }

      const newCart = await dispatch(createCart({ sessionId })).unwrap();
      localStorage.setItem("cartId", newCart.id);
      setLoading(false);
      return newCart;
    } catch (error) {
      console.error("Error initializing cart:", error);
      setLoading(false);
      return null;
    }
  };

  const assignCartToUser = async (userId) => {
    const cartId = localStorage.getItem("cartId");
    const sessionId = getOrCreateSessionId();
    if (!cartId) return { success: false, error: "No cartId found" };

    return dispatch(
      updateCart({
        cartId,
        data: {
          userId,
          sessionId,
          countryCode: "JO",
          currencyCode: "JOD",
        },
      }),
    )
      .unwrap()
      .then((response) => {
        return { success: true, data: response };
      })
      .catch((error) => {
        console.error("Error assigning cart to user:", error);
        return { success: false, error };
      });
  };

const handlePostLoginCart = async (userId) => {
    setLoading(true);
    try {
      const anonymousCartId = localStorage.getItem("cartId");
      const anonymousCartLines = cartItems?.cartLines ?? [];
      const anonymousLineIds = anonymousCartLines.map((line) => line.id);

      const userCartResult = await dispatch(getActiveCart({ userId })).unwrap();

      console.log("User cart result after login:", userCartResult);
      const allUserCarts = userCartResult?.items ?? [];
      const existingUserCart = allUserCarts.find(
        (cart) => cart.status === "ACTIVE"
      );

      if (existingUserCart && existingUserCart.id !== anonymousCartId) {
        if (anonymousLineIds.length > 0) {
          await dispatch(
            mergeCarts({
              cartId: existingUserCart.id,
              cartLineIds: anonymousLineIds,
            }),
          ).unwrap();
        }
        localStorage.setItem("cartId", existingUserCart.id);
      } else if (!existingUserCart) {

        const sessionId = getOrCreateSessionId();
        const newCart = await dispatch(
          createCart({ sessionId, userId }),
        ).unwrap();
        localStorage.setItem("cartId", newCart.id);

        if (anonymousLineIds.length > 0) {
          await dispatch(
            mergeCarts({
              cartId: newCart.id,
              cartLineIds: anonymousLineIds,
            }),
          ).unwrap();
        }
      }

      await fetchCartItems();
      setLoading(false);
      return { success: true };
    } catch (error) {
      console.error("Error handling post-login cart:", error);
      setLoading(false);
      return { success: false, error };
    }
  };

  const getGiftPackages = () => dispatch(getGiftPackges());

  const updateItemToGiftPackage = (cartLineId, giftData) =>{
    return dispatch(updateItemToGift({ cartLineId, giftData }))
      .unwrap()
      .then((response) => {
        return { success: true, data: response };
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to update gift package");
        console.error("Error updating gift package:", error);
        return { success: false, error };
      });
  }

  return {
    activeCart,
    cartItems,
    giftPackages,
    error,
    loading,
    fetchActiveCart,
    fetchCartItems,
    addItem,
    removeItems,
    addNewItemToCart,
    removeItemFromCart,
    updateItemInCart,
    deleteAllItemsFromCart,
    initCart,
    assignCartToUser,
    handlePostLoginCart,
    updateItemToGiftPackage,
    getGiftPackages,
  };
};

export default useCart;
