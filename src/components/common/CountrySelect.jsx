import React, { useState, useRef, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { ChevronDown } from 'lucide-react';
import './CountrySelect.css';
import { imageUrl } from '../../helper/helper';

const CountrySelect = ({
  label,
  name,
  placeholder = 'Country Name',
  required = false,
  disabled = false,
  className = '',
  variant = 'borderless',
  bgColor,
  control,
  error,
  styleLabel = {},
  style = {},
  options = [],
  showFlag = true,
  valueKey = 'id',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const getSelectedCountry = (value) => {
    if (value === null || value === undefined) return null;
    return options.find((country) => country[valueKey] === value);
  };


  return (
    <div className={`country-select-group ${className}`}>
      {label && (
        <label htmlFor={name} className="country-select-label" style={styleLabel}>
          {label}
          {required && <span className="country-select-required">*</span>}
        </label>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, ref } }) => {
          const selectedCountry = getSelectedCountry(value);

          return (
            <div
              className="country-select-wrapper"
              ref={dropdownRef}
            >
              <button
                type="button"
                ref={ref}
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`
                  country-select-trigger
                  country-select-trigger-${variant}
                  ${error ? 'country-select-trigger-error' : ''}
                  ${disabled ? 'country-select-trigger-disabled' : ''}
                  ${isOpen ? 'country-select-trigger-open' : ''}
                `}
                style={bgColor ? { backgroundColor: bgColor, ...style } : style}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? `${name}-error` : undefined}
              >
                <span className="country-select-value">
                  {selectedCountry ? (
                    <>
                      {showFlag && selectedCountry.flagId && (
                        <img 
                           src={`${imageUrl}${selectedCountry.flagId}`} 
                          alt={selectedCountry.name}
                          className="country-select-flag"
                          style={{ width: '24px', height: '16px', objectFit: 'cover' }}
                        />
                      )}
                      <span className="country-select-name">
                        {selectedCountry.name}
                      </span>
                    </>
                  ) : (
                    <span className="country-select-placeholder">
                      {placeholder}
                    </span>
                  )}
                </span>

                <ChevronDown
                  size={18}
                  className={`country-select-chevron ${isOpen ? 'country-select-chevron-open' : ''}`}
                />
              </button>

              {isOpen && (
                <ul
                  className="country-select-dropdown"
                  role="listbox"
                  aria-label={label || 'Select country'}
                >
                  {options.map((country) => (
                    <li
                      key={country.id}
                      role="option"
                      aria-selected={value === country[valueKey]}
                      className={`
                        country-select-option
                        ${value === country[valueKey] ? 'country-select-option-selected' : ''}
                      `}
                      onClick={() => {
                        onChange(country[valueKey]);
                        setIsOpen(false);
                      }}
                    > 
                    
                      {showFlag && country.flagId && (
                        <img 
                          src={`${imageUrl}${country.flagId}`} 
                          alt={country.name}
                          className="country-select-option-flag"
                          style={{ width: '24px', height: '16px', objectFit: 'cover' }}
                        />
                      )}
                      <span className="country-select-option-name">
                        {country.name}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        }}
      />

      {error && (
        <span id={`${name}-error`} className="country-select-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default CountrySelect;
 