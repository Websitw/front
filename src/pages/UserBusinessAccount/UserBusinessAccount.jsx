import React, { useState, useEffect } from "react";
import "./UserBusinessAccount.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchIndustries } from "../../store/slices/industriesSlice";
import { fetchCountriesListAnonymous } from "../../store/slices/counteriesSlice";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { uploadImage } from "../../helper/helper";
import { createCompany } from "../../store/slices/companySlice";
import { showToast } from "../../components/CustomToast/CustomToast";
import { useNavigate } from "react-router-dom";
import { imageUrl } from "../../helper/helper";
import { z } from "zod";
import { userCompanyStatus } from "../../store/slices/usersSlice";
import { selectUser } from "../../store/slices/authSlice";

const UserBusinessAccount = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const [countryOpen, setCountryOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const navigation = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.industries);
  const { allCountriesList } = useSelector((state) => state.countries);
  const userCheck = useSelector(selectUser);
  
  const businessAccountSchema = z.object({
    companyName: z.string().min(1, "Company name is required"),
    commercialName: z.string().min(1, "Commercial name is required"),
    businessEmail: z
      .string()
      .email("Invalid email address")
      .min(1, "Business email is required"),
    establishmentNumber: z.string().optional(),
    businessPhone: z
      .string()
      .min(1, "Business phone number is required")
      .regex(/^[0-9]{9,10}$/, "Phone number must be 9-10 digits"),
    countryId: z.string().min(1, "Country is required"),
    industryId: z.string().min(1, "Business industry is required"),
    taxId: z.string().min(1, "Tax ID is required"),
    businessLicenseFile: z
      .instanceof(File, { message: "Business license file is required" })
      .refine((file) => file.size <= 5000000, {
        message: "File size should be less than 5MB",
      })
      .refine(
        (file) => {
          const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "application/pdf",
          ];
          return allowedTypes.includes(file.type);
        },
        { message: "Only image (JPEG, PNG, WebP) and PDF files are allowed" },
      ),
    businessStartedDate: z
      .object({
        day: z.string().optional(),
        month: z.string().optional(),
        year: z.string().optional(),
      })
      .optional(),
    agreedToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  });
  const phoneCodes = [
    {
      code: "+962",
      flag: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Flag_of_Jordan.svg",
    },
    {
      code: "+966",
      flag: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Flag_of_Saudi_Arabia.svg",
    },
    {
      code: "+971",
      flag: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Flag_of_the_United_Arab_Emirates.svg",
    },
  ];

  const [country, setCountry] = useState(null);
  const [phoneCode, setPhoneCode] = useState(phoneCodes[0]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(businessAccountSchema),
    defaultValues: {
      companyName: "",
      commercialName: "",
      businessEmail: "",
      establishmentNumber: "",
      businessPhone: "",
      countryId: "",
      industryId: "",
      taxId: "",
      businessLicenseFile: null,
      businessStartedDate: {
        day: "",
        month: "",
        year: "",
      },
      agreedToTerms: false,
    },
  });

  const businessLicenseFile = watch("businessLicenseFile");

  useEffect(() => {
    dispatch(fetchIndustries());
    dispatch(fetchCountriesListAnonymous());
  }, [dispatch]);

  useEffect(() => {
    if (allCountriesList.length > 0 && !country) {
      setCountry(allCountriesList[0]);
      setValue("countryId", allCountriesList[0].id);
    }
  }, [allCountriesList, country, setValue]);

  useEffect(() => {
    if (businessLicenseFile instanceof File) {
      const fileType = businessLicenseFile.type;

      if (fileType.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(businessLicenseFile);
      } else {
        setImagePreview(null);
      }
    } else {
      setImagePreview(null);
    }

    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [businessLicenseFile]);

  const handleRemoveFile = () => {
    setValue("businessLicenseFile", null);
    setImagePreview(null);
  };

  const onSubmit = async (data) => {
    try {
      let commercialImageId = "";

      if (data.businessLicenseFile) {
        setIsUploading(true);
        try {
          const uploadResult = await uploadImage(data.businessLicenseFile);
          commercialImageId = uploadResult.result?.id || "";
        } catch (uploadError) {
          showToast.error(
            t("businessAccount.uploadError") ||
              "Failed to upload business license file",
          );
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      let businessStartedDate = "";
      if (
        data.businessStartedDate?.year &&
        data.businessStartedDate?.month &&
        data.businessStartedDate?.day
      ) {
        const year = data.businessStartedDate.year;
        const month = String(data.businessStartedDate.month).padStart(2, "0");
        const day = String(data.businessStartedDate.day).padStart(2, "0");
        businessStartedDate = `${year}-${month}-${day}`;
      }

      const requestBody = {
        companyName: data.companyName,
        commercialName: data.commercialName,
        logoId: "",
        taxId: data.taxId,
        commercialImageId: commercialImageId,
        establishmentNo: data.establishmentNumber || "",
        businessPhone: `${data.businessPhone}`,
        businessEmail: data.businessEmail,
        countryId: data.countryId,
        industryId: data.industryId,
        businessStartedDate: businessStartedDate || undefined,
        status: "PENDING",
      };

      await dispatch(createCompany(requestBody))
        .unwrap()
        .then(() => {
          showToast.success(
            t("businessAccount.success") ||
              "Business account created successfully!",
          );
          dispatch(userCompanyStatus(userCheck?.id)).unwrap();
          setSuccessMessage(true);
          navigation("/");
        })
        .catch((error) => {
          showToast.error(
            error.message ||
              t("businessAccount.error") ||
              "Failed to create business account. Please try again.",
          );
        });
    } catch (error) {
      console.error("Error:", error);
      showToast.error(
        error.message ||
          t("businessAccount.error") ||
          "Failed to create business account. Please try again.",
      );
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    navigation("/");
  };

  if (!isOpen) return null;

  console.log("errors", errors);

  return (
    <div className="main-user-account">
      <div className="modalOverlay">
        <div className="modalContainer">
          <button className="closeButton" onClick={handleClose}>
            <CloseIcon />
          </button>

          <div className="modalContent">
            <div className="leftSection">
              <div className="leftSectionHeader">
                <h1 className="modalTitle">
                  {t("businessAccount.title") || "Start Your Business Account"}
                </h1>
                <p className="modalSubtitle">
                  {t("businessAccount.subtitle") ||
                    "Start your business account to access wholesale products competitive pricing and tools designed to support your daily operations."}
                </p>
              </div>
              {successMessage ? (
                <>
                  <div className="create-message-wrapper">
                    <div className="create-message">
                      <img
                        src="https://media.istockphoto.com/id/691856234/vector/flat-round-check-mark-green-icon-button-tick-symbol-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=hXL5nXQ2UJlh4yzs2LyZC4GtctQG0fs-mk30GPPbhbQ="
                        alt="done"
                      />
                      <h2>{t("businessAccount.done") || "Done"}</h2>
                      <p>
                        {t("businessAccount.pendingMessage") ||
                          "Your business account has been created and is currently being"}{" "}
                        <strong
                          style={{
                            color: "#000",
                          }}
                        >
                          {t("businessAccount.pending") || "Pending"}
                        </strong>{" "}
                        {t("businessAccount.fromAdmin") || "from admin"}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="leftSectionScrollable">
                    <div className="formSection">
                      <h3 className="sectionTitle">
                        {t("businessAccount.businessInformation") ||
                          "Business Information"}
                      </h3>

                      <div className="formGroup">
                        <label className="formLabel">
                          {t("businessAccount.companyName") || "Company Name"}
                        </label>
                        <Controller
                          name="companyName"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              placeholder={
                                t("businessAccount.companyNamePlaceholder") ||
                                "Company Name"
                              }
                              className={`formInput ${
                                errors.companyName ? "errorInput" : ""
                              }`}
                            />
                          )}
                        />
                        {errors.companyName && (
                          <span className="errorMessage">
                            {errors.companyName.message}
                          </span>
                        )}
                      </div>

                      <div className="formGroup">
                        <label className="formLabel">
                          {t("businessAccount.commercialName") ||
                            "Commercial Name"}
                        </label>
                        <Controller
                          name="commercialName"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              placeholder={
                                t(
                                  "businessAccount.commercialNamePlaceholder",
                                ) || "Commercial Name"
                              }
                              className={`formInput ${
                                errors.commercialName ? "errorInput" : ""
                              }`}
                            />
                          )}
                        />
                        {errors.commercialName && (
                          <span className="errorMessage">
                            {errors.commercialName.message}
                          </span>
                        )}
                      </div>

                      <div className="formGroup">
                        <label className="formLabel">
                          {t("businessAccount.establishmentNumber") ||
                            "Establishment Number"}
                        </label>
                        <Controller
                          name="establishmentNumber"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              placeholder={
                                t(
                                  "businessAccount.establishmentNumberPlaceholder",
                                ) || "Establishment Number"
                              }
                              className={`formInput ${
                                errors.establishmentNumber ? "errorInput" : ""
                              }`}
                            />
                          )}
                        />
                        {errors.establishmentNumber && (
                          <span className="errorMessage">
                            {errors.establishmentNumber.message}
                          </span>
                        )}
                      </div>

                      <div className="formGroup">
                        <label className="formLabel">
                          {t("businessAccount.businessEmail") ||
                            "Business Email"}
                        </label>
                        <Controller
                          name="businessEmail"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="email"
                              placeholder={
                                t("businessAccount.businessEmailPlaceholder") ||
                                "Business Email"
                              }
                              className={`formInput ${
                                errors.businessEmail ? "errorInput" : ""
                              }`}
                            />
                          )}
                        />
                        {errors.businessEmail && (
                          <span className="errorMessage">
                            {errors.businessEmail.message}
                          </span>
                        )}
                      </div>

                      <div className="formGroup">
                        <label className="formLabel">
                          {t("businessAccount.businessPhone") ||
                            "Business Phone Number"}
                        </label>

                        <div className="phone-wrapper">
                          <div
                            className="phone-code"
                            onClick={() => setCodeOpen(!codeOpen)}
                          >
                            <img src={phoneCode.flag} alt="" />
                            <span
                              style={{
                                color: "#818181",
                              }}
                            >
                              {phoneCode.code}
                            </span>
                            <KeyboardArrowDownIcon fontSize="small" />
                          </div>

                          <Controller
                            name="businessPhone"
                            control={control}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="tel"
                                placeholder={
                                  t(
                                    "businessAccount.businessPhonePlaceholder",
                                  ) || "Phone Number"
                                }
                                onChange={(e) => {
                                  const value = e.target.value.replace(
                                    /\D/g,
                                    "",
                                  );
                                  field.onChange(value);
                                }}
                              />
                            )}
                          />
                        </div>

                        {codeOpen && (
                          <div className="dropdown phone-dropdown">
                            {phoneCodes.map((c) => (
                              <div
                                key={c.code}
                                className="dropdown-item"
                                onClick={() => {
                                  setPhoneCode(c);
                                  setCodeOpen(false);
                                }}
                              >
                                <img src={c.flag} alt="" />
                                <span>{c.code}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {errors.businessPhone && (
                          <span className="errorMessage">
                            {errors.businessPhone.message}
                          </span>
                        )}
                      </div>

                      <div className="formGroup">
                        <label className="formLabel">
                          {t("businessAccount.businessCountry") ||
                            "Business Country"}
                        </label>

                        <div
                          className="select-box"
                          onClick={() => setCountryOpen(!countryOpen)}
                        >
                          <div className="select-value">
                            {country && (
                              <img
                                src={`${imageUrl}${country.flagId}`}
                                alt=""
                              />
                            )}
                            <span>
                              {country?.name ||
                                t("businessAccount.selectCountry") ||
                                "Select Country"}
                            </span>
                          </div>
                          <KeyboardArrowDownIcon />
                        </div>

                        {countryOpen && (
                          <div className="dropdown">
                            {allCountriesList.map((c) => (
                              <div
                                key={c.id}
                                className="dropdown-item"
                                onClick={() => {
                                  setCountry(c);
                                  setValue("countryId", c.id);
                                  setCountryOpen(false);
                                }}
                              >
                                <img src={`${imageUrl}${c.flagId}`} alt="" />
                                <span>{c.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {errors.countryId && (
                          <span className="errorMessage">
                            {errors.countryId.message}
                          </span>
                        )}
                      </div>

                      <div className="formGroup">
                        <label className="formLabel">
                          {t("businessAccount.businessIndustry") ||
                            "Business Industry"}
                        </label>
                        <Controller
                          name="industryId"
                          control={control}
                          render={({ field }) => (
                            <select
                              {...field}
                              className={`formInput ${
                                errors.industryId ? "errorInput" : ""
                              }`}
                            >
                              <option value="">
                                {t("businessAccount.selectIndustry") ||
                                  "Select Industry"}
                              </option>
                              {items.map((industry) => (
                                <option key={industry.id} value={industry.id}>
                                  {industry.name}
                                </option>
                              ))}
                            </select>
                          )}
                        />
                        {errors.industryId && (
                          <span className="errorMessage">
                            {errors.industryId.message}
                          </span>
                        )}
                      </div>

                      <div className="formGroup">
                        <label className="formLabel">
                          {t("businessAccount.taxId") || "Tax ID"}
                        </label>
                        <Controller
                          name="taxId"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              placeholder={
                                t("businessAccount.taxIdPlaceholder") ||
                                "Tax ID"
                              }
                              className={`formInput ${
                                errors.taxId ? "errorInput" : ""
                              }`}
                            />
                          )}
                        />
                        {errors.taxId && (
                          <span className="errorMessage">
                            {errors.taxId.message}
                          </span>
                        )}
                      </div>

                      <div className="formGroup">
                        <label className="formLabel">
                          {t("businessAccount.uploadBusinessLicense") ||
                            "Upload Business license File"}
                        </label>
                        <div
                          className={`fileUpload ${
                            errors.businessLicenseFile ? "errorInput" : ""
                          }`}
                        >
                          <input
                            type="text"
                            placeholder={
                              t(
                                "businessAccount.businessLicenseFilePlaceholder",
                              ) || "Business license file"
                            }
                            className="fileInputDisplay"
                            value={businessLicenseFile?.name || ""}
                            readOnly
                          />
                          <label className="uploadButton">
                            ⬆
                            <Controller
                              name="businessLicenseFile"
                              control={control}
                              render={({
                                field: { onChange, value, ...field },
                              }) => (
                                <input
                                  {...field}
                                  type="file"
                                  accept="image/*,.pdf"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    onChange(file || null);
                                  }}
                                  hidden
                                />
                              )}
                            />
                          </label>
                        </div>

                        {imagePreview && (
                          <div className="imagePreviewContainer">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="imagePreview"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveFile}
                              className="removeImageButton"
                            >
                              <DeleteIcon fontSize="small" />
                            </button>
                          </div>
                        )}

                        {businessLicenseFile && !imagePreview && (
                          <div className="filePreviewContainer">
                            <span className="fileName">
                              {businessLicenseFile.name}
                            </span>
                            <button
                              type="button"
                              onClick={handleRemoveFile}
                              className="removeFileButton"
                            >
                              <DeleteIcon fontSize="small" />
                            </button>
                          </div>
                        )}

                        <p className="fileNote">
                          {t("businessAccount.fileNote") ||
                            "Note: Image, PDF file (Max 5MB)"}
                        </p>
                        {errors.businessLicenseFile && (
                          <span className="errorMessage">
                            {errors.businessLicenseFile.message}
                          </span>
                        )}
                      </div>

                      <div className="formGroup">
                        <label className="formLabel">
                          {t("businessAccount.businessStartedDate") ||
                            "Business Started Date"}{" "}
                          <span className="optionalLabel">
                            ({t("businessAccount.optional") || "optional"})
                          </span>
                        </label>
                        <div className="dateInputs">
                          <Controller
                            name="businessStartedDate.day"
                            control={control}
                            render={({ field }) => (
                              <select {...field} className="dateInput">
                                <option value="">
                                  {t("businessAccount.day") || "Day"}
                                </option>
                                {[...Array(31)].map((_, i) => (
                                  <option key={i + 1} value={i + 1}>
                                    {i + 1}
                                  </option>
                                ))}
                              </select>
                            )}
                          />

                          <Controller
                            name="businessStartedDate.month"
                            control={control}
                            render={({ field }) => (
                              <select {...field} className="dateInput">
                                <option value="">
                                  {t("businessAccount.month") || "Month"}
                                </option>
                                {[
                                  "January",
                                  "February",
                                  "March",
                                  "April",
                                  "May",
                                  "June",
                                  "July",
                                  "August",
                                  "September",
                                  "October",
                                  "November",
                                  "December",
                                ].map((m, i) => (
                                  <option key={i + 1} value={i + 1}>
                                    {m}
                                  </option>
                                ))}
                              </select>
                            )}
                          />

                          <Controller
                            name="businessStartedDate.year"
                            control={control}
                            render={({ field }) => (
                              <select {...field} className="dateInput">
                                <option value="">
                                  {t("businessAccount.year") || "Year"}
                                </option>
                                {[...Array(50)].map((_, i) => {
                                  const year = new Date().getFullYear() - i;
                                  return (
                                    <option key={year} value={year}>
                                      {year}
                                    </option>
                                  );
                                })}
                              </select>
                            )}
                          />
                        </div>
                      </div>

                      <div className="formGroup checkboxGroup">
                        <label className="checkboxLabel">
                          <Controller
                            name="agreedToTerms"
                            control={control}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="checkbox"
                                checked={field.value}
                                onChange={(e) =>
                                  field.onChange(e.target.checked)
                                }
                                className="checkbox"
                              />
                            )}
                          />
                          <span className="checkboxText">
                            {t("businessAccount.agreeToTerms") ||
                              "By ticking, you agree to"}{" "}
                            <a href="#" className="termsLink">
                              {t("businessAccount.termsAndConditions") ||
                                "SAWA terms and conditions"}
                            </a>
                            .
                          </span>
                        </label>
                        {errors.agreedToTerms && (
                          <span className="errorMessage">
                            {errors.agreedToTerms.message}
                          </span>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || isUploading}
                        className={`submitButton ${
                          isSubmitting || isUploading
                            ? "submitButtonDisabled"
                            : ""
                        }`}
                      >
                        {isUploading
                          ? t("businessAccount.uploading") || "Uploading..."
                          : isSubmitting
                            ? t("businessAccount.creatingAccount") ||
                              "Creating Account..."
                            : t("businessAccount.createButton") ||
                              "Create Business Account"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            <div className="rightSection">
              <h2 className="benefitsTitle">
                {t("businessAccount.builtForBusiness") || "Built for Business"}
              </h2>

              {[1, 2, 3].map((i) => (
                <div className="benefitItem" key={i}>
                  <div className="benefitIcon">✓</div>
                  <div>
                    <h4 className="benefitHeading">
                      {t("businessAccount.benefitHeading") ||
                        "Buy more save more"}
                    </h4>
                    <p className="benefitText">
                      {t("businessAccount.benefitText") ||
                        "Save more when you order in larger quantities."}
                    </p>
                  </div>
                </div>
              ))}

              <div className="pageWrapper">
                <div className="merchantSection">
                  <p className="merchantText">
                    {t("businessAccount.merchantText") ||
                      "I'm looking to be a Merchant."}
                  </p>
                  <a href="#" className="merchantLink">
                    {t("businessAccount.merchantLink") ||
                      "Create a Merchant account"}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBusinessAccount;
