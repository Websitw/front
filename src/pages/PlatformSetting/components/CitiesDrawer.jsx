import React, { useState, useEffect, use } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "../../../components/common/FormInput";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { ITEMS_PER_PAGE } from "../../../helper/helper";
import {
  getCities,
  updateCity,
  createCity,
  deleteCitiesBulk,
} from "../../../store/slices/citiesSlice";
import { fetchAllCountries } from "../../../store/slices/counteriesSlice";
import CustomSwitch from "../../../components/common/CustomSwitch";
import ConfirmDialog from "../../../components/Admin/Modal/Modal";
import FormMapLocation from "../../../components/common/FormMapLocation";
import FormCoordinateInputs from "../../../components/common/FormCoordinateInputs";
import FormCheckbox from "../../../components/common/Formcheckbox";
import { citySchema } from "../../../components/Admin/Schemas/CitiesSchema";
import { showToast } from "../../../components/CustomToast/CustomToast";
const CitiesDrawer = ({
  onClose,
  mode = "create",
  editData = null,
  onCityAdded,
  onCityUpdated
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  console.log("CitiesDrawer mounted:", { mode, editData, onCityAdded, onCityUpdated });
  const [ids, setIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const { citiesList, totalPages } = useSelector((state) => state.cities);
  const { allCountriesList } = useSelector((state) => state.countries);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(citySchema),
    defaultValues: {
      cityNameEn: "",
      cityNameAr: "",
      cityCode: "",
      countryId: "temp-country-id", // Temporary ID for country being configured
      latitude: "",
      isCapital: false,
      status: "ACTIVE",
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (mode === "edit" && editData) {
      setValue("cityNameEn", editData.cityNameEn || "");
      setValue("cityNameAr", editData.cityNameAr || "");
      setValue("cityCode", editData.cityCode || "");
      setValue("countryId", editData.countryId || "temp-country-id");
      setValue("latitude", editData.latitude || "");
      setValue("isCapital", editData.isCapital || false);
      setValue("status", editData.status || "ACTIVE");
    }
  }, [mode, editData, setValue]);

  useEffect(() => {
    dispatch(
      getCities({
        page: currentPage,
        // limit: ITEMS_PER_PAGE,
      })
    );
  }, [dispatch, t, currentPage]);

  useEffect(() => {
    dispatch(fetchAllCountries());
  }, [dispatch]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (data) => {
    try {
      console.log("Form Data Submitted:", data);
      if (mode === "edit" && editData) {
        // Edit mode - call parent callback
        if (onCityUpdated) {
          onCityUpdated({ ...data, id: editData.id });
        }
      } else {
        // Create mode - call parent callback
        if (onCityAdded) {
          onCityAdded(data);
        } else {
          // Fallback to API call if no callback provided
          await dispatch(createCity(data))
            .unwrap()
            .then(() => {
              showToast.success(t("dashboard.create_success"));
              reset();
              dispatch(
                getCities({
                  page: currentPage,
                })
              );
            })
            .catch((error) => {
              showToast.error(error?.message || t("dashboard.error"));
            });
        }
      }
    } catch (error) {
      showToast.error(error?.message || t("dashboard.error"));
      console.error("Failed to save city:", error);
    }
  };

  const handleFormError = (errors) => {
    console.log("Form validation errors:", errors);
    // Show first error message
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      showToast.error(t(firstError.message));
    }
  };
  const handleStatusChange = async (region) => {
    try {
      await dispatch(
        updateCity({
          cityId: region.id,
          cityData: {
            ...region,
            status: region.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
          },
        })
      )
        .unwrap()
        .then(() => {
          showToast.success(t("dashboard.update_success"));
          dispatch(
            getCities({
              page: currentPage,
              // limit: ITEMS_PER_PAGE,
            })
          );
        })
        .catch((error) => {
          showToast.error(error?.message || t("dashboard.error"));
        });
    } catch (error) {
      showToast.error(error?.message || t("dashboard.error"));
      console.error("Failed to update region status:", error);
    }
  };

  const handleSelectIds = (id) => {
    setIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCancelDelete = () => {
    setIsConfirmDialogOpen(false);
  };

  const confirmDelete = async () => {
    if (ids.length !== 0) {
      try {
        setIsDeleting(true);
        await dispatch(deleteCitiesBulk(ids))
          .unwrap()
          .then(() => {
            showToast.success(t("users.delete_success"));
            setIsConfirmDialogOpen(false);
            setIds([]);
            // Refresh regions list after deletion
            dispatch(
              getCities({
                page: currentPage,
                // limit: ITEMS_PER_PAGE,
              })
            );
            setIsDeleting(false);
          })
          .catch((error) => {
            showToast.error(error?.message || t("dashboard.error"));
            setIsDeleting(false);
          });
      } catch (error) {
        console.error("Error deleting region:", error);
        showToast.error(error?.message || t("dashboard.error"));
      }
    }
  };

  const handleBulkDelete = () => {
    if (ids.length === 0) {
      showToast.info(t("common.select_delete"));
      return;
    }
    setIsConfirmDialogOpen(true);
  };


  const selectAllToDelete = (e) => {
    const isChecked = e.target.checked;
    if (!isChecked) {
      setIds([]);
      return;
    }
    if (citiesList?.length !== 0) {
      const allIds = citiesList.map((city) => city.id);
      setIds(allIds);
    } else {
      showToast.info(t("common.no_items"));
    }
  };


  console.log("citiesList", citiesList);
  return (
    <>
      <ConfirmDialog
        open={isConfirmDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={confirmDelete}
        title={t("users.delete_dialog_title")}
        message={t("users.delete_dialog_message")}
        confirmText={t("users.delete_confirm")}
        cancelText={t("users.delete_cancel")}
        confirmColor="error"
        loading={isDeleting}
      />
      <div className="regions-overlay" onClick={onClose} />
      <div className="regions-drawer">
        <div className="regions-header">
          <div>
            <h1>
              {mode === "edit"
                ? t("cities.modal.editTitle")
                : t("cities.modal.createTitle")}
            </h1>
          </div>

          <button className="regions-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="city-form-container">

          <form className="city-form" onSubmit={handleSubmit(handleFormSubmit, handleFormError)}>
            <FormInput
              label={t("cities.modal.cityNameEn")}
              name="cityNameEn"
              type="text"
              placeholder={t("cities.modal.cityNameEnPlaceholder")}
              control={control}
              error={errors.cityNameEn?.message ? t(errors.cityNameEn.message) : ""}
              variant="bordered"
              bgColor={"--var(--color-white)"}

            />

            <FormInput
              label={t("cities.modal.cityNameAr")}
              name="cityNameAr"
              type="text"
              placeholder={t("cities.modal.cityNameArPlaceholder")}
              control={control}
              error={errors.cityNameAr?.message ? t(errors.cityNameAr.message) : ""}
              variant="bordered"
              bgColor={"--var(--color-white)"}
            />

            <FormInput
              label={t("cities.modal.cityCodeOptional")}
              name="cityCode"
              type="text"
              placeholder={t("cities.modal.cityCodePlaceholder")}
              control={control}
              error={errors.cityCode?.message ? t(errors.cityCode.message) : ""}
              variant="bordered"
              bgColor={"--var(--color-white)"}
            />

            <div>
              {/* Coordinate Inputs - Separate Component */}
              <FormCoordinateInputs
                name="latitude"
                control={control}
              />

              {/* Map Location - Separate Component */}
              <FormMapLocation
                label={t("cities.modal.location")}
                name="latitude"
                control={control}
                error={errors.latitude?.message ? t(errors.latitude.message) : ""}
                apiKey={"AIzaSyC1JR7YS_Wjimpb64tG6TwvDMk7IJRGOiY"}
                required
                bgColor={"--var(--color-white)"}
              />

              <FormCheckbox
                label={t("cities.modal.isCapital")}
                name="isCapital"
                control={control}
              />
            </div>

            <button
              type="submit"
              className={
                isSubmitting ? "add-region-btn submitting" : "add-region-btn"
              }
              disabled={isSubmitting}
              onClick={() => console.log("Submit button clicked, errors:", errors)}
            >
              {isSubmitting ? t("common.submitting") : t("common.submit")}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CitiesDrawer;