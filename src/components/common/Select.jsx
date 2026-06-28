import React from 'react';
import { Controller } from 'react-hook-form';
import { ChevronDown } from 'lucide-react';
import './FormComponents.css';

const FormSelect = ({
  label,
  name,
  options = [],
  required = false,
  disabled = false,
  placeholder = 'Select an option',
  className = '',
  control,
  error,
  returnObject = false
}) => {
  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="form-required">*</span>}
      </label>
      <div className="form-select-wrapper">
        <Controller
          name={name}
          control={control}
          render={({ field: { onChange, value } }) => {
            const selectedValue = returnObject 
              ? (value ? value.id || value.value : '') 
              : value;

            const handleChange = (e) => {
              const selectedId = e.target.value;
              if (!selectedId) {
                onChange(null);
                return;
              }

              if (returnObject) {
                const selectedOption = options.find(opt => 
                  (opt.data?.id || opt.value) === selectedId
                );
                onChange(selectedOption?.data || selectedOption);
              } else {
                onChange(selectedId);
              }
            };

            return (
              <select
                id={name}
                value={selectedValue}
                onChange={handleChange}
                disabled={disabled}
                className={`form-select ${error ? 'form-input-error' : ''}`}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? `${name}-error` : undefined}
              >
                {placeholder && (
                  <option value="" disabled>
                    {placeholder}
                  </option>
                )}
                {options.map((option) => (
                  <option 
                    key={option.data?.id || option.value} 
                    value={option.data?.id || option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            );
          }}
        />
        <ChevronDown className="form-select-icon" size={20} />
      </div>
      {error && (
        <span id={`${name}-error`} className="form-error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default FormSelect;