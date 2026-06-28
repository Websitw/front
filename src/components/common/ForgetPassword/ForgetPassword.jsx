import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ForgetPasswordLayout from "./ForgetPasswordLayout";
import RadioInput from "../Radioinput";
import "./ForegetPassord.css";
import { forgetPasswordSchema } from "../../Schemas/ForgetSchema";
import { ForgetOne } from "../../../assets/image";
import { MainLogo } from "../../../assets/icons";

const ForgetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: {
      verificationType: "email",
    },
  });

  const verificationOptions = [
    {
      value: "email",
      label: t("forgetPassword.emailLabel", "Email"),
      displayValue: "m***@email.com",
    },
    {
      value: "phone",
      label: t("forgetPassword.phoneLabel", "Phone"),
      displayValue: "***225",
    },
  ];

  const onSubmit = async (data) => {
    console.log("Form submitted:", data);
    // Navigate to step 2
    navigate("/forget-password/step2", {
      state: { verificationType: data.verificationType },
    });
  };

  const handleBackToLogin = () => {
    navigate("/admin");
  };

  return (
    <ForgetPasswordLayout
      backgroundImage={ForgetOne}
      title={t("forgetPassword.backgroundTitle", "Ready To Lead The Region?")}
      subtitle={t(
        "forgetPassword.backgroundSubtitle",
        "Let's Keep Our Core Values Of Trust, Quality, And Accessibility At The Heart Of Every Decision."
      )}
      fullOverlay={false}
      t={t}
    >
      <div
        className="forget-one"
        style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}
      >
        <div style={{ flex: 1 }}>
          <MainLogo />
          <h1 className="form-title">
            {t("forgetPassword.title", "Forget Password")}
          </h1>
          <p className="form-subtitle">
            {t(
              "forgetPassword.subtitle",
              "Please choose your preferred verification method."
            )}
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <RadioInput
              name="verificationType"
              control={control}
              options={verificationOptions}
              error={errors.verificationType?.message}
            />
            <div className="form-actions-forget">
              <button
                type="submit"
                className="form-button form-button-primary"
                disabled={isSubmitting}
              >
                {t("forgetPassword.continueButton", "Continue to Verify")}
              </button>

              <button
                type="button"
                className="form-button form-button-secondary"
                onClick={handleBackToLogin}
              >
                {t("forgetPassword.backButton", "Back to Login")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ForgetPasswordLayout>
  );
};

export default ForgetPassword;
