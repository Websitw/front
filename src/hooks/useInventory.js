import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { showToast } from "../components/CustomToast/CustomToast";
import {
  fetchInventories,
  createInventory,
  updateInventory,
  deleteInventory,
} from "../store/slices/inventorySlice";

const useInventory = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { items: inventories } = useSelector((state) => state.inventory);

  const fetchAllInventories = (params) => {
    setLoading(true);
    return dispatch(fetchInventories(params))
      .unwrap()
      .then((result) => {
        return { success: true, data: result };
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to fetch inventories");
        return { success: false, error };
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const addInventory = (data) => {
    setLoading(true);
    return dispatch(createInventory(data))
      .unwrap()
      .then((result) => {
        showToast.success("Inventory created successfully");
        return { success: true, data: result };
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to create inventory");
        return { success: false, error };
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const editInventory = (id, data) => {
    setLoading(true);
    return dispatch(updateInventory({ id, data }))
      .unwrap()
      .then((result) => {
        showToast.success("Inventory updated successfully");
        return { success: true, data: result };
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to update inventory");
        return { success: false, error };
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const removeInventory = (id) => {
    setLoading(true);
    return dispatch(deleteInventory(id))
      .unwrap()
      .then(() => {
        showToast.success("Inventory deleted successfully");
        return { success: true };
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to delete inventory");
        return { success: false, error };
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return {
    inventories,
    loading,
    fetchAllInventories,
    addInventory,
    editInventory,
    removeInventory,
  };
};

export default useInventory;