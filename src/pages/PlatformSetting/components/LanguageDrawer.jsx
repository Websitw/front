import React, { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import FormInput from "../../../components/common/FormInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { languageSchema } from "../../../components/Admin/Schemas/languageSchema";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchLanguages,
  createLanguage,
  updateLanguage,
  deleteLanguagesBulk,
} from "../../../store/slices/languageSlice";
import CustomSwitch from "../../../components/common/CustomSwitch";
import ConfirmDialog from "../../../components/Admin/Modal/Modal";
import { Trash, EditIcon } from "../../../assets/icons";
import EditLanguageModal from "./EditModal/EditLanguage";
import { showToast } from "../../../components/CustomToast/CustomToast";
import DataModal from "./InfoModal/InfoModal";

const LanguageDrawer = ({ onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.languages);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLanguagesModalOpen, setIsLanguagesModalOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(languageSchema),
    defaultValues: {
      languageCode: "",
      name: "",
      status: "ACTIVE",
    },
  });

  const transformLanguagesData = (languages) => {
    if (!languages || languages.length === 0) return [];

    return languages.map((lang) => ({
      id: lang.id,
      englishName: lang.name || "-",
      // arabicName: lang.nameAr || "-", 
      code: lang.languageCode || "-",
      createdBy: lang.creatorid || "-",
      createdDate: lang.createdAt 
        ? new Date(lang.createdAt).toLocaleString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          })
        : "-",
      status: lang.status === "ACTIVE",
      originalStatus: lang.status,
    }));
  };

  const languagesColumns = [
    { header: t("common.english_name") || "English Name", key: "englishName" },
    // { header: t("common.arabic_name") || "Arabic Name", key: "arabicName" },
    { header: t("common.code") || "Code", key: "code" },
    { header: t("common.created_by") || "Created By", key: "createdBy" },
    { header: t("common.created_date") || "Created Date", key: "createdDate" },
    { header: t("common.status") || "Status", key: "status" },
  ];

  const handleLanguageStatusChangeInModal = async (index) => {
    const transformedData = transformLanguagesData(items);
    const selectedLang = transformedData[index];
    
    const originalLang = items.find(l => l.id === selectedLang.id);
    
    if (!originalLang) {
      showToast.error(t("dashboard.error"));
      return;
    }

    try {
      await dispatch(
        updateLanguage({
          id: originalLang.id,
          data: {
            ...originalLang,
            status: originalLang.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
          },
        })
      )
        .unwrap()
        .then(() => {
          showToast.success(t("dashboard.update_success"));
          dispatch(fetchLanguages());
        })
        .catch((error) => {
          showToast.error(error?.message || t("dashboard.error"));
        });
    } catch (error) {
      showToast.error(error?.message || t("dashboard.error"));
      console.error("Failed to update language status:", error);
    }
  };

  console.log("Languages Items:", items);
  
  useEffect(() => {
    dispatch(fetchLanguages());
  }, [dispatch, t]);

  const handleStatusChange = async (lang) => {
    try {
      await dispatch(
        updateLanguage({
          id: lang.id,
          data: {
            ...lang,
            status: lang.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
          },
        })
      )
        .unwrap()
        .then(() => {
          showToast.success(t("dashboard.update_success"));
          dispatch(fetchLanguages());
        })
        .catch((error) => {
          showToast.error(error?.message || t("dashboard.error"));
        });
    } catch (error) {
      showToast.error(error?.message || t("dashboard.error"));
      console.error("Failed to update region status:", error);
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      const formData ={
        ...data,
        // name_i18n:{
        //   en:data.name,
        //   ar:"scasc"
        // }
      }
      await dispatch(createLanguage(formData))
        .unwrap()
        .then(() => {
          showToast.success(t("dashboard.create_success"));
          reset();
          dispatch(fetchLanguages());
        })
        .catch((error) => {
          showToast.error(error?.message || t("dashboard.error"));
        });
    } catch (error) {
      showToast.error(error?.message || t("dashboard.error"));
      console.error("Failed to create language:", error);
    }
  };

  const handleSelectIds = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) {
      showToast.info(t("common.select_delete"));
      return;
    }
    setIsConfirmDialogOpen(true);
  };

  const handleCancelDelete = () => {
    setIsConfirmDialogOpen(false);
  };

  const confirmDelete = async () => {
    if (selectedIds.length !== 0) {
      try {
        setIsDeleting(true);
        await dispatch(deleteLanguagesBulk(selectedIds))
          .unwrap()
          .then(() => {
            showToast.success(t("users.delete_success"));
            setIsConfirmDialogOpen(false);
            setSelectedIds([]);
            dispatch(fetchLanguages());
            setIsDeleting(false);
          })
          .catch((error) => {
            showToast.error(error?.message || t("dashboard.error"));
            setIsDeleting(false);
          });
      } catch (error) {
        showToast.error(error?.message || t("dashboard.error"));
        console.error("Error deleting languages:", error);
      }
    }
  };

  const selectAllToDelete = (e) => {
    const isChecked = e.target.checked;
    if (!isChecked) {
      setSelectedIds([]);
      return;
    }
    if (items?.length !== 0) {
      const allIds = items.map((lang) => lang.id);
      setSelectedIds(allIds);
    } else {
      showToast.info(t("common.no_items"));
    }
  };

  const handleOpenEditModal = (language) => {
    setSelectedLanguage(language);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedLanguage(null);
  };

  const handleEditSubmit = async (data) => {
    try {
      setIsUpdating(true);
      await dispatch(
        updateLanguage({
          id: data.id,
          data: data,
        })
      )
        .unwrap()
        .then(() => {
          showToast.success(t("dashboard.update_success"));
          handleCloseEditModal();
          dispatch(fetchLanguages());
        })
        .catch((error) => {
          showToast.error(error?.message || t("dashboard.error"));
        });
    } catch (error) {
      showToast.error(error?.message || t("dashboard.error"));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <DataModal
        isOpen={isLanguagesModalOpen}
        onClose={() => setIsLanguagesModalOpen(false)}
        title={"Languages"}
        columns={languagesColumns}
        data={transformLanguagesData(items)}
        onStatusChange={handleLanguageStatusChangeInModal}
      />

      <ConfirmDialog
        open={isConfirmDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={confirmDelete}
        title={t("users.delete_dialog_title", { name: t("languages.title") })}
        message={t("users.delete_dialog_message", {
          name: t("languages.title"),
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
            <h1>{t("languages.title")}</h1>
            <p>{t("languages.subtitle")}</p>
          </div>

          <button className="regions-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="regions-divider" />
        <h2 className="regions-title">{t("languages.title")} </h2>
        <div className="regions-subheader">
          <span
            style={{
              fontSize: "16px",
            }}
          >
            {t("common.available", { name: t("languages.title") })}
          </span>
          <span className="delete-action" onClick={handleDelete}>
            <Trash style={{ margin: "4px" }} />
            <span
              style={{
                fontSize: "14px",
              }}
              className="delete-button-drawer"
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
            {items &&
              items?.map((lang) => {
                return (
                  <React.Fragment key={lang.id}>
                    <span>
                      <input
                        type="checkbox"
                        value={lang.id}
                        checked={selectedIds.includes(lang.id)}
                        onChange={() => handleSelectIds(lang.id)}
                      />
                    </span>
                    <span className="region-name">
                      {lang?.name?.length > 7
                        ? lang.name.substring(0, 7) + "..."
                        : lang.name}
                    </span>
                    <span className="region-code">{lang.languageCode}</span>

                    <span className="region-status">
                      <CustomSwitch
                        checked={lang.status === "ACTIVE"}
                        onChange={() => handleStatusChange(lang)}
                      />
                      <span
                        className={
                          lang.status === "ACTIVE"
                            ? "status-active"
                            : "status-inactive"
                        }
                      >
                        {lang.status === "ACTIVE"
                          ? t("common.status_item.active")
                          : t("common.status_item.inactive")}
                      </span>
                    </span>
                    <span className="region-edit">
                      <EditIcon
                        style={{ cursor: "pointer" }}
                        onClick={() => handleOpenEditModal(lang)}
                      />
                    </span>
                  </React.Fragment>
                );
              })}
          </div>
        </div>

        <p 
          className="see-all-info"
          onClick={() => setIsLanguagesModalOpen(true)}
          style={{ cursor: 'pointer' }}
        >
          {t("common.see-all") || "See All Table info"}
        </p>

        <h2 className="regions-title">{t("languages.addTitle")} </h2>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <FormInput
            label={t("languages.form.languageName")}
            name="name"
            type="text"
            control={control}
            bgColor="var(--color-white)"
            styleLabel={{ marginBottom: "0px" }}
            variant="bordered"
            error={errors.name?.message ? t(errors.name.message) : undefined}
            placeholder={t("languages.form.languageNamePlaceholder")}
          />
          <FormInput
            label={t("languages.form.languageCode")}
            name="languageCode"
            type="text"
            control={control}
            bgColor="var(--color-white)"
            variant="bordered"
            error={
              errors.languageCode?.message
                ? t(errors.languageCode.message)
                : undefined
            }
              styleLabel={{ marginTop: "16px", marginBottom: "0px" }}
            placeholder={t("languages.form.languageCodePlaceholder")}
          />

          <button
            type="submit"
            className={
              isSubmitting ? "add-region-btn submitting" : "add-region-btn"
            }
            disabled={isSubmitting}
          >
            {isSubmitting ? t("common.submitting") : t("common.submit")}
          </button>
        </form>
      </div>

      <EditLanguageModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleEditSubmit}
        initialData={selectedLanguage}
        isLoading={isUpdating}
      />
    </>
  );
};

export default LanguageDrawer;