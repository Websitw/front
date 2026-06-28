import React from "react";
import "./OrderConfirmedModal.css";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import useLocalStorage from "../../hooks/useLocalStorage";
import { formatDate } from "../../helper/helper";
const OrderConfirmedModal = ({ onClose, orderDetails }) => {
  const [user] = useLocalStorage("userData", null);
  const getPropValue = (key) => {
    return orderDetails?.paymentMethodObject?.pluginInfo?.properties?.find(
      (prop) => prop.key === key,
    )?.value || "";
  }
  const summary = orderDetails?.summary || {};
  const currency = orderDetails?.cart?.currencyCode || "JOD";

  console.log('summary' , summary);

  console.log('orderDetails way' , orderDetails);
  
  return (
    <div className="order-confirmed">
      <div className="order-confirmed__overlay">
        <div className="order-confirmed__container">
          <div className="order-confirmed__header">
            <span className="order-confirmed__points">
              {/* You've earned 10 credit points */}
            </span>
            <button className="order-confirmed__close-btn" onClick={onClose}>
              <CloseIcon />
            </button>
          </div>

          <div className="order-confirmed__success">
            <div className="order-confirmed__check-icon">✓</div>
            <h2>Order Confirmed!</h2>
            <p>
              We sent an email to <strong>{user?.email}</strong> with your
              order confirmation and bill.
            </p>

            <div className="order-confirmed__meta">
              <div>
                <strong>Time placed:</strong> {formatDate(orderDetails?.createdAt, false)}
              </div>
              <div>
                <strong>Order :</strong> {orderDetails?.orderCode}
              </div>
            </div>
          </div>

          <div className="order-confirmed__timeline">
            <div className="order-confirmed__step order-confirmed__step--active">
              <div className="order-confirmed__circle order-confirmed__circle--filled">
                <DescriptionOutlinedIcon style={{ color: "#FFF" }} />
              </div>
              <p>Placed</p>
              <small>17/02/2020 12:45 CEST</small>
            </div>

            <div className="order-confirmed__line"></div>

            <div className="order-confirmed__step">
              <div className="order-confirmed__circle order-confirmed__circle--outline">
                <LocalShippingOutlinedIcon style={{ color: "#0D7C85" }} />
              </div>
              <p>Shipped</p>
              <small>17/02/2020 12:45 CEST</small>
            </div>

            <div className="order-confirmed__line"></div>

            <div className="order-confirmed__step">
              <div className="order-confirmed__circle order-confirmed__circle--outline">
                <CheckCircleOutlineIcon style={{ color: "#0D7C85" }} />
              </div>
              <p>Delivered</p>
              <small>17/02/2020 12:45 CEST</small>
            </div>
          </div>

          <div className="order-confirmed__grid">
            <div className="order-confirmed__card">
              <h3>Order Details</h3>

              <div className="order-confirmed__row">
                <span>Subtotal ({summary?.itemCount}) Item</span>
                <span>{currency} {summary?.subtotalPrice}</span>
              </div>
              <div className="order-confirmed__row">
                <span>Delivery Fee</span>
                <span>{currency} {summary?.shippingFee}</span>
              </div>
              <div className="order-confirmed__row">
                <span>Gift Prepare ({summary?.giftCount}) Item</span>
                <span>{currency} {summary?.giftFee}</span>
              </div>
              <div className="order-confirmed__row order-confirmed__row--discount">
                <span>Discount</span>
                <span>-{currency} {summary?.discountAmount}</span>
              </div>
              <div className="order-confirmed__row">
                <span>Tax</span>
                <span>{currency} {summary?.taxAmount}</span>
              </div>

              <div className="order-confirmed__card-divider"></div>

              <div className="order-confirmed__row order-confirmed__row--total">
                <span>Total Payment</span>
                <span>{currency} {summary?.totalPriceIncTax}</span>
              </div>

              {/* <div className="order-confirmed__see-details">See details ›</div> */}
            </div>

            <div className="order-confirmed__right-col">
              <div className="order-confirmed__card">
                <h3>Shipping Address</h3>
                <div className="order-confirmed__address-flag">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/c/c0/Flag_of_Jordan.svg"
                    alt="Jordan"
                  />
                  <p className="order-confirmed__country">
                    {orderDetails?.address?.country?.name} -{" "}
                    {orderDetails?.address?.city?.name}
                  </p>
                </div>
                <p className="order-confirmed__address-text">
                  {orderDetails?.address?.name}
                </p>
                <p>
                  <strong>Phone:</strong> {}
                  {orderDetails?.address?.phoneNumber}
                </p>
              </div>

              <div className="order-confirmed__card">
                <h3>Payment Methods</h3>

                {orderDetails?.paymentMethod ? <>
                
                <p>Cash on delivery</p>
                </> 
                
              : <>
              
              <div className="order-confirmed__payment-box">
                  <img
                    src="https://i.pinimg.com/736x/43/ed/1d/43ed1d4685a1e776836cf19557cfca73.jpg"
                    className="order-confirmed__visa-img"
                  />
                  <div>
                    <div>
                      Visa ••••
                      {
                        getPropValue("card_last4")
                      }{" "}
                      |{" "}
                      {
                        getPropValue("card_exp_month")
                      }
                      /
                      {
                        getPropValue("card_exp_year")
                      }
                    </div>
                  
                  </div>
                </div>
              
              </>}

            
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmedModal;
