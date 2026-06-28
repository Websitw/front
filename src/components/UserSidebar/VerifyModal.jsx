import React, { useState, useRef, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useSelector, useDispatch } from "react-redux";

import { useTranslation } from "react-i18next";
import "./VerifyModal.css";
import { setCredentials } from "../../store/slices/authSlice";
import { showToast } from "../CustomToast/CustomToast";
import { MainLogo } from "../../assets/icons";
import { environment } from "../../environments/environment";

const VerifyModal = ({
  isOpen,
  onClose,
  onSuccess,
  onBack,
  pendingLoginData,
  setPendingLoginData,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const inputRefs = useRef([]);
  const { user } = useSelector((state) => state.authRegister);

  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);

      if (value && index < 5) {
        const nextInput = document.getElementById(`verify-otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      const prevInput = document.getElementById(`verify-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otpValues];
    for (let i = 0; i < pastedData.length; i++) {
      if (i < 6) newOtp[i] = pastedData[i];
    }
    setOtpValues(newOtp);
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleValidateOtp = async () => {
    const otpCode = otpValues.join("");
    if (otpCode.length !== 6) {
      showToast.error("Please enter all 6 digits");
      return;
    }

    setIsVerifying(true);
    try {
      const otpTrailId = localStorage.getItem("REG_OTP_TRAIL_ID");
      const accessToken = localStorage.getItem("OTP_TOKEN");
      const apiUrl = `${environment.platformServerOrigin}v1/_otp/${otpTrailId}/${otpCode}`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await response.json();

      if (data.valid) {
        setIsVerifying(false);
        setOtpValues(["", "", "", "", "", ""]);

        if (pendingLoginData) {
          const { token, user } = pendingLoginData;
          localStorage.setItem("token", token);
          localStorage.setItem("userData", JSON.stringify(user));
          localStorage.setItem("userId", user.id);
          localStorage.setItem("xPayId", user.xPayId);
          dispatch(setCredentials({ user, token }));
          window.dispatchEvent(new Event("authStateChanged"));

          setPendingLoginData(null);
          localStorage.removeItem("REG_OTP_TRAIL_ID");
          localStorage.removeItem("OTP_TOKEN");
          localStorage.removeItem("USER_ID");

          onClose();
          showToast.success(t("Login successful! Your account has been verified."));
        } else {
          onClose();
          onSuccess();
        }
      } else {
        setIsVerifying(false);
        showToast.error("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setIsVerifying(false);
      showToast.error("Failed to verify OTP. Please try again.");
    }
  };

  const displayEmail = pendingLoginData
    ? pendingLoginData.user.email
    : user?.user?.email;

  return (
    <div className={`verify-modal-comp ${isOpen ? "verify-modal-comp--open" : ""}`}>
      <div className="verify-modal-comp__header">
        <MainLogo className="verify-modal-comp__logo" />
        <button
          className="verify-modal-comp__close-btn"
          onClick={() => {
            onClose();
            setPendingLoginData(null);
          }}
        >
          <CloseIcon style={{ color: "#151515" }} />
        </button>
      </div>

      <h2 className="verify-modal-comp__title">Verify your account</h2>
      <p className="verify-modal-comp__subtitle">
        Please enter the code we just sent to your Email
        <br />
        <strong>{displayEmail}</strong>
      </p>

      <div className="verify-modal-comp__otp-container">
        {otpValues.map((value, index) => (
          <input
            key={index}
            id={`verify-otp-${index}`}
            type="text"
            ref={(el) => (inputRefs.current[index] = el)}
            onPaste={handlePaste}
            maxLength="1"
            className="verify-modal-comp__otp-input"
            value={value}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
          />
        ))}
      </div>

      <p className="verify-modal-comp__helper-text">Enter the 6 digit code</p>
      <p className="verify-modal-comp__resend-text">
        You can request a new code in{" "}
        <span className="verify-modal-comp__resend-timer">0:45</span>
      </p>

      <button
        className="verify-modal-comp__validate-btn"
        onClick={handleValidateOtp}
        disabled={isVerifying}
      >
        {isVerifying ? "Verifying..." : "Validate"}
      </button>

      <button
        className="verify-modal-comp__back-btn"
        onClick={() => {
          setOtpValues(["", "", "", "", "", ""]);
          onBack();
        }}
      >
        Back
      </button>

      <div className="verify-modal-comp__footer">
        © Copyright SAWA 2026. All right reserved
      </div>
    </div>
  );
};

export default VerifyModal;
