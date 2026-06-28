import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import inventoryFormSchema from "../Schemas/inventoryFormSchema";
import { useSelector, useDispatch } from "react-redux";
import CountrySelect from "../../common/CountrySelect";
import FormInput from "../../common/FormInput";
import FormSelect from "../../common/FormSelect";
import PhoneInput from "../../common/FormPhoneInput";
import { Controller } from "react-hook-form";
import { fetchCountriesListAnonymous } from "../../../store/slices/counteriesSlice";
import { fetchAllCities } from "../../../store/slices/citiesSlice";
import LocationModal from "../../UserSidebar/LocationModal/LocationModal";
import { SetLocation } from "../../../assets/icons";
import { showToast } from "../../CustomToast/CustomToast";
import "./InventoryFormModal.css";

const InventoryFormModal = ({ isOpen, onClose, onSubmitForm, inventory }) => {
  const [filterCities, setFilterCities] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const dispatch = useDispatch();
  const { allCountriesList } = useSelector((state) => state.countries);
  const { allCities } = useSelector((state) => state.cities);

  const validCountries = allCountriesList.filter(
    (country) =>
      country.countryCodeNumeric !== undefined &&
      country.countryCodeNumeric !== null,
  );

  const isEditMode = !!inventory;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      storeName: "",
      phoneNumber: "",
      countryId: "",
      cityId: "",
      address1: "",
      address2: "",
      latitude: undefined,
      longitude: undefined,
      storageSpace: 20,
      status: "ACTIVE",
    },
  });

  const countryId = watch("countryId");

  useEffect(() => {
    if (countryId) {
      const filtered = allCities.filter((city) => city.countryId === countryId);
      setFilterCities(filtered);
    }
  }, [countryId, allCities]);

  useEffect(() => {
    dispatch(fetchCountriesListAnonymous());
    dispatch(fetchAllCities());
  }, []);

  useEffect(() => {
    if (isOpen && isEditMode) {
      const loc = inventory.storeLocation || {};
      setValue("storeName", inventory.storeName || "");
      setValue("storageSpace", inventory.storageSpace || 20);
      setValue("status", inventory.status || "ACTIVE");
      setValue("phoneNumber", (loc.phoneNumber || "").replace(/^\+962/, ""));
      setValue("countryId", loc.countryId || "");
      setValue("cityId", loc.cityId || "");
      setValue("address1", loc.address1 || "");
      setValue("address2", loc.address2 || "");
      setValue("latitude", loc.latitude);
      setValue("longitude", loc.longitude);
    }

    if (isOpen && !isEditMode) {
      reset();
    }
  }, [isOpen, isEditMode, inventory, setValue, reset]);

  const handleLocationConfirm = (details) => {
    if (!details) return;

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
    setValue("latitude", details.lat);
    setValue("longitude", details.lng);

    const countryCities = allCities.filter(
      (c) => c.countryId === matchedCountry.id,
    );

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

    setValue("address1", details.address || "", { shouldValidate: true });
  };

  const onSubmit = async (formData) => {
    const payload = {
      storeName: formData.storeName,
      storeLocation: {
        countryId: formData.countryId,
        cityId: formData.cityId,
        phoneNumber: `+962${formData.phoneNumber}`,
        latitude: formData.latitude || 0,
        longitude: formData.longitude || 0,
        address1: formData.address1,
        address2: formData.address2 || "",
      },
      status: formData.status,
      storageSpace: formData.storageSpace,
      ownerType: "MERCHANT",
    };

    await onSubmitForm(payload);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const cityOptions = filterCities.map((city) => ({
    value: city.id,
    label: city.name,
  }));

  if (!isOpen) return null;

  return (
    <>
      <div
        className={`inventory-modal__overlay ${isOpen ? "inventory-modal__overlay--show" : ""}`}
        onClick={handleClose}
      />

      <div
        className={`inventory-modal__slider ${isOpen ? "inventory-modal__slider--open" : ""}`}
      >
        <div className="inventory-modal__header">
          <h2>{isEditMode ? "Edit Inventory" : "Add New Inventory"}</h2>
          <button
            type="button"
            className="inventory-modal__close"
            onClick={handleClose}
          >
            &times;
          </button>
        </div>

        <form
          className="inventory-modal__content"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormInput
            label="Store Name"
            name="storeName"
            control={control}
            placeholder="Store Name"
            required
            variant="bordered"
            error={errors.storeName?.message}
          />

          <div className="inventory-modal__row">
            <div className="inventory-modal__field">
              <label>Storage Space</label>
              <Controller
                name="storageSpace"
                control={control}
                render={({ field }) => (
                  <input {...field} type="number" min="1" placeholder="20" />
                )}
              />
              {errors.storageSpace && (
                <span className="inventory-modal__error">
                  {errors.storageSpace.message}
                </span>
              )}
            </div>

            <div className="inventory-modal__field">
              <label>Status</label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <div className="inventory-modal__toggle">
                    <button
                      type="button"
                      className={`inventory-modal__toggle-btn ${field.value === "ACTIVE" ? "inventory-modal__toggle-btn--active" : ""}`}
                      onClick={() => field.onChange("ACTIVE")}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      className={`inventory-modal__toggle-btn ${field.value === "INACTIVE" ? "inventory-modal__toggle-btn--active" : ""}`}
                      onClick={() => field.onChange("INACTIVE")}
                    >
                      Inactive
                    </button>
                  </div>
                )}
              />
            </div>
          </div>

          <h3 className="inventory-modal__section-title">Store Location</h3>

          <PhoneInput
            label="Phone Number"
            name="phoneNumber"
            placeholder="Phone Number"
            control={control}
            error={errors.phoneNumber?.message}
            bgColor="var(--color-white)"
          />

          <div className="inventory-modal__field">
            <div className="inventory-modal__location-row">
              <span className="inventory-modal__location-label">
                Select location by map
              </span>
              <SetLocation
                className="inventory-modal__location-icon"
                onClick={() => setShowLocationModal(true)}
                style={{ cursor: "pointer" }}
              />
            </div>

            <CountrySelect
              control={control}
              style={{ maxHeight: "40px" }}
              label="Country"
              name="countryId"
              error={errors.countryId?.message}
              bgColor="var(--color-white)"
              valueKey="id"
              options={validCountries}
              variant="bordered"
            />
            {errors.countryId && (
              <span className="inventory-modal__error">
                {errors.countryId.message}
              </span>
            )}
          </div>

          <FormSelect
            label="City"
            name="cityId"
            control={control}
            options={cityOptions}
            placeholder="Select City"
            variant="bordered"
            bgColor={"var(--color-white)"}
            error={errors.cityId?.message}
          />

          <FormInput
            label="Address 1"
            name="address1"
            control={control}
            placeholder="Address 1"
            variant="bordered"
            error={errors.address1?.message}
          />

          <FormInput
            label="Address 2"
            name="address2"
            control={control}
            placeholder="Address 2"
            variant="bordered"
          />

          <button
            type="submit"
            className="inventory-modal__submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Saving..."
              : isEditMode
                ? "Update Inventory"
                : "Create Inventory"}
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

export default InventoryFormModal;