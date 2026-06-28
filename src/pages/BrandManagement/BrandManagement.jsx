import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import { Add, SearchIcon } from "../../assets/icons";
import { showToast } from "../../components/CustomToast/CustomToast";
import { environment } from "../../environments/environment";
import ConfirmDialog from "../../components/Admin/Modal/Modal";
import { uploadImage } from "../../helper/helper";
import useLocalStorage from "../../hooks/useLocalStorage";
import { useLocation, useNavigate } from "react-router-dom";
import BrandForm from "./BrandForm/BrandForm";
import LoadingIndicator from "../../components/common/LoadingIndicator/LoadingIndicator";
import "./BrandManagement.css";

const imageUrl = `${environment.serverOrigin}_xfilestore/mada/`;
const MAX_BRAND_NAME_LENGTH = 12;

const BrandManagement = () => {
  const [segments, setSegments] = useState([]);
  const [countries, setCountries] = useState([]);
  const [userData] = useLocalStorage("userData", null);
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname?.split("/")?.pop();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("create");
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Loading States ──
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadingFields, setUploadingFields] = useState({});

  const token = localStorage.getItem("token");

  const initialForm = {
    brandName: "",
    brandDescription: "",
    brandDescription_i18n: { en: "", ar: "" },
    countryOfRegistrationId: "",
    trademarkStatus: "REGISTERED",
    trademarkRegistrationNumber: "",
    brandDocumentId: "",
    ownerId: "",
    creatorType: "MERCHANT",
    approvalStatus: "UNDER_REVIEW",
    comment: "",
    logoId: "",
    catalogId: "",
    mediaList: [],
    key: "",
  };

  const [formData, setFormData] = useState(initialForm);

  // ── Fetch ──

  const fetchBrands = useCallback(async () => {
    setIsFetching(true);
    try {
      const url =
        path === "my-brands"
          ? `${environment.serverOrigin}brands?q=properties.ownerId:${userData?.cbCusId}`
          : `${environment.serverOrigin}brands`;
      const res = await axios.get(url, {
        headers: { Authorization: `Anonymous=${environment.appid}` },
      });
      setSegments(res.data.items || []);
    } catch (error) {
      console.error(error);
      showToast.error("Failed to fetch brands", "error");
    } finally {
      setIsFetching(false);
    }
  }, [path, userData?.cbCusId]);

  const fetchCountries = useCallback(async () => {
    try {
      const res = await axios.get(
        `${environment.serverOrigin}countries?limit=100`,
        { headers: { Authorization: `Anonymous=${environment.appid}` } }
      );
      setCountries(res.data.items || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
    fetchCountries();
  }, [fetchBrands, fetchCountries]);

  // ── Upload Handlers ──

  const handleSingleUpload = async (file, field) => {
    setUploadingFields((prev) => ({ ...prev, [field]: true }));
    try {
      const res = await uploadImage(file);
      setFormData((prev) => ({ ...prev, [field]: res?.result?.id }));
    } catch (error) {
      console.error(error);
      showToast.error(`Failed to upload ${field}`, "error");
    } finally {
      setUploadingFields((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleMediaUpload = async (files) => {
    setUploadingFields((prev) => ({ ...prev, mediaList: true }));
    try {
      const uploaded = [...formData.mediaList];
      for (let i = 0; i < files.length; i++) {
        const res = await uploadImage(files[i]);
        uploaded.push({
          mediaId: res?.result?.id,
          type: "IMAGE",
          altText: files[i].name,
          sortOrder: uploaded.length + 1,
        });
      }
      setFormData((prev) => ({ ...prev, mediaList: uploaded }));
    } catch (error) {
      console.error(error);
      showToast.error("Failed to upload media", "error");
    } finally {
      setUploadingFields((prev) => ({ ...prev, mediaList: false }));
    }
  };

  const handleAddNew = () => {
    setDrawerMode("create");
    setIsDrawerOpen(true);
    setSelectedSegment(null);
    setFormData(initialForm);
    setUploadingFields({});
  };

  const handleEdit = (segment) => {
    setDrawerMode("edit");
    setSelectedSegment(segment);
    setIsDrawerOpen(true);
    setUploadingFields({});
    setFormData({
      ...initialForm,
      ...segment,
      brandDescription_i18n: segment.brandDescription_i18n || {
        en: "",
        ar: "",
      },
      mediaList: segment.mediaList || [],
    });
  };


  const handleView = (segment) => {
    setDrawerMode("view");
    setSelectedSegment(segment);
    setIsDrawerOpen(true);
    setUploadingFields({});

    setFormData({
      ...initialForm,
      ...segment,
      brandDescription_i18n: segment.brandDescription_i18n || {
        en: "",
        ar: "",
      },
      mediaList: segment.mediaList || [],
    });
  };

  const validateForm = () => {
    if (!formData.brandName) return "Brand Name required";
    if (formData.brandName.trim().length > MAX_BRAND_NAME_LENGTH) {
      return `Brand Name must be ${MAX_BRAND_NAME_LENGTH} characters or fewer`;
    }
    if (!formData.brandDescription) return "Description required";
    if (!formData.brandDescription_i18n.en) return "Description EN required";
    if (!formData.brandDescription_i18n.ar) return "Description AR required";
    if (!formData.countryOfRegistrationId) return "Country required";
    if (!formData.trademarkRegistrationNumber) return "Trademark Number required";
    if (!formData.key) return "Key required";
    if (!formData.logoId) return "Logo image required";
    if (!formData.catalogId) return "Catalog image required";
    if (!formData.brandDocumentId) return "Brand Document required";
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      showToast.error(error);
      return;
    }

    setIsSubmitting(true);
    try {
      if (drawerMode === "create") {
        await axios.post(
          `${environment.serverOrigin}brands`,
          { ...formData, brandName: formData.brandName.trim(), ownerId: userData?.cbCusId || null },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showToast.success("Brand Created", "success");
      } else {
        await axios.put(
          `${environment.serverOrigin}brands/${selectedSegment.id}`,
          { ...formData, brandName: formData.brandName.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showToast.success("Brand Updated", "success");
      }
      fetchBrands();
      setIsDrawerOpen(false);
    } catch (error) {
      console.error(error);
      showToast.error(
        drawerMode === "create"
          ? `Failed to create brand ${error.response?.data?.message}`
          : `Failed to update brand ${error.response?.data?.message}`,
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSegment?.id) {
      showToast.error("No brand selected", "error");
      return;
    }
    setIsDeleting(true);
    try {
      await axios.delete(
        `${environment.serverOrigin}brands/${selectedSegment.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBrands();
      showToast.success("Brand Deleted", "success");
      setIsConfirmDialogOpen(false);
    } catch (error) {
      console.error(error);
      showToast.error(
        `Can't delete Brand: ${selectedSegment?.name_i18n?.en || ""}`,
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };


  const filteredSegments = segments.filter((s) =>
    s?.brandName?.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <>
      <div className="brand-mgmt">
        <div className="brand-mgmt__header-section">
          <div className="brand-mgmt__header">
            <h1 className="brand-mgmt__title">Brands Management</h1>
            <p className="brand-mgmt__subtitle">
              Manage and track your Brands
            </p>
          </div>
        </div>

        <div className="brand-mgmt__card">
          <div className="brand-mgmt__filters">
            <div className="brand-mgmt__search-box">
              <SearchIcon className="brand-mgmt__search-icon" />
              <input
                className="brand-mgmt__search-input"
                placeholder="Search By Brand Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button className="brand-mgmt__btn-add" onClick={handleAddNew}>
              <Add /> Add New Brand
            </button>
          </div>

          <div className="brand-mgmt__table-wrapper">
            <table className="brand-mgmt__table">
              <thead>
                <tr>
                  <th></th>
                  <th>Brand Name</th>
                  <th>Key</th>
                  <th>Creator Type</th>
                  <th>Approval Status</th>
                  <th>Status</th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {isFetching ? (
                  <tr>
                    <td colSpan="10">
                      <div className="brand-mgmt__table-loader">
                        <LoadingIndicator size="md" text="Loading brands..." />
                      </div>
                    </td>
                  </tr>
                ) : filteredSegments.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="brand-mgmt__empty">
                      No Results Found
                    </td>
                  </tr>
                ) : (
                  filteredSegments.map((segment) => (
                    <tr key={segment.id}>
                      <td>
                        <input type="checkbox" />
                      </td>

                      <td className="brand-mgmt__name-cell">
                        <span className="brand-mgmt__avatar">
                          <img
                            src={
                              segment.logoId
                                ? `${imageUrl}${segment.logoId}`
                                : "/fallback.png"
                            }
                            alt="brand"
                          />
                        </span>
                        {segment?.brandName || "No Data"}
                      </td>

                      <td>{segment?.key || "No Data"}</td>
                      <td>{segment?.creatorType || "No Data"}</td>
                      <td>{segment?.approvalStatus || "No Data"}</td>
                      <td>{segment?.status || "No Data"}</td>

                      <td>
                        <button
                          onClick={() => handleEdit(segment)}
                          className="brand-mgmt__btn-action brand-mgmt__btn-action--edit"
                        >
                          Edit
                        </button>
                      </td>

                      <td>
                        <button
                          style={{
                            color: 'green'
                          }}
                          className="brand-mgmt__btn-action"
                          onClick={() => handleView(segment)}
                        >
                          Details
                        </button>
                      </td>


                      <td>
                        <button
                          className="brand-mgmt__btn-action"
                          onClick={() =>
                            navigate(
                              path === "my-brands"
                                ? `/merchant/dashboard/my-brands/${segment.id}/storefront`
                                : `/dashboard/BrandManagement/${segment.id}/storefront`,
                            )
                          }
                        >
                          Storefront
                        </button>
                      </td>

                      <td>
                        <button
                          className="brand-mgmt__btn-action brand-mgmt__btn-action--delete"
                          onClick={() => {
                            setSelectedSegment(segment);
                            setIsConfirmDialogOpen(true);
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`brand-mgmt__drawer ${isDrawerOpen ? "brand-mgmt__drawer--open" : ""}`}>
          <div className="brand-mgmt__drawer-content">
            <div className="brand-mgmt__drawer-header">
              <h2>
                {drawerMode === "create"
                  ? "Add Brand"
                  : drawerMode === "edit"
                    ? "Edit Brand"
                    : "Brand Details"}
              </h2>
              <button
                className="brand-mgmt__drawer-close"
                onClick={() => setIsDrawerOpen(false)}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="brand-mgmt__drawer-body">
              <BrandForm
                formData={formData}
                setFormData={setFormData}
                countries={countries}
                disabled={isSubmitting}
                handleSingleUpload={handleSingleUpload}
                handleMediaUpload={handleMediaUpload}
                imageBaseUrl={imageUrl}
                uploadingFields={uploadingFields}
              />
            </div>


            {drawerMode !== "view" && (
              <div className="brand-mgmt__drawer-footer">
                <button
                  className="brand-mgmt__btn-submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <LoadingIndicator size="xs" color="white" />
                  ) : drawerMode === "create" ? (
                    "Create"
                  ) : (
                    "Update"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Brand"
        message="Are you sure you want to delete this Brand?"
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        loading={isDeleting}
      />
    </>
  );
};

export default BrandManagement;
