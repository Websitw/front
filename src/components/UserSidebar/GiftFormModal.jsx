import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { giftFormSchema } from "../Schemas/Giftformschema";
import { useSelector, useDispatch } from "react-redux";
import CountrySelect from "../common/CountrySelect";
import { fetchCountriesListAnonymous } from "../../store/slices/counteriesSlice";
import { fetchAllCities } from "../../store/slices/citiesSlice";
import { imageUrl } from "../../helper/helper";
import useCart from "../../hooks/useCart";
import { showToast } from "../CustomToast/CustomToast";

// import { useAddress } from "../../../hooks/useAddress";
import { useAddress } from '../../hooks/useAddress'

import LocationModal from "./LocationModal/LocationModal";
import { SetLocation } from "../../assets/icons";
import "./GiftFormModal.css";

const GiftFormModal = ({ isOpen, onClose, cartLineItem, giftPackages, isIncludedBrand }) => {
  const { updateItemToGiftPackage, fetchCartItems } = useCart();
  const [filterCites, setFilterCities] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locations, setLocations] = useState([]);

  const dispatch = useDispatch();
  const { allCountriesList } = useSelector((state) => state.countries);
  const { allCities } = useSelector((state) => state.cities);
  const validCountries = allCountriesList.filter(
    (country) =>
      country.countryCodeNumeric !== undefined &&
      country.countryCodeNumeric !== null,
  );


  const {
    getAddresses,
    defaultAddress,
    loading: hookLoading,
  } = useAddress();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(giftFormSchema),
    defaultValues: {
      packagingId: giftPackages?.[0]?.id || "",
      recipientPhoneNumber: "",
      giftMessage: "",
      senderName: "",
      deliveryDateType: "ORDER",
      deliveryDate: "",
      addressType: "ORDER",
      countryId: "",
      cityId: "",
      addressLine1: "",
      addressLine2: "",
    },
  });


  const fetchLocations = async () => {
    const result = await getAddresses(null);
    if (result.success) {
      setLocations(result.data);
      console.log('locations', locations);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [isOpen])

  
  const isEditMode = cartLineItem?.isGift === true && !!cartLineItem?.giftAddress;

  const addressType = watch("addressType");
  const deliveryDateType = watch("deliveryDateType");
  const packagingId = watch("packagingId");
  const countryId = watch("countryId");
  useEffect(() => {
    if (countryId) {
      const filtered = allCities.filter((city) => city.countryId === countryId);
      setFilterCities(filtered);
    }
  }, [countryId, allCities]);

  useEffect(() => {
    if (isOpen && giftPackages?.length > 0 && !packagingId) {
      setValue("packagingId", giftPackages[0].id, { shouldValidate: true });
    }
  }, [isOpen, giftPackages, packagingId, setValue]);

  // Pre-populate form when editing an existing gift
  useEffect(() => {
    if (isOpen && isEditMode) {
      const gift = cartLineItem.giftAddress;

      // Strip country code prefix (+962) from phone number for the input field
      const rawPhone = gift.recipientPhoneNumber || "";
      const phone = rawPhone.replace(/^\+962/, "");

      setValue("recipientPhoneNumber", phone, { shouldValidate: true });
      setValue("giftMessage", gift.giftMessage || "", { shouldValidate: true });
      setValue("senderName", gift.senderName || "", { shouldValidate: true });
      setValue("deliveryDateType", gift.deliveryDateType || "ORDER", { shouldValidate: true });
      if (gift.deliveryDateType === "CUSTOM" && gift.deliveryDate) {
        setValue("deliveryDate", gift.deliveryDate, { shouldValidate: true });
      }
      setValue("addressType", gift.addressType || "ORDER", { shouldValidate: true });

      if (gift.packagingId) {
        setValue("packagingId", gift.packagingId, { shouldValidate: true });
      }

      if (gift.addressType === "CUSTOM") {
        if (gift.countryId) setValue("countryId", gift.countryId, { shouldValidate: true });
        if (gift.cityId) setValue("cityId", gift.cityId, { shouldValidate: true });
        if (gift.addressLine1) setValue("addressLine1", gift.addressLine1, { shouldValidate: true });
        if (gift.addressLine2) setValue("addressLine2", gift.addressLine2, { shouldValidate: true });
      }
    }
  }, [isOpen, isEditMode, cartLineItem, setValue]);

  useEffect(() => {
    dispatch(fetchCountriesListAnonymous());
    dispatch(fetchAllCities());
  }, []);

  const selectedPackage = giftPackages?.find((p) => p.id === packagingId);

  const handleSelectPackage = (id) => {
    setValue("packagingId", id, { shouldValidate: true });
  };

  const handleLocationConfirm = (details) => {
    if (!details) return;

    console.log("Selected location details:", details);
    const matchedCountry = validCountries.find(
      (c) =>
        c.isoCode2?.toUpperCase() === details.countryCode?.toUpperCase() ||
        c.countryCode?.toUpperCase() === details.countryCode?.toUpperCase(),
    );

    if (!matchedCountry) {
      showToast.error("This location is not supported currently");
      return;
    }

    setValue("countryId", matchedCountry.id, { shouldValidate: true });

    const countryCities = allCities.filter(
      (c) => c.countryId === matchedCountry.id,
    );

    // Try name match first (check both directions + Arabic name)
    let matchedCity = countryCities.find((c) => {
      const googleCity = details.city?.toLowerCase() || "";
      const nameEn = c.name?.toLowerCase() || "";
      const nameAr = c.name_i18n?.ar || "";
      return (
        googleCity.includes(nameEn) ||
        nameEn.includes(googleCity) ||
        googleCity.includes(nameAr)
      );
    });

    // Fallback: find nearest city by distance
    if (!matchedCity && countryCities.length > 0) {
      let minDist = Infinity;
      countryCities.forEach((c) => {
        const dLat = details.lat - c.latitude;
        const dLng = details.lng - c.longitude;
        const dist = dLat * dLat + dLng * dLng;
        if (dist < minDist) {
          minDist = dist;
          matchedCity = c;
        }
      });
    }

    if (matchedCity) {
      setValue("cityId", matchedCity.id, { shouldValidate: true });
    }

    setValue("addressLine1", details.address || "", { shouldValidate: true });
  };

  const buildGiftPayload = (formData) => ({
    cartId: cartLineItem.cartId,
    skuId: cartLineItem.skuId,
    lineQuantity: cartLineItem.lineQuantity,
    lineType: cartLineItem.lineType,
    merchantId: cartLineItem.merchantId,
    storeId: cartLineItem.storeId,
    isGift: true,
    giftAddress: {
      recipientPhoneNumber: `+962${formData.recipientPhoneNumber}`,
      packagingId: formData.packagingId,
      giftMessage: formData.giftMessage || "",
      senderName: formData.senderName,
      deliveryDate:
        formData.deliveryDateType === "CUSTOM" ? formData.deliveryDate : "",
      deliveryDateType: formData.deliveryDateType,
      addressType: formData.addressType,
      ...(formData.addressType === "CUSTOM" && {
        countryId: formData.countryId,
        cityId: formData.cityId,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2 || "",
      }),
    },
  });

  const onSubmit = async (formData) => {
    const payload = buildGiftPayload(formData);
    const result = await updateItemToGiftPackage(cartLineItem.id, payload);

    if (result?.success) {
      showToast.success(
        isEditMode ? "Gift details updated successfully" : "Item marked as gift successfully"
      );
      await fetchCartItems();
      reset();
      onClose();
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen || !cartLineItem) return null;

  return (
    <>
      <div
        className={`cart-drawer-gift__overlay ${isOpen ? "cart-drawer-gift__overlay--show" : ""}`}
        onClick={handleClose}
      />


      <div

        style={{
          backgroundColor: isIncludedBrand ? '#303030' : '#FFF'
        }}
        className={`cart-drawer-gift__slider ${isOpen ? "cart-drawer-gift__slider--open" : ""}`}
      >
        <div className="cart-drawer-gift__header">
          <h2

            style={{
              color: isIncludedBrand ? '#FFF' : ''
            }}
          >Gift Option</h2>
        </div>

        <form
          className="cart-drawer-gift__content"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="cart-drawer-gift__preview">
            {selectedPackage && (
              <img
                src={`${imageUrl}${selectedPackage.mediaId}`}
                alt="gift"
                className="cart-drawer-gift__main-image"
              />
            )}
          </div>

          <div className="cart-drawer-gift__paper-row">
            <span

              style={{
                color: isIncludedBrand ? '#FFF' : ''
              }}
            >
              Gift Paper :{" "}
              <b

                style={{
                  color: isIncludedBrand ? '#FFF' : ''
                }}
              >{selectedPackage?.title_i18n?.en || "Select one"}</b>
            </span>
            <span

              style={{
                color: isIncludedBrand ? '#FFF' : ''
              }}
              className="cart-drawer-gift__price">
              {selectedPackage?.price ?? 0}{" "}
              {selectedPackage?.currencyCode ?? "JOD"}
            </span>
          </div>

          <p

            style={{
              color: isIncludedBrand ? '#FFF' : ''
            }}
            className="cart-drawer-gift__label">Choose Gift Paper</p>
          {errors.packagingId && (
            <span className="cart-drawer-gift__error">
              {errors.packagingId.message}
            </span>
          )}

          <div className="cart-drawer-gift__paper-list">
            {giftPackages?.map((item) => (
              <div
                key={item.id}
                className={`cart-drawer-gift__paper-item ${packagingId === item.id ? "cart-drawer-gift__paper-item--active" : ""}`}
                onClick={() => handleSelectPackage(item.id)}
              >
                <img src={`${imageUrl}${item.mediaId}`} alt={item.title} />
              </div>
            ))}
          </div>

          <p

            style={{
              color: isIncludedBrand ? '#FFF' : ''
            }}
            className="cart-drawer-gift__shipping-note">
            Shipping costs are determined according to the shipping location.
          </p>

          <label

            style={{
              color: isIncludedBrand ? '#FFF' : ''
            }}
            className="cart-drawer-gift__input-label">
            Recipient phone number
          </label>
          <div className="cart-drawer-gift__phone-input">
            <div

              style={{
                backgroundColor: isIncludedBrand ? '#444444' : ''
              }}
              className="cart-drawer-gift__country-code">
              <img

                className="cart-drawer-gift__country-flag"
                src="https://upload.wikimedia.org/wikipedia/commons/c/c0/Flag_of_Jordan.svg"
                alt="Jordan"
              />
              <span


                style={{
                  color: isIncludedBrand ? '#fff' : ''
                }}
              >+962</span>
            </div>
            <Controller

              name="recipientPhoneNumber"
              control={control}
              render={({ field }) => (
                <input

                  style={{
                    backgroundColor: isIncludedBrand ? '#444444' : ''
                  }}
                  {...field} type="text" placeholder="Phone Number" />
              )}
            />
          </div>
          {errors.recipientPhoneNumber && (
            <span className="cart-drawer-gift__error">
              {errors.recipientPhoneNumber.message}
            </span>
          )}

          <label
            style={{
              color: isIncludedBrand ? '#fff' : ''
            }}
            className="cart-drawer-gift__input-label">Gift Message</label>
          <Controller
            name="giftMessage"
            control={control}
            render={({ field }) => (
              <textarea

                style={{
                  backgroundColor: isIncludedBrand ? '#444444' : ''
                }}
                {...field}
                className="cart-drawer-gift__textarea"
                placeholder="Message"
              />
            )}
          />

          <div className="cart-drawer-gift__row">
            <div className="cart-drawer-gift__field">
              <label

                style={{
                  color: isIncludedBrand ? '#fff' : ''
                }}
              >
                Your name <span>(Required)</span>
              </label>
              <Controller
                name="senderName"
                control={control}
                render={({ field }) => (
                  <input

                    style={{
                      backgroundColor: isIncludedBrand ? '#444444' : ''
                    }}
                    {...field} type="text" placeholder="Your name" />
                )}
              />
              {errors.senderName && (
                <span
                  className="cart-drawer-gift__error">
                  {errors.senderName.message}
                </span>
              )}
            </div>

            <div className="cart-drawer-gift__field">
              <label

                style={{
                  color: isIncludedBrand ? '#fff' : ''
                }}
              >Delivery Date</label>
              <Controller
                name="deliveryDateType"
                control={control}
                render={({ field }) => (
                  <div className="cart-drawer-gift__delivery-toggle">
                    <button

                      style={{
                        backgroundColor: isIncludedBrand ? '#444444' : ''
                      }}
                      type="button"
                      className={`cart-drawer-gift__toggle-btn ${field.value === "ORDER" ? "cart-drawer-gift__toggle-btn--active" : ""}`}
                      onClick={() => {
                        field.onChange("ORDER");
                        setValue("deliveryDate", "");
                      }}
                    >
                      Now
                    </button>
                    <button

                      style={{
                        backgroundColor: isIncludedBrand ? '#444444' : ''
                      }}
                      type="button"
                      className={`cart-drawer-gift__toggle-btn ${field.value === "CUSTOM" ? "cart-drawer-gift__toggle-btn--active" : ""}`}
                      onClick={() => field.onChange("CUSTOM")}
                    >
                      Custom
                    </button>
                  </div>
                )}
              />
              {deliveryDateType === "CUSTOM" && (
                <div className="cart-drawer-gift__date-input">
                  <Controller
                    name="deliveryDate"
                    control={control}
                    render={({ field }) => (
                      <input

                        style={{
                          backgroundColor: isIncludedBrand ? '#444444' : ''
                        }}
                        {...field}
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                      />
                    )}
                  />
                  <span className="cart-drawer-gift__calendar-icon">
                    <CalendarMonthIcon fontSize="small" />
                  </span>
                </div>
              )}
              {errors.deliveryDate && (
                <span className="cart-drawer-gift__error">
                  {errors.deliveryDate.message}
                </span>
              )}
            </div>
          </div>

          <div className="cart-drawer-gift__shipping">
            <h3

              style={{
                color: isIncludedBrand ? '#fff' : ''
              }}
              className="cart-drawer-gift__section-title">Gift Shipping</h3>

            <Controller
              name="addressType"
              control={control}
              render={({ field }) => (
                <>

                  {locations && locations.length ?

                    <>
                      <label
                        style={{
                          color: isIncludedBrand ? '#fff' : ''
                        }}
                        className={`cart-drawer-gift__radio ${field.value === "ORDER" ? "cart-drawer-gift__radio--active" : ""}`}
                      >
                        <input
                          type="radio"
                          name="addressType"
                          checked={field.value === "ORDER"}
                          onChange={() => field.onChange("ORDER")}
                        />
                        <div>
                          <span

                            style={{
                              color: isIncludedBrand ? '#fff' : ''
                            }}
                          >Use Main Shipping Address</span>
                          <p>No extra fee, Based on full order location</p>
                        </div>
                      </label>

                    </>

                    :
                    <>
                      <p
                        style={{
                          color: 'red',
                          margin: '10px 0'
                        }}
                      >You should add at least one address from your profile </p>

                    </>
                  }


                  <label

                    style={{
                      color: isIncludedBrand ? '#fff' : ''
                    }}
                    className={`cart-drawer-gift__radio ${field.value === "CUSTOM" ? "cart-drawer-gift__radio--active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="addressType"
                      checked={field.value === "CUSTOM"}
                      onChange={() => field.onChange("CUSTOM")}
                    />
                    <div>
                      <span

                        style={{
                          color: isIncludedBrand ? '#fff' : ''
                        }}
                      >Send to a different address</span>
                      <p>Fee apply based on location</p>
                    </div>
                  </label>
                </>
              )}
            />

            {addressType === "CUSTOM" && (
              <div className="cart-drawer-gift__address-box">
                <div className="cart-drawer-gift__select">
                  <div className="flex-between">
                    <span

                      style={{
                        color: isIncludedBrand ? '#fff' : ''
                      }}
                      className="set-location">
                      Select location by map
                    </span>
                    <SetLocation
                      className="set-location-icon"
                      onClick={() => setShowLocationModal(true)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                  <div className="cart-drawer-gift__select-wrapper">
                    <CountrySelect
                      control={control}
                      style={{
                        maxHeight: "40px",
                        backgroundColor: isIncludedBrand ? '#444444' : ''
                      }}
                      label="Country"
                      name="countryId"
                      error={errors.countryId?.message}
                      bgColor="var(--color-white)"
                      valueKey="id"
                      options={validCountries}
                      variant="bordered"
                    />
                  </div>
                  {errors.countryId && (
                    <span className="cart-drawer-gift__error">
                      {errors.countryId.message}
                    </span>
                  )}
                </div>

                <div className="cart-drawer-gift__select">
                  <label

                    style={{
                      color: isIncludedBrand ? '#fff' : ''
                    }}
                  >City</label>
                  <div className="cart-drawer-gift__select-wrapper">
                    <Controller
                      name="cityId"
                      control={control}
                      render={({ field }) => (
                        <select

                          style={{
                            backgroundColor: isIncludedBrand ? '#444444' : ''
                          }}
                          {...field}>
                          {filterCites?.map((city) => (
                            <option key={city.id} value={city.id}>
                              {city.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    <KeyboardArrowDownIcon className="select-arrow" />
                  </div>
                  {errors.cityId && (
                    <span className="cart-drawer-gift__error">
                      {errors.cityId.message}
                    </span>
                  )}
                </div>

                <label

                  style={{
                    color: isIncludedBrand ? '#fff' : ''
                  }}
                >Address 1</label>
                <Controller
                  name="addressLine1"
                  control={control}
                  render={({ field }) => (
                    <input

                      style={{
                        backgroundColor: isIncludedBrand ? '#444444' : ''
                      }}
                      {...field} type="text" placeholder="Address 1" />
                  )}
                />
                {errors.addressLine1 && (
                  <span className="cart-drawer-gift__error">
                    {errors.addressLine1.message}
                  </span>
                )}

                <label

                  style={{
                    color: isIncludedBrand ? '#fff' : ''
                  }}
                >Address 2</label>
                <Controller
                  name="addressLine2"
                  control={control}
                  render={({ field }) => (
                    <input

                      style={{
                        backgroundColor: isIncludedBrand ? '#444444' : ''
                      }}
                      {...field} type="text" placeholder="Address 2" />
                  )}
                />

                <div className="cart-drawer-gift__shipping-fee">
                  <div>
                    <div className="cart-drawer-gift__shipping-fee-label">
                      <LocalShippingIcon
                        fontSize="small"
                        style={{ color: "#0D7C85" }}
                      />
                      <span

                        style={{
                          color: isIncludedBrand ? '#fff' : ''
                        }}
                      >Shipping Fee</span>
                    </div>
                    <p

                      style={{
                        color: isIncludedBrand ? '#fff' : ''
                      }}
                    >Based on selected location</p>
                  </div>
                  <span

                    style={{
                      color: isIncludedBrand ? '#fff' : ''
                    }}
                  >+ JOD 3.99</span>
                </div>
              </div>
            )}

            {/* <div className="cart-drawer-gift__total">
              <span
              
          style={{
            color: isIncludedBrand ? '#fff' : ''
          }}
              >Total Gift Fee</span>
              <b
              
          style={{
            color: isIncludedBrand ? '#fff' : ''
          }}
              >
                JOD{" "}
                {(
                  (selectedPackage?.price ?? 0) +
                  (addressType === "CUSTOM" ? 3.99 : 0)
                ).toFixed(2)}
              </b>
            </div> */}
          </div>

          <button
            type="submit"
            className="cart-drawer-gift__submit"
            disabled={isSubmitting}
          >
            <CardGiftcardIcon style={{ color: "#0e7c7b" }} fontSize="small" />
            {isSubmitting ? "Saving..." : isEditMode ? "Update Gift" : "Create as Gift"}
          </button>
        </form>
      </div>

      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onConfirm={handleLocationConfirm}
      />
    </>
  );
};

export default GiftFormModal;