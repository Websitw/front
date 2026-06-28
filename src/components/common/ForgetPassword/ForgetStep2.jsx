import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ForgetPasswordLayout from "./ForgetPasswordLayout";
import FormInput from "../FormInput";
import "./ForegetPassord.css";
import { ForgetOne } from "../../../assets/image";
import { useSelector, useDispatch } from "react-redux";
import { sendForgetPasswordEmail } from "../../../store/slices/forgetPassword";
import { forgetStep2Schema } from "../../Schemas/ForgetSchema";
import { showToast } from "../../CustomToast/CustomToast";
import { MainLogo } from "../../../assets/icons";
const ForgetStep2 = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgetStep2Schema),
    defaultValues: {
      email: "",
    },
  });

  const emailValue = watch("email");

  const onSubmit = async (data) => {
    try {
      await dispatch(sendForgetPasswordEmail(data.email))
        .unwrap()
        .then((result) => {
          localStorage.setItem("OTP_KEY", result?.result.otpkey);
          localStorage.setItem(
            "RESET_PASS_TOKEN",
            result?.result.restPassToken
          );
          localStorage.setItem("USER_EMAIL", data.email);
          navigate("/forget-password/step3", { state: { email: data.email } });
        })
        .catch((error) => {
          showToast.error(error?.message || "Failed to send verification code");
          console.error("Error sending forget password email:", error);
        });
    } catch (error) {
      showToast.error(error?.message || "Failed to send verification code");
      console.error("Error sending forget password email:", error);
    }
  };

  const handleBack = () => {
    navigate("/forget-password");
  };

  // Mask email for display
  const getMaskedEmail = (email) => {
    if (!email || !email.includes("@")) return "M****@business.com";
    const [username, domain] = email.split("@");
    const maskedUsername =
      username[0] +
      "****" +
      (username.length > 1 ? username[username.length - 1] : "");
    return `${maskedUsername}@${domain}`;
  };

  return (
    <ForgetPasswordLayout
      backgroundImage={ForgetOne}
      title={t("forgetStep2.backgroundTitle", "Ready To Lead The Region?")}
      subtitle={t(
        "forgetStep2.backgroundSubtitle",
        "Let's Keep Our Core Values Of Trust, Quality, And Accessibility At The Heart Of Every Decision."
      )}
      fullOverlay={false}
      t={t}
    >
      <div 
      >
        <MainLogo/>
        <h1 className="form-title">
          {t("forgetStep2.title", "Forget Password")}
        </h1>
        <p className="form-subtitle">
          {t(
            "forgetStep2.subtitle",
            "To keep your account secure, please enter your email. We'll send a verification code to"
          )}{" "}
          <strong>
            {getMaskedEmail(emailValue || "example@business.com")}
          </strong>
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FormInput
            label={t("forgetStep2.emailLabel", "Email")}
            name="email"
            type="email"
            placeholder={t("forgetStep2.emailPlaceholder", "Your Email")}
            control={control}
            error={errors.email?.message}
            variant="bordered"
            bgColor="var(--color-white)"
          />

          <button
            type="submit"
            className="form-button form-button-primary"
            disabled={isSubmitting}
            style={{ marginTop: "16px" }}
          >
            {t("forgetStep2.sendButton", "Send Verification Code")}
          </button>

          <button
            type="button"
            className="form-button form-button-secondary"
            onClick={handleBack}
          >
            {t("forgetStep2.backButton", "Back")}
          </button>
        </form>

        {/* <div className="form-footer">
          {t('forgetStep2.copyright', '© Copyright SAWA 2026. All right reserved')}
        </div> */}
      </div>
    </ForgetPasswordLayout>
  );
};

export default ForgetStep2;
