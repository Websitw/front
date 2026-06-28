import React, { useState } from 'react';
import { Controller } from 'react-hook-form';
import { ChevronDown } from 'lucide-react';
import './FormComponents.css';
import { JordanFlag } from '../../assets/icons';
const COUNTRIES = [
  { code: '+962', name: 'Jordan', flag: JordanFlag , countryCode: 'JO' },
  // { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦', countryCode: 'SA' },
  // { code: '+971', name: 'UAE', flag: '🇦🇪', countryCode: 'AE' },
  // { code: '+20', name: 'Egypt', flag: '🇪🇬', countryCode: 'EG' },
  // { code: '+1', name: 'USA', flag: '🇺🇸', countryCode: 'US' },
  // { code: '+44', name: 'UK', flag: '🇬🇧', countryCode: 'GB' },
];

const FormPhoneInput = ({
  label,
  name,
  placeholder = '',
  required = false,
  disabled = false,
  className = '',
  variant = 'borderless',
  bgColor,
  control,
  error,
  defaultCountryCode = '+962',
  styleLabel
}) => {
  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRIES.find(c => c.code === defaultCountryCode) || COUNTRIES[0]
  );

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label" style={styleLabel}>
          {label}
          {required && <span className="form-required">*</span>}
        </label>
      )}
      <div
        className={`form-phone-container form-phone-container-${variant} ${error ? 'form-input-error' : ''}`}
        style={bgColor ? { backgroundColor: bgColor } : undefined}
      >
        <div className="form-phone-country-wrapper">
          <select
            value={selectedCountry.code}
            onChange={(e) => {
              const country = COUNTRIES.find(c => c.code === e.target.value);
              if (country) setSelectedCountry(country);
            }}
            className="form-phone-country-select-inline"
            disabled={disabled}
          >
            {COUNTRIES.map((country) => (
              <option key={country.countryCode} style={{
                color:'black'
              }} value={country.code}>
                {country.name} {country.code}
              </option>
            ))}
          </select>
          <div className="form-phone-country-display">
            <span className="form-phone-flag">
              <selectedCountry.flag />
            </span>
            <span className="form-phone-code">{selectedCountry.code}</span>
            <ChevronDown className="form-phone-chevron" size={14} />
          </div>
        </div>
        <div className="form-phone-divider"></div>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input
              {...field}
              id={name}
              type="tel"
              placeholder={placeholder}
              disabled={disabled}
              className="form-phone-input-field"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${name}-error` : undefined}
            />
          )}
        />
      </div>
      {error && (
        <span id={`${name}-error`} className="form-error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};


export default FormPhoneInput;


