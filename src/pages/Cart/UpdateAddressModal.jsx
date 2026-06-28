import React, { useEffect, useState } from "react";
import "./UpdateAddressModal.css";
import CloseIcon from "@mui/icons-material/Close";
import CountrySelect from "../../components/common/CountrySelect";
import FormSelect from "../../components/common/FormSelect";
import FormInput from "../../components/common/FormInput";
import PhoneInput from "../../components/common/FormPhoneInput";
import FormCheckbox from "../../components/common/Formcheckbox";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelector, useDispatch } from "react-redux";
import { fetchCountriesListAnonymous } from "../../store/slices/counteriesSlice";
import { fetchAllCities } from "../../store/slices/citiesSlice";
import { SetLocation } from "../../assets/icons";
import LocationModal from "../../components/UserSidebar/LocationModal/LocationModal";
import useLocationSelect from "../../hooks/useLocationSelect";

const addressSchema = z.object({
  locationName: z.string().min(1, "Location name is required"),
  countryId: z.string().min(1, "Country is required"),
  cityId: z.string().min(1, "City is required"),
  address1: z.string().min(1, "Address 1 is required"),
  address2: z.string().optional(),
  phone: z.string().min(1, "Phone is required"),
  isDefault: z.boolean().optional().default(false),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const UpdateAddressModal = ({
  selectedLocation,
  onClose,
  onBack,
  onUpdate,
  hookLoading,
}) => {
  const { allCountriesList } = useSelector((state) => state.countries);
  const { allCities } = useSelector((state) => state.cities);
  const dispatch = useDispatch();
  const [filterCities, setFilterCities] = useState([]);

  const validCountries = allCountriesList.filter(
    (country) =>
      country.countryCodeNumeric !== undefined &&
      country.countryCodeNumeric !== null,
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      locationName: "",
      countryId: "",
      cityId: "",
      address1: "",
      address2: "",
      phone: "",
      isDefault: false,
      latitude: undefined,
      longitude: undefined,
    },
  });

  const {
    showLocationModal,
    openLocationModal,
    closeLocationModal,
    handleLocationConfirm,
  } = useLocationSelect({ setValue, validCountries, allCities });

  useEffect(() => {
    dispatch(fetchCountriesListAnonymous());
    dispatch(fetchAllCities());
  }, [dispatch]);

  const countryId = watch("countryId");

  useEffect(() => {
    if (countryId) {
      const filtered = allCities.filter((city) => city.countryId === countryId);
      setFilterCities(filtered);
    }
  }, [countryId, allCities]);

  useEffect(() => {
    if (selectedLocation) {
      reset({
        locationName: selectedLocation.name || "",
        countryId: selectedLocation.countryId || "",
        cityId: selectedLocation.cityId || "",
        address1: selectedLocation.address1 || "",
        address2: selectedLocation.address2 || "",
        phone: selectedLocation?.phoneNumber || "",
        isDefault: selectedLocation.isDefault || false,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      });
    }
  }, [selectedLocation, reset]);

  const onSubmitUpdate = async (data) => {
    const payload = {
      name: data.locationName,
      countryId: data.countryId,
      cityId: data.cityId,
      address1: data.address1,
      address2: data.address2,
      phoneNumber: data.phone,
      isDefault: data.isDefault,
      latitude: data.latitude,
      longitude: data.longitude,
    };

    await onUpdate(selectedLocation.id, payload);
  };

  const handleBack = () => {
    reset();
    onBack();
  };

  return (
    <div className="update-address-modal">
      <div className="update-address-modal__overlay">
        <div className="update-address-modal__container">
          <div className="update-address-modal__header">
            <div className="update-address-modal__header-top">
              <h2 className="update-address-modal__title">Confirm Order</h2>
              <button
                className="update-address-modal__close-btn"
                onClick={onClose}
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>
            <span
              className="update-address-modal__back-btn"
              onClick={handleBack}
            >
              ← Back
            </span>
          </div>

          <div className="update-address-modal__body">
            <div className="update-address-modal__body-left">
              <div className="update-address-modal__body-header">
                <div>
                  <h4 className="update-address-modal__section-title">
                    Shipping Address | (Home) Update Location
                  </h4>
                </div>
                <button
                  className="update-address-modal__submit-btn"
                  onClick={handleSubmit(onSubmitUpdate)}
                  disabled={isSubmitting || hookLoading}
                >
                  {isSubmitting || hookLoading ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>

          <div className="update-address-modal__form">
            <div className="update-address-modal__form-group">
              <FormInput
                label="Location Name"
                name="locationName"
                placeholder="Location Name"
                control={control}
                error={errors.locationName?.message}
                styleLabel={{ marginBottom: "0px" }}
                bgColor="var(--color-white)"
                style={{ padding: "15px 20px" }}
              />
            </div>

            <hr className="update-address-modal__divider" />
            <div
              className="flex-between"
              style={{ maxWidth: "430px" }}
            >
              <span className="set-location">Select location by map</span>
              <SetLocation
                className="set-location-icon"
                onClick={openLocationModal}
                style={{ cursor: "pointer" }}
              />
            </div>

            <div className="update-address-modal__row">
              <div className="update-address-modal__form-group">
                <CountrySelect
                  control={control}
                  label="Country"
                  name="countryId"
                  error={errors.countryId?.message}
                  bgColor="var(--color-white)"
                  valueKey="id"
                  options={validCountries}
                  variant="bordered"
                />
              </div>

              <div className="update-address-modal__form-group">
                <FormSelect
                  control={control}
                  label="City"
                  name="cityId"
                  error={errors.cityId?.message}
                  bgColor="var(--color-white)"
                  options={filterCities.map((city) => ({
                    label: city.name,
                    value: city.id,
                  }))}
                  style={{ padding: "15px 20px" }}
                  variant="bordered"
                />
              </div>
            </div>

            <div className="update-address-modal__row">
              <div className="update-address-modal__form-group">
                <FormInput
                  label="Address 1"
                  name="address1"
                  placeholder="Address 1"
                  control={control}
                  error={errors.address1?.message}
                  styleLabel={{ marginBottom: "0px" }}
                  bgColor="var(--color-white)"
                  style={{ padding: "15px 20px" }}
                />
              </div>

              <div className="update-address-modal__form-group">
                <FormInput
                  label="Address 2"
                  name="address2"
                  placeholder="Address 2"
                  control={control}
                  error={errors.address2?.message}
                  styleLabel={{ marginBottom: "0px" }}
                  bgColor="var(--color-white)"
                  style={{ padding: "15px 20px" }}
                />
              </div>
            </div>

            <div className="update-address-modal__form-group">
              <PhoneInput
                label="Phone Number"
                name="phone"
                placeholder="79555522"
                control={control}
                error={errors.phone?.message}
                styleLabel={{ marginTop: "10px", marginBottom: "0px" }}
                bgColor="var(--color-white)"
                style={{ marginTop: "10px" }}
              />
            </div>

            <div className="update-address-modal__form-group">
              <FormCheckbox
                label="Set as default address"
                name="isDefault"
                control={control}
                error={errors.isDefault?.message}
                bgColor="var(--color-white)"
              />
            </div>
          </div>
        </div>
      </div>
      <LocationModal
        isOpen={showLocationModal}
        onClose={closeLocationModal}
        onConfirm={handleLocationConfirm}
      />
    </div>
  );
};

export default UpdateAddressModal;