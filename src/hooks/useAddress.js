import {
  createAddress,
  updateAddress,
  deleteAddress,
} from "../store/slices/addressSlice";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { showToast } from "../components/CustomToast/CustomToast";
import axiosInstance from "../config/axiosInstance";
import { selectUser } from "../store/slices/authSlice";

export const useAddress = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(false);
  const [defaultAddress , setDefaultAddress] = useState(null);

  const addAddress = (addressData) => {
    setLoading(true);
    const payload = {
      ...addressData,
    
    }
    return dispatch(createAddress(payload))
      .unwrap()
      .then((result) => {
        showToast.success("Address added successfully");
        return { success: true, data: result };
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to add address");
        console.error("Error adding address:", error);
        return { success: false, error };
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const editAddress = (addressId, addressData) => {
    setLoading(true);
    return dispatch(updateAddress({ id: addressId, data: addressData }))
      .unwrap()
      .then((result) => {
        showToast.success("Address updated successfully");
        return { success: true, data: result };
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to update address");
        console.error("Error updating address:", error);
        return { success: false, error };
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const removeAddress = (addressId) => {
    setLoading(true);
    return dispatch(deleteAddress(addressId))
      .unwrap()
      .then(() => {
        showToast.success("Address deleted successfully");
        return { success: true };
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to delete address");
        console.error("Error deleting address:", error);
        return { success: false, error };
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getAddresses = async (type) => {
    if (!user?.id) {
      setDefaultAddress(null);
      return { success: true, data: [] };
    }

    const queryFilters = [`properties.ownerId:${user.id}`];
    if (type) {
      queryFilters.push(`properties.ownerType:${type}`);
    }

    setLoading(true);
    return await axiosInstance
        .get(
          `addresses`,
          {
            params: {
              q: queryFilters.join(" AND "),
            },
          },
        )
        .then((response) => {
          setLoading(false);
          const defaultAddr = response.data?.items?.find(addr => addr.isDefault);
          setDefaultAddress(defaultAddr || null);
          return { success: true, data: response.data?.items };
        })
        .catch((error) => {
          showToast.error(error?.message || "Failed to fetch addresses");
          console.error("Error fetching addresses:", error);
          setLoading(false);
          return { success: false, error };
        });
    
  };

  return {
    addAddress,
    editAddress,
    removeAddress,
    getAddresses,
    defaultAddress,
    loading,
  };
};
