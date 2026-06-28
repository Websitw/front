import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export const usePasswordValidation = (password) => {
  const { t } = useTranslation();

  const validations = useMemo(
    () => [
      {
        key: "minLength",
        label: t("forgetStep3.validation.minLength", "Minimum 8 characters"),
        isValid: password.length >= 8,
      },
      {
        key: "hasNumber",
        label: t("forgetStep3.validation.hasNumber", "At least 1 number (1-9)"),
        isValid: /\d/.test(password),
      },
      {
        key: "hasLetters",
        label: t(
          "forgetStep3.validation.hasLetters",
          "At least lowercase or uppercase letters"
        ),
        isValid: /[a-zA-Z]/.test(password),
      },
    ],
    [password, t]
  );

  const isPasswordValid = useMemo(
    () => validations.every((v) => v.isValid),
    [validations]
  );

  return { validations, isPasswordValid };
};