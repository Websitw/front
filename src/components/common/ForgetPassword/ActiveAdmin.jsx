import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import ForgetPasswordLayout from "./ForgetPasswordLayout";
import PasswordInput from "../PasswordInput";
import OTPInput from "../OTPInput";
import PasswordValidation from "./PasswordValidation";
import "./ForegetPassord.css";
import { ForgetOne } from "../../../assets/image";
import {
  activeAdminUser,
  resendOTP,
} from "../../../store/slices/forgetPassword";
import { useDispatch, useSelector } from "react-redux";
import { forgetStep3Schema } from "../../Schemas/ForgetSchema";
import { showToast } from "../../CustomToast/CustomToast";

const ActiveAdmin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const [currentVToken, setCurrentVToken] = useState("");
  const [currentOtpKey, setCurrentOtpKey] = useState("");

  const identifier = searchParams.get("identifier")?.split("?")[0];
  const urlOtpKey = searchParams.get("id");
  const urlVToken = searchParams.get("ver");
  const appParam = searchParams.get("app");

  useEffect(() => {
    if (urlOtpKey) {
      setCurrentOtpKey(urlOtpKey);
      localStorage.setItem("OTP_KEY", urlOtpKey);
    } else {
      const storedOtpKey = localStorage.getItem("OTP_KEY");
      if (storedOtpKey) {
        setCurrentOtpKey(storedOtpKey);
      }
    }
    if (urlVToken) {
      setCurrentVToken(urlVToken);
      localStorage.setItem("RESET_PASS_TOKEN", urlVToken);
    } else {
      const storedVToken = localStorage.getItem("RESET_PASS_TOKEN");
      if (storedVToken) {
        setCurrentVToken(storedVToken);
      }
    }

    if (identifier) {
      localStorage.setItem("RESET_IDENTIFIER", identifier);
    }
  }, [urlOtpKey, urlVToken, identifier]);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgetStep3Schema),
    defaultValues: {
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const newPassword = watch("newPassword");

  const onSubmit = async (data) => {
    if (!identifier || !currentOtpKey || !currentVToken) {
      showToast.error(
        "Missing required parameters. Please use the link from your email."
      );
      return;
    }

    try {
      await dispatch(
        activeAdminUser({
          identifier: identifier,
          otp: data.otp,
          password: data.newPassword,
          newPassword: data.confirmPassword,
          vToken: currentVToken,
          otpKey: currentOtpKey,
        })
      )
        .unwrap()
        .then(() => {
          localStorage.removeItem("OTP_KEY");
          localStorage.removeItem("RESET_PASS_TOKEN");
          localStorage.removeItem("RESET_IDENTIFIER");
          
          reset();
          navigate("/forget-password/success");
        })
        .catch((error) => {
          showToast.error(error?.message || "Failed to reset password");
          console.error("Error resetting password:", error);
        });
    } catch (e) {
      console.error("Unexpected error:", e);
      showToast.error(e?.message || "An unexpected error occurred");
    }
  };

  const handleResendOTP = () => {
    dispatch(
      resendOTP({
        identifier: identifier,
        otpType: "V",
      })
    )
      .unwrap()
      .then((res) => {
        if (res?.result?.otpkey) {
          setCurrentOtpKey(res.result.otpkey);
          localStorage.setItem("OTP_KEY", res.result.otpkey);
        }
        
        if (res?.result?.restPassToken) {
          setCurrentVToken(res.result.restPassToken);
          localStorage.setItem("RESET_PASS_TOKEN", res.result.restPassToken);
        }
        
        showToast.success("OTP resent successfully");
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to resend OTP");
        console.error("Error resending OTP:", error);
      });
  };

  const handleTryAnotherWay = () => {
    localStorage.removeItem("OTP_KEY");
    localStorage.removeItem("RESET_PASS_TOKEN");
    localStorage.removeItem("RESET_IDENTIFIER");
    
    navigate("/forget-password");
  };

  const passwordValidations = [
    {
      key: "minLength",
      label: t("forgetStep3.validation.minLength", "Minimum 8 characters"),
      isValid: newPassword.length >= 8,
    },
    {
      key: "hasNumber",
      label: t("forgetStep3.validation.hasNumber", "Atleast 1 number (1-9)"),
      isValid: /\d/.test(newPassword),
    },
    {
      key: "hasLetters",
      label: t(
        "forgetStep3.validation.hasLetters",
        "Atleast lowercase or uppercase letters"
      ),
      isValid: /[a-zA-Z]/.test(newPassword),
    },
  ];

  if (!identifier || !urlOtpKey || !urlVToken) {
    return (
      <ForgetPasswordLayout
        backgroundImage={ForgetOne}
        title={t("forgetStep3.backgroundTitle", "Ready To Lead The Region?")}
        subtitle={t(
          "forgetStep3.backgroundSubtitle",
          "Let's Keep Our Core Values Of Trust, Quality, And Accessibility At The Heart Of Every Decision."
        )}
        fullOverlay={true}
        t={t}
      >
        <div>
          <h1 className="form-title">
            {t("forgetStep3.invalidLink", "Invalid Link")}
          </h1>
          <p className="form-subtitle">
            {t(
              "forgetStep3.invalidLinkMessage",
              "This link is invalid or has expired. Please contact support or try again."
            )}
          </p>
          <button
            type="button"
            className="form-button form-button-primary"
            onClick={() => {
              localStorage.removeItem("OTP_KEY");
              localStorage.removeItem("RESET_PASS_TOKEN");
              localStorage.removeItem("RESET_IDENTIFIER");
              navigate("/admin");
            }}
          >
            {t("forgetStep3.backToForgetPassword", "Back to Login")}
          </button>
        </div>
      </ForgetPasswordLayout>
    );
  }

  return (
    <ForgetPasswordLayout
      backgroundImage={ForgetOne}
      title={t("forgetStep3.backgroundTitle", "Ready To Lead The Region?")}
      subtitle={t(
        "forgetStep3.backgroundSubtitle",
        "Let's Keep Our Core Values Of Trust, Quality, And Accessibility At The Heart Of Every Decision."
      )}
      fullOverlay={true}
      t={t}
    >
      <div>
        <h1 className="form-title">
          {t("forgetStep3.title", "Reset Password")}
        </h1>
        <p className="form-subtitle">
          {t(
            "forgetStep3.subtitle",
            "Create your new password, so you can login to your account."
          )}
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <PasswordInput
            label={t("forgetStep3.newPasswordLabel", "New Password")}
            name="newPassword"
            placeholder={t("forgetStep3.passwordPlaceholder", "Password")}
            control={control}
            error={errors.newPassword?.message}
            variant="bordered"
            bgColor="var(--color-white)"
          />

          <PasswordValidation
            password={newPassword}
            validations={passwordValidations}
          />

          <PasswordInput
            label={t("forgetStep3.confirmPasswordLabel", "Confirm Password")}
            name="confirmPassword"
            placeholder={t(
              "forgetStep3.confirmPasswordPlaceholder",
              "Confirm Password"
            )}
            control={control}
            error={errors.confirmPassword?.message}
            variant="bordered"
            bgColor="var(--color-white)"
            styleLabel={{ marginTop: "16px" }}
          />

          <div style={{ marginTop: "24px" }}>
            <p
              style={{
                textAlign: "center",
                fontSize: "14px",
                color: "#757575",
                marginBottom: "12px",
              }}
            >
              {t(
                "forgetStep3.otpMessage",
                "Please enter the code we just sent to your Email"
              )}{" "}
              {/* <strong>{identifier}</strong> */}
            </p>

            <OTPInput
              name="otp"
              control={control}
              error={errors.otp?.message}
              length={6}
              resendText={t("forgetStep3.resendCode", "Resend Code")}
              resendTimer={2}
              onResend={handleResendOTP}
            />
          </div>

          <button
            type="submit"
            className="form-button form-button-primary"
            disabled={isSubmitting}
          >
            {t("forgetStep3.resetButton", "Reset Password")}
          </button>

          <button
            type="button"
            className="form-button form-button-secondary"
            onClick={handleTryAnotherWay}
          >
            {t("forgetStep3.tryAnotherWay", "Try Another Way")}
          </button>
        </form>
      </div>
    </ForgetPasswordLayout>
  );
};

export default ActiveAdmin;