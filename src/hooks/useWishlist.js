import { useDispatch, useSelector } from "react-redux";
import { useState, useCallback } from "react";
import {
  fetchWishlistItems,
  addToWishlist,
  removeFromWishlist,
  invalidateProductDetails,
} from "../store/slices/wishlistSlice";
import { showToast } from "../components/CustomToast/CustomToast";
import { selectUser } from "../store/slices/authSlice";

export const useWishlist = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const [loading, setLoading] = useState(false);

  const getWishlist = useCallback(() => {
    if (!user?.id) return Promise.resolve({ success: false });
    setLoading(true);
    return dispatch(
      fetchWishlistItems({ q: `properties.userId:${user.id}` })
    )
      .unwrap()
      .then((result) => {
        return { success: true, data: result };
      })
      .catch((error) => {
        console.error("Error fetching wishlist:", error);
        return { success: false, error };
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dispatch, user?.id]);

  const addItem = useCallback(
    (skuId) => {
      if (!user?.id) {
        showToast.error("Please login to add to wishlist");
        return Promise.resolve({ success: false });
      }
      setLoading(true);
      return dispatch(addToWishlist({ userId: user.id, skuId }))
        .unwrap()
        .then((result) => {
          showToast.success("Added to wishlist");
          return { success: true, data: result };
        })
        .catch((error) => {
          showToast.error(error?.message || "Failed to add to wishlist");
          console.error("Error adding to wishlist:", error);
          return { success: false, error };
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [dispatch, user?.id]
  );

  const removeItem = useCallback(
    (wishlistId, productId) => {
      setLoading(true);
      return dispatch(removeFromWishlist(wishlistId))
        .unwrap()
        .then(() => {
          if (productId) {
            dispatch(invalidateProductDetails(productId));
          }
          showToast.success("Removed from wishlist");
          return { success: true };
        })
        .catch((error) => {
          showToast.error(error?.message || "Failed to remove from wishlist");
          console.error("Error removing from wishlist:", error);
          return { success: false, error };
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [dispatch]
  );

  const toggleWishlist = useCallback(
    (productData, activeSku) => {
      if (!user?.id) {
        showToast.error("Please login to add to wishlist");
        return Promise.resolve({ success: false });
      }

      const skuId = activeSku?.id || productData.skus?.[0]?.id;
      const productId = productData.productId || productData.id;

      if (activeSku?.isFavorite) {
        const wishlistRecord = wishlistItems?.find(
          (item) => item.skuId === skuId
        );
        const wishlistId = wishlistRecord?.id || productData.wishlistId;

        if (!wishlistId) {
          console.error("No wishlist record ID found for removal");
          return Promise.resolve({ success: false });
        }

        return removeItem(wishlistId, productId);
      } else {
        if (!skuId) {
          showToast.error("No SKU available for this product");
          return Promise.resolve({ success: false });
        }
        return addItem(skuId).then((result) => {
          if (result.success && productId) {
            dispatch(invalidateProductDetails(productId));
          }
          return result;
        });
      }
    },
    [user?.id, wishlistItems, addItem, removeItem, dispatch]
  );

  const isInWishlist = useCallback(
    (skuId) => {
      if (!wishlistItems?.length) return false;
      return wishlistItems.some((item) => item.skuId === skuId);
    },
    [wishlistItems]
  );

  return {
    wishlistItems,
    loading,
    getWishlist,
    addItem,
    removeItem,
    toggleWishlist,
    isInWishlist,
  };
};