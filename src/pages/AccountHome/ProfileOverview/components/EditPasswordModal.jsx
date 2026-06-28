import { useEffect } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import OTPInput from "../../../../components/common/OTPInput";
import PasswordValidation from "../../../../components/common/ForgetPassword/PasswordValidation";
import PasswordInput from "../../../../components/common/PasswordInput";
import useLocalStorage from "../../../../hooks/useLocalStorage";
import { forgetStep3Schema } from "../../../../components/Schemas/ForgetSchema";
import { usePasswordReset } from "../../../../hooks/usePasswordReset";
import { usePasswordValidation } from "../../../../hooks/usePasswordValidation";
import "../../../../components/common/ForgetPassword/ForegetPassord.css";

const EditPasswordModal = ({ isOpen, onClose }) => {
  const [user] = useLocalStorage("userData", null);
  const userEmail = user?.email || "";
  const { t } = useTranslation();

  const {
    sendVerificationCode,
    verifyAndResetPassword,
    resendVerificationCode,
  } = usePasswordReset();

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
  const { validations } = usePasswordValidation(newPassword);

  useEffect(() => {
    if (isOpen) {
      reset();
      sendVerificationCode(userEmail);
    }
  }, [isOpen, userEmail]);

  const handleResendOTP = () => {
    resendVerificationCode(userEmail, "F");
  };

  const onSubmit = (data) => {
    verifyAndResetPassword({
      email: userEmail,
      otp: data.otp,
      password: data.newPassword,
      confirmPassword: data.confirmPassword,
      shouldLogout: true,
    }).then((result) => {
      if (result.success) {
        reset();
        onClose();
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Password</h3>
          <X onClick={onClose} style={{ cursor: "pointer" }} />
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="field">
            <PasswordInput
              label="New Password"
              name="newPassword"
              placeholder="New Password"
              control={control}
              error={errors.newPassword?.message}
              variant="bordered"
              bgColor="var(--color-white)"
            />
            <ul className="rules">
              <PasswordValidation
                password={newPassword}
                validations={validations}
              />
            </ul>
          </div>

          <OTPInput
            name="otp"
            control={control}
            error={errors.otp?.message}
            length={6}
            resendText={t(
              "forgetStep3.resendCode",
              "You can request a new code in",
            )}
            resendTimer={45}
            onResend={handleResendOTP}
          />

          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            placeholder="Confirm Password"
            control={control}
            error={errors.confirmPassword?.message}
            variant="bordered"
            bgColor="var(--color-white)"
          />

          <button className={`save-btn ${isSubmitting ? "submitting" : ""}`}>
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPasswordModal;
