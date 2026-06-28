import React, { useState, useRef } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelector, useDispatch } from "react-redux";

import FormInput from "../common/FormInput";
import PasswordInput from "../common/PasswordInput";
import PhoneInput from "../common/FormPhoneInput";
import FormCheckbox from "../common/Formcheckbox";
import CountrySelect from "../common/CountrySelect";
import FormSelect from "../common/FormSelect";
import RadioInput from "../common/Radioinput";
import "./RegisterModal.css";
import { RegisterSchema } from "../Schemas/RegsiterSchema";
import { AdditionalInfoSchema } from "../Schemas/AdditionalInfoSchema";
import { additionalInfo, registerUser } from "../../store/slices/authReducer";
import { MainLogo } from "../../assets/icons";
import { genderOptions } from "../../constants/options";
import { showToast } from "../CustomToast/CustomToast";
import { addXPayAccount } from "../../store/slices/paymentSlice";
import { environment } from "../../environments/environment";
const RegisterModal = ({ isOpen, onClose, onOpenVerify }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const registerFormRef = useRef(null);
  let scrollTimeout = null;

  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState(false);

  const handleApply = () => {
    if (code.trim() === "") {
      setError(true);
      setApplied(false);
      return;
    }
    setError(false);
    setApplied(true);
  };

  const handleChange = (e) => {
    setCode(e.target.value);
    if (applied) setApplied(false);
    if (error) setError(false);
  };

  const { allCountriesList } = useSelector((state) => state.countries);

  const validCountries = allCountriesList.filter(
    (country) =>
      country.countryCodeNumeric !== undefined &&
      country.countryCodeNumeric !== null,
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      country: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const {
    control: additionalInfoControl,
    trigger: triggerAdditionalInfo,
    getValues: getAdditionalInfoValues,
    formState: { errors: additionalInfoErrors },
    reset: resetAdditionalInfo,
  } = useForm({
    resolver: zodResolver(AdditionalInfoSchema),
    mode: "onChange",
    defaultValues: {
      gender: "",
      startDay: "",
      startMonth: "",
      startYear: "",
    },
  });

  const days = Array.from({ length: 31 }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
  }));

  const months = [
    { value: "1", label: t("merchant.completeProfile.months.january") },
    { value: "2", label: t("merchant.completeProfile.months.february") },
    { value: "3", label: t("merchant.completeProfile.months.march") },
    { value: "4", label: t("merchant.completeProfile.months.april") },
    { value: "5", label: t("merchant.completeProfile.months.may") },
    { value: "6", label: t("merchant.completeProfile.months.june") },
    { value: "7", label: t("merchant.completeProfile.months.july") },
    { value: "8", label: t("merchant.completeProfile.months.august") },
    { value: "9", label: t("merchant.completeProfile.months.september") },
    { value: "10", label: t("merchant.completeProfile.months.october") },
    { value: "11", label: t("merchant.completeProfile.months.november") },
    { value: "12", label: t("merchant.completeProfile.months.december") },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
  }));

  const handleRegisterSubmit = async (data) => {
    const isAdditionalInfoValid = await triggerAdditionalInfo();
    if (!isAdditionalInfoValid) return;

    const { gender, startDay, startMonth, startYear } =
      getAdditionalInfoValues();
    const birthdate = `${startYear}-${startMonth.padStart(2, "0")}-${startDay.padStart(2, "0")}`;

    try {
      const formData = {
        appid: environment.appid,
        provider: "password",
        customerType: 1,
        onBoardingType: 1,
        programCode: "customer",
        vipFlag: 0,
        kycStatus: 0,
        kycRemark: "",
        picture: "base46",
        regMobileISDNCode: data.country,
        regMobileNumber: `${data.phoneNumber}`,
        verType: "otp",
        verWay: "E",
        languagePreference: "en",
        name: `${data.firstName} ${data.lastName}`,
        token: `${data.email}::${data.password}`,
        countryCode: parseInt(data.country),
      };

      const result = await dispatch(registerUser(formData)).unwrap();

      console.log("Registration result:", result);
      const xpayAccount = {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        currency: "JOD",
        country: "JO",
        city: "Amman",
        address: "Amman",
        phone: data.phoneNumber,
      };
      const token = result.jwt.access_token;
      dispatch(addXPayAccount({ xpayAccount, token })).unwrap();

      localStorage.setItem("REG_OTP_TRAIL_ID", result.otpTrail.id);
      localStorage.setItem("OTP_TOKEN", result.jwt.access_token);
      localStorage.setItem("USER_ID", result.user.id);


      dispatch(
        additionalInfo({
          profileData: {
            userId: result.user.id,
            birthdate,
            gender: gender?.toUpperCase(),
            name: `${data.firstName} ${data.lastName}`,
          },
        }),
      ).unwrap()

      onClose();
      onOpenVerify();
      reset();
      resetAdditionalInfo();
    } catch (error) {
      showToast.error(error.message || t("dashboard.error"));
    }
  };

  const handleFormScroll = () => {
    const form = registerFormRef.current;
    if (form) {
      form.classList.add("register-modal-comp__form--scrolling");
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        form.classList.remove("register-modal-comp__form--scrolling");
      }, 1000);
    }
  };

  const hasBirthdayError =
    additionalInfoErrors.startDay?.message ||
    additionalInfoErrors.startMonth?.message ||
    additionalInfoErrors.startYear?.message;

  return (
    <div
      className={`register-modal-comp ${isOpen ? "register-modal-comp--open" : ""}`}
    >
      <div className="register-modal-comp__header">
        <MainLogo className="register-modal-comp__logo" />
        <button className="register-modal-comp__close-btn" onClick={onClose}>
          <CloseIcon style={{ color: "#151515" }} />
        </button>
      </div>

      <div className="register-modal-comp__title-section">
        <h2 className="register-modal-comp__title">Create an SAWA account</h2>
      </div>

      <p className="register-modal-comp__subtitle">
        From your profile, you will find all info linked or connected to your
        account. And it's free to join!
      </p>

      <form
        className="register-modal-comp__form"
        ref={registerFormRef}
        onScroll={handleFormScroll}
        onSubmit={(e) => {
          e.preventDefault();
          triggerAdditionalInfo();
          handleSubmit(handleRegisterSubmit)(e);
        }}
      >
        <FormInput
          label={t("user.form.firstName")}
          name="firstName"
          placeholder={t("user.form.firstNamePlaceholder")}
          control={control}
          error={t(errors.firstName?.message)}
          bgColor="var(--color-white)"
          styleLabel={{ marginTop: "10px", marginBottom: "0px" }}
        />
        <FormInput
          label={t("user.form.lastName")}
          name="lastName"
          placeholder={t("user.form.lastNamePlaceholder")}
          control={control}
          error={t(errors.lastName?.message)}
          bgColor="var(--color-white)"
          styleLabel={{ marginTop: "10px", marginBottom: "0px" }}
        />
        <FormInput
          label={t("user.form.email")}
          name="email"
          // type="email"
          placeholder={t("user.form.emailPlaceholder")}
          control={control}
          error={t(errors.email?.message)}
          bgColor="var(--color-white)"
          styleLabel={{ marginTop: "10px", marginBottom: "0px" }}
        />
        <CountrySelect
          label={t("user.form.country")}
          name="country"
          control={control}
          error={t(errors.country?.message)}
          bgColor="var(--color-white)"
          valueKey="countryCodeNumeric"
          variant="bordered"
          options={validCountries}
          styleLabel={{ marginBottom: "0px", marginTop: "10px" }}
        />

        <span className="register-modal-comp__section-label">Birthday</span>
        {hasBirthdayError && (
          <span
            className="register-modal-comp__error"
            style={{ marginTop: "10px" }}
          >
            {additionalInfoErrors.startYear?.message ===
            "you must be at least 18 years old"
              ? additionalInfoErrors.startYear.message
              : "the birth date is required"}
          </span>
        )}
        <div className="date-select-group">
          <FormSelect
            name="startDay"
            placeholder={t("merchant.completeProfile.placeholders.day")}
            options={days}
            control={additionalInfoControl}
            className="user-sidebar-birthday"
            variant="bordered"
            style={{ padding: "10px 15px" }}
            bgColor="var(--color-white)"
            styleLabel={{ marginTop: "0px", marginBottom: "0px" }}
          />
          <FormSelect
            name="startMonth"
            placeholder={t("merchant.completeProfile.placeholders.month")}
            options={months}
            control={additionalInfoControl}
            className="date-select"
            variant="bordered"
            style={{ padding: "10px 15px" }}
            bgColor="var(--color-white)"
            styleLabel={{ marginBottom: "0px" }}
          />
          <FormSelect
            name="startYear"
            placeholder={t("merchant.completeProfile.placeholders.year")}
            options={years}
            control={additionalInfoControl}
            className="date-select"
            variant="bordered"
            style={{ padding: "10px 15px", borderRadius: "5px" }}
            bgColor="var(--color-white)"
            styleLabel={{ marginBottom: "0px" }}
          />
        </div>

        <span className="register-modal-comp__section-label">Gender</span>
        <RadioInput
          name="gender"
          control={additionalInfoControl}
          options={genderOptions}
          error={additionalInfoErrors.gender?.message}
          style={{ margin: "0px" }}
          styleRadioOptions={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            gap: "5rem",
          }}
          styleRadioOption={{
            border: "none",
            padding: "0px",
            background: "transparent",
            maxWidth: "57px",
          }}
          styleRadio={{ maxWidth: "14px", maxHeight: "14px" }}
        />

        <PhoneInput
          label={t("user.form.phoneNumber")}
          name="phoneNumber"
          placeholder={t("user.form.phoneNumberPlaceholder")}
          control={control}
          error={t(errors.phoneNumber?.message)}
          styleLabel={{ marginTop: "10px", marginBottom: "0px" }}
          bgColor="var(--color-white)"
          style={{ marginTop: "10px" }}
        />
        <PasswordInput
          label={t("user.form.password")}
          name="password"
          placeholder={t("user.form.passwordPlaceholder")}
          control={control}
          error={t(errors.password?.message)}
          bgColor="var(--color-white)"
          styleLabel={{ marginBottom: "0px", marginTop: "10px" }}
        />
        <PasswordInput
          label={t("user.form.confirmPassword")}
          name="confirmPassword"
          placeholder={t("user.form.confirmPasswordPlaceholder")}
          control={control}
          error={t(errors.confirmPassword?.message)}
          bgColor="var(--color-white)"
          styleLabel={{ marginBottom: "0px", marginTop: "10px" }}
        />

        {/*  start  */}

        <div className="invitation-wrapper">
          <label className="invitation-label">
            Have an invitation code?{" "}
            <span className="invitation-optional">(Optional)</span>
          </label>

          <div className="invitation-input-row">
            <input
              type="text"
              className="invitation-input"
              placeholder="Enter invitation code"
              value={code}
              onChange={handleChange}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
            />

            {/* onClick={handleApply} */}
            <button className="invitation-apply-btn">Apply</button>
          </div>

          {!applied && !error && (
            <p className="invitation-hint">
              You'll receive 500 points after signing up
            </p>
          )}
          {applied && (
            <p className="invitation-hint invitation-hint--success">
              ✓ Invitation code applied successfully!
            </p>
          )}
          {error && (
            <p className="invitation-hint invitation-hint--error">
              Please enter a valid invitation code.
            </p>
          )}
        </div>

        {/* end */}
        <div className="register-modal-comp__terms">
          <FormCheckbox
            name="terms"
            width={14}
            height={14}
            style={{ marginTop: "6px" }}
            label={
              <label htmlFor="terms">
                By ticking, you are confirming that you have read and agree to
                SAWA <a href="#">terms and conditions</a>
              </label>
            }
            control={control}
            error={t(errors.terms?.message)}
          />
        </div>

        <button
          type="submit"
          className={`register-modal-comp__submit-btn ${isSubmitting ? "register-modal-comp__submit-btn--loading" : ""}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </button>
      </form>
    </div>
  );
};

export default RegisterModal;
