import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  sendForgetPasswordEmail,
  verifyOtpForPasswordReset,
  resendOTP,
} from "../store/slices/forgetPassword";
import { showToast } from "../components/CustomToast/CustomToast";
import { logout } from "../store/slices/authSlice";

export const usePasswordReset = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const sendVerificationCode = (email) => {
    setIsLoading(true);
    
    return dispatch(sendForgetPasswordEmail(email))
      .unwrap()
      .then((result) => {
        localStorage.setItem("OTP_KEY", result?.result.otpkey);
        localStorage.setItem("RESET_PASS_TOKEN", result?.result.restPassToken);
        localStorage.setItem("USER_EMAIL", email);
        
        showToast.success("Verification code sent to your email");
        return { success: true, data: result };
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to send verification code");
        console.error("Error sending verification code:", error);
        return { success: false, error };
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const verifyAndResetPassword = ({ email, otp, password, confirmPassword, shouldLogout = false }) => {
    setIsLoading(true);
    
    return dispatch(
      verifyOtpForPasswordReset({
        email,
        otp,
        password,
        newPassword: confirmPassword,
      })
    )
      .unwrap()
      .then(() => {
        localStorage.removeItem("OTP_KEY");
        localStorage.removeItem("RESET_PASS_TOKEN");
        localStorage.removeItem("USER_EMAIL");

        if (shouldLogout) {
          dispatch(logout());
          showToast.success("Password updated successfully. Please log in again.");
          setTimeout(() => navigate("/"), 10);
        } else {
          showToast.success("Password reset successfully");
        }

        return { success: true };
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to reset password");
        console.error("Error resetting password:", error);
        return { success: false, error };
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const resendVerificationCode = (email, otpType = "F") => {
    setIsLoading(true);
    
    return dispatch(resendOTP({ identifier: email, otpType }))
      .unwrap()
      .then((result) => {
        localStorage.setItem("OTP_KEY", result?.result?.otpkey);
        localStorage.setItem("RESET_PASS_TOKEN", result?.result?.restPassToken);
        
        showToast.success("OTP resent successfully");
        return { success: true, data: result };
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to resend OTP");
        console.error("Error resending OTP:", error);
        return { success: false, error };
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return {
    sendVerificationCode,
    verifyAndResetPassword,
    resendVerificationCode,
    isLoading,
  };
};