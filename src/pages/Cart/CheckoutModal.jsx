import React from "react";
import "./CheckoutModal.css";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const checkoutSchema = z.object({
  shippingFeeId: z.string().min(1, "Please choose a delivery option"),
});

const CheckoutModal = ({
  address,
  onClose,
  onChangeAddress,
  onNextPayment,
  deliveryFee,
  onChangeDelivery,
  checkoutDetails
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingFeeId: "",
    },
  });

  console.log('checkoutDetails ', checkoutDetails);

  const onSubmit = (data) => {
    onChangeDelivery(data.shippingFeeId);
    onNextPayment();
  };
  const currencySymbol = checkoutDetails?.cart?.currencyCode
  return (
    <div className="checkout-modal">
      <div className="checkout-modal__header">
        <h2 className="checkout-modal__title">Confirm Order</h2>
        <button className="checkout-modal__close-btn" onClick={onClose}>
          <CloseIcon />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="checkout-modal__body">
          <div className="checkout-modal__left">
            <div className="checkout-modal__section">
              <div className="checkout-modal__section-header">
                <h4>Shipping Address</h4>
              </div>

              {address ? (
                <div className="checkout-modal__address-box">
                  <div className="checkout-modal__address-options">
                    <h4>{address.name}</h4>
                    <button
                      type="button"
                      onClick={onChangeAddress}
                      className="checkout-modal__change-btn"
                    >
                      Change
                    </button>
                  </div>
                  <div className="checkout-modal__country-row">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/c/c0/Flag_of_Jordan.svg"
                      alt="Jordan"
                    />
                    <span>
                      {address.country.name_i18n?.en} -{" "}
                      {address.city.name_i18n?.en}
                    </span>
                  </div>
                  <p className="checkout-modal__location-name">
                    {address.address1}
                  </p>
                  <p className="checkout-modal__phone-number">
                    <strong>Phone :</strong> {address.phoneNumber}
                  </p>
                </div>
              ) : (
                <div className="checkout-modal__address-box">
                  <div className="checkout-modal__address-options">
                    <h4 className="checkout-modal__address-label">Address</h4>
                    <button
                      type="button"
                      className="checkout-modal__add-address-btn"
                      onClick={onChangeAddress}
                    >
                      <AddIcon className="checkout-modal__add-icon" />
                      Add a New Address
                    </button>
                  </div>
                  <p className="checkout-modal__location-name">
                    Can't complete
                    checkout please add at least one address
                  </p>
                </div>
              )}
            </div>

            <div className="checkout-modal__section">
              <h4 className="checkout-modal__delivery-title">
                Choose a delivery options:
              </h4>

              <Controller
                name="shippingFeeId"
                control={control}
                render={({ field }) =>
                  deliveryFee?.map((option) => (
                    <label
                      key={option?.fee?.id}
                      className={`checkout-modal__delivery-option ${field.value === String(option?.fee?.id)
                        ? "checkout-modal__delivery-option--active"
                        : ""
                        }`}
                    >
                      <div>
                        <input
                          type="radio"
                          name="delivery"
                          value={option?.fee?.id}
                          checked={field.value === String(option?.fee?.id)}
                          onChange={() =>
                            field.onChange(String(option?.fee?.id))
                          }
                        />
                        <strong>{option.name}</strong>
                        {/* <p>Arrives by April 3 to April 9th</p> */}
                      </div>
                      <span>
                        {option?.fee?.currencyCode_i18n?.en} {option?.fee?.fee}
                      </span>
                    </label>
                  ))
                }
              />

              {/* {errors.shippingFeeId && (
                <p className="checkout-modal__error">
                  {errors.shippingFeeId.message}
                </p>
              )} */}
            </div>
          </div>

          <div className="checkout-modal__right">
            <h4>Order Summary</h4>

            <div className="checkout-modal__summary-row">
              <span>Subtotal ({checkoutDetails?.summary?.itemCount}) Item</span>
              <span>{currencySymbol} {checkoutDetails?.summary?.subtotalPrice}</span>
            </div>
            <div className="checkout-modal__summary-row">
              <span>Delivery Fee</span>
              <span>{currencySymbol} {checkoutDetails?.summary?.shippingFee}</span>
            </div>
            <div className="checkout-modal__summary-row checkout-modal__summary-row--discount">
              <span>Discount</span>
              <span>{currencySymbol} {checkoutDetails?.summary?.discountAmount}</span>
            </div>
            <hr />
            <div className="checkout-modal__summary-row">
              <span>Price After Discount</span>

              {currencySymbol}{" "}
              {checkoutDetails?.summary?.totalPriceExcTax}
              {/* <span>{currencySymbol} 9.99</span> */}
            </div>
            <div className="checkout-modal__summary-row">
              <span>Total (exe tax)</span>
              <span>{currencySymbol} {checkoutDetails?.summary?.totalPriceExcTax}</span>
            </div>
            <div className="checkout-modal__summary-row">
              <span>Tax</span>
              <span>{currencySymbol} {checkoutDetails?.summary?.taxAmount}</span>
            </div>
            <hr />
            <div className="checkout-modal__summary-row checkout-modal__summary-row--total">
              <span>Total Payment</span>
              <span>{currencySymbol} {checkoutDetails?.summary?.totalPriceIncTax}</span>
            </div>

            {/* <button type="submit" className="checkout-modal__pay-btn">
              Next to Payment
            </button> */}
            <button
              type="submit"
              className="checkout-modal__pay-btn"
              disabled={!address || address.length === 0 || errors.shippingFeeId}
            >
              Next to Payment
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutModal;