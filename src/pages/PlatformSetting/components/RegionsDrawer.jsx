import React, { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { regionSchema } from "../../../components/Admin/Schemas/regionSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "../../../components/common/FormInput";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { ITEMS_PER_PAGE } from "../../../helper/helper";
import {
  getRegions,
  updateRegion,
  deleteRegionsBulk,
} from "../../../store/slices/regionSlice";
import { toast } from "react-toastify";
import CustomSwitch from "../../../components/common/CustomSwitch";
import ConfirmDialog from "../../../components/Admin/Modal/Modal";
import { Trash, EditIcon } from "../../../assets/icons";
import { showToast } from "../../../components/CustomToast/CustomToast";
import EditRegionModal from "./EditModal/EditRegion";
import DataModal from "./InfoModal/InfoModal";

const RegionsDrawer = ({ onClose, mode = "create", onSubmit }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [ids, setIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRegionsModalOpen, setIsRegionsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { regionsList, totalPages } = useSelector((state) => state.regions);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(regionSchema),
    defaultValues: {
      regionCode: "",
      name: "",
      isActive: true,
      nameAr: "",
    },
  });

  console.log("Regions List:", regionsList);
  const transformRegionsData = (regions) => {
    if (!regions || regions.length === 0) return [];

    return regions.map((region) => ({
      id: region.id,
      englishName: region.regionName || region.name || "-",
      arabicName: region?.name_i18n?.ar || "-",
      code: region.regionCode || "-",
      createdBy: region.creatorid || "-",
      createdDate: region.createdAt
        ? new Date(region.createdAt).toLocaleString("en-US", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          })
        : "-",
      status: region.status === "ACTIVE",
      originalStatus: region.status,
    }));
  };

  const regionsColumns = [
    { header: t("common.english_name"), key: "englishName" },
    { header: t("common.arabic_name"), key: "arabicName" },
    { header: t("common.code"), key: "code" },
    { header: t("common.created_by"), key: "createdBy" },
    { header: t("common.created_date"), key: "createdDate" },
    { header: t("common.status"), key: "status" },
  ];

  useEffect(() => {
    dispatch(
      getRegions({
        page: currentPage,
      })
    );
  }, [dispatch, currentPage]);

  const handleRegionStatusChangeInModal = async (index) => {
    const transformedData = transformRegionsData(regionsList);
    const selectedRegion = transformedData[index];

    const originalRegion = regionsList.find((r) => r.id === selectedRegion.id);

    if (!originalRegion) {
      toast.error(t("dashboard.error"));
      return;
    }

    try {
      await dispatch(
        updateRegion({
          regionId: originalRegion.id,
          regionData: {
            ...originalRegion,
            status: originalRegion.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
          },
        })
      )
        .unwrap()
        .then(() => {
          showToast.success(t("dashboard.update_success"), "Message");
          dispatch(
            getRegions({
              page: currentPage,
            })
          );
        })
        .catch((error) => {
          toast.error(error?.message || t("dashboard.error"));
        });
    } catch (error) {
      toast.error(error?.message || t("dashboard.error"));
      console.error("Failed to update region status:", error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    reset();
  };

  const handleStatusChange = async (region) => {
    try {
      await dispatch(
        updateRegion({
          regionId: region.id,
          regionData: {
            ...region,
            status: region.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
          },
        })
      )
        .unwrap()
        .then(() => {
          showToast.success(t("dashboard.update_success"), "Message");
          dispatch(
            getRegions({
              page: currentPage,
            })
          );
        })
        .catch((error) => {
          toast.error(error?.message || t("dashboard.error"));
        });
    } catch (error) {
      toast.error(error?.message || t("dashboard.error"));
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
        await dispatch(deleteRegionsBulk(ids))
          .unwrap()
          .then(() => {
            toast.success(t("users.delete_success"));
            setIsConfirmDialogOpen(false);
            setIds([]);
            dispatch(
              getRegions({
                page: currentPage,
              })
            );
            setIsDeleting(false);
          })
          .catch((error) => {
            toast.error(error?.message || t("dashboard.error"));
            setIsDeleting(false);
          });
      } catch (error) {
        console.error("Error deleting region:", error);
        toast.error(error?.message || t("dashboard.error"));
      }
    }
  };

  const handleBulkDelete = () => {
    if (ids.length === 0) {
      toast.info(t("common.select_delete"));
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
    if (regionsList?.length !== 0) {
      const allIds = regionsList.map((region) => region.id);
      setIds(allIds);
    } else {
      toast.info(t("common.no_items"));
    }
  };

  const handleOpenEditModal = (region) => {
    setSelectedRegion(region);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedRegion(null);
  };

  const handleEditSubmit = async (data) => {
    try {
      setIsUpdating(true);
      await dispatch(
        updateRegion({
          regionId: data.id,
          regionData: data,
        })
      )
        .unwrap()
        .then(() => {
          showToast.success(t("dashboard.update_success"), "Message");
          handleCloseEditModal();
          dispatch(
            getRegions({
              page: currentPage,
            })
          );
        })
        .catch((error) => {
          toast.error(error?.message || t("dashboard.error"));
        });
    } catch (error) {
      toast.error(error?.message || t("dashboard.error"));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <DataModal
        isOpen={isRegionsModalOpen}
        onClose={() => setIsRegionsModalOpen(false)}
        title={t("regions.title")}
        columns={regionsColumns}
        data={transformRegionsData(regionsList)}
        onStatusChange={handleRegionStatusChangeInModal}
      />

      <ConfirmDialog
        open={isConfirmDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={confirmDelete}
        title={t("users.delete_dialog_title", { name: t("regions.region") })}
        message={t("users.delete_dialog_message", {
          name: t("regions.region"),
        })}
        confirmText={t("users.delete_confirm")}
        cancelText={t("users.delete_cancel")}
        confirmColor="error"
        loading={isDeleting}
      />

      <div className="regions-overlay" onClick={onClose} />

      <div className="regions-drawer">
        <div className="regions-header">
          <div>
            <h1>{t("regions.title")}</h1>
            <p>{t("regions.modal.subtitleCreate")}</p>
          </div>

          <button className="regions-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="regions-divider" />
        <h2 className="regions-title">{t("sidebar.regions")}</h2>
        <div className="regions-subheader">
          <span
            style={{
              fontSize: "16px",
            }}
          >
            {t("common.available", { name: t("sidebar.regions") })}
          </span>
          <span className="delete-action" onClick={handleBulkDelete}>
            <Trash style={{ margin: "4px" }} />
            <span
              style={{
                fontSize: "16px",
                fontWeight: "400",
                color: "var(--color-secondary-light)",
              }}
            >
              {t("common.delete")}
            </span>
          </span>
        </div>

        <div className="regions-table">
          <div className="regions-table-head">
            <span>
              <input type="checkbox" onClick={selectAllToDelete} />
            </span>
            <span>{t("common.name")}</span>
            <span>{t("common.code")}</span>
            <span>{t("common.status")}</span>
            <span>{t("common.edit")}</span>
          </div>

          <div className="regions-table-row">
            {regionsList &&
              regionsList.map((region) => {
                return (
                  <React.Fragment key={region.id}>
                    <span>
                      <input
                        type="checkbox"
                        value={region.id}
                        checked={ids.includes(region.id)}
                        onChange={() => handleSelectIds(region.id)}
                      />
                    </span>
                    <span className="region-name">
                      {region.name.length > 7
                        ? `${region.name.substring(0, 7)}...`
                        : region.name}
                    </span>
                    <span className="region-code">{region.regionCode}</span>

                    <span className="region-status">
                      <CustomSwitch
                        checked={region.status === "ACTIVE"}
                        onChange={() => handleStatusChange(region)}
                      />
                      <span
                        className={
                          region.status === "ACTIVE"
                            ? "status-active"
                            : "status-inactive"
                        }
                      >
                        {region.status === "ACTIVE"
                          ? t("common.status_item.active")
                          : t("common.status_item.inactive")}
                      </span>
                    </span>
                    <span className="region-edit">
                      <EditIcon
                        style={{ cursor: "pointer" }}
                        onClick={() => handleOpenEditModal(region)}
                      />
                    </span>
                  </React.Fragment>
                );
              })}
          </div>
        </div>

        <p
          className="see-all-info"
          onClick={() => setIsRegionsModalOpen(true)}
          style={{ cursor: "pointer" }}
        >
          {t("common.see-all")}
        </p>

        <h2 className="regions-title">{t("regions.modal.addRegion")}</h2>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <FormInput
            label={t("regions.form.regionName")}
            name="name"
            type="text"
            placeholder={t("regions.form.regionNamePlaceholder")}
            required
            bgColor="var(--color-white)"
            variant="bordered"
            control={control}
            styleLabel={{ marginBottom: "0px" }}
            error={errors.name?.message ? t(errors.name.message) : ""}
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
            styleLabel={{ marginTop: "16px", marginBottom: "0px" }}
          />
          <FormInput
            label={t("regions.form.regionCode")}
            name="regionCode"
            type="text"
            placeholder={t("regions.form.regionCodePlaceholder")}
            required
            bgColor="var(--color-white)"
            variant="bordered"
            disabled={mode === "edit"}
            control={control}
            error={
              errors.regionCode?.message ? t(errors.regionCode.message) : ""
            }
            styleLabel={{ marginTop: "16px", marginBottom: "0px" }}
          />
          <button
            type="submit"
            className={
              isSubmitting ? "add-region-btn submitting" : "add-region-btn"
            }
            disabled={isSubmitting}
          >
            {isSubmitting
              ? t("common.submitting")
              : t("regions.modal.addRegion")}
          </button>
        </form>
      </div>

      <EditRegionModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleEditSubmit}
        initialData={selectedRegion}
        isLoading={isUpdating}
      />
    </>
  );
};

export default RegionsDrawer;
