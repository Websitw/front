import React, { useState } from "react";
import { Controller } from "react-hook-form";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import "./FormComponents.css";

const PhoneNumber = ({
  label,
  name,
  placeholder = "Phone Number",
  required = false,
  disabled = false,
  className = "",
  control,
  error,
  style={},
}) => {
  const phoneCodes = [
    { code: "+962", flag: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Flag_of_Jordan.svg" },
    { code: "+966", flag: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Flag_of_Saudi_Arabia.svg" },
    { code: "+971", flag: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Flag_of_the_United_Arab_Emirates.svg" },
  ];

  const [codeOpen, setCodeOpen] = useState(false);
  const [phoneCode, setPhoneCode] = useState(phoneCodes[0]);

  return (
    <div style={{
      margin:'20px 0'
    }} className={`formGroup ${className}`}>
      {label && (
        <label>
          {label}
          {required && <span className="form-required">*</span>}
        </label>
      )}

      <div style={style} className={`phone-wrapper ${error ? "input-error" : ""}`}>
    
        <div
          className="phone-code"
          onClick={() => setCodeOpen(!codeOpen)}
        >
          <img src={phoneCode.flag} alt="" />
          <span>{phoneCode.code}</span>
          <KeyboardArrowDownIcon fontSize="small" />
        </div>

        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="tel"
              placeholder={placeholder}
              disabled={disabled}
              
            />
          )}
        />
      </div>

      {codeOpen && (
        <div className="dropdown phone-dropdown">
          {phoneCodes.map((c) => (
            <div
              key={c.code}
              className="dropdown-item"
              onClick={() => {
                setPhoneCode(c);
                setCodeOpen(false);
              }}
            >
              <img src={c.flag} alt="" />
              <span>{c.code}</span>
            </div>
          ))}
        </div>
      )}

      {error && <span
      style={{
        marginTop:'10px'
      }}
      className="form-error-message">{error}</span>}
    </div>
  );
};

export default PhoneNumber;
