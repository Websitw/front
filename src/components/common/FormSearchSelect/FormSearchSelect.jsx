import React from "react";
import { Controller } from "react-hook-form";
import { Autocomplete, TextField } from "@mui/material";
import { ChevronDown } from "lucide-react";
import "./FormSearchSelect.css";
import "../FormComponents.css";

const FormSearchSelect = ({
  label,
  name,
  options = [],
  required = false,
  disabled = false,
  placeholder = "Select an option",
  className = "",
  variant = "borderless",
  bgColor,
  control,
  error,
  style = {},
  styleLabel = {},
  showInfoIcon = false,
  InfoIcon = null,
}) => {
  const variantClass = `form-search-select-${variant}`;
  const errorClass = error ? "form-search-select-error" : "";

  return (
    <div className={`form-group ${className}`}>
      {!showInfoIcon && (
        <label htmlFor={name} className="form-label" style={styleLabel}>
          {label}
          {required && <span className="form-required">*</span>}
        </label>
      )}

      {showInfoIcon && InfoIcon && (
        <div className="label-with-icon flex-center-row">
          <label htmlFor={name} className="form-label" style={styleLabel}>
            {label}
            {required && <span className="form-required">*</span>}
          </label>
          <InfoIcon className="info-icon" size={16} />
        </div>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div
            className={`form-search-select-wrapper ${variantClass} ${errorClass}`}
          >
            <Autocomplete
              id={name}
              options={options}
              getOptionLabel={(option) =>
                typeof option === "string"
                  ? options.find((o) => o.value === option)?.label || ""
                  : option.label || ""
              }
              value={options.find((o) => o.value === field.value) || null}
              onChange={(_, newValue) => {
                field.onChange(newValue ? newValue.value : "");
              }}
              disabled={disabled}
              popupIcon={
                <ChevronDown size={20} color="var(--color-gray-300)" />
              }
              isOptionEqualToValue={(option, value) =>
                option.value === value?.value
              }
              noOptionsText="No results found"
              slotProps={{
                paper: {
                  className: "form-search-select-dropdown",
                },
              }}
              sx={
                bgColor
                  ? {
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: bgColor,
                        ...style,
                      },
                    }
                  : style && Object.keys(style).length
                    ? {
                        "& .MuiOutlinedInput-root": {
                          ...style,
                        },
                      }
                    : undefined
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={placeholder}
                  aria-invalid={error ? "true" : "false"}
                  aria-describedby={error ? `${name}-error` : undefined}
                />
              )}
            />
          </div>
        )}
      />

      {error && (
        <span id={`${name}-error`} className="form-error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default FormSearchSelect;