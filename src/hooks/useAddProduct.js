import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getShippingInstructions,
  moveMultipleProductsToStore,
  moveProductToStore,
  deleteSkuProduct,
  deleteMultipleProducts,
  addProduct,
  editProduct,
  deleteProduct,
  editSkuProduct
} from "../store/slices/addProduct";
import { showToast } from "../components/CustomToast/CustomToast";

const useAddProduct = () => {
  const dispatch = useDispatch();

  const shippingInstructions = useSelector(
    (state) => state.addProduct.shippingInstructions,
  );
  const loading = useSelector((state) => state.addProduct.loading);
  const error = useSelector((state) => state.addProduct.error);

  const fetchShippingInstructions = useCallback(
    () => dispatch(getShippingInstructions({})).unwrap(),
    [dispatch],
  );
  const moveProduct = useCallback(
    (productId, storeId) =>
      dispatch(moveProductToStore({ productId, storeId }))
        .unwrap()
        .then(() => {
          showToast.success("Product moved successfully");
        })
        .catch((error) => {
          showToast.error("Failed to move product: " + error.message);
        }),

    [dispatch],
  );
  const moveMultipleProducts = useCallback(
    (productIds, targetStoreId) =>
      dispatch(moveMultipleProductsToStore({ productIds, targetStoreId }))
        .unwrap()
        .then(() => {
          showToast.success("Products moved successfully");
        })
        .catch((error) => {
          showToast.error("Failed to move products: " + error.message);
        }),
    [dispatch],
  );

  const removeSkuProduct = useCallback(
    (productId) =>
      dispatch(deleteSkuProduct({ productId }))
        .unwrap()
        .then(() => {
          showToast.success("Product deleted successfully");
        })
        .catch((error) => {
          showToast.error("Failed to delete product: " + error.message);
        }),
    [dispatch],
  );

  const removeMultipleProducts = useCallback(
    (productIds) =>
      dispatch(deleteMultipleProducts({ productIds }))
        .unwrap()
        .then(() => {
          showToast.success("Products deleted successfully");
        })
        .catch((error) => {
          showToast.error("Failed to delete products: " + error.message);
        }),
    [dispatch],
  );

  const removeProduct = useCallback(
    (productId) =>
      dispatch(deleteProduct({ productId }))
        .unwrap()
        .then(() => {
          showToast.success("Product deleted successfully");
        })
        .catch((error) => {
          showToast.error("Failed to delete product: " + error.message);
        }),
    [dispatch],
  );

  const createProduct = useCallback(
    (productData) =>
      dispatch(addProduct(productData))
        .unwrap()
        .then(() => {
          showToast.success("Product added successfully");
        })
        .catch((error) => {
          showToast.error("Failed to add product: " + error.message);
          throw error;
        }),
    [dispatch],
  );

  const updateProduct = useCallback(
    (productId, productData) =>
      dispatch(editProduct({ productId, productData }))
        .unwrap()
        .then(() => {
          showToast.success("Product updated successfully");
        })
        .catch((error) => {
          showToast.error("Failed to update product: " + error.message);
        }),
    [dispatch],
  );

  const updateSkuProduct = useCallback(
    (skuId, skuData) =>
      dispatch(editSkuProduct({ skuId, skuData }))
        .unwrap()
        .then(() => {
          showToast.success("SKU product updated successfully");
        })
        .catch((error) => {
          showToast.error("Failed to update SKU product: " + error.message);
        }),
    [dispatch],
  );

  return {
    shippingInstructions,
    loading,
    error,
    moveProduct,
    moveMultipleProducts,
    removeSkuProduct,
    removeProduct,
    fetchShippingInstructions,
    removeMultipleProducts,
    createProduct,
    updateProduct,
    updateSkuProduct
  };
};

export default useAddProduct;
