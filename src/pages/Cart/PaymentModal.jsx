import React, { useState } from "react";
import "./PaymentModal.css";
import CloseIcon from "@mui/icons-material/Close";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import usePayment from "../../hooks/usePayment";
import { useOrder } from "../../hooks/useOrder";
import useCart from "../../hooks/useCart";

import calenderImage from '../../assets/icons/CalenderImage.svg';
const paymentSchema = z.object({
  paymentMethod: z.enum(["CARD", "COD"], {
    required_error: "Please select a payment method",
  }),
});

const getCardProp = (properties, key) =>
  properties?.find((p) => p.key === key)?.value;

const PaymentModal = ({
  onClose,
  onConfirmOrder,
  handleApplyCoupon,
  checkoutDetails,
  updateCheckout,
  setOrderDetails
}) => {
  const [coupon, setCoupon] = useState("");
  const [couponStatus, setCouponStatus] = useState(null);
  const { paymentMethods } = usePayment();
  const { addOrder } = useOrder();
  const firstCard = paymentMethods[0];
  const { fetchCartItems } = useCart();

  const cardLast4 = getCardProp(firstCard?.properties, "card_last4");
  const cardBrand = getCardProp(firstCard?.properties, "card_brand");
  const cardExpMonth = getCardProp(firstCard?.properties, "card_exp_month");
  const cardExpYear = getCardProp(firstCard?.properties, "card_exp_year");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: "",
    },
  });

  const handleApply = async () => {
    if (!coupon.trim()) return;
    const result = await handleApplyCoupon(coupon);
    setCouponStatus(result?.success ? "success" : "error");
  };

  const onSubmit = async (data) => {
    const payload =
      data.paymentMethod === "CARD"
        ? { paymentMethod: "CARD", paymentMethodId: firstCard?.paymentMethodId }
        : { paymentMethod: "COD" };

    const result = await updateCheckout(payload);
    if (result?.success) {
      const response = await addOrder();
      if (response?.success) {
        setOrderDetails(response.data?.result)
        fetchCartItems();
        onConfirmOrder();
      }
    }
  };

  const currencySymbol = checkoutDetails?.cart?.currencyCode;

  return (
    <div className="payment-modal">
      <div className="payment-modal__overlay">
        <div className="payment-modal__container">
          <div className="payment-modal__content">
            <div className="payment-modal__header">
              <h2 className="payment-modal__title">Confirm Order</h2>
              <button className="payment-modal__close-btn" onClick={onClose}>
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="payment-modal__body">
                <div className="payment-modal__left">
                  <div className="payment-modal__section">
                    <div className="payment-modal__coupon-box">
                      <div className="payment-modal__coupon-header">
                        <h4>Save on your order</h4>
                      </div>
                      <div className="payment-modal__coupon-container">
                        <input
                          type="text"
                          placeholder="Enter Coupon Number"
                          value={coupon}
                          onChange={(e) => {
                            setCoupon(e.target.value);
                            setCouponStatus(null);
                          }}
                          className="payment-modal__coupon-input"
                        />
                        <button
                          type="button"
                          className="payment-modal__apply-btn"
                          onClick={handleApply}
                        >
                          Apply
                        </button>
                      </div>
                      {couponStatus === "success" && (
                        <p className="payment-modal__coupon-msg payment-modal__coupon-msg--success">
                          Coupon applied successfully
                        </p>
                      )}
                      {couponStatus === "error" && (
                        <p className="payment-modal__coupon-msg payment-modal__coupon-msg--error">
                          Invalid coupon
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="payment-modal__section">
                    <h4 className="payment-modal__methods-title">
                      Payment Methods:
                    </h4>

                    <Controller
                      name="paymentMethod"
                      control={control}
                      render={({ field }) => (
                        <>
                          {firstCard && (
                            <label
                              className={`payment-modal__option ${field.value === "CARD"
                                ? "payment-modal__option--active"
                                : ""
                                }`}
                            >
                              <div>
                                <div className="payment-modal__option-inner">
                                  <input
                                    type="radio"
                                    checked={field.value === "CARD"}
                                    onChange={() => field.onChange("CARD")}
                                  />
                                  <img
                                    src="https://i.pinimg.com/736x/43/ed/1d/43ed1d4685a1e776836cf19557cfca73.jpg"
                                    className="payment-modal__card-img"
                                  />
                                  <strong className="payment-modal__card-label">
                                    {cardBrand?.charAt(0).toUpperCase() +
                                      cardBrand?.slice(1)}{" "}
                                    ••••{cardLast4} | {cardExpMonth}/
                                    {cardExpYear?.slice(-2)}
                                  </strong>
                                </div>
                              </div>
                              <span className="payment-modal__change-btn">
                                Change
                              </span>
                            </label>
                          )}

                          <label
                            className={`payment-modal__option ${field.value === "COD"
                              ? "payment-modal__option--active"
                              : ""
                              }`}
                          >
                            <div>
                              <input
                                type="radio"
                                checked={field.value === "COD"}
                                onChange={() => field.onChange("COD")}
                              />
                              <CurrencyExchangeIcon className="payment-modal__cash-icon" />
                              <strong className="payment-modal__cash-label">
                                Cash Upon Delivery
                              </strong>
                            </div>
                          </label>
                        </>
                      )}
                    />

                    {/* {errors.paymentMethod && (
                      <p className="payment-modal__error">
                        error
                        {errors.paymentMethod.message}
                      </p>
                    )} */}
                  </div>
                </div>

                <div className="payment-modal__right">
                  <h4>Order Summary</h4>

                  <div className="payment-modal__summary-row">
                    <span>
                      Subtotal ({checkoutDetails?.summary?.itemCount}) Item
                    </span>
                    <span>
                      {currencySymbol} {checkoutDetails?.summary?.subtotalPrice}
                    </span>
                  </div>
                  <div className="payment-modal__summary-row">
                    <span>Delivery Fee</span>
                    <span>
                      {currencySymbol} {checkoutDetails?.summary?.shippingFee}
                    </span>
                  </div>
                  <div className="payment-modal__summary-row payment-modal__summary-row--discount">
                    <span>Discount</span>
                    <span>
                      {currencySymbol}{" "}
                      {checkoutDetails?.summary?.discountAmount}
                    </span>
                  </div>
                  <hr />

                  <div className="payment-modal__summary-row">
                    <span
                      className="price-after-dicount"
                    >Price After Discount </span>
                    <span>
                      {currencySymbol}{" "}
                      {checkoutDetails?.summary?.totalPriceExcTax}
                    </span>
                  </div>

                  <div className="payment-modal__summary-row">
                    <span>Total (exe tax)</span>
                    <span>
                      {currencySymbol}{" "}
                      {checkoutDetails?.summary?.totalPriceExcTax}
                    </span>
                  </div>
                  <div className="payment-modal__summary-row">
                    <span>Tax</span>
                    <span>
                      {currencySymbol} {checkoutDetails?.summary?.taxAmount}
                    </span>
                  </div>
                  <hr />
                  <div className="payment-modal__summary-row payment-modal__summary-row--total">
                    <span>Total Payment</span>
                    <span>
                      {currencySymbol}{" "}
                      {checkoutDetails?.summary?.totalPriceIncTax}
                    </span>
                  </div>


                  {/* <div class="delivery-banner">
                    <span class="icon">
                      <img src={calenderImage} alt='image not found' />
                    </span>
                    <p>Arrives by April 3 to April 9th</p>
                  </div> */}



                  {/* errors.paymentMethod */}

                  {/* disabled={!address || address.length === 0 || errors.shippingFeeId} */}


                  <button
                    disabled={!!errors?.paymentMethod}
                    type="submit"
                    className="payment-modal__pay-btn"
                  >
                    Pay {currencySymbol}{" "}
                    {checkoutDetails?.summary?.totalPriceIncTax}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
