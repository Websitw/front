import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { environment } from "../../environments/environment";
import { setCredentials } from "../../store/slices/authSlice";
import { resolveUserRole } from "../../helper/authRole";
import Loading from "../../components/Loading/Loading";
import './SiginAdmin.css';
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { showToast } from "../../components/CustomToast/CustomToast";
import { MainLogo } from "../../assets/icons";
const SignIn = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
  };
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
      newErrors.username = t("admin.errors.email_required");
    }
    //  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.username)) {
    //   newErrors.username = t("admin.errors.email_invalid");
    // }

    if (!form.password.trim()) {
      newErrors.password = t("admin.errors.password_required");
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

      if (resolvedRole !== "superadmin" && resolvedRole !== "admin") {
        showToast.error(t("users.unauthorized_access"));
        return;
      }

      const token = data.jwt.access_token;
      const user = data.user;

      localStorage.setItem("token", token);
      localStorage.setItem("tokenExpires", data.jwt.expires);
      localStorage.setItem("tokenRefresh", data.jwt.refresh);
      localStorage.setItem("userData", JSON.stringify(user));

      dispatch(setCredentials({ token, user }));
      showToast.success(t("welcome_back!"));
      setTimeout(()=>{
        navigate("/dashboard/platformSetting");
      },10);
      
    } catch {
      showToast.error(t("something_went_wrong"));
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    document.documentElement.dir =
      i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);


  return (
    <div className="login-wrapper">
      <div className="login-bg">
        <div className="bg-content">
          
          <h1>{t("admin.hero.title")}</h1>
          <p>{t("admin.hero.description")}</p>

          <div style={{
            position: 'relative',
          }}>

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
              justifyContent: "flex-end",
            }}
          >
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div
                style={{
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "400",
                  color: "#00619B",
                  userSelect: "none",
                }}
                onClick={() =>
                  changeLanguage(i18n.language === "ar" ? "en" : "ar")
                }
              >
                {i18n.language === "ar" ? "English" : "العربية"}
              </div>
            </div>

          </div>
          <MainLogo/>
          <h2>{t("admin.login.title")}</h2>
          <p className="subtitle">{t("admin.login.subtitle")}</p>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t("admin.login.email")}</label>

              <input
                type="text"
                name="username"
                placeholder={t("admin.login.email_placeholder")}
                value={form.username}
                onChange={handleChange}
                className={errors.username ? "input-error" : ""}
              />
              {errors.username && (
                <span className="error-text">{errors.username}</span>
              )}
            </div>


            <div className="form-group">
              <label>{t("admin.login.password")}</label>

              <div className="password-wrapper">


                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={t("admin.login.password_placeholder")}
                  value={form.password}
                  onChange={handleChange}
                  className={errors.password ? "input-error" : ""}
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
                {t("admin.login.remember_me")}

              </label>

              <span
                style={{
                  cursor: 'pointer'
                }}
                onClick={() => navigate("/forget-password")} className="help">{t("admin.login.forgot_password")}</span>
            </div>


            <button
              style={{
                outline: 'none',
                boxShadow: 'none',
              }}
              type="submit">{loading ? <Loading /> : t("admin.login.submit")}
            </button>
          </form>


          <div className="footer">
            © Copyright SAWA 2026. All right reserved
          </div>

        </div>
      </div>

    </div>
  );
};

export default SignIn;
