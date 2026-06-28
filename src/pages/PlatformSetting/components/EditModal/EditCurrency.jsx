import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { currencySchema } from "../../../../components/Admin/Schemas/currencySchema";
import FormInput from "../../../../components/common/FormInput";
import FormNumberInput from "../../../../components/common/FormNumberInput";
import "./EditModal.css";

const EditCurrency = ({
  isOpen,
  onClose,
  onSubmit,
  currency,
  isSubmitting,
}) => {
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(currencySchema),
    defaultValues: {
      currencyCode: "",
      name: "",
      decimalPlaces: 2,
      symbol: "",
      status: "ACTIVE",
      nameAr: "",
    },
  });

  useEffect(() => {
    if (currency && isOpen) {
      reset({
        currencyCode: currency.currencyCode || "",
        name: currency.name || "",
        decimalPlaces: currency.decimalPlaces || 2,
        symbol: currency.symbol || "",
        status: currency.status || "ACTIVE",
        nameAr: currency?.name_i18n?.ar || "",
      });
    }
  }, [currency, isOpen, reset]);

  const handleFormSubmit = (data) => {
    onSubmit({ ...data, id: currency.id });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="edit-modal-overlay" onClick={handleOverlayClick}>
      <div className="edit-modal-container">
        <div className="edit-modal-header">
          <h2 className="edit-modal-title">
            {t("currencies.modal.editTitle")}
          </h2>
          <button
            type="button"
            className="edit-modal-close-btn"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="edit-modal-body">
            <div className="edit-modal-form">
              <FormInput
                label={t("currencies.form.currencyName")}
                name="name"
                type="text"
                placeholder={t("currencies.form.currencyNamePlaceholder")}
                required
                bgColor="var(--color-white)"
                variant="bordered"
                control={control}
                styleLabel={{ marginBottom: "0px" }}
                error={errors.name?.message ? t(errors.name.message) : ""}
              />
              <FormInput
                label={t("currencies.form.nameAr")}
                name="nameAr"
                type="text"
                placeholder={t("currencies.form.nameArPlaceholder")}
                required
                bgColor="var(--color-white)"
                variant="bordered"
                control={control}
                error={errors.nameAr?.message ? t(errors.nameAr.message) : ""}
                styleLabel={{ marginTop: "16px" }}
              />
              <div className="grid-inputs">
                <FormInput
                  styleLabel={{ marginBottom: "0px" }}
                  label={t("currencies.form.currencyCode")}
                  name="currencyCode"
                  type="text"
                  placeholder={t("currencies.form.currencyCodePlaceholder")}
                  bgColor="var(--color-gray-50)"
                  variant="bordered"
                  control={control}
                  disabled={true}
                  error={
                    errors.currencyCode?.message
                      ? t(errors.currencyCode.message)
                      : ""
                  }
                />

                <FormInput
                  styleLabel={{ marginBottom: "0px" }}
                  label={t("currencies.form.symbol")}
                  name="symbol"
                  type="text"
                  placeholder={t("currencies.form.symbolPlaceholder")}
                  control={control}
                  bgColor="var(--color-white)"
                  variant="bordered"
                  error={errors.symbol?.message ? t(errors.symbol.message) : ""}
                />

                <FormNumberInput
                  styleLabel={{ marginBottom: "0px" }}
                  label={t("currencies.form.decimalPlaces")}
                  name="decimalPlaces"
                  placeholder={t("currencies.form.decimalPlacesPlaceholder")}
                  bgColor="var(--color-white)"
                  variant="bordered"
                  control={control}
                  error={
                    errors.decimalPlaces?.message
                      ? t(errors.decimalPlaces.message)
                      : ""
                  }
                />
              </div>
            </div>
          </div>

          <div className="edit-modal-footer">
            <button
              type="submit"
              className="edit-modal-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? t("common.submitting")
                : t("currencies.modal.editTitle")}
            </button>
            <button
              type="button"
              className="edit-modal-cancel-btn"
              onClick={handleClose}
            >
              {t("common.cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCurrency;
