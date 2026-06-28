import React, { useState, useEffect, useRef } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import "./CountryFlagSelect.css";
import { DefaultFalg } from "../../assets/image";
const CountryFlagSelect = ({
  label,
  countries = [],
  imageBaseUrl = "",
  value,
  onChange,
  placeholder = "Select a country",
  required = false,
  disabled = false,
  error,
  className = "",
  styleDiv={}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectedCountry = countries.find((country) => country.id === value);
   
  console.log("selectedCountry", selectedCountry,"s>>>", countries, value);
  const handleSelect = (countryId) => {
    onChange(countryId);
    setIsOpen(false);
  };

  return (
    <div style={styleDiv} className={`country-flag-select-container ${className}`} ref={dropdownRef}>
      {label && (
        <label className="country-flag-select-label">
          {label}
          {required && <span className="country-flag-select-required">*</span>}
        </label>
      )}

      <div
        className={`country-flag-select-box ${disabled ? "disabled" : ""} ${
          error ? "error" : ""
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="country-flag-select-value">
          {selectedCountry ? (
            <>
              <img
                src={selectedCountry.flagId ? `${imageBaseUrl}${selectedCountry.flagId}` : DefaultFalg}
                alt={selectedCountry.name}
                className="country-flag-img"
              />
              <span>{selectedCountry.name}</span>
            </>
          ) : (
            <span className="country-flag-select-placeholder">{placeholder}</span>
          )}
        </div>
        <KeyboardArrowDownIcon
          className={`country-flag-select-arrow ${isOpen ? "open" : ""}`}
        />
      </div>

      {isOpen && !disabled && (
        <div className="country-flag-dropdown">
          {countries?.length > 0 ? (
            countries?.map((country) => (
              <div
                key={country.id}
                className={`country-flag-dropdown-item ${
                  value === country.id ? "selected" : ""
                }`}
                onClick={() => handleSelect(country.id)}
              >
                <img
                  src={country.flagId ? `${imageBaseUrl}${country.flagId}` : DefaultFalg}
                  alt={country.name}
                  className="country-flag-img"
                />
                <span>{country.name}</span>
              </div>
            ))
          ) : (
            <div className="country-flag-dropdown-empty">No countries available</div>
          )}
        </div>
      )}

      {error && (
        <span className="country-flag-select-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default CountryFlagSelect;
