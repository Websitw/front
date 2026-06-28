import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { environment } from "../../environments/environment";
import { setCredentials } from "../../store/slices/authSlice";
import "./Otp.css";
import OTPInput from "../common/OTPInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { showToast } from "../CustomToast/CustomToast";
import useLocalStorage from "../../hooks/useLocalStorage";
import { resendOTP } from "../../store/slices/forgetPassword";
const Otp = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [pendingLoginData, setPendingLoginData] = useState(null);
  const [user] = useLocalStorage("userData", null);
  const otpSchema = z.object({
    otp: z.string().length(6, "Please enter the 6-digit code"),
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const handleBack = () => {
    localStorage.removeItem("REG_OTP_TRAIL_ID");
    localStorage.removeItem("OTP_TOKEN");
    localStorage.removeItem("USER_ID");
    localStorage.removeItem("USER_EMAIL");
    navigate("/create-merchant");
  };

  const handleValidate = async (data) => {
    const { otp } = data;
    try {
      const otpTrailId = localStorage.getItem("REG_OTP_TRAIL_ID");
      const accessToken = localStorage.getItem("OTP_TOKEN");
      const platformServerOrigin = `${environment.platformServerOrigin}`;
      const apiUrl = `${platformServerOrigin}v1/_otp/${otpTrailId}/${otp}`;
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      if (data.valid) {
        reset();
        console.log("pendingLoginData:", pendingLoginData);
        // Check if this is a login verification (pending login data exists)
        if (pendingLoginData) {
          // Complete the login flow
          const { token, user } = pendingLoginData;
          localStorage.setItem("token", token);
          localStorage.setItem("userData", JSON.stringify(user));
          localStorage.setItem("userId", user.id);
          localStorage.setItem("xPayId", user.xPayId);
          dispatch(setCredentials({ user, token }));

          // Clear pending login data
          setPendingLoginData(null);

          // Clear OTP data
          localStorage.removeItem("REG_OTP_TRAIL_ID");
          localStorage.removeItem("OTP_TOKEN");
          localStorage.removeItem("USER_ID");
          localStorage.removeItem("USER_EMAIL");

          navigate("/congratulations");
        } else {
          // This is registration verification
          showToast.success("OTP Verified Successfully");
          navigate("/congratulations");
        }
      } else {
        showToast.error("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      showToast.error("Failed to verify OTP. Please try again.");
    }
  };

  const handleResendOTP = () => {
    dispatch(
      resendOTP({
        identifier: localStorage.getItem("USER_EMAIL"),
        otpType: "F",
      }),
    )
      .unwrap()
      .then((res) => {
        localStorage.setItem("REG_OTP_TRAIL_ID", res?.result?.otpkey);
        localStorage.setItem("OTP_TOKEN", res?.result?.restPassToken);
        reset();
        showToast.success("OTP resent successfully");
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to resend OTP");
        console.error("Error resending OTP:", error);
      });
  };

  return (
    <div className="login-wrapper">
      <div className="login-bg">
        <div className="bg-content">
          <h1>Shape your business path</h1>
          <p>
            where your brand grows through dual experiences in wholesale and
            retail.
          </p>
          <div
            style={{
              position: "relative",
              // backgroundColor: "red ",
            }}
          >
            <div className="dots">
              <span className="dot active"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        </div>
      </div>

      <div className="login-card-wrapper">
        <div className="login-card otp-card">
          <h2 className="otp-title">Verify your account</h2>

          <p className="otp-description">
            Please enter the code we just sent to email
          </p>

          <p className="otp-phone">{user?.email}</p>
          <form
            className="form-val-otp"
            onSubmit={handleSubmit(handleValidate)}
          >
            <OTPInput
              name="otp"
              control={control}
              error={errors.otp?.message}
              length={6}
              resendText={t(
                "forgetStep3.resendCode",
                "You can request a new code in",
              )}
              resendTimer={45}
              onResend={handleResendOTP}
              showResend={false}
            />
            {/* <div className="otp-inputs">
            {[0, 1, 2, 3, 4, 5].map((_, i) => (
              <input
                key={i}
                type="text"
                maxLength="1"
                className="otp-input"
              />
            ))}
          </div> */}

            <p style={{ textAlign: "center" }} className="otp-helper">
              Enter the 6 digit code
            </p>

            <button className="otp-validate-btn">Validate</button>
          </form>
          <button className="otp-back-btn" onClick={handleBack}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Otp;
