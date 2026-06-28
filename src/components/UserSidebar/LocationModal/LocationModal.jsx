import React, { useState, useEffect, useRef, useCallback } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import CloseIcon from "@mui/icons-material/Close";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import "./LocationModal.css";

const GOOGLE_API_KEY = "AIzaSyCPjH0g-NJXpXJ8vJRB5sLCRPkZUUrlX8M";
const DEFAULT_CENTER = { lat: 31.9539, lng: 35.9106 };

const LocationModal = ({ isOpen, onClose, onConfirm }) => {
  const [position, setPosition] = useState(DEFAULT_CENTER);
  const [locationDetails, setLocationDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const geocoderRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);
        setLoading(false);
      },
      () => setLoading(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, [isOpen]);

  const reverseGeocode = useCallback((lat, lng) => {
    if (!window.google) return;

    if (!geocoderRef.current) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }

    geocoderRef.current.geocode(
      { location: { lat, lng } },
      (results, status) => {
        if (status !== "OK" || !results?.[0]) return;

        const components = results[0].address_components;
        const get = (type) => components.find((c) => c.types.includes(type));

        setLocationDetails({
          lat,
          lng,
          country: get("country")?.long_name || "",
          countryCode: get("country")?.short_name || "",
          city:
            get("locality")?.long_name ||
            get("administrative_area_level_1")?.long_name ||
            "",
          address: results[0].formatted_address || "",
          addressComponents: components,
        });
      },
    );
  }, []);

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setPosition({ lat, lng });
    reverseGeocode(lat, lng);
  };

  const handleMapLoad = (map) => {
    mapRef.current = map;
    reverseGeocode(position.lat, position.lng);
  };

  const handleRecenter = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setPosition(coords);
      mapRef.current?.panTo(coords);
      reverseGeocode(coords.lat, coords.lng);
    });
  };

  const handleConfirm = () => {
    onConfirm(locationDetails);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="location-modal__overlay" onClick={onClose} />
      <div className="location-modal">
        <div className="location-modal__header">
          <h3>Select Location</h3>
          <button
            type="button"
            className="location-modal__close"
            onClick={onClose}
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <div className="location-modal__map">
          {loading ? (
            <div className="location-modal__loading">Getting location…</div>
          ) : (
            <LoadScript googleMapsApiKey={GOOGLE_API_KEY}>
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={position}
                zoom={14}
                onClick={handleMapClick}
                onLoad={handleMapLoad}
              >
                <Marker position={position} />
              </GoogleMap>
            </LoadScript>
          )}

          <button
            type="button"
            className="location-modal__recenter"
            onClick={handleRecenter}
            title="My location"
          >
            <MyLocationIcon fontSize="small" />
          </button>
        </div>

        {locationDetails && (
          <p className="location-modal__address">{locationDetails.address}</p>
        )}

        <div className="location-modal__actions">
          <button
            type="button"
            className="location-modal__cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="location-modal__confirm"
            onClick={handleConfirm}
            disabled={!locationDetails}
          >
            Confirm Location
          </button>
        </div>
      </div>
    </>
  );
};

export default LocationModal;