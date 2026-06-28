import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ForgetPasswordLayout from "./ForgetPasswordLayout";
import PasswordInput from "../PasswordInput";
import OTPInput from "../OTPInput";
import PasswordValidation from "./PasswordValidation";
import { forgetStep3Schema } from "../../Schemas/ForgetSchema";
import { usePasswordReset } from "../../../hooks/usePasswordReset";
import { usePasswordValidation } from "../../../hooks/usePasswordValidation";
import { ForgetOne } from "../../../assets/image";
import "./ForegetPassord.css";

const ForgetStep3 = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { verifyAndResetPassword, resendVerificationCode } = usePasswordReset();

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
  const userEmail = localStorage.getItem("USER_EMAIL");
  const { validations } = usePasswordValidation(newPassword);

  const onSubmit = (data) => {
    verifyAndResetPassword({
      email: userEmail,
      otp: data.otp,
      password: data.newPassword,
      confirmPassword: data.confirmPassword,
      shouldLogout: false,
    }).then((result) => {
      if (result.success) {
        reset();
        navigate("/forget-password/success");
      }
    });
  };

  const handleResendOTP = () => {
    resendVerificationCode(userEmail, "F");
  };

  const handleTryAnotherWay = () => {
    navigate("/forget-password");
  };

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
            validations={validations}
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
              <strong>{userEmail}</strong>
            </p>

            <OTPInput
              name="otp"
              control={control}
              error={errors.otp?.message}
              length={6}
              resendText={t(
                "forgetStep3.resendCode",
                "You can request a new code in"
              )}
              resendTimer={45}
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

export default ForgetStep3;