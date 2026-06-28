import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { languageSchema } from "../../../../components/Admin/Schemas/languageSchema";
import FormInput from "../../../../components/common/FormInput";
import "./EditModal.css";

const EditLanguageModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(languageSchema),
    defaultValues: {
      name: initialData?.name || "",
      languageCode: initialData?.languageCode || "",
      status: initialData?.status || "ACTIVE",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        languageCode: initialData.languageCode || "",
        status: initialData.status || "ACTIVE",
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data) => {
    await onSubmit({
      ...initialData,
      ...data,
    });
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
            {t("languages.editModal.titleEdit")}
          </h2>
          <button
            type="button"
            className="edit-modal-close-btn"
            onClick={handleClose}
            aria-label={t("common.close")}
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="edit-modal-body"
        >
          <div className="edit-modal-form">
            <FormInput
              label={t("languages.form.languageName")}
              name="name"
              type="text"
              placeholder={t("languages.form.languageNamePlaceholder")}
              required
              bgColor="var(--color-white)"
              control={control}
              error={errors.name?.message ? t(errors.name.message) : ""}
              variant="bordered"
              className="edit-modal-field"
              styleLabel={{ marginBottom: "0px" }}
            />

            <FormInput
              bgColor="var(--color-white)"
              label={t("languages.form.languageCode")}
              name="languageCode"
              type="text"
              placeholder={t("languages.form.languageCodePlaceholder")}
              required
              disabled={true}
              control={control}
              error={
                errors.languageCode?.message
                  ? t(errors.languageCode.message)
                  : ""
              }
              variant="bordered"
              styleLabel={{ marginBottom: "0px" }}
              className="edit-modal-field"
            />
          </div>
        </form>

        <div className="edit-modal-footer">
          <button
            type="submit"
            className="edit-modal-submit-btn"
            disabled={isSubmitting || isLoading}
            onClick={handleSubmit(handleFormSubmit)}
          >
            {isSubmitting || isLoading
              ? t("common.submitting")
              : t("languages.editModal.saveEdit")}
          </button>
          <button
            type="button"
            className="edit-modal-cancel-btn"
            onClick={handleClose}
          >
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditLanguageModal;
