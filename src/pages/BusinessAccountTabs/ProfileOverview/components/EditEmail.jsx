import React, { useEffect } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { showToast } from "../../../../components/CustomToast/CustomToast";
import { updateCompany } from "../../../../store/slices/companySlice";
import { useDispatch } from "react-redux";
import FormInput from "../../../../components/common/FormInput";

const emailSchema = z.object({
  additionalEmail: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
});

const EditEmail = ({
  isOpen,
  onClose,
  userData,
  onSave,
  checkCompanyStatus,
}) => {
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      additionalEmail: "",
    },
  });

  useEffect(() => {
    if (isOpen && userData) {
      reset({
        additionalEmail: userData.additionalBusinessEmail || "",
      });
    }
  }, [isOpen, userData, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        companyName: userData?.companyName,
        commercialName: userData?.commercialName,
        businessEmail: userData?.businessEmail,
        additionalBusinessEmail: data.additionalEmail,
        establishmentNo: userData?.establishmentNo,
        businessPhone: userData?.businessPhone,
        countryId: userData?.countryId?.id,
        industryId: userData?.industry?.id,
        taxId: userData?.taxId,
        logoId: userData?.logoId,
        businessStartedDate: userData?.businessStartedDate,
        status: userData?.status || "Pending",
        commercialImageId: userData?.commercialImageId,
      };

      const result = await dispatch(
        updateCompany({ id: userData?.id, data: payload }),
      ).unwrap();
      await checkCompanyStatus();
      showToast.success("Additional email updated successfully");
      onSave?.(result);
      onClose();
    } catch (error) {
      console.error("Update failed", error);
      showToast.error(error?.message || "Failed to update additional email");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container-mobile"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Edit Additional Email</h3>
          <X className="close-icon" onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body">
            <div className="modal-field">
              <label
                style={{
                  marginBottom: "0px",
                }}
              >
                Additional Email{" "}
                <span className="optional-text">(optional)</span>
              </label>
              <FormInput
                label={""}
                name="additionalEmail"
                type="email"
                placeholder="additional@company.com"
                bgColor="var(--color-white)"
                variant="bordered"
                control={control}
                styleLabel={{ marginBottom: "0px" }}
                style={{ marginTop: "0px" }}
                error={errors.additionalEmail?.message || ""}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="submit" className="save-btn" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmail;
