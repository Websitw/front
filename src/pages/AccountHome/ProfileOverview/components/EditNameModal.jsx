import React, { useEffect } from "react";
import { showToast } from "../../../../components/CustomToast/CustomToast";
import RadioInput from "../../../../components/common/Radioinput";
import CountrySelect from "../../../../components/common/CountrySelect";
import { useSelector, useDispatch } from "react-redux";
import { fetchCountriesListAnonymous } from "../../../../store/slices/counteriesSlice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FormInput from "../../../../components/common/FormInput";
import { genderOptions } from "../../../../constants/options";
import FormSelect from "../../../../components/common/FormSelect";
import { useTranslation } from "react-i18next";
import {
  getDataProfile,
  updateProfile,
} from "../../../../store/slices/authReducer";
const nameRegex = /^[a-zA-Z\s'-]+$/;

const editNameSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters")
    .regex(
      nameRegex,
      "First name can only contain letters, spaces, hyphens, and apostrophes",
    ),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters")
    // .regex(
    //   // nameRegex,
    //   "Last name can only contain letters, spaces, hyphens, and apostrophes",
    // ),
    ,
  gender: z.string().min(1, "Gender is required"),
  country: z
    .union([z.string(), z.number()])
    .refine((val) => val !== "" && val !== null && val !== undefined, {
      message: "Country is required",
    }),
  startDay: z.string().min(1, "Day is required"),
  startMonth: z.string().min(1, "Month is required"),
  startYear: z.string().min(1, "Year is required"),
});

const EditNameModal = ({ isOpen, onClose, userData, onSave }) => {
  const { allCountriesList } = useSelector((state) => state.countries);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const validCountries = allCountriesList.filter(
    (country) =>
      country.countryCodeNumeric !== undefined &&
      country.countryCodeNumeric !== null,
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(editNameSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: "",
      country: "",
      startDay: "",
      startMonth: "",
      startYear: "",
    },
  });

  useEffect(() => {
    dispatch(fetchCountriesListAnonymous());
  }, []);

 useEffect(() => {
  if (isOpen && userData) {
    console.log("User data in EditNameModal useEffect:", userData);
    const birthdate = userData.birthdate;
    const startDay = birthdate ? birthdate.split("-")[2] : "";
    const startMonth = birthdate ? birthdate.split("-")[1] : "";
    const startYear = birthdate ? birthdate.split("-")[0] : "";

    const nameParts = (userData.name || "").split(" ");

    reset({
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      gender: userData.gender || "",
      country: userData.country?.countryCodeNumeric || "",
      startDay: startDay || "",
      startMonth: startMonth || "",
      startYear: startYear || "",
    });
  }
}, [isOpen, userData, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: `${data.firstName.trim()} ${data.lastName.trim()}`,
        email: userData.email,
        mobileNo: userData.regMobileNumber,
        picture: userData.picture,
        regMobileISDNCode: userData.regMobileISDNCode,
        regMobileNumber: userData.regMobileNumber,
        languagePreference: userData.languagePreference,
        gender: data.gender?.toUpperCase(),
        countryCode: data.country,
        birthdate: `${data.startYear}-${data.startMonth.padStart(2, "0")}-${data.startDay.padStart(2, "0")}`,
      };
      dispatch(updateProfile({ profileData: payload }))
        .unwrap()
        .then((res) => {
          dispatch(getDataProfile()).unwrap();
          showToast.success("Profile Updated successfully");
          onClose();
          onSave(res);
          reset();
        })
        .catch((err) => {
          console.error("Error updating profile:", err);
          showToast.error(err.message || "Failed to update name");
        });
      // await new Promise((resolve) => setTimeout(resolve, 1000));

      // const updatedUser = { ...userData, ...payload };
      // const currentUserData = JSON.parse(
      //   localStorage.getItem("userData") || "{}",
      // );
      // const mergedData = { ...currentUserData, ...updatedUser };
      // localStorage.setItem("userData", JSON.stringify(mergedData));

      // onSave(mergedData);
      onClose();
      reset();
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update name. Please try again.");
    }
  };

  if (!isOpen) return null;

  const days = Array.from({ length: 31 }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
  }));
  const months = [
    { value: "01", label: t("merchant.completeProfile.months.january") },
    { value: "02", label: t("merchant.completeProfile.months.february") },
    { value: "03", label: t("merchant.completeProfile.months.march") },
    { value: "04", label: t("merchant.completeProfile.months.april") },
    { value: "05", label: t("merchant.completeProfile.months.may") },
    { value: "06", label: t("merchant.completeProfile.months.june") },
    { value: "07", label: t("merchant.completeProfile.months.july") },
    { value: "08", label: t("merchant.completeProfile.months.august") },
    { value: "09", label: t("merchant.completeProfile.months.september") },
    { value: "10", label: t("merchant.completeProfile.months.october") },
    { value: "11", label: t("merchant.completeProfile.months.november") },
    { value: "12", label: t("merchant.completeProfile.months.december") },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
  }));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-headerr">
          <h2>Edit Personal Info</h2>
          <button className="edit-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body">
            <FormInput
              name="firstName"
              label="First Name"
              control={control}
              bgColor="var(--color-white)"
              styleLabel={{ marginTop: "10px", marginBottom: "0px" }}
            />

            <FormInput
              name="lastName"
              label="Last Name"
              control={control}
              maxLength={50}
              bgColor="var(--color-white)"
              styleLabel={{ marginTop: "10px", marginBottom: "0px" }}
            />

            <CountrySelect
              label={t("user.form.country")}
              name="country"
              control={control}
              error={t(errors.country?.message)}
              bgColor="var(--color-white)"
              // countries={countries}
              valueKey={"countryCodeNumeric"}
              style={{
                marginBottom: "10px",
              }}
              variant="bordered"
              options={validCountries}
              styleLabel={{ marginBottom: "0px", marginTop: "10px" }}
            />
            <span className="user-sidebar-label">Birthday</span>
            <div className="date-select-group">
              <FormSelect
                name="startDay"
                placeholder="Day"
                options={days}
                control={control}
                className="user-sidebar-birthday"
                variant="bordered"
                style={{ padding: "15px 20px" }}
                bgColor="var(--color-white)"
                styleLabel={{ marginTop: "0px", marginBottom: "0px" }}
              />
              <FormSelect
                name="startMonth"
                placeholder="Month"
                options={months}
                control={control}
                className="date-select"
                variant="bordered"
                style={{ padding: "15px 20px" }}
                bgColor="var(--color-white)"
                styleLabel={{ marginBottom: "0px" }}
              />
              <FormSelect
                name="startYear"
                placeholder="Year"
                options={years}
                control={control}
                className="date-select"
                variant="bordered"
                style={{ padding: "15px 20px", borderRadius: "5px" }}
                bgColor="var(--color-white)"
                styleLabel={{ marginBottom: "0px" }}
              />
            </div>
            <RadioInput
              style={{ margin: "10px 0" }}
              styleRadioOptions={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                gap: "5rem",
              }}
              styleRadioOption={{
                border: "none",
                padding: "0px",
                background: "transparent",
                maxWidth: "57px",
              }}
              styleRadio={{
                maxWidth: "14px",
                maxHeight: "14px",
              }}
              name="gender"
              label="Gender"
              options={genderOptions}
              control={control}
              bgColor="var(--color-white)"
              styleLabel={{ marginTop: "10px", marginBottom: "0px" }}
            />
          </div>

          <button className="save-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditNameModal;
