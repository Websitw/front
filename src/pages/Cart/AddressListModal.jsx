import React, { useState, useEffect } from "react";
import "./AddressListModal.css";
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
import { imageUrl } from "../../helper/helper";
import { SetLocation } from "../../assets/icons";
import LocationModal from "../../components/UserSidebar/LocationModal/LocationModal";
import useLocationSelect from "../../hooks/useLocationSelect";

const addressSchema = z.object({
  locationName: z.string().min(1, "Location name is required"),
  countryId: z
    .string({
      required_error: "Country is required",
      invalid_type_error: "Country is required",
    })
    .min(0, "Country is required"),
  cityId: z.string().min(1, "City is required"),
  address1: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  phone: z.string().min(1, "Phone is required"),
  isDefault: z.boolean().optional().default(false),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const AddressListModal = ({
  locations,
  onClose,
  onBack,
  onUpdateLocation,
  onRemoveLocation,
  onAddAddress,
  hookLoading,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);

  const { allCountriesList } = useSelector((state) => state.countries);
  const { allCities } = useSelector((state) => state.cities);
  const dispatch = useDispatch();

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
    },
  });

  const {
    showLocationModal,
    openLocationModal,
    closeLocationModal,
    handleLocationConfirm,
  } = useLocationSelect({ setValue, validCountries, allCities });

  const countryId = watch("countryId");
  const [filterCites, setFilterCities] = useState([]);

  useEffect(() => {
    if (countryId) {
      const filtered = allCities.filter((city) => city.countryId === countryId);
      setFilterCities(filtered);
    }
  }, [countryId, allCities]);

  useEffect(() => {
    dispatch(fetchCountriesListAnonymous());
    dispatch(fetchAllCities());
  }, [dispatch]);

  const onSubmitAdd = async (data) => {
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

    const success = await onAddAddress(payload);

    if (success) {
      reset();
      setShowAddForm(false);
    }
  };

  return (
    <div className="address-list-modal">
      <div className="address-list-modal__overlay">
        <div className="address-list-modal__container">
          <div className="address-list-modal__header">
            <div className="address-list-modal__header-top">
              <h2 className="address-list-modal__title">Confirm Order</h2>
              <button
                className="address-list-modal__close-btn"
                onClick={onClose}
              >
                <CloseIcon />
              </button>
            </div>
            <span
              className="address-list-modal__back-btn"
              onClick={() => {
                onBack();
                setShowAddForm(false);
              }}
            >
              ← Back
            </span>
          </div>

          <div className="address-list-modal__body">
            <div className="address-list-modal__left">
              <div className="address-list-modal__left-header">
                <div>
                  <h4 className="address-list-modal__section-title">
                    Shipping Address
                  </h4>
                  <h6 className="address-list-modal__subtitle">
                    Select shipping address:
                  </h6>
                </div>
              </div>

              <div className="address-list-modal__list">
                {locations.map((location) => (
                  <div key={location.id} className="address-list-modal__card">
                    <h4>{location.name}</h4>

                    <div className="address-list-modal__country-row">
                      <img
                        className="address-list-modal__flag"
                        src={`${imageUrl}${location?.country?.flagId}`}
                        alt={location?.country?.name || "Country"}
                      />
                      <p>
                        {location?.country?.name || "Jordan"} -{" "}
                        {location?.city?.name || ""}
                      </p>
                    </div>

                    <p>{location.address1}</p>

                    <div className="address-list-modal__actions">
                      <button
                        className="address-list-modal__update-btn"
                        onClick={() => onUpdateLocation(location)}
                      >
                        Update Location
                      </button>
                      <span className="address-list-modal__separator">|</span>
                      <button
                        className="address-list-modal__remove-btn"
                        onClick={() => onRemoveLocation(location.id)}
                      >
                        Remove Location
                      </button>
                    </div>
                  </div>
                ))}

                {!showAddForm && (
                  <div
                    className="address-list-modal__add-card"
                    onClick={() => setShowAddForm(true)}
                  >
                    + Add a New Address
                  </div>
                )}
              </div>
            </div>

            {showAddForm && (
              <div className="address-list-modal__right">
                <h4 className="address-list-modal__form-title">
                  Add A New Location
                </h4>

                <div className="address-list-modal__form-group">
                  <FormInput
                    label={"Location Name"}
                    name="locationName"
                    style={{ padding: "15px 20px" }}
                    placeholder="Location Name"
                    control={control}
                    error={errors.locationName?.message}
                    styleLabel={{ marginBottom: "0px" }}
                    bgColor="var(--color-white)"
                  />
                </div>
                <div className="flex-between">
                  <span className="set-location">Select location by map</span>
                  <SetLocation
                    className="set-location-icon"
                    onClick={openLocationModal}
                    style={{ cursor: "pointer" }}
                  />
                </div>

                <div className="address-list-modal__form-group">
                  <CountrySelect
                    control={control}
                    label={"Country"}
                    name="countryId"
                    error={errors.countryId?.message}
                    bgColor="var(--color-white)"
                    valueKey="id"
                    options={validCountries}
                    variant="bordered"
                  />
                </div>

                <div className="address-list-modal__form-group">
                  <FormSelect
                    control={control}
                    label={"City"}
                    name="cityId"
                    error={errors.cityId?.message}
                    bgColor="var(--color-white)"
                    options={filterCites.map((city) => ({
                      label: city.name,
                      value: city.id,
                    }))}
                    style={{ padding: "15px 20px" }}
                    variant="bordered"
                  />
                </div>

                <div className="address-list-modal__form-group">
                  <FormInput
                    label={"Address 1"}
                    name="address1"
                    style={{ padding: "15px 20px" }}
                    placeholder="Address 1"
                    control={control}
                    error={errors.address1?.message}
                    styleLabel={{ marginBottom: "0px" }}
                    bgColor="var(--color-white)"
                  />
                </div>

                <div className="address-list-modal__form-group">
                  <FormInput
                    label={"Address 2"}
                    name="address2"
                    style={{ padding: "15px 20px" }}
                    placeholder="Address 2"
                    control={control}
                    error={errors.address2?.message}
                    styleLabel={{ marginBottom: "0px" }}
                    bgColor="var(--color-white)"
                  />
                </div>

                <div className="address-list-modal__form-group">
                  <PhoneInput
                    label={"Phone Number"}
                    name="phone"
                    placeholder={"79 xxxxxxx"}
                    control={control}
                    error={errors.phone?.message}
                    styleLabel={{ marginTop: "10px", marginBottom: "0px" }}
                    bgColor="var(--color-white)"
                    style={{ marginTop: "10px" }}
                  />
                </div>

                <div className="address-list-modal__form-group">
                  <FormCheckbox
                    label={"Set as default address"}
                    name="isDefault"
                    control={control}
                    error={errors.isDefault?.message}
                    bgColor="var(--color-white)"
                  />
                </div>
                <button
                  type="button"
                  className="address-list-modal__submit-btn"
                  onClick={handleSubmit(onSubmitAdd)}
                  disabled={isSubmitting || hookLoading}
                >
                  {isSubmitting || hookLoading ? "Adding..." : "Add Location"}
                </button>
              </div>
            )}
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

export default AddressListModal;