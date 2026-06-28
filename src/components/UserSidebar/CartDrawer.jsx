import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AddIcon from "@mui/icons-material/Add";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { MainLogo, MainLogoDark } from "../../assets/icons";
import deliveryIcon from "../../assets/icons/deliveryIcon.png";
import { useLocation, useNavigate } from "react-router-dom";
import "./CartDrawer.css";
import useCart from "../../hooks/useCart";
import { showToast } from "../CustomToast/CustomToast";
import { imageUrl } from "../../helper/helper";
import Loading from "../common/LoadingSpinner/LoadingSpinner";
import { PlusIcon } from "lucide-react";
import GiftFormModal from "./GiftFormModal";
import { useCheckout } from "../../hooks/useCheckout";
import WarningModal from "../WarningModal/WarningModal";
import { getItemPrice } from "../../helper/helper";
import BROKEIMAGE from "../../assets/icons/imageNotFound.png";
const CartDrawer = ({ isOpen, onClose, handleOpenSearch, isIncludedBrand }) => {
  const {
    activeCart,
    initCart,
    fetchCartItems,
    cartItems,
    updateItemInCart,
    removeItemFromCart,
    deleteAllItemsFromCart,
    loading,
    giftPackages,
    getGiftPackages,
    updateItemToGiftPackage,
  } = useCart();

  const { createCheckout } = useCheckout();

  useEffect(() => {
    initCart();
    getGiftPackages();

    const handleAuthChange = () => {
      initCart();
    };

    window.addEventListener("authStateChanged", handleAuthChange);
    return () => {
      window.removeEventListener("authStateChanged", handleAuthChange);
    };
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const isCartPage = location.pathname === "/cart";

  const cartLines = cartItems?.cartLines ?? [];
  const [selected, setSelected] = useState([]);
  const [isGiftOpen, setIsGiftOpen] = useState(false);
  const [giftCartLineItem, setGiftCartLineItem] = useState(null);
  const [warningOpen, setWarningOpen] = useState(false);
  const [warningExclusions, setWarningExclusions] = useState([]);

  const displayedCartLines = isCartPage
    ? cartLines.filter((item) => item.effectiveQuantity > 0)
    : cartLines;

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    selected.length === cartLines.length
      ? setSelected([])
      : setSelected(cartLines.map((i) => i.id));
  };

  const handleRemove = () => {
    if (selected.length === 0) return;
    deleteAllItemsFromCart(selected)?.then((response) => {
      if (response?.success) {
        fetchCartItems();
        setSelected([]);
      }
    });
  };

  const handleClose = () => {
    setIsGiftOpen(false);
    setGiftCartLineItem(null);
    onClose();
    navigate("/");
  };

  const validateCartForCheckout = () => {
    const userCountry = cartItems?.countryCode || "JO";
    const exclusions = [];

    let unavailableCount = 0;
    let quantityIssueCount = 0;

    cartLines.forEach((item) => {
      const shippable = item.sku?.shippableCountries || [];
      if (!shippable.includes(userCountry)) {
        unavailableCount++;
      }
      if (item.lineQuantity > item.effectiveQuantity) {
        quantityIssueCount++;
      }
    });

    if (unavailableCount > 0) {
      exclusions.push({
        reason: "Unavailable for your region",
        count: unavailableCount,
      });
    }
    if (quantityIssueCount > 0) {
      exclusions.push({
        reason: "Requested quantity not available",
        count: quantityIssueCount,
      });
    }

    return exclusions;
  };

  const handleCheckout = () => {
    if (displayedCartLines.length == 0) {
      showToast.error("Fill the cart before checkout step ");
    } else {
      setIsGiftOpen(false);
      setGiftCartLineItem(null);

      if (!isCartPage) {
        const exclusions = validateCartForCheckout();
        if (exclusions.length > 0) {
          setWarningExclusions(exclusions);
          setWarningOpen(true);
          return;
        }

        createCheckout();
        navigate("/cart");
      } else {
        navigate("/");
      }
    }
  };

  const handleWarningContinue = () => {
    setWarningOpen(false);
    createCheckout();
    navigate("/cart");
  };

  const handleWarningEdit = () => {
    setWarningOpen(false);
  };

  const handleAddMore = (item) => {
    const updatedItem = {
      skuId: item.skuId,
      cartId: item.cartId,
      lineType: item.lineType,
      merchantId: item.merchantId,
      storeId: item.storeId,
      lineQuantity: item.lineQuantity + 1,
      isGift: item.isGift,
    };
    updateItemInCart(item?.id, updatedItem)?.then((response) => {
      if (response?.success) {
        fetchCartItems();
      }
    });
  };

  const handleRemoveItem = (itemId) => {
    removeItemFromCart(itemId)?.then((response) => {
      if (response?.success) {
        fetchCartItems();
      }
    });
  };

  const handleRedirectAdd = () => {
    onClose();
    handleOpenSearch();
  };

  const handleOpenGift = (item) => {
    setGiftCartLineItem(item);
    setIsGiftOpen(true);
  };

  const handleCloseGift = () => {
    setIsGiftOpen(false);
    setGiftCartLineItem(null);
  };

  const handleCancelGift = async (item) => {
    const payload = {
      cartId: item.cartId,
      skuId: item.skuId,
      lineQuantity: item.lineQuantity,
      lineType: item.lineType,
      merchantId: item.merchantId,
      storeId: item.storeId,
      isGift: false,
      giftAddress: null,
    };

    const result = await updateItemToGiftPackage(item.id, payload);

    if (result?.success) {
      fetchCartItems();
    }
  };

  return (
    <>
      <div
        style={{
          backgroundColor: isIncludedBrand ? "#303030" : "#FFF",
        }}
        className={`cart-drawer ${isOpen ? "cart-drawer--open" : ""}`}
      >
        <div className="cart-drawer__inner">
          <div className="cart-drawer__top">
            <div className="cart-drawer__header">
              {isIncludedBrand ? (
                <MainLogoDark className="search-modal__logo" />
              ) : (
                <MainLogo className="search-modal__logo" />
              )}
              <button className="cart-drawer__close-btn" onClick={handleClose}>
                <CloseIcon
                  style={{ color: isIncludedBrand ? "#FFF" : "#151515" }}
                />
              </button>
            </div>

            <h2
              style={{
                color: isIncludedBrand ? "#FFF" : "",
              }}
              className="cart-drawer__title"
            >
              Your Cart Details
            </h2>

            <div className="cart-drawer__delivery-row">
              <div className="cart-drawer__location">
                <LocationOnOutlinedIcon />
                <span>Deliver To Jordan</span>
              </div>
              <span className="cart-drawer__change-location"></span>
            </div>

            {!isCartPage && (
              <div className="cart-drawer__select-row">
                <div className="cart-drawer__select-left">
                  <input
                    type="checkbox"
                    checked={
                      cartLines.length > 0 &&
                      selected.length === cartLines.length
                    }
                    onChange={toggleSelectAll}
                  />
                  <span>Select ({selected.length}) Item</span>
                </div>
                <button
                  className={`cart-drawer__remove-btn ${selected.length === 0 ? "cart-drawer__remove-btn--disabled" : ""}`}
                  onClick={handleRemove}
                >
                  <DeleteOutlineIcon style={{ fontSize: "20px" }} />
                  Remove
                </button>
              </div>
            )}

            <div className="cart-drawer__items">
              <div></div>
              {loading ? (
                <Loading />
              ) : (
                <>
                  {displayedCartLines?.length === 0 && (
                    <div className="cart-drawer__empty">
                      <button
                        className="cart-drawer__shop-btn"
                        onClick={() => handleRedirectAdd()}
                      >
                        <PlusIcon fontSize="small" />
                        Add Item
                      </button>
                      <p>Your cart is empty. Add items to start shopping</p>
                    </div>
                  )}

                  {displayedCartLines?.map((item) => {
                    const { isOnSale, displayPrice, originalPrice } =
                      getItemPrice(item);
                    return (
                      <div
                        key={item.id}
                        className="cart-drawer__card-container"
                      >
                        <div className="cart-drawer__card">
                          <div className="cart-drawer__card-image">
                            {!isCartPage && (
                              <input
                                type="checkbox"
                                className="cart-drawer__checkbox"
                                checked={selected.includes(item.id)}
                                onChange={() => toggleSelect(item.id)}
                              />
                            )}

                            <img
                              className="img-cart-drawer-card"
                              src={
                                item?.sku?.mediaList?.[0]?.mediaId
                                  ? `${imageUrl}${item.sku.mediaList[0].mediaId}`
                                  : BROKEIMAGE
                              }
                              alt="product"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = BROKEIMAGE;
                              }}
                            />
                          </div>

                          <div className="cart-drawer__card-info">
                            <p
                              style={{
                                color: isIncludedBrand ? "#FFF" : "",
                              }}
                              className="cart-drawer__product-name"
                            >
                              {item?.sku?.productTitle_i18n?.en}
                            </p>
                            <div className="cart-drawer__product-tags">
                              {item?.sku?.attributeValues?.[0]?.value_i18n
                                ?.en && (
                                <span
                                  style={{
                                    color: isIncludedBrand ? "#FFF" : "",
                                  }}
                                  className="cart-drawer__tag"
                                >
                                  {item?.sku?.attributeValues?.[0]?.value_i18n
                                    ?.en.length > 7
                                    ? item?.sku?.attributeValues?.[0]?.value_i18n?.en.slice(
                                        0,
                                        7,
                                      ) + " ..."
                                    : item?.sku?.attributeValues?.[0]
                                        ?.value_i18n?.en}
                                </span>
                              )}

                              {item?.sku?.attributeValues?.[1]?.value_i18n
                                ?.en && (
                                <span
                                  style={{
                                    color: isIncludedBrand ? "#FFF" : "",
                                  }}
                                  className="cart-drawer__tag"
                                >
                                  {
                                    item?.sku?.attributeValues?.[1]?.value_i18n
                                      ?.en
                                  }
                                </span>
                              )}
                            </div>
                            <div className="cart-drawer__qty-row">
                              {!isCartPage && (
                                <button
                                  className="cart-drawer__qty-btn"
                                  onClick={() => handleRemoveItem(item.id)}
                                >
                                  <DeleteForeverIcon
                                    className="cart-drawer__delete-icon"
                                    fontSize="small"
                                  />
                                </button>
                              )}
                              {isCartPage && <span>Quantity</span>}
                              <span
                                style={{
                                  color: isIncludedBrand ? "#FFF" : "",
                                }}
                              >
                                {isCartPage
                                  ? item?.effectiveQuantity
                                  : item?.lineQuantity}
                              </span>
                              {!isCartPage && (
                                <button
                                  className="cart-drawer__qty-btn"
                                  onClick={() => handleAddMore(item)}
                                >
                                  <AddIcon fontSize="small" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="cart-drawer__price-section">
                            {!isCartPage && (
                              <span
                                className="cart-drawer__make-gift"
                                onClick={() =>
                                  item?.isGift
                                    ? handleCancelGift(item)
                                    : handleOpenGift(item)
                                }
                              >
                                {item?.isGift
                                  ? "Cancel  Gift"
                                  : "Make it a gift"}
                              </span>
                            )}
                            <div className="cart-drawer__price">
                              {item?.isOnSale && (
                                <span
                                  style={{
                                    color: isIncludedBrand ? "#FFF" : "",
                                  }}
                                  className="cart-drawer__old-price"
                                >
                                  JOD {item?.salePrice}
                                  Total JOD{" "}
                                  {item?.salePrice * item?.effectiveQuantity}
                                </span>
                              )}
                              <span
                                style={{
                                  color: isIncludedBrand ? "#FFF" : "",
                                }}
                                className="cart-drawer__new-price"
                              >
                                JOD {item?.listPrice}
                              </span>
                              <p
                                style={{
                                  color: isIncludedBrand ? "#FFF" : "",
                                }}
                                className="cart-drawer__new-price"
                              >
                                Total JOD{" "}
                                {item?.listPrice * item?.effectiveQuantity}
                                {/* Total JOD {item?.listPrice } */}
                              </p>
                            </div>
                          </div>
                        </div>

                        {!item?.sku?.shippableCountries?.includes("JO") && (
                          <div className="cart-drawer__delivery-option">
                            <p>This item cannot be shipped to Jordan</p>
                          </div>
                        )}

                        {item?.isGift && (
                          <div className="cart-drawer__gift-option">
                            <p
                              style={{
                                color: isIncludedBrand ? "#FFF" : "",
                              }}
                            >
                              Created Gift{" "}
                              <span
                                style={{
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                }}
                                onClick={() => handleOpenGift(item)}
                              >
                                View & Edit
                              </span>
                            </p>
                            <p> + JOD {item?.giftAddress?.totalFee}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          <div className="cart-drawer__bottom">
            {!isCartPage && (
              <div
                style={{
                  backgroundColor: isIncludedBrand ? "#F07570" : "",
                }}
                className="cart-drawer__free-delivery"
              >
                <img src={deliveryIcon} alt="delivery" />
                Add{" "}
                {`${cartItems?.countryCode ?? ""} ${cartItems?.cartSummary?.freeShippingAmountRemaining ?? "0.00"}`}{" "}
                to get free delivery
              </div>
            )}

            <div className="cart-drawer__summary">
              {!isCartPage && (
                <>
                  <div className="cart-drawer__summary-row">
                    <span
                      style={{
                        color: isIncludedBrand ? "#fff" : "",
                      }}
                    >
                      Subtotal{" "}
                      <span className="cart-drawer__item-count">
                        ({cartItems?.cartSummary?.itemCount ?? "0"}) Item
                      </span>
                    </span>
                    <span
                      style={{
                        color: isIncludedBrand ? "#fff" : "",
                      }}
                    >{`${cartItems?.countryCode ?? ""} ${cartItems?.cartSummary?.subtotalPrice ?? "0.00"}`}</span>
                  </div>
                  {cartItems?.cartSummary?.giftCount > 0 && (
                    <div className="cart-drawer__summary-row">
                      <span
                        style={{
                          color: isIncludedBrand ? "#fff" : "",
                        }}
                      >
                        Gift{" "}
                        <span className="cart-drawer__item-count">
                          ({cartItems?.cartSummary?.giftCount ?? "0"}) Item
                        </span>
                      </span>
                      <span
                        style={{
                          color: isIncludedBrand ? "#fff" : "",
                        }}
                      >{`${cartItems?.countryCode ?? ""} ${cartItems?.cartSummary?.giftFee ?? "0.00"}`}</span>
                    </div>
                  )}
                  {cartItems?.cartSummary?.discountAmount !== 0 && (
                    <div className="cart-drawer__summary-row cart-drawer__summary-row--discount">
                      <span
                        style={{
                          color: isIncludedBrand ? "#fff" : "",
                        }}
                      >
                        Discount
                      </span>
                      <span>
                        -
                        {`${cartItems?.countryCode ?? ""} ${cartItems?.cartSummary?.discountAmount ?? "0.00"}`}
                      </span>
                    </div>
                  )}
                  <div className="cart-drawer__summary-total">
                    <span
                      style={{
                        color: isIncludedBrand ? "#fff" : "",
                      }}
                    >
                      Total Payment
                    </span>
                    <span
                      style={{
                        color: isIncludedBrand ? "#fff" : "",
                      }}
                    >{`${cartItems?.countryCode ?? ""} ${cartItems?.cartSummary?.totalPriceExcTax ?? "0.00"}`}</span>
                  </div>
                </>
              )}

              <button
                className={`cart-drawer__checkout-btn ${isCartPage ? "cart-drawer__checkout-btn--edit" : ""}`}
                onClick={handleCheckout}
              >
                {isCartPage ? "Edit Cart" : "Checkout"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <GiftFormModal
        isOpen={isGiftOpen}
        onClose={handleCloseGift}
        isIncludedBrand={isIncludedBrand}
        cartLineItem={giftCartLineItem}
        giftPackages={giftPackages}
      />

      <WarningModal
        open={warningOpen}
        exclusions={warningExclusions}
        onPrimary={handleWarningContinue}
        onSecondary={handleWarningEdit}
        onClose={() => setWarningOpen(false)}
      />
    </>
  );
};

export default CartDrawer;
