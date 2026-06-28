import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { regionSchema } from "../../../../components/Admin/Schemas/regionSchema";
import FormInput from "../../../../components/common/FormInput";
import "./EditModal.css";

const EditRegionModal = ({
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
    resolver: zodResolver(regionSchema),
    defaultValues: {
      name: initialData?.name || "",
      regionCode: initialData?.regionCode || "",
      status: initialData?.status || "ACTIVE",
      nameAr: initialData?.name_i18n?.ar || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        regionCode: initialData.regionCode || "",
        status: initialData.status || "ACTIVE",
        nameAr: initialData?.name_i18n?.ar || "",
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
          <h2 className="edit-modal-title">{t("regions.modal.titleEdit")}</h2>
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
              styleLabel={{ marginBottom: "0px" }}
              label={t("regions.form.regionName")}
              name="name"
              type="text"
              placeholder={t("regions.form.regionNamePlaceholder")}
              required
              control={control}
              error={errors.name?.message ? t(errors.name.message) : ""}
              variant="bordered"
              bgColor="var(--color-white)"
              className="edit-modal-field"
            />
            <FormInput
              label={t("regions.form.regionNameAr")}
              name="nameAr"
              type="text"
              placeholder={t("regions.form.regionNameArPlaceholder")}
              required
              bgColor="var(--color-white)"
              variant="bordered"
              control={control}
              error={errors.nameAr?.message ? t(errors.nameAr.message) : ""}
              styleLabel={{ marginTop: "16px" }}
            />
            <FormInput
              styleLabel={{ marginBottom: "0px" }}
              label={t("regions.form.regionCode")}
              name="regionCode"
              type="text"
              placeholder={t("regions.form.regionCodePlaceholder")}
              required
              bgColor="var(--color-white)"
              disabled={true}
              control={control}
              error={
                errors.regionCode?.message ? t(errors.regionCode.message) : ""
              }
              variant="bordered"
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
              : t("regions.editModal.saveEdit")}
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

export default EditRegionModal;
