import React from 'react';
import { Controller } from 'react-hook-form';
import './ForgetPassword/ForegetPassord.css';

const RadioInput = ({
  label,
  name,
  options = [],
  required = false,
  className = '',
  control,
  error,
  style={},
  styleRadio={},
  labelStyle={},
  styleSpan={},
  styleRadioOption={},
  styleRadioOptions={}
}) => {
  return (
    <div className={`radio-group ${className}`} style={style}>
      {label && (
        <label className="radio-group-label" style={labelStyle}>
          {label}
          {required && <span className="form-required">*</span>}
        </label>
      )}
      
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="radio-options" style={styleRadioOptions} >
            {options.map((option) => (
              <label
                key={option.value}
                style={styleRadioOption}
                className={`radio-option ${
                  field.value === option.value ? 'radio-option-selected' : ''
                }`}
              >
                <input
                  type="radio"
                  style={styleRadio}
                  {...field}
                  value={option.value}
                  checked={field.value === option.value}
                  onChange={() => field.onChange(option.value)}
                />
                <span style={styleSpan} className="radio-option-label">{option.label}</span>
                {option.displayValue && (
                  <span  className="radio-option-value">{option.displayValue}</span>
                )}
              </label>
            ))}
          </div>
        )}
      />
      
      {error && (
        <span className="form-error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default RadioInput;