import React, { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { currencySchema } from "../../../components/Admin/Schemas/currencySchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "../../../components/common/FormInput";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { ITEMS_PER_PAGE } from "../../../helper/helper";
import {
  getCurrencies,
  createCurrency,
  updateCurrency,
  deleteCurrenciesBulk,
} from "../../../store/slices/currenciesSlice";
import { toast } from "react-toastify";
import FormNumberInput from "../../../components/common/FormNumberInput";
import CustomSwitch from "../../../components/common/CustomSwitch";
import ConfirmDialog from "../../../components/Admin/Modal/Modal";
import { Trash, EditIcon } from "../../../assets/icons";
import EditCurrency from "./EditModal/EditCurrency";
import DataModal from "./InfoModal/InfoModal";

const CurrencyDrawer = ({ onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const { currencies } = useSelector((state) => state.currencies);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [isCurrenciesModalOpen, setIsCurrenciesModalOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(currencySchema),
    defaultValues: {
      currencyCode: "",
      name: "",
      decimalPlaces: 2,
      symbol: "",
      isActive: true,
      nameAr: "",
    },
  });

  const transformCurrenciesData = (currenciesData) => {
    if (!currenciesData || currenciesData.length === 0) return [];

    return currenciesData.map((currency) => ({
      id: currency.id,
      englishName: currency.currencyName || currency.name || "-",
      arabicName: currency?.name_i18n?.ar || "-",
      code: currency.currencyCode || "-",
      symbol: currency.symbol || "-",
      decimalPlaces: currency.decimalPlaces || 0,
      createdBy: currency.creatorid || "-",
      // createdDate: currency.createdAt 
      //   ? new Date(currency.createdAt).toLocaleString('en-US', {
      //       month: 'numeric',
      //       day: 'numeric',
      //       year: 'numeric',
      //       hour: 'numeric',
      //       minute: 'numeric',
      //       hour12: true
      //     })
      //   : "-",
      status: currency.status === "ACTIVE",
      originalStatus: currency.status,
    }));
  };

  const currenciesColumns = [
    { header: t("common.english_name") || "English Name", key: "englishName" },
    { header: t("common.arabic_name") || "Arabic Name", key: "arabicName" },
    { header: t("common.code") || "Code", key: "code" },
    { header: t("common.symbol") || "Symbol", key: "symbol" },
    { header: t("currencies.form.decimalPlaces") || "Decimal Places", key: "decimalPlaces" },
    { header: t("common.created_by") || "Created By", key: "createdBy" },
    // { header: t("common.created_date") || "Created Date", key: "createdDate" },
    { header: t("common.status") || "Status", key: "status" },
  ];

  const handleCurrencyStatusChangeInModal = async (index) => {
    const transformedData = transformCurrenciesData(currencies.items);
    const selectedCurr = transformedData[index];
    
    const originalCurr = currencies.items.find(c => c.id === selectedCurr.id);
    
    if (!originalCurr) {
      toast.error(t("dashboard.error"));
      return;
    }

    try {
      await dispatch(
        updateCurrency({
          currencyId: originalCurr.id,
          currencyData: {
            ...originalCurr,
            status: originalCurr.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
          },
        })
      )
        .unwrap()
        .then(() => {
          toast.success(t("dashboard.update_success"));
          dispatch(
            getCurrencies({
              page: currentPage,
            })
          );
        })
        .catch((error) => {
          toast.error(error?.message || t("dashboard.error"));
        });
    } catch (error) {
      toast.error(error?.message || t("dashboard.error"));
      console.error("Failed to update currency status:", error);
    }
  };

  useEffect(() => {
    dispatch(
      getCurrencies({
        page: currentPage,
      })
    );
  }, [dispatch, currentPage]);

 

  const handleFormSubmit = async (data) => {
    try {
      const formData = {
        ...data,
        name_i18n: {
          en: data.name,
          ar: data.nameAr,
        },
      };
      await dispatch(createCurrency(formData)).unwrap();
      toast.success(t("dashboard.create_success"));
      dispatch(
        getCurrencies({
          page: currentPage,
        })
      );
      reset();
    } catch (error) {
      toast.error(error?.message || t("dashboard.error"));
      console.error("Failed to create currency:", error);
    }
  };

  const handleStatusChange = async (currency) => {
    try {
      await dispatch(
        updateCurrency({
          currencyId: currency.id,
          currencyData: {
            ...currency,
            status: currency.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
          },
        })
      )
        .unwrap()
        .then(() => {
          toast.success(t("dashboard.update_success"));
          dispatch(
            getCurrencies({
              page: currentPage,
            })
          );
        })
        .catch((error) => {
          toast.error(error?.message || t("dashboard.error"));
        });
    } catch (error) {
      toast.error(error?.message || t("dashboard.error"));
      console.error("Failed to update currency status:", error);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmDialogOpen(false);
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) {
      toast.info(t("common.select_delete"));
      return;
    }
    setIsConfirmDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedIds.length !== 0) {
      try {
        setIsDeleting(true);
        await dispatch(deleteCurrenciesBulk(selectedIds))
          .unwrap()
          .then(() => {
            toast.success(t("users.delete_success"));
            setIsConfirmDialogOpen(false);
            setSelectedIds([]);
            dispatch(
              getCurrencies({
                page: currentPage,
              })
            );
            setIsDeleting(false);
          })
          .catch((error) => {
            console.log("Error deleting currencies:", error);
            toast.error(error?.message || t("dashboard.error"));
            setIsDeleting(false);
          });
      } catch (error) {
        toast.error(error?.message || t("dashboard.error"));
        console.error("Error deleting languages:", error);
      }
    }
  };

  const handleSelectIds = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllToDelete = (e) => {
    const isChecked = e.target.checked;
    if (!isChecked) {
      setSelectedIds([]);
      return;
    }
    if (currencies.items?.length !== 0) {
      const allIds = currencies.items.map((currency) => currency.id);
      setSelectedIds(allIds);
    } else {
      toast.info(t("common.no_items"));
    }
  };

  const handleEditClick = (currency) => {
    setSelectedCurrency(currency);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (data) => {
    try {
      setIsEditSubmitting(true);
      await dispatch(
        updateCurrency({
          currencyId: data.id,
          currencyData: {
            name: data.name,
            name_i18n: {
              en: data.name,
              ar: data.nameAr,
            },
            currencyCode: data.currencyCode,
            decimalPlaces: data.decimalPlaces,
            symbol: data.symbol,
            status: data.status,
          },
        })
      )
        .unwrap()
        .then(() => {
          toast.success(t("dashboard.update_success"));
          setIsEditModalOpen(false);
          setSelectedCurrency(null);
          dispatch(
            getCurrencies({
              page: currentPage,
            })
          );
        })
        .catch((error) => {
          toast.error(error?.message || t("dashboard.error"));
        });
    } catch (error) {
      toast.error(error?.message || t("dashboard.error"));
      console.error("Failed to update currency:", error);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  return (
    <>
      {/* DataModal للعرض الكامل */}
      <DataModal
        isOpen={isCurrenciesModalOpen}
        onClose={() => setIsCurrenciesModalOpen(false)}
        title={"Currencies"}
        columns={currenciesColumns}
        data={transformCurrenciesData(currencies.items || [])}
        onStatusChange={handleCurrencyStatusChangeInModal}
      />

      <ConfirmDialog
        open={isConfirmDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={confirmDelete}
        title={t("users.delete_dialog_title", { name: t("currencies.title") })}
        message={t("users.delete_dialog_message", {
          name: t("currencies.title"),
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
            <h1>{t("currencies.title")}</h1>
            <p>{t("currencies.subtitle")}</p>
          </div>

          <button className="regions-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="regions-divider" />
        <h2 className="regions-title">{t("currencies.title")}</h2>
        <div className="regions-subheader">
          <span
            style={{
              fontSize: "16px",
            }}
          >
            {t("common.available", { name: t("sidebar.currencies") })}
          </span>
          <span className="delete-action" onClick={handleDelete}>
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
            {currencies.items &&
              currencies.items.map((currency) => {
                return (
                  <React.Fragment key={currency.id}>
                    <span>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(currency.id)}
                        onChange={() => handleSelectIds(currency.id)}
                      />
                    </span>
                    <span className="region-name">
                      {currency.name.length > 7
                        ? `${currency.name.substring(0, 7)}...`
                        : currency.name}
                    </span>
                    <span className="region-code">{currency.currencyCode}</span>

                    <span className="region-status">
                      <CustomSwitch
                        checked={currency.status === "ACTIVE"}
                        onChange={() => handleStatusChange(currency)}
                      />
                      <span
                        className={
                          currency.status === "ACTIVE"
                            ? "status-active"
                            : "status-inactive"
                        }
                      >
                        {currency.status === "ACTIVE"
                          ? t("common.status_item.active")
                          : t("common.status_item.inactive")}
                      </span>
                    </span>
                    <span className="region-edit">
                      <EditIcon
                        style={{ cursor: "pointer" }}
                        onClick={() => handleEditClick(currency)}
                      />
                    </span>
                  </React.Fragment>
                );
              })}
          </div>
        </div>

        <p 
          className="see-all-info"
          onClick={() => setIsCurrenciesModalOpen(true)}
          style={{ cursor: 'pointer' }}
        >
          {t("common.see-all") || "See All Table info"}
        </p>

        <h2 className="regions-title">{t("currencies.modal.addTitle")}</h2>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <FormInput
            label={t("currencies.form.currencyName")}
            name="name"
            type="text"
            placeholder={t("currencies.form.currencyNamePlaceholder")}
            required
            bgColor="var(--color-white)"
            variant="bordered"
            control={control}
            styleLabel={{marginBottom:'0px'}}
            error={errors.name?.message ? t(errors.name.message) : ""}
          />
           <FormInput
            label={t("currencies.form.nameAr")}
            name="nameAr"
            type="text"
            
            placeholder={t("currencies.form.nameArPlaceholder")}
            required
            bgColor="var(--color-white)"
            variant="bordered"
            control={control}
            error={errors.nameAr?.message ? t(errors.nameAr.message) : ""}
            styleLabel={{ marginBottom: "0px", marginTop: "16px" }}
          />
          <div className="grid-inputs">
            <FormInput
              label={t("currencies.form.currencyCode")}
              name="currencyCode"
              type="text"
              placeholder={t("currencies.form.currencyCodePlaceholder")}
              styleLabel={{ marginTop: "16px", marginBottom: "0px" }}
              bgColor="var(--color-white)"
              variant="bordered"
              control={control}
              error={
                errors.currencyCode?.message
                  ? t(errors.currencyCode.message)
                  : ""
              }
            />

            <FormInput
              label={t("currencies.form.symbol")}
              name="symbol"
              type="text"
              placeholder={t("currencies.form.symbolPlaceholder")}
              styleLabel={{ marginTop: "16px", marginBottom: "0px" }}
              control={control}
              bgColor="var(--color-white)"
              variant="bordered"
              error={errors.symbol?.message ? t(errors.symbol.message) : ""}
            />

            <FormNumberInput
              label={t("currencies.form.decimalPlaces")}
              name="decimalPlaces"
              placeholder={t("currencies.form.decimalPlacesPlaceholder")}
              bgColor="var(--color-white)"
              variant="bordered"
              control={control}
              error={
                errors.decimalPlaces?.message
                  ? t(errors.decimalPlaces.message)
                  : ""
              }
              styleLabel={{ marginTop: "16px", marginBottom: "0px" }}
            />
          </div>

          <button
            type="submit"
            className={
              isSubmitting ? "add-region-btn submitting" : "add-region-btn"
            }
            disabled={isSubmitting}
          >
            {isSubmitting
              ? t("common.submitting")
              : t("currencies.modal.addTitle")}
          </button>
        </form>
      </div>

      <EditCurrency
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCurrency(null);
        }}
        onSubmit={handleEditSubmit}
        currency={selectedCurrency}
        isSubmitting={isEditSubmitting}
      />
    </>
  );
};

export default CurrencyDrawer;