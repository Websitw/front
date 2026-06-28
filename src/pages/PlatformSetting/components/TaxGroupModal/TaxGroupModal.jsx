import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "../../../../components/common/FormInput";
import FormCheckbox from "../../../../components/common/Formcheckbox";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  taxGroupSchema,
  getTaxGroupDefaultValues,
} from "../../../../components/Admin/Schemas/taxGroupSchema";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import "./TaxGroupModal.css";

const TaxGroupModal = ({
  open,
  onClose,
  mode = "create",
  editData = null,
  onTaxGroupAdded,
  onTaxGroupUpdated,
}) => {
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(taxGroupSchema),
    defaultValues: getTaxGroupDefaultValues(),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "taxes",
  });

  // Populate form when editing
  useEffect(() => {
    if (mode === "edit" && editData) {
      setValue("taxGroupCode", editData.taxGroupCode || "");
      setValue(
        "taxes",
        editData.taxes || [
          { nameEn: "", nameAr: "", rate: "", isDefault: false },
        ]
      );
    } else if (mode === "create") {
      reset(getTaxGroupDefaultValues());
    }
  }, [mode, editData, setValue, reset]);

  const handleClose = () => {
    reset(getTaxGroupDefaultValues());
    onClose();
  };

  const handleFormSubmit = async (data) => {
    try {
      console.log("Tax Group Form Data Submitted:", data);

      if (mode === "edit" && editData) {
        // Edit mode - call parent callback
        if (onTaxGroupUpdated) {
          onTaxGroupUpdated({ ...data, id: editData.id });
          toast.success(t("taxes.updateSuccess"));
          handleClose();
        }
      } else {
        // Create mode - call parent callback
        if (onTaxGroupAdded) {
          onTaxGroupAdded(data);
          toast.success(t("taxes.createSuccess"));
          handleClose();
        }
      }
    } catch (error) {
      toast.error(error?.message || t("dashboard.error"));
      console.error("Failed to save tax group:", error);
    }
  };

  const handleFormError = (errors) => {
    console.log("Form validation errors:", errors);
    // Show first error message
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      toast.error(t(firstError.message));
    } else if (firstError?.taxes) {
      // Handle nested array errors
      const taxError = Object.values(firstError.taxes)[0];
      if (taxError) {
        const fieldError = Object.values(taxError)[0];
        if (fieldError?.message) {
          toast.error(t(fieldError.message));
        }
      }
    }
  };

  const handleAddTax = () => {
    append({ nameEn: "", nameAr: "", rate: "", isDefault: false });
  };

  const handleRemoveTax = (index) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast.info(t("taxes.validation.atLeastOneTaxRequired"));
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="tax-modal-overlay" onClick={handleClose} />
      <div className="tax-modal-container">
        <div className="tax-modal-header">
          <h2>
            {mode === "edit"
              ? t("taxes.modal.editTitle")
              : t("taxes.modal.addTitle")}
          </h2>
          <button className="tax-modal-close" onClick={handleClose}>
            ✕
          </button>
        </div>

        <form
          className="tax-modal-form"
          onSubmit={handleSubmit(handleFormSubmit, handleFormError)}
        >
          <div className="tax-modal-body">
            {/* Tax Group Code */}
            <div className="tax-group-code-section">
              <FormInput
                label={t("taxes.modal.taxGroupCode")}
                name="taxGroupCode"
                type="text"
                placeholder={t("taxes.modal.taxGroupCodePlaceholder")}
                control={control}
                error={
                  errors.taxGroupCode?.message
                    ? t(errors.taxGroupCode.message)
                    : ""
                }
                variant="bordered"
                required
                bgColor={"--var(color-white)"}
              />
            </div>

            {/* Tax Entries */}
            <div className="tax-entries-section">
              <h3 className="tax-entries-title">
                {t("taxes.modal.taxesTitle")}
              </h3>

              {fields.map((field, index) => (
                <div key={field.id} className="tax-entry-card">
                  <div className="tax-entry-header">
                    <span className="tax-line"> </span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        className="tax-entry-delete-btn"
                        onClick={() => handleRemoveTax(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    )}
                  </div>

                  <div className="tax-entry-fields">
                    <div className="tax-entry-row">
                      <FormInput
                        label={t("taxes.modal.taxNameEn")}
                        name={`taxes.${index}.nameEn`}
                        type="text"
                        placeholder={t("taxes.modal.taxNameEnPlaceholder")}
                        control={control}
                        error={
                          errors.taxes?.[index]?.nameEn?.message
                            ? t(errors.taxes[index].nameEn.message)
                            : ""
                        }
                        variant="bordered"
                        required
                        bgColor={"--var(color-white)"}
                      />
                      <FormInput
                        label={t("taxes.modal.taxRate")}
                        name={`taxes.${index}.rate`}
                        type="text"
                        placeholder={t("taxes.modal.taxRatePlaceholder")}
                        control={control}
                        error={
                          errors.taxes?.[index]?.rate?.message
                            ? t(errors.taxes[index].rate.message)
                            : ""
                        }
                        variant="bordered"
                        required
                        bgColor={"--var(color-white)"}
                        style={{ marginBottom: "0px" }}
                      />
                    </div>

                    <div className="tax-entry-row">
                      <FormInput
                        label={t("taxes.modal.taxNameAr")}
                        name={`taxes.${index}.nameAr`}
                        type="text"
                        placeholder={t("taxes.modal.taxNameArPlaceholder")}
                        control={control}
                        error={
                          errors.taxes?.[index]?.nameAr?.message
                            ? t(errors.taxes[index].nameAr.message)
                            : ""
                        }
                        variant="bordered"
                        required
                        bgColor={"--var(color-white)"}
                      />

                      <div className="tax-default-checkbox">
                        <FormCheckbox
                          label={t("taxes.modal.isDefault")}
                          name={`taxes.${index}.isDefault`}
                          control={control}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            </div>
          </div>

          <div className="tax-modal-footer">
            <button
              type="submit"
              className={
                isSubmitting
                  ? "tax-modal-submit-btn submitting"
                  : "tax-modal-submit-btn"
              }
              disabled={isSubmitting}
            >
              {isSubmitting
                ? t("common.submitting")
                : mode === "edit"
                ? t("taxes.modal.saveEdit")
                : t("taxes.modal.addTax")}
            </button>
            <button
              type="button"
              className="tax-modal-cancel-btn"
              onClick={handleClose}
            >
              {t("common.cancel")}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default TaxGroupModal;
