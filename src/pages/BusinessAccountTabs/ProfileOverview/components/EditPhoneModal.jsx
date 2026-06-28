import React, { useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { showToast } from "../../../../components/CustomToast/CustomToast";
import { updateCompany } from "../../../../store/slices/companySlice";
import { useDispatch } from "react-redux";

const phoneSchema = z.object({
  businessPhone: z
    .string()
    .min(1, "Business phone number is required")
    .regex(/^[0-9]{9,10}$/, "Phone number must be 9-10 digits"),
  additionalPhoneNumber: z
    .string()
    .regex(/^[0-9]{9,10}$/, "Phone number must be 9-10 digits")
    .optional()
    .or(z.literal("")),
});


const EditPhoneModal = ({ isOpen, onClose, userData, onSave, checkCompanyStatus }) => {
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      businessPhone: "",
      additionalPhoneNumber: "",
    },
  });

  useEffect(() => {
    if (isOpen && userData) {
      reset({
        businessPhone: userData.businessPhone || "",
        additionalPhoneNumber: userData.additionalBusinessPhone || "",
      });
    }
  }, [isOpen, userData, reset]);

  const onSubmit = async (data) => {
    try {
      console.log("userData>>",userData)
      const payload = {
        companyName: userData.companyName,
        commercialName: userData.commercialName,
        businessEmail: userData.businessEmail,
        establishmentNo: userData.establishmentNo,
        businessPhone: userData.businessPhone,
        additionalBusinessPhone: data.additionalPhoneNumber,
        countryId: userData.countryId?.id,
        industryId: userData.industry?.id,
        taxId: userData.taxId,
        logoId: userData.logoId,
        businessStartedDate: userData.businessStartedDate,
        status: userData?.status || "Pending",
        commercialImageId: userData.commercialImageId,
      };

      const result = await dispatch(updateCompany({id: userData.id, data: payload})).unwrap();
      await checkCompanyStatus();
      
      showToast.success("Phone numbers updated successfully");
      onSave?.(result);
      onClose();
    } catch (error) {
      console.error("Update failed", error);
      showToast.error(error?.message || "Failed to update phone numbers");
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
          <h3>Edit Phone Number</h3>
          <X className="close-icon" onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body">
            <div className="form-group">
              <label>Business Phone Number *</label>
              <div className="phone-input">
                <div className="country-code">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Flag_of_Jordan.svg/960px-Flag_of_Jordan.svg.png"
                    alt="JO"
                    className="flag"
                  />
                  <span className="code">
                    {userData?.regMobileISDNCode || "+962"}
                  </span>
                  <ChevronDown size={16} className="dropdown-icon" />
                </div>
                <div className="phone-separator"></div>
                <Controller
                  name="businessPhone"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="phone-field"
                      placeholder="7XXXXXXXX"
                      maxLength={10}
                      disabled={true}
                    />
                  )}
                />
              </div>
              {errors.businessPhone && (
                <span className="error-message-profile">
                  {errors.businessPhone.message}
                </span>
              )}
            </div>

            <div className="form-group" style={{
                marginTop:"10px"
            }}>
              <label>Additional Phone Number</label>
              <div className="phone-input">
                <div className="country-code">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Flag_of_Jordan.svg/960px-Flag_of_Jordan.svg.png"
                    alt="JO"
                    className="flag"
                  />
                  <span className="code">
                    {userData?.regMobileISDNCode || "+962"}
                  </span>
                  <ChevronDown size={16} className="dropdown-icon" />
                </div>
                <div className="phone-separator"></div>
                <Controller
                  name="additionalPhoneNumber"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="phone-field"
                      placeholder="7XXXXXXXX (Optional)"
                      maxLength={10}
                    />
                  )}
                />
              </div>
              {errors.additionalPhoneNumber && (
                <span className="error-message-profile">
                  {errors.additionalPhoneNumber.message}
                </span>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="submit"
              className="save-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPhoneModal;