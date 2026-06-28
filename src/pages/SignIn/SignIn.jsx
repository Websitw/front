import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { environment } from "../../environments/environment";
import { setCredentials } from "../../store/slices/authSlice";
import { resolveUserRole } from "../../helper/authRole";
import Loading from "../../components/Loading/Loading";
import "./SignIn.css";
import Background from "../../components/common/Background";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { MerchantLogin } from "../../assets/image";
import { showToast } from "../../components/CustomToast/CustomToast";
import { MainLogo } from "../../assets/icons";
const SignIn = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
    remember: false,
  });

  const validateForm = () => {
    const newErrors = {};

    if (!form.username.trim()) {
      newErrors.username = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.username)) {
      newErrors.username = "Enter a valid email address";
    }

    if (!form.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const DTO = {
        appid: environment.appid,
        provider: "password",
        token: `${form.username}::${form.password}`,
      };

      const { data } = await axios.post(
        `${environment.platformServerOrigin}jwt_auth`,
        DTO
      );

      const resolvedRole = resolveUserRole(data?.user);

      if (
        resolvedRole === "superadmin" ||
        resolvedRole === "admin" ||
        resolvedRole === "U" ||
        resolvedRole === "customer" ||
        resolvedRole === "company"
      ) {
        showToast.error(t("users.unauthorized_access"));
        return;
      }

      const token = data.jwt.access_token;
      const user = data.user;

      console.log("Login merchant Data:", data);

      if (!user?.verStatus) {
        navigate("/validate-otp");
        if (data.otpTrail) {
          localStorage.setItem("REG_OTP_TRAIL_ID", data.otpTrail.id);
          localStorage.setItem("OTP_TOKEN", token);
          localStorage.setItem("USER_ID", user.id);
        }
      }

      localStorage.setItem("token", token);
      localStorage.setItem("tokenExpires", data.jwt.expires);
      localStorage.setItem("tokenRefresh", data.jwt.refresh);
      localStorage.setItem("userData", JSON.stringify(user));

      dispatch(setCredentials({ token, user }));
      showToast.success(t("welcome_back!"));
      navigate("/merchant/dashboard/home");
    } catch {
      showToast.error(t("something_went_wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-wrapper">
        <Background
          title="Shape your business path"
          description="where your brand grows through dual experiences in wholesale and retail."
          image={MerchantLogin}
        />
        <div className="login-card-wrapper">
          <div className="login-card">
            <MainLogo className="main-logo-signin" />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* <img
                src={logoImage}
                alt="image not found"
                style={{
                  width: "150px",
                  height: "50px",
                  objectFit: "contain",
                }}
              /> */}
            </div>

            <h2>Log In</h2>
            <div
              style={
                {
                  // paddingTop:'40px'
                  // padding:'40px 0'
                }
              }
            >
              <p className="subtitle">
                Do not have an account?{" "}
                <Link
                  style={{
                    color: "#00619B",
                    fontSize: "16px",
                    marginLeft: "5px",
                    fontWeight: "400",
                  }}
                  to="/create-merchant"
                >
                  Create Account as Merchant
                </Link>
              </p>
            </div>
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter the email"
                  value={form.username}
                  onChange={handleChange}
                />
                {errors.username && (
                  <span className="error-text">{errors.username}</span>
                )}
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter the password"
                    value={form.password}
                    onChange={handleChange}
                  />

                  <span
                    className="eye-icon"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <VisibilityOffOutlinedIcon />
                    ) : (
                      <RemoveRedEyeOutlinedIcon />
                    )}
                  </span>
                </div>

                {errors.password && (
                  <span className="error-text">{errors.password}</span>
                )}
              </div>

              <div className="options">
                <label className="remember">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={handleChange}
                  />
                  Remember me
                </label>

                <span
                  onClick={() => navigate("/forget-password")}
                  className="help"
                >
                  Forgot Your Password?
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  border: "none",
                  margin: "25px 0",
                  outline: "none",
                  boxShadow: "none",
                  WebkitAppearance: "none",
                }}
              >
                {loading ? <Loading /> : "Log In"}
              </button>
            </form>

            <div
              style={{
                textAlign: "center",
                maxWidth: "600px",
                fontSize: "16px",
                fontWeight: "400",
                margin: "auto",
              }}
            >
              By continuing, you agree to{" "}
              <Link
                style={{
                  color: "#00619B",
                  marginLeft: "5px",
                  fontWeight: "400",
                  fontSize: "16px",
                }}
                path="/"
              >
                SAWA Business Terms and Conditions.
              </Link>
            </div>

            <div
              style={{
                textAlign: "center",
                maxWidth: "600",
                margin: "auto",
                fontSize: "16px",
                fontWeight: "400",
              }}
            >
              © 2025 Govarro, Inc. or its affiliates
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
