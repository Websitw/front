import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { environment } from "../../../environments/environment";
import ConfirmDialog from "../../../components/Admin/Modal/Modal";
import axios from "axios";
import { useAddress } from "../../../hooks/useAddress";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/authSlice";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import Loading from "../../../components/Loading/Loading";

const ShippingAndLocationCompany = () => {
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
  const [cities, setCities] = useState([]);
  const [locations, setLocations] = useState([]);

  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [baseUrl] = useState(environment.serverOrigin);

  const [form, setForm] = useState({
    locationName: "",
    countryId: "",
    cityId: "",
    address1: "",
    address2: "",
  });

  const [errors, setErrors] = useState({});

  const authHeaders = {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const fetchLocations = async () => {
    const result = await getAddresses("COMPANY");
    if (result.success) {
      setLocations(result.data);
    }
  };

  const fetchCountries = async () => {
    try {
      const res = await axios.get(
        `${environment.serverOrigin}countries?limit=100`,
        { headers: authHeaders },
      );
      setCountries(res.data.items);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCities = async (countryId) => {
    try {
      const res = await axios.get(
        `${environment.serverOrigin}cities?limit=100`,
        { headers: authHeaders },
      );
      const filteredCities = res.data.items.filter(
        (city) => city.countryId === countryId,
      );
      setCities(filteredCities);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchCountries();
  }, []);

  useEffect(() => {
    if (form.countryId) {
      fetchCities(form.countryId);
    } else {
      setCities([]);
      setForm((prev) => ({ ...prev, cityId: "" }));
    }
  }, [form.countryId]);

  const openCreateModal = () => {
    setMode("create");
    setSelectedLocation(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openUpdateModal = (location) => {
    setMode("update");
    setSelectedLocation(location);

    setForm({
      locationName: location.name || "",
      countryId: location.country?.id || "",
      cityId: location.city?.id || "",
      address1: location.address1 || "",
      address2: location.address2 || "",
    });

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setMode("create");
    setSelectedLocation(null);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      locationName: "",
      countryId: "",
      cityId: "",
      address1: "",
      address2: "",
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.locationName.trim())
      newErrors.locationName = "Location name is required";
    if (!form.countryId) newErrors.countryId = "Country is required";
    if (!form.cityId) newErrors.cityId = "City is required";
    if (!form.address1.trim()) newErrors.address1 = "Address 1 is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      name: form.locationName,
      countryId: form.countryId,
      ownerType: "COMPANY",
      cityId: form.cityId,
      ownerId: user?.id,
      addressType: "REGISTERED",
      address1: form.address1,
      address2: form.address2,
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
          {hookLoading ?
            <LoadingSpinner />
            :
          <div className="cards-grid">
            {!hookLoading &&
              locations.map((location) => (
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
              <div onClick={openCreateModal} className="card add-payment-card">
                <button className="add-payment-btn">
                  <span className="plus-icon">+</span>
                  <span>Add a new location</span>
                </button>
              </div>
            )}
          </div>
}
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

              <div className="modal-body">
                <div className="form-group">
                  <label>Location Name</label>
                  <input
                    name="locationName"
                    value={form.locationName}
                    onChange={handleChange}
                    placeholder="e.g., Home, Office"
                  />
                  {errors.locationName && (
                    <small className="error">{errors.locationName}</small>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group-half">
                    <label>Country</label>

                    <div
                      style={{
                        marginTop: "8px",
                      }}
                      className="select-wrapper"
                    >
                      <select
                        name="countryId"
                        value={form.countryId}
                        onChange={handleChange}
                        className="select-input"
                      >
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                          <option key={country.id} value={country.id}>
                            {country.name}
                          </option>
                        ))}
                      </select>

                      <KeyboardArrowDownIcon className="select-icon" />
                    </div>

                    {errors.countryId && (
                      <small className="error">{errors.countryId}</small>
                    )}
                  </div>

                  <div className="form-group-half">
                    <label>City</label>

                    <div
                      style={{
                        marginTop: "8px",
                      }}
                      className="select-wrapper"
                    >
                      <select
                        name="cityId"
                        value={form.cityId}
                        onChange={handleChange}
                        className="select-input"
                        disabled={!form.countryId}
                      >
                        <option value="">Select City</option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.name}
                          </option>
                        ))}
                      </select>

                      <KeyboardArrowDownIcon className="select-icon" />
                    </div>

                    {errors.cityId && (
                      <small className="error">{errors.cityId}</small>
                    )}
                  </div>
                </div>

                <div className="form-group-half">
                  <label>Address 1</label>
                  <input
                    style={{
                      marginTop: "8px",
                    }}
                    name="address1"
                    value={form.address1}
                    onChange={handleChange}
                    placeholder="Street, Building"
                  />
                  {errors.address1 && (
                    <small className="error">{errors.address1}</small>
                  )}
                </div>

                <div
                  style={{
                    marginTop: "10px",
                  }}
                  className="form-group-half"
                >
                  <label>Address 2</label>
                  <input
                    style={{
                      marginTop: "8px",
                    }}
                    name="address2"
                    value={form.address2}
                    onChange={handleChange}
                    placeholder="Street, Building"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="add-location-btn"
                  onClick={handleSubmit}
                  disabled={hookLoading}
                >
                  {hookLoading
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

export default ShippingAndLocationCompany;
