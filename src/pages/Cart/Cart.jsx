import React, { useState, useEffect } from "react";
import "./Cart.css";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAddress } from "../../hooks/useAddress";
import { selectUser } from "../../store/slices/authSlice";
import ConfirmDialog from "../../components/Admin/Modal/Modal";
import useSideBar from "../../hooks/useSidebar";

import CheckoutModal from "./CheckoutModal";
import AddressListModal from "./AddressListModal";
import UpdateAddressModal from "./UpdateAddressModal";
import PaymentModal from "./PaymentModal";
import OrderConfirmedModal from "./OrderConfirmedModal";
import { useCheckout } from "../../hooks/useCheckout";

const Cart = () => {
  const user = useSelector(selectUser);
  const [orderDetails, setOrderDetails] = useState(null);
  const { setLoginOpen, setCartOpen } = useSideBar();
  const {
    addAddress,
    editAddress,
    removeAddress,
    getAddresses,
    defaultAddress,

    loading: hookLoading,
  } = useAddress();
  const { updateCheckout, fetchDeliveryFee, deliveryFee, checkoutDetails } =
    useCheckout();

  console.log("Checkout details in Cart:", checkoutDetails);
  const navigation = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [address, setAddress] = useState(["1"]);
  const [locations, setLocations] = useState([]);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [updateAddressModel, setUpdateAddressModel] = useState(false);
  const [nextPaymentModel, setNextPaymentModel] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoginOpen(true);
      setCartOpen(false);
    }
  }, [user, setLoginOpen]);

  useEffect(() => {
    if (defaultAddress) {
      fetchDeliveryFee(defaultAddress?.country?.id, defaultAddress?.city?.id);
    }
  }, [defaultAddress]);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    if (user) {
      const result = await getAddresses("USER");
      if (result.success) {
        setLocations(result.data);
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    navigation("/");
  };

  const handleAddAddress = async (payload) => {
    const fullPayload = {
      ...payload,
      ownerId: user?.id,
      ownerType: "USER",
      addressType: "REGISTERED",
    };

    const result = await addAddress(fullPayload);
    if (result.success) {
      fetchLocations();
      return true;
    }
    return false;
  };

  const handleUpdateAddress = async (locationId, payload) => {
    const fullPayload = {
      ...payload,
      ownerId: user?.id,
      ownerType: "USER",
      addressType: "REGISTERED",
    };

    const result = await editAddress(locationId, fullPayload);
    if (result.success) {
      fetchLocations();
      setUpdateAddressModel(false);
      setSelectedLocation(null);
    }
  };

  const handleRemoveLocation = (id) => setDeleteConfirmation(id);

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;
    const result = await removeAddress(deleteConfirmation);
    if (result.success) {
      fetchLocations();
      setDeleteConfirmation(null);
    }
  };

  if (!isOpen) return null;

  const handleChangeDelivery = (shippingFeeId) => {
    const addressId = defaultAddress?.id;
    const payload = {
      addressId,
      shippingFeeId,
    };
    updateCheckout(payload);
  };

  const handleApplyCoupon = async (couponId) => {
    const payload = { couponId };
    const result = await updateCheckout(payload);
    return result;
  };

  return (
    <>
      <div className="cart-page" style={{ position: "relative" }}>
        {!user && (
          <div className="cart-page__login-overlay">
            <p>
              Almost there! Just log in or create an account to complete the
              process.
            </p>
          </div>
        )}

        <div className="cart-page__modal-overlay">
          <div className="cart-page__modal-container">
            <CheckoutModal
              address={defaultAddress}
              checkoutDetails={checkoutDetails}
              deliveryFee={deliveryFee}
              onClose={handleClose}
              onChangeAddress={() => setShowAddressModal(true)}
              onNextPayment={() => setNextPaymentModel(true)}
              onChangeDelivery={handleChangeDelivery}
            />
          </div>
        </div>
      </div>

      {showAddressModal && (
        <AddressListModal
          locations={locations}
          onClose={handleClose}
          onBack={() => setShowAddressModal(false)}
          onUpdateLocation={(location) => {
            setUpdateAddressModel(true);
            setSelectedLocation(location);
          }}
          onRemoveLocation={handleRemoveLocation}
          onAddAddress={handleAddAddress}
          hookLoading={hookLoading}
        />
      )}

      {updateAddressModel && (
        <UpdateAddressModal
          selectedLocation={selectedLocation}
          onClose={handleClose}
          onBack={() => {
            setUpdateAddressModel(false);
            setSelectedLocation(null);
          }}
          onUpdate={handleUpdateAddress}
          hookLoading={hookLoading}
        />
      )}

      {nextPaymentModel && (
        <PaymentModal
          onClose={handleClose}
          setOrderDetails={setOrderDetails}
          checkoutDetails={checkoutDetails}
          handleApplyCoupon={handleApplyCoupon}
          updateCheckout={updateCheckout}
          onConfirmOrder={() => setOrderConfirmed(true)}
        />
      )}

      {orderConfirmed && (
        <OrderConfirmedModal
          orderDetails={orderDetails}
          onClose={handleClose}
        />
      )}

      <ConfirmDialog
        open={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={confirmDelete}
        title="Delete Location"
        message="Are you sure you want to delete this location?"
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
      />
    </>
  );
};

export default Cart;
