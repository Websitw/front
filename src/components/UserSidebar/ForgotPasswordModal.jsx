import React, { useState, useEffect, useRef } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { MainLogo } from "../../assets/icons";
import CongratulationIcon from "../../assets/userSidebar/Congratulation.svg";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import {
  forgetPasswordSchema,
  forgetStep2Schema,
  forgetStep3Schema,
} from "../Schemas/ForgetSchema";
import {
  verifyOtpForPasswordReset,
  sendForgetPasswordEmail,
  resendOTP,
} from "../../store/slices/forgetPassword";
import RadioInput from "../common/Radioinput";
import FormInput from "../common/FormInput";
import PasswordInput from "../common/PasswordInput";
import PasswordValidation from "../common/ForgetPassword/PasswordValidation";
import OTPInput from "../common/OTPInput";
import { showToast } from "../CustomToast/CustomToast";
import "./ForgotPasswordModal.css";

const ForgotPasswordModal = ({ isOpen, onClose, onBackToLogin }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [step, setStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotTimer, setForgotTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);

  const { loading: forgotPasswordLoading } = useSelector(
    (state) => state.forgetPassword
  );

  // Step 1 form
  const {
    control: step1Control,
    handleSubmit: handleStep1Submit,
    formState: { errors: step1Errors },
  } = useForm({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: { verificationType: "" },
  });

  // Step 2 form
  const {
    control: step2Control,
    handleSubmit: handleStep2Submit,
    formState: { errors: step2Errors },
    reset: resetStep2,
  } = useForm({
    resolver: zodResolver(forgetStep2Schema),
    defaultValues: { email: "" },
  });

  // Step 3 form
  const {
    control: step3Control,
    handleSubmit: handleStep3Submit,
    formState: { errors: step3Errors },
    watch: watchStep3,
    reset: resetStep3,
  } = useForm({
    resolver: zodResolver(forgetStep3Schema),
    defaultValues: { otp: "", newPassword: "", confirmPassword: "" },
  });

  const watchedNewPassword = watchStep3("newPassword") || "";

  const verificationOptions = [
    {
      value: "email",
      label: t("forgetPassword.emailLabel", "Email"),
      displayValue: "m***@email.com",
    },
  ];

  const passwordValidations = [
    {
      key: "minLength",
      label: t("forgetStep3.validation.minLength", "Minimum 8 characters"),
      isValid: watchedNewPassword.length >= 8,
    },
    {
      key: "hasNumber",
      label: t("forgetStep3.validation.hasNumber", "Atleast 1 number (1-9)"),
      isValid: /\d/.test(watchedNewPassword),
    },
    {
      key: "hasLetters",
      label: t("forgetStep3.validation.hasLetters", "Atleast lowercase or uppercase letters"),
      isValid: /[a-zA-Z]/.test(watchedNewPassword),
    },
  ];

  // Timer logic
  useEffect(() => {
    if (step === 3 && forgotTimer > 0) {
      const interval = setInterval(() => {
        setForgotTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, forgotTimer]);

  useEffect(() => {
    if (step === 3) {
      setForgotTimer(45);
      setCanResend(false);
    }
  }, [step]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Step handlers
  const onStep1Submit = handleStep1Submit(() => setStep(2));

  const onStep2Submit = handleStep2Submit(async (data) => {
    try {
      const result = await dispatch(sendForgetPasswordEmail(data.email)).unwrap();

      if (result?.result?.otpkey) {
        localStorage.setItem("OTP_KEY", result.result.otpkey);
      }
      if (result?.result?.restPassToken) {
        localStorage.setItem("RESET_PASS_TOKEN", result.result.restPassToken);
      }

      setForgotEmail(data.email);
      showToast.success(t("Verification code sent to your email"));
      setStep(3);
    } catch (error) {
      showToast.error(error.message || t("Failed to send verification code"));
    }
  });

  const onStep3Submit = handleStep3Submit(async (data) => {
    try {
      await dispatch(
        verifyOtpForPasswordReset({
          email: forgotEmail,
          otp: data.otp,
          password: data.newPassword,
          newPassword: data.confirmPassword,
          restPassToken: localStorage.getItem("RESET_PASS_TOKEN"),
        })
      ).unwrap();

      localStorage.removeItem("OTP_KEY");
      localStorage.removeItem("RESET_PASS_TOKEN");
      localStorage.removeItem("USER_EMAIL");
      setStep(4);
    } catch (error) {
      showToast.error('Invalid or expired otp')
      // showToast.error(error.message || t("Failed to reset password"));
    }
  });

  const handleResendCode = async () => {
    if (!canResend) return;

    try {
      const res = await dispatch(
        resendOTP({ identifier: forgotEmail, otpType: "F" })
      ).unwrap();

      localStorage.setItem("OTP_KEY", res?.result?.otpkey);
      localStorage.setItem("RESET_PASS_TOKEN", res?.result?.restPassToken);
      showToast.success("OTP resent successfully");
      setForgotTimer(45);
      setCanResend(false);
    } catch (error) {
      showToast.error(error?.message || "Failed to resend OTP");
    }

    resetStep3({
      otp: "",
      newPassword: watchedNewPassword,
      confirmPassword: watchStep3("confirmPassword"),
    });
  };

  const handleClose = () => {
    setStep(1);
    setForgotEmail("");
    setForgotTimer(45);
    setCanResend(false);
    resetStep2();
    resetStep3();
    localStorage.removeItem("OTP_KEY");
    localStorage.removeItem("RESET_PASS_TOKEN");
    onClose();
  };

  const handleBackToLoginClick = () => {
    handleClose();
    onBackToLogin();
  };

  return (
    <>
      {/* Step 1: Choose verification method */}
      <div
        className={`forgot-modal-comp ${isOpen && step === 1 ? "forgot-modal-comp--open" : ""}`}
      >
        <div className="forgot-modal-comp__header">
          <MainLogo className="forgot-modal-comp__logo" />
          <button className="forgot-modal-comp__close-btn" onClick={handleClose}>
            <CloseIcon style={{ color: "#151515" }} />
          </button>
        </div>
        <div className="forgot-modal-comp__title-section">
          <h2 className="forgot-modal-comp__title">Forget Password</h2>
        </div>
        <p className="forgot-modal-comp__subtitle">
          Please choose your preferred verification method.
        </p>

        <form onSubmit={onStep1Submit}>
          <div className="forgot-modal-comp__methods">
            <RadioInput
              name="verificationType"
              control={step1Control}
              options={verificationOptions}
              error={step1Errors.verificationType?.message}
              style={{ marginBottom: "0px" }}
            />
          </div>
          <button type="submit" className="forgot-modal-comp__primary-btn">
            Continue to Verify
          </button>
        </form>

        <button
          className="forgot-modal-comp__secondary-btn"
          onClick={handleBackToLoginClick}
        >
          Back to Login
        </button>

        <div className="forgot-modal-comp__footer">
          © Copyright SAWA 2026. All right reserved
        </div>
      </div>

      {/* Step 2: Enter email */}
      <div
        className={`forgot-modal-comp ${isOpen && step === 2 ? "forgot-modal-comp--open" : ""}`}
      >
        <div className="forgot-modal-comp__header">
          <MainLogo className="forgot-modal-comp__logo" />
          <button className="forgot-modal-comp__close-btn" onClick={handleClose}>
            <CloseIcon style={{ color: "#151515" }} />
          </button>
        </div>
        <div className="forgot-modal-comp__title-section">
          <h2 className="forgot-modal-comp__title">Forget Password</h2>
        </div>
        <p className="forgot-modal-comp__subtitle">
          To keep your account secure, please enter your email. We'll send a
          verification code to your email.
        </p>

        <form onSubmit={onStep2Submit}>
          <FormInput
            label={t("forgetStep2.emailLabel", "Email")}
            name="email"
            type="email"
            placeholder={t("forgetStep2.emailPlaceholder", "Your Email")}
            control={step2Control}
            error={step2Errors.email?.message}
            variant="bordered"
            bgColor="var(--color-white)"
            style={{ marginBottom: "0px" }}
            styleLabel={{ marginBottom: "0px", marginTop: "30px" }}
          />
          <button
            type="submit"
            className="forgot-modal-comp__primary-btn"
            disabled={forgotPasswordLoading}
          >
            {forgotPasswordLoading ? "Sending..." : "Send Code"}
          </button>
        </form>

        <button
          className="forgot-modal-comp__secondary-btn"
          onClick={() => setStep(1)}
        >
          Back
        </button>

        <div className="forgot-modal-comp__footer">
          © Copyright SAWA 2026. All right reserved
        </div>
      </div>

      {/* Step 3: Reset password + OTP */}
      <div
        className={`forgot-modal-comp forgot-modal-comp--scrollable ${isOpen && step === 3 ? "forgot-modal-comp--open" : ""}`}
      >
        <div className="forgot-modal-comp__header">
          <MainLogo className="forgot-modal-comp__logo" />
          <button className="forgot-modal-comp__close-btn" onClick={handleClose}>
            <CloseIcon style={{ color: "#151515" }} />
          </button>
        </div>
        <div className="forgot-modal-comp__title-section">
          <h2 className="forgot-modal-comp__title">Reset Password</h2>
        </div>
        <p className="forgot-modal-comp__subtitle">
          Create your new password, so you can login to your account.
        </p>

        <form onSubmit={onStep3Submit}>
          <PasswordInput
            label={t("forgetStep3.newPasswordLabel", "New Password")}
            name="newPassword"
            placeholder={t("forgetStep3.passwordPlaceholder", "Password")}
            control={step3Control}
            error={step3Errors.newPassword?.message}
            variant="bordered"
            bgColor="var(--color-white)"
            style={{ marginBottom: "0px" }}
            styleLabel={{ marginBottom: "0px" }}
          />
          <PasswordValidation
            password={watchedNewPassword}
            validations={passwordValidations}
          />
          <PasswordInput
            label={t("forgetStep3.confirmPasswordLabel", "Confirm Password")}
            name="confirmPassword"
            placeholder={t("forgetStep3.confirmPasswordPlaceholder", "Confirm Password")}
            control={step3Control}
            error={step3Errors.confirmPassword?.message}
            variant="bordered"
            bgColor="var(--color-white)"
            styleLabel={{ marginBottom: "0px", marginTop: "10px" }}
            style={{ marginBottom: "0px" }}
          />

          <div className="forgot-modal-comp__otp-section">
            <p className="forgot-modal-comp__otp-instruction">
              Please enter the code we just sent to your Email{" "}
              <strong>{forgotEmail}</strong>
            </p>

            <OTPInput
              name="otp"
              control={step3Control}
              error={step3Errors.otp?.message}
              length={6}
              style={{ margin: "0px", flexDirection: "column" }}
              resendTimer={45}
            />
            <p className="forgot-modal-comp__resend-text">
              {canResend ? (
                <>
                  Didn't receive code?{" "}
                  <span
                    className="forgot-modal-comp__resend-link"
                    onClick={handleResendCode}
                  >
                    Resend
                  </span>
                </>
              ) : (
                <>
                  You can request a new code in{" "}
                  <span className="forgot-modal-comp__resend-timer">
                    {formatTimer(forgotTimer)}
                  </span>
                </>
              )}
            </p>
          </div>

          <button
            type="submit"
            className="forgot-modal-comp__primary-btn"
            disabled={forgotPasswordLoading}
          >
            {forgotPasswordLoading ? "Validating..." : "Validate"}
          </button>
        </form>

        <button
          className="forgot-modal-comp__secondary-btn"
          onClick={() => {
            setStep(1);
            resetStep3();
          }}
        >
          Try Another Way
        </button>

        <div className="forgot-modal-comp__footer">
          © Copyright SAWA 2026. All right reserved
        </div>
      </div>

      <div
        className={`forgot-modal-comp forgot-modal-comp--success ${isOpen && step === 4 ? "forgot-modal-comp--open" : ""}`}
      >
        <button className="forgot-modal-comp__close-btn" onClick={handleClose}>
          ×
        </button>

        <div className="forgot-modal-comp__success-content">
          <div className="forgot-modal-comp__success-icon">
            <img
              src={CongratulationIcon}
              alt="Success"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
          <h2 className="forgot-modal-comp__success-title">
            Password Changed!
          </h2>
          <p className="forgot-modal-comp__success-text">
            Password changed successfully, you can login again with a new
            password
          </p>
          <button
            className="forgot-modal-comp__success-btn"
            onClick={handleBackToLoginClick}
          >
            Log In
          </button>
        </div>

        <div className="forgot-modal-comp__footer">
          © Copyright SAWA 2026. All right reserved
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordModal;
