import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { environment } from "../../../environments/environment";
import ConfirmDialog from "../../../components/Admin/Modal/Modal";
import axios from "axios";
import { useAddress } from "../../../hooks/useAddress";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/authSlice";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import { SetLocation } from "../../../assets/icons";
import LocationModal from "../../../components/UserSidebar/LocationModal/LocationModal";
import useLocationSelect from "../../../hooks/useLocationSelect";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import CountrySelect from "../../../components/common/CountrySelect";
import FormSelect from "../../../components/common/FormSelect";
import FormInput from "../../../components/common/FormInput";
import PhoneInput from "../../../components/common/FormPhoneInput";
import FormCheckbox from "../../../components/common/Formcheckbox";

const addressSchema = z.object({
  locationName: z.string().min(1, "Location name is required"),
  countryId: z.string().min(1, "Country is required"),
  cityId: z.string().min(1, "City is required"),
  address1: z.string().min(1, "Address 1 is required"),
  address2: z.string().optional().default(""),
  phone: z.string().min(1, "Phone number is required"),
  isDefault: z.boolean().optional().default(false),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const ShippingAndLocation = () => {
  const {
    addAddress,
    editAddress,
    removeAddress,
    getAddresses,
    loading: hookLoading,
  } = useAddress();

  const user = useSelector(selectUser);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [countries, setCountries] = useState([]);
  const [allCitiesList, setAllCitiesList] = useState([]);
  const [cities, setCities] = useState([]);
  const [locations, setLocations] = useState([]);

  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [baseUrl] = useState(environment.serverOrigin);

  const {
    handleSubmit,
    watch,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
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
  } = useLocationSelect({
    setValue,
    validCountries: countries,
    allCities: allCitiesList,
  });

  const countryId = watch("countryId");

  const fetchLocations = async () => {
    const result = await getAddresses("USER");
    if (result.success) {
      setLocations(result.data);
    }
  };

  const fetchCountries = async () => {
    try {
      const res = await axios.get(
        `${environment.serverOrigin}countries?limit=100`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setCountries(res.data.items);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllCities = async () => {
    try {
      const res = await axios.get(
        `${environment.serverOrigin}cities?limit=100`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setAllCitiesList(res.data.items);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchCountries();
    fetchAllCities();
  }, []);

  useEffect(() => {
    if (countryId) {
      const filtered = allCitiesList.filter(
        (city) => city.countryId === countryId,
      );
      setCities(filtered);
    } else {
      setCities([]);
      setValue("cityId", "");
    }
  }, [countryId, allCitiesList, setValue]);

  const openCreateModal = () => {
    setMode("create");
    setSelectedLocation(null);
    reset({
      locationName: "",
      countryId: "",
      cityId: "",
      address1: "",
      address2: "",
      phone: "",
      isDefault: false,
    });
    setIsModalOpen(true);
  };

  const openUpdateModal = (location) => {
    setMode("update");
    setSelectedLocation(location);
    reset({
      locationName: location.name || "",
      countryId: location.country?.id || "",
      cityId: location.city?.id || "",
      address1: location.address1 || "",
      address2: location.address2 || "",
      phone: location.phoneNumber || "",
      isDefault: location.isDefault || false,
      latitude: location.latitude,
      longitude: location.longitude,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setMode("create");
    setSelectedLocation(null);
    reset();
  };

  const onSubmit = async (data) => {
    const payload = {
      name: data.locationName,
      countryId: data.countryId,
      cityId: data.cityId,
      ownerId: user?.id,
      ownerType: "USER",
      addressType: "REGISTERED",
      address1: data.address1,
      address2: data.address2,
      phoneNumber: data.phone,
      isDefault: data.isDefault,
      latitude: data.latitude,
      longitude: data.longitude,
    };

    let result;
    if (mode === "create") {
      result = await addAddress(payload);
    } else {
      result = await editAddress(selectedLocation.id, payload);
    }

    if (result.success) {
      fetchLocations();
      closeModal();
    }
  };

  const handleRemoveLocation = (id) => setDeleteConfirmation(id);
  const cancelDelete = () => setDeleteConfirmation(null);

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;

    const result = await removeAddress(deleteConfirmation);
    if (result.success) {
      fetchLocations();
      setDeleteConfirmation(null);
    }
  };

  return (
    <>
      <div className="container-payments-invoices">
        <section className="payment-methods-section">
          <h1 className="section-title">Delivery Location</h1>
          {hookLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="cards-grid">
              {!hookLoading &&
                locations?.map((location) => (
                  <div key={location.id} className="card payment-card">
                    <span
                      style={{
                        color: "#151515",
                        fontWeight: "400",
                        lineHeight: "23px",
                        fontSize: "22px",
                        textTransform: "uppercase",
                      }}
                    >
                      {location?.name}
                    </span>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginTop: "10px",
                        marginBottom: "5px",
                      }}
                    >
                      {location.country && (
                        <img
                          style={{
                            width: "30px",
                            height: "20px",
                            objectFit: "contain",
                          }}
                          src={`${baseUrl}_xfilestore/mada/${location.country.flagId}`}
                          alt=""
                        />
                      )}

                      <div className="card-number">
                        {location.country?.name} - {location.city?.name}
                      </div>
                    </div>
                    <div className="card-address">{location.address1}</div>

                    <div className="card-actions">
                      <button
                        className="btn-update"
                        onClick={() => openUpdateModal(location)}
                      >
                        Update Location
                      </button>
                      <span className="separator">|</span>
                      <button
                        className="btn-remove"
                        onClick={() => handleRemoveLocation(location.id)}
                      >
                        Remove Location
                      </button>
                    </div>
                  </div>
                ))}

              {!hookLoading && (
                <div
                  onClick={openCreateModal}
                  className="card add-payment-card"
                >
                  <button className="add-payment-btn">
                    <span className="plus-icon">+</span>
                    <span>Add a new location</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {isModalOpen && (
        <div className="model-create-location">
          <div className="modal-overlay-address" onClick={closeModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-location">
                <h2>
                  {mode === "create" ? "Add a New Location" : "Update Location"}
                </h2>
                <button className="close-btn" onClick={closeModal}>
                  <CloseIcon />
                </button>
              </div>

              <div className="modal-body-location">
                <div className="form-group">
                  <FormInput
                    label="Location Name"
                    name="locationName"
                    placeholder="e.g., Home, Office"
                    control={control}
                    error={errors.locationName?.message}
                    style={{ padding: "15px 20px" }}
                    styleLabel={{ marginBottom: "0px" }}
                    bgColor="var(--color-white)"
                  />
                </div>

                <div className="flex-between" style={{ maxWidth: "430px", marginTop:"10px" }}>
                  <span className="set-location">Select location by map</span>
                  <SetLocation
                    className="set-location-icon"
                    onClick={openLocationModal}
                    style={{ cursor: "pointer" }}
                  />
                </div>

                <div>
                  <div className="form-group-half">
                    <CountrySelect
                      control={control}
                      label="Country"
                      name="countryId"
                      error={errors.countryId?.message}
                      bgColor="var(--color-white)"
                      valueKey="id"
                      options={countries}
                      variant="bordered"
                      styleLabel={{ marginBottom: "0px" }}
                    />
                  </div>
                </div>
                <div className="form-group-half">
                  <FormSelect
                    control={control}
                    label="City"
                    name="cityId"
                    error={errors.cityId?.message}
                    bgColor="var(--color-white)"
                    options={cities.map((city) => ({
                      label: city.name,
                      value: city.id,
                    }))}
                    style={{ padding: "15px 20px" }}
                    variant="bordered"
                    styleLabel={{ marginBottom: "0px", marginTop: "10px" }}
                  />
                </div>

                <div className="form-group">
                  <FormInput
                    label="Address 1"
                    name="address1"
                    placeholder="Street, Building"
                    control={control}
                    error={errors.address1?.message}
                    style={{ padding: "15px 20px" }}
                    styleLabel={{ marginBottom: "0px", marginTop: "10px" }}
                    bgColor="var(--color-white)"

                  />
                </div>

                <div className="form-group">
                  <FormInput
                    label="Address 2"
                    name="address2"
                    placeholder="Street, Building"
                    control={control}
                    error={errors.address2?.message}
                    style={{ padding: "15px 20px", }}
                    styleLabel={{ marginBottom: "0px", marginTop: "10px" }}
                    bgColor="var(--color-white)"
                  />
                </div>

                <div className="form-group">
                  <PhoneInput
                    label="Phone Number"
                    name="phone"
                    placeholder="79 xxxxxxx"
                    control={control}
                    error={errors.phone?.message}
                    styleLabel={{ marginTop: "10px", marginBottom: "0px" }}
                    bgColor="var(--color-white)"
                    style={{ marginTop: "10px" }}
                  />
                </div>

                <div className="form-group">
                  <FormCheckbox
                    label="Set as default address"
                    name="isDefault"
                    control={control}
                    error={errors.isDefault?.message}
                    bgColor="var(--color-white)"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="add-location-btn"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting || hookLoading}
                >
                  {isSubmitting || hookLoading
                    ? mode === "create"
                      ? "Adding..."
                      : "Updating..."
                    : mode === "create"
                      ? "Add Location"
                      : "Update Location"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <LocationModal
        isOpen={showLocationModal}
        onClose={closeLocationModal}
        onConfirm={handleLocationConfirm}
      />

      <ConfirmDialog
        open={!!deleteConfirmation}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Location"
        message="Are you sure you want to delete this location?"
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        loading={hookLoading}
      />
    </>
  );
};

export default ShippingAndLocation;
