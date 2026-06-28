import { useState, useEffect } from "react";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import { Add, SearchIcon } from "../../assets/icons";
import { showToast } from "../../components/CustomToast/CustomToast";
import { environment } from "../../environments/environment";
import ConfirmDialog from "../../components/Admin/Modal/Modal";
import { uploadImage } from "../../helper/helper";
import CategoryForm from "./CategoryForm/CategoryForm";
import LoadingIndicator from "../../components/common/LoadingIndicator/LoadingIndicator";
import "./CategoriesManagement.css";

const BASE_URL = `${environment.serverOrigin}catalog/categories`;
const imageUrl = `${environment.serverOrigin}_xfilestore/mada/`;

const CategoriesManagement = () => {
  const [segments, setSegments] = useState([]);
  const [segmentData, setSegmentData] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("create");

  const [selectedSegment, setSelectedSegment] = useState(null);
  const [selectedSegmentId, setSelectedSegmentId] = useState("");

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [imagePreview, setImagePreview] = useState(null);
  const [imageId, setImageId] = useState(null);


  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const token = localStorage.getItem("token");

  const initialForm = {
    segmentId: "",
    categoryName: "",
    name_i18n: { ar: "", en: "" },
    key: "",
    imageId: "",
    status: "ACTIVE",
    isLeaf: false,
  };

  const [formData, setFormData] = useState(initialForm);


  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsFetching(true);
    try {
      const res = await axios.get(BASE_URL, {
        headers: { Authorization: `Anonymous=${environment.appid}` },
      });
      setSegments(res.data.items || []);
      setSegmentData(res.data.items || []);
    } catch {
      showToast.error("Error fetching categories");
    } finally {
      setIsFetching(false);
    }
  };


  const handleUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    try {
      setImagePreview(URL.createObjectURL(file));
      const res = await uploadImage(file);
      const uploadedId = res?.result?.id;
      if (!uploadedId) throw new Error("Upload failed");
      setImageId(uploadedId);
    } catch {
      showToast.error("Upload failed");
      setImagePreview(null);
      setImageId(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setImagePreview(null);
    setImageId(null);
  };


  const handleAddNew = () => {
    setDrawerMode("create");
    setIsDrawerOpen(true);
    setSelectedSegment(null);
    setSelectedSegmentId("");
    setFormData(initialForm);
    setImagePreview(null);
    setImageId(null);
  };

  const handleEdit = (segment, e) => {
    e.stopPropagation();
    setDrawerMode("edit");
    setSelectedSegment(segment);
    setIsDrawerOpen(true);
    setSelectedSegmentId(segment.segmentId || "");
    setFormData({
      segmentId: segment.segmentId || "",
      categoryName: segment.categoryName || "",
      name_i18n: segment.name_i18n || { ar: "", en: "" },
      key: segment.key || "",
      imageId: segment.imageId || "",
      status: segment.status || "ACTIVE",
      isLeaf: segment.isLeaf || false,
    });
    setImageId(segment.imageId || null);
    setImagePreview(
      segment.imageId ? `${imageUrl}${segment.imageId}` : null
    );
  };

  const handleView = (segment, e) => {
    e.stopPropagation();

    setDrawerMode("view");
    setSelectedSegment(segment);
    setIsDrawerOpen(true);

    setSelectedSegmentId(segment.segmentId || "");

    setFormData({
      segmentId: segment.segmentId || "",
      categoryName: segment.categoryName || "",
      name_i18n: segment.name_i18n || { ar: "", en: "" },
      key: segment.key || "",
      imageId: segment.imageId || "",
      status: segment.status || "ACTIVE",
      isLeaf: segment.isLeaf || false,
    });

    setImageId(segment.imageId || null);
    setImagePreview(
      segment.imageId ? `${imageUrl}${segment.imageId}` : null
    );
  };


  const validateForm = () => {
    if (!selectedSegmentId) return "Segment required";
    if (!formData.categoryName) return "Category Name required";
    if (!formData.key) return "Key required";
    if (!formData.name_i18n.en) return "English name required";
    if (!formData.name_i18n.ar) return "Arabic name required";
    if (!imageId && !formData.imageId) return "Image required";
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
      const payload = {
        segmentId: selectedSegmentId,
        categoryName: formData.categoryName,
        name_i18n: formData.name_i18n,
        isLeaf: false,
        status: formData.status,
        key: formData.key,
        imageId: imageId || formData.imageId,
      };

      if (drawerMode === "create") {
        await axios.post(BASE_URL, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast.success("Category created", "success");
      } else {
        await axios.put(`${BASE_URL}/${selectedSegment.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast.success("Category updated", "success");
      }

      fetchCategories();
      setIsDrawerOpen(false);
    } catch {
      showToast.error(
        drawerMode === "create" ? "Create failed" : "Update failed",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSegment?.id) return;
    setIsDeleting(true);
    try {
      await axios.delete(`${BASE_URL}/${selectedSegment.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast.success("Category Deleted", "success");
      fetchCategories();
      setIsConfirmDialogOpen(false);
    } catch {
      showToast.error("Delete failed", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Filter ──

  const filteredSegments = segments.filter((segment) => {
    const q = searchQuery.toLowerCase();
    return (
      segment?.name_i18n?.en?.toLowerCase().includes(q) ||
      segment?.name_i18n?.ar?.toLowerCase().includes(q) ||
      segment?.key?.toLowerCase().includes(q)
    );
  });


  return (
    <>
      <div className="cat-mgmt">
        <div className="cat-mgmt__header-section">
          <div className="cat-mgmt__header">
            <h1 className="cat-mgmt__title">Categories Management</h1>
            <p className="cat-mgmt__subtitle">
              Manage and track your Categories
            </p>
          </div>
        </div>

        <div className="cat-mgmt__card">
          <div className="cat-mgmt__filters">
            <div className="cat-mgmt__search-box">
              <SearchIcon className="cat-mgmt__search-icon" />
              <input
                className="cat-mgmt__search-input"
                placeholder="Search By Category Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button className="cat-mgmt__btn-add" onClick={handleAddNew}>
              <Add /> Add New Category
            </button>
          </div>

          <div className="cat-mgmt__table-wrapper">
            <table className="cat-mgmt__table">
              <thead>
                <tr>
                  <th></th>
                  <th>Name EN</th>
                  <th>Name AR</th>
                  <th>Segment</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th></th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {isFetching ? (
                  <tr>
                    <td colSpan="8">
                      <div className="cat-mgmt__table-loader">
                        <LoadingIndicator
                          size="md"
                          text="Loading categories..."
                        />
                      </div>
                    </td>
                  </tr>
                ) : filteredSegments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="cat-mgmt__empty">
                      No Results Found
                    </td>
                  </tr>
                ) : (
                  filteredSegments.map((segment) => (
                    <tr key={segment.id}>
                      <td>
                        <input type="checkbox" />
                      </td>

                      <td className="cat-mgmt__name-cell">
                        <span className="cat-mgmt__avatar">
                          <img
                            src={
                              segment.imageId
                                ? `${imageUrl}${segment.imageId}`
                                : "/fallback.png"
                            }
                            alt="category"
                          />
                        </span>
                        {segment?.name_i18n?.en || "No Data"}
                      </td>

                      <td>{segment?.name_i18n?.ar || "No Data"}</td>
                      <td>{segment?.segmentId || "No Data"}</td>
                      <td>{segment?.slug || "No Data"}</td>
                      <td>{segment?.status || "No Data"}</td>

                      <td>
                        <button
                          className="cat-mgmt__btn-action cat-mgmt__btn-action--edit"
                          onClick={(e) => handleEdit(segment, e)}
                        >
                          Edit
                        </button>
                      </td>

                      <td>
                        <button
                        style={{
                          color:'green'
                        }}
                          className="cat-mgmt__btn-action"
                          onClick={(e) => handleView(segment, e)}
                        >
                          Details
                        </button>
                      </td>

                      <td>
                        <button
                          className="cat-mgmt__btn-action cat-mgmt__btn-action--delete"
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

        <div
          className={`cat-mgmt__drawer ${isDrawerOpen ? "cat-mgmt__drawer--open" : ""}`}
        >
          <div className="cat-mgmt__drawer-content">
            <div className="cat-mgmt__drawer-header">
           

              <h2>
                {drawerMode === "create"
                  ? "Add Category"
                  : drawerMode === "edit"
                    ? "Edit Category"
                    : "Category Details"}
              </h2>
              <button
                className="cat-mgmt__drawer-close"
                onClick={() => setIsDrawerOpen(false)}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="cat-mgmt__drawer-body">
              <CategoryForm
                disabled={isSubmitting}
                selectedSegmentId={selectedSegmentId}
                setSelectedSegmentId={setSelectedSegmentId}
                segmentData={segmentData}
                formData={formData}
                setFormData={setFormData}
                imagePreview={imagePreview}
                handleUpload={handleUpload}
                handleRemove={handleRemove}
                isUploading={isUploading}
              />
            </div>

            {/* <div className="cat-mgmt__drawer-footer">
              <button
                className="cat-mgmt__btn-submit"
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
            </div> */}

            {drawerMode !== "view" && (
              <div className="cat-mgmt__drawer-footer">
                <button
                  className="cat-mgmt__btn-submit"
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
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  );
};

export default CategoriesManagement;
