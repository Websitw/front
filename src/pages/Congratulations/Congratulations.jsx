import Background from "../../components/common/Background";
import { MerchantLogin } from "../../assets/image";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import "../../components/common/Register.css";
import "./Congratulations.css";
import { Checked } from "../../assets/icons";
import useLocalStorage from "../../hooks/useLocalStorage";
import { logout } from "../../store/slices/authSlice";
import { useDispatch } from "react-redux";
const Congratulations = () => {

  
  const dispatch = useDispatch();
  const [user] = useLocalStorage("userData", null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });
  const navigate = useNavigate();

  const handlerRegister = () => {
    navigate("/validate-otp");
  };

    const handleBackToLogin = () => {
      dispatch(logout());
      window.dispatchEvent(new Event("authStateChanged"));
      navigate("/Signin");
    };
  return (
    <>
      <div className="congratulations-container">
        <div className="create-merchant-container">
          <div className="login-wrapper">
            <Background
              title="Shape your business path"
              description="where your brand grows through dual experiences in wholesale and retail."
              image={MerchantLogin}
            />
            <div className="login-card-wrapper">
              <div className="login-card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                ></div>

                <h2 className="create-merchant-title">Verify your account </h2>
                <p className="otp-phone">
                  Please enter the code we just sent to email
                </p>
                <p className="otp-phone-number">{user?.email}</p>
                <div className="congratulations-content">
                  <div className="congratulations-icon-wrapper flex-center-column">
                    <Checked className="congratulations-icon" />
                    <h3 className="congratulations-title">Congratulations!</h3>
                    <p className="congratulations-desc">
                      Your account is ready. Let’s complete your business <br />
                      details to get started.{" "}
                    </p>
                  </div>

                  <div className="buttons">
                    <button
                      className="complete-details-button"
                      onClick={handleBackToLogin}
                    >
                      Complete Business Details
                    </button>
                    <button
                      className="back-to-login-button"
                      onClick={handleBackToLogin}
                    >
                      Back to Login
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Congratulations;
