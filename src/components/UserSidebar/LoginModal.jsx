import React, { useState } from "react";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CloseIcon from "@mui/icons-material/Close";
import { MainLogo, MainLogoDark } from "../../assets/icons";
import { showToast } from "../CustomToast/CustomToast";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/slices/authSlice";
import { environment } from "../../environments/environment";
import axios from "axios";
import "./LoginModal.css";
import { useLocation, useNavigate } from "react-router-dom";
import useCart from "../../hooks/useCart";

const LoginModal = ({
  isOpen,
  onClose,
  onOpenRegister,
  isIncludedBrand,
  onOpenForgotPassword,
  onOpenVerify,
  setPendingLoginData,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmailError, setLoginEmailError] = useState("");
  const [loginPasswordError, setLoginPasswordError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { handlePostLoginCart } = useCart();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    if (name === "email") setLoginEmailError("");
    if (name === "password") setLoginPasswordError("");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const DTO = {
        appid: environment.appid,
        provider: "password",
        token: `${loginData.email}::${loginData.password}`,
      };

      const { data } = await axios.post(
        `${environment.platformServerOrigin}jwt_auth`,
        DTO,
      );

      const token = data.jwt.access_token;
      const user = data.user;

      if (user.programCode !== "customer" && user.programCode !== "company") {
        showToast.error(t("users.unauthorized_access"));
        return;
      }

      if (!user.verStatus) {
        setPendingLoginData({ token, user, otpTrail: data.otpTrail });

        if (data.otpTrail) {
          localStorage.setItem("REG_OTP_TRAIL_ID", data.otpTrail.id);
          localStorage.setItem("OTP_TOKEN", token);
          localStorage.setItem("USER_ID", user.id);
        }

        onClose();
        onOpenVerify();
        showToast.info(t("Please verify your email to continue"));
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("tokenExpires", data.jwt.expires);
      localStorage.setItem("tokenRefresh", data.jwt.refresh);
      localStorage.setItem("userData", JSON.stringify(user));
      localStorage.setItem("userId", user.id);
      localStorage.setItem("xPayId", user.xPayId);

      dispatch(setCredentials({ user, token }));
      window.dispatchEvent(new Event("authStateChanged"));

      handlePostLoginCart(user.id);

      onClose();
      setLoginData({ email: "", password: "" });
      setLoginEmailError("");
      setLoginPasswordError("");
      showToast.success("welcome back!");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || t("something_went_wrong"),
      );
    }
  };

  const onLoginClick = async (e) => {
    e.preventDefault();
    let hasError = false;

    setLoginEmailError("");
    setLoginPasswordError("");

    if (!loginData.email) {
      setLoginEmailError("Email is required");
      hasError = true;
    }
    if (!loginData.password) {
      setLoginPasswordError("Password is required");
      hasError = true;
    }
    if (hasError) return;

    try {
      setLoading(true);
      await handleLoginSubmit(e);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseLogin = () => {
    if (pathname === "/cart") {
      navigate("/");
    }
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div
      style={{
        backgroundColor: isIncludedBrand ? '#303030' : '#FFF'
      }}
      className={`login-modal ${isOpen ? "login-modal--open" : ""}`}>
      <div className="login-modal__header">
        {isIncludedBrand ? (
          <MainLogoDark className="search-modal__logo" />
        ) : (
          <MainLogo className="search-modal__logo" />
        )}

        {/* isIncludedBrand */}
        <button className="login-modal__close-btn" onClick={handleCloseLogin}>
          <CloseIcon style={{ color: isIncludedBrand ? "#FFF" : "#151515" }} />

        </button>
      </div>

      <div className="login-modal__title-section">
        <h2
          style={{
            color: isIncludedBrand ? '#fff' : ''
          }}
          className="login-modal__title">Log in to your account</h2>
      </div>

      <p
        style={{
          color: isIncludedBrand ? '#B4B4B4' : ''
        }}

        className="login-modal__subtitle">
        Log in for a faster personalized experience.
      </p>

      <form className="login-modal__form" onSubmit={onLoginClick}>
        <label
          style={{
            color: isIncludedBrand ? "#FFFFFF" : ''
          }}
          className="login-modal__label">Email</label>
        <input

          style={{
            backgroundColor: isIncludedBrand ? '#444444' : ''
          }}
          className="login-modal__input"
          type="email"
          name="email"
          value={loginData.email}
          onChange={handleInputChange}
          placeholder="Your Email"
        />
        {loginEmailError && (
          <span className="login-modal__error">{loginEmailError}</span>
        )}

        <label

          style={{
            color: isIncludedBrand ? "#FFFFFF" : ''
          }}
          className="login-modal__label">Password</label>
        <div className="login-modal__password-field">
          <input
            style={{
              backgroundColor: isIncludedBrand ? '#444444' : ''
            }}
            className="login-modal__input"
            type={showPassword ? "text" : "password"}
            name="password"
            value={loginData.password}
            onChange={handleInputChange}
            placeholder="Your Password"
          />
          <span
            className="login-modal__eye"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <RemoveRedEyeIcon style={{ color: "#B4B4B4" }} />
            ) : (
              <VisibilityOffIcon style={{ color: "#B4B4B4" }} />
            )}
          </span>
        </div>
        {loginPasswordError && (
          <span className="login-modal__error">{loginPasswordError}</span>
        )}
        {errorMessage && (
          <span className="login-modal__error">{errorMessage}</span>
        )}

        <span
          className="login-modal__forgot-link"
          onClick={() => {
            onClose();
            onOpenForgotPassword();
          }}
        >
          Forgot Your Password?
        </span>

        <button
          style={{
            backgroundColor: isIncludedBrand ? '#0D7C85' : ''
          }}
          type="submit"
          className="login-modal__submit-btn"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <div
        className="login-modal__divider">
        <span

          style={{
            color: isIncludedBrand ? '#FFF' : '',
            backgroundColor: isIncludedBrand ? '#303030' : ''
          }}
        >New at SAWA ?</span>
      </div>

      <button
        style={{
          color: isIncludedBrand ? '#FFFFFF' : ''
        }}
        className="login-modal__create-btn"
        onClick={() => {
          onClose();
          onOpenRegister();
        }}
      >
        Create Account
      </button>

      <div
        style={{
          color: isIncludedBrand ? "#FFF" : ''
        }}
        className="login-modal__footer">
        © Copyright SAWA 2026. All right reserved
      </div>
    </div>
  );
};

export default LoginModal;
