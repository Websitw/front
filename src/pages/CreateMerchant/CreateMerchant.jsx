import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { environment } from "../../environments/environment";
import { setCredentials } from "../../store/slices/authSlice";
import Loading from "../../components/Loading/Loading";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import "./CreateMerchant.css";
import FormInput from "../../components/common/FormInput";
import CountrySelect from "../../components/common/CountrySelect";
import PhoneInput from "../../components/common/PhoneNumber";
import PasswordInput from "../../components/common/PasswordInput";
import { fetchCountriesListAnonymous } from "../../store/slices/counteriesSlice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema } from "../../components/Schemas/RegsiterSchema";
import FormCheckbox from "../../components/common/Formcheckbox";
import { registerUser } from "../../store/slices/authReducer";
import { showToast } from "../../components/CustomToast/CustomToast";
const CreateMerchant = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { allCountriesList } = useSelector((state) => state.countries);

  // Filter countries to only include those with valid countryCodeNumeric
  const validCountries = allCountriesList.filter(
    (country) => country.countryCodeNumeric !== undefined && country.countryCodeNumeric !== null
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      country: null,
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });


  const handleRegisterSubmit = async (data) => {
    try {
      console.log("Registration data:", data);
      const formData = {
        appid: environment.appid,
        provider: "password",
        customerType: 1,
        onBoardingType: 1,
        programCode: `merchant`,
        vipFlag: 0,
        kycStatus: 0,
        kycRemark: "",
        picture: "base46",
        regMobileISDNCode: data.country,
        regMobileNumber: `${data.country} ${data.phoneNumber}`,
        verType: "otp",
        verWay: "E",
        languagePreference: "en",
        name: `${data.firstName} ${data.lastName}`,
        token: `${data.email}::${data.password}`,
        countryCode: data.countryCodeNumeric,
      };
      
      await dispatch(registerUser(formData))
        .unwrap()
        .then((result) => {
          // Store OTP data BEFORE navigation
          localStorage.setItem("REG_OTP_TRAIL_ID", result.otpTrail.id);
          localStorage.setItem("OTP_TOKEN", result.jwt.access_token);
          localStorage.setItem("USER_ID", result.user.id);
          localStorage.setItem("USER_EMAIL", data.email);
          navigate("/validate-otp");
        })
        .catch((error) => {
          showToast.error(error.message || t("dashboard.error"));
        });
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  useEffect(() => {
    dispatch(fetchCountriesListAnonymous());
  }, []);
  return (
    <div className="login-wrapper-merchant">
      <div className="login-bg">
        <div className="bg-content">
          <h1>Ready To Lead The Region?</h1>
          <p>
            Let’s keep our core values of trust, quality, and accessibility at
            the heart of every decision.
          </p>
          <div
            style={{
              position: "relative",
              // backgroundColor: "green  ",
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
        <div className="login-card">
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          ></div>
          <div>
            <h2>Create an SAWA Merchant account</h2>
            <p className="subtitle">
              From your profile, you will find all information connected to your
              account. And it’s free to join!
            </p>
          </div>
          <form
            className="login-form"
            onSubmit={handleSubmit(handleRegisterSubmit)}
          >
            <div className="completeScrollable">
              <FormInput
                label={t("user.form.firstName")}
                name="firstName"
                placeholder={t("user.form.firstNamePlaceholder")}
                control={control}
                error={
                  errors.firstName?.message ? t(errors.firstName.message) : ""
                }
                bgColor="var(--color-white)"
                variant="bordered"
              />

              <FormInput
                label={t("user.form.lastName")}
                name="lastName"
                placeholder={t("user.form.lastNamePlaceholder")}
                control={control}
                error={t(errors.lastName?.message)}
                bgColor="var(--color-white)"
                variant="bordered"
              />

              <FormInput
                label={t("user.form.email")}
                name="email"
                type="email"
                placeholder={t("user.form.emailPlaceholder")}
                control={control}
                error={t(errors.email?.message)}
                bgColor="var(--color-white)"
                variant="bordered"
              />
              <CountrySelect
                label={t("user.form.country")}
                name="country"
                control={control}
                error={t(errors.country?.message)}
                bgColor="var(--color-white)"
                // countries={countries}
                valueKey={"countryCodeNumeric"}
                variant="bordered"
                options={validCountries}
              />
              <PhoneInput
                label={t("user.form.phoneNumber")}
                name="phoneNumber"
                placeholder={t("user.form.phoneNumberPlaceholder")}
                control={control}
                error={t(errors.phoneNumber?.message)}
                bgColor="var(--color-white)"
                variant="bordered"
              />

              {/*  */}
              <PasswordInput
                label={t("user.form.password")}
                name="password"
                placeholder={t("user.form.passwordPlaceholder")}
                control={control}
                error={t(errors.password?.message)}
                bgColor="var(--color-white)"
                styleButton={{ top: "50%" }}
                variant="bordered"
              />
              <PasswordInput
                label={t("user.form.confirmPassword")}
                name="confirmPassword"
                placeholder={t("user.form.confirmPasswordPlaceholder")}
                control={control}
                error={t(errors.confirmPassword?.message)}
                bgColor="var(--color-white)"
                styleButton={{ top: "50%" }}
                variant="bordered"
              />
              {/* <div className="form-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type="password"
                  name="Password"
                  placeholder="Your Password"
                />
              </div>
            </div> */}
              <div className="terms-checkbox">
                <FormCheckbox
                  name="terms"
                  width={14}
                  style={{
                    marginTop: "6px",
                  }}
                  height={14}
                  label={
                    <label htmlFor="terms">
                      By ticking, you are confirming that you have read and
                      agree to SAWA <a href="#">terms and conditions</a>
                    </label>
                  }
                  control={control}
                  error={t(errors.terms?.message)}
                />
              </div>
              <button
                style={{
                  // marginTop: "20px",
                  // border: 'none'
                  border: "none",
                  margin: "25px 0",
                  outline: "none",
                  boxShadow: "none",
                  WebkitAppearance: "none",
                  // backgroundColor:'red',
                  marginBottom:'50px'
                }}
                type="submit"
                className="create-account-m"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loading /> : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateMerchant;
