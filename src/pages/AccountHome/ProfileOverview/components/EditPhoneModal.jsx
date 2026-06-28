import React, { useState, useEffect } from "react";
import axios from "axios";
import { environment } from "../../../../environments/environment";
import { X, ChevronDown } from "lucide-react";

const EditPhoneModal = ({ isOpen, onClose, userData, onSave }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("User data in EditPhoneModal:", userData);
    if (isOpen && userData.regMobileNumber) {
      setPhoneNumber(userData.regMobileNumber);
      setError(""); // Clear error when modal opens
    }
  }, [isOpen, userData]);

  const validatePhoneNumber = (number) => {
    // Remove any non-digit characters
    const digitsOnly = number.replace(/\D/g, "");

    if (digitsOnly.length === 0) {
      return "Phone number is required";
    }

    if (digitsOnly.length !== 10) {
      return "Phone number must be 10 digits";
    }

    return "";
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);

    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const handleSave = async () => {
    // Validate phone number
    const validationError = validatePhoneNumber(phoneNumber);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: userData.name,
        email: userData.email,
        mobileNo: phoneNumber,
        picture: userData.picture,
        regMobileISDNCode: userData.regMobileISDNCode,
        regMobileNumber: phoneNumber,
        languagePreference: userData.languagePreference,
      };

      const response = await axios.patch(`${environment.serverOrigin}profile`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedUser = {
        ...userData,
        regMobileNumber: phoneNumber,
        mobileNo: phoneNumber
      };

      const currentUserData = JSON.parse(localStorage.getItem("userData") || "{}");
      const mergedData = { ...currentUserData, ...updatedUser };
      localStorage.setItem("userData", JSON.stringify(mergedData));

      onSave(mergedData);
      onClose();

      setPhoneNumber("");
      setError("");
    } catch (error) {
      console.error("Update failed", error);
      setError("Failed to update phone number. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-mobile" onClick={onClose}>
      <div className="modal-container-mobile" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Phone Number</h3>
          <X className="close-icon" onClick={onClose} />
        </div>

        <div className="modal-body">
          <label>Phone Number</label>
          <div className="phone-input modal-input">
            <div className="country-code">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Flag_of_Jordan.svg/960px-Flag_of_Jordan.svg.png" alt="JO" className="flag" />
              <span className="code">+962</span>
              <ChevronDown className="dropdown-icon" />
            </div>
            <input
              type="text"
              value={phoneNumber}
              onChange={handlePhoneChange}
              className="phone-field"
              maxLength="10"
            />
          </div>
          {error && <div style={{
            fontSize:"14px",
            color:"#b91c1c",
            marginTop:"8px"
          }}>{error}</div>}
        </div>

        <div className="modal-footer">
        <button className="save-btn" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPhoneModal;