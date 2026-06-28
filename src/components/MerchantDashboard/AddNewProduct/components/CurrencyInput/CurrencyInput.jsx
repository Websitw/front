import React, { useState } from 'react';
import { Controller } from 'react-hook-form';
import { ChevronDown } from 'lucide-react';
import '../../../../common/FormComponents.css';

const CurrencyInput = ({
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
  currencies = [],
  defaultCurrencyCode,
  styleLabel
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState(
    currencies.find(c => c.code === defaultCurrencyCode) || currencies[0]
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
            value={selectedCurrency?.code}
            onChange={(e) => {
              const currency = currencies.find(c => c.code === e.target.value);
              if (currency) setSelectedCurrency(currency);
            }}
            className="form-phone-country-select-inline"
            disabled={disabled}
          >
            {currencies.map((currency) => (
              <option key={currency.code} style={{ color: 'black' }} value={currency.code}>
                {currency.name} ({currency.code})
              </option>
            ))}
          </select>
          <div className="form-phone-country-display">
            <span className="form-phone-flag">
              <selectedCurrency.flag />
            </span>
            <span className="form-phone-code">{selectedCurrency?.code}</span>
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
              type="number"
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

export default CurrencyInput;