import { useState, useEffect } from "react";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import { Add, SearchIcon } from "../../assets/icons";
import { showToast } from "../../components/CustomToast/CustomToast";
import { environment } from "../../environments/environment";
import ConfirmDialog from "../../components/Admin/Modal/Modal";
import { uploadImage } from "../../helper/helper";
import SegmentForm from "./SegmentForm/SegmentForm";
import LoadingIndicator from "../../components/common/LoadingIndicator/LoadingIndicator";
import "./SegmentsManagement.css";

const BASE_URL = `${environment.serverOrigin}catalog/segments`;
const imageUrl = `${environment.serverOrigin}_xfilestore/mada/`;

const SegmentsManagement = () => {
  const [segments, setSegments] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("create");
  const [selectedSegment, setSelectedSegment] = useState(null);
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
    segmentName: "",
    name_i18n: { ar: "", en: "" },
    key: "",
  };

  const [formData, setFormData] = useState(initialForm);


  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    setIsFetching(true);
    try {
      const res = await axios.get(BASE_URL, {
        headers: { Authorization: `Anonymous=${environment.appid}` },
      });
      setSegments(res.data.items || []);
    } catch (error) {
      console.error(error);
      showToast.error("Error fetching segments", "error");
    } finally {
      setIsFetching(false);
    }
  };


  const handleUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const previewURL = URL.createObjectURL(file);
      setImagePreview(previewURL);
      const res = await uploadImage(file);
      const uploadedId = res?.result?.id;
      if (!uploadedId) throw new Error("Upload failed");
      setImageId(uploadedId);
    } catch {
      showToast.error("Image upload failed");
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
    setFormData(initialForm);
    setImagePreview(null);
    setImageId(null);
  };

  const handleEdit = (segment, e) => {
    e.stopPropagation();
    setDrawerMode("edit");
    setSelectedSegment(segment);
    setIsDrawerOpen(true);
    setFormData({
      segmentName: segment.segmentName || "",
      name_i18n: segment.name_i18n || { ar: "", en: "" },
      key: segment.key || "",
    });
    setImagePreview(segment.imageId ? `${imageUrl}${segment.imageId}` : null);
    setImageId(segment.imageId || null);
  };

  const handleView = (segment, e) => {
    e.stopPropagation();
    setDrawerMode("view");
    setSelectedSegment(segment);
    setIsDrawerOpen(true);
    setFormData({
      segmentName: segment.segmentName || "",
      name_i18n: segment.name_i18n || { ar: "", en: "" },
      key: segment.key || "",
    });
    setImagePreview(segment.imageId ? `${imageUrl}${segment.imageId}` : null);
    setImageId(segment.imageId || null);
  };


  const validateForm = () => {
    if (!formData.segmentName) return "Segment Name required";
    if (!formData.key) return "Key required";
    if (!formData.name_i18n.en) return "English name required";
    if (!formData.name_i18n.ar) return "Arabic name required";
    if (!imageId) return "Segment image required";
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
        segmentName: formData.segmentName,
        name_i18n: formData.name_i18n,
        key: formData.key,
        imageId,
      };

      if (drawerMode === "create") {
        await axios.post(BASE_URL, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast.success("Segment created", "success");
      } else {
        await axios.put(`${BASE_URL}/${selectedSegment.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast.success("Segment updated", "success");
      }

      fetchSegments();
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

  const handleConfirmDelete = async () => {
    if (!selectedSegment?.id) {
      showToast.error("No segment selected", "error");
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(`${BASE_URL}/${selectedSegment.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSegments();
      showToast.success("Segment Deleted", "success");
      setIsConfirmDialogOpen(false);
    } catch {
      showToast.error(
        `Can't delete segment: ${selectedSegment?.name_i18n?.en || ""}`,
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };


  const filteredSegments = segments.filter((segment) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    const nameEn = (segment?.name_i18n?.en || "").toLowerCase();
    const nameAr = (segment?.name_i18n?.ar || "").toLowerCase();
    return nameEn.includes(query) || nameAr.includes(query);
  });


  return (
    <>
      <div className="seg-mgmt">
        <div className="seg-mgmt__header-section">
          <div className="seg-mgmt__header">
            <h1 className="seg-mgmt__title">Segments Management</h1>
            <p className="seg-mgmt__subtitle">
              Manage and track your Segments
            </p>
          </div>
        </div>

        <div className="seg-mgmt__card">
          <div className="seg-mgmt__filters">
            <div className="seg-mgmt__search-box">
              <SearchIcon className="seg-mgmt__search-icon" />
              <input
                className="seg-mgmt__search-input"
                placeholder="Search By Segment Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button className="seg-mgmt__btn-add" onClick={handleAddNew}>
              <Add /> Add New Segment
            </button>
          </div>

          <div className="seg-mgmt__table-wrapper">
            <table className="seg-mgmt__table">
              <thead>
                <tr>
                  <th></th>
                  <th>Name EN</th>
                  <th>Name AR</th>
                  <th>Key</th>
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
                    <td colSpan="9">
                      <div className="seg-mgmt__table-loader">
                        <LoadingIndicator
                          size="md"
                          text="Loading segments..."
                        />
                      </div>
                    </td>
                  </tr>
                ) : filteredSegments.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="seg-mgmt__empty">
                      No Results Found
                    </td>
                  </tr>
                ) : (
                  filteredSegments.map((segment) => (
                    <tr key={segment.id}>
                      <td>
                        <input type="checkbox" />
                      </td>

                      <td className="seg-mgmt__name-cell">
                        <span className="seg-mgmt__avatar">
                          <img
                            src={
                              segment.imageId
                                ? `${imageUrl}${segment.imageId}`
                                : "/fallback.png"
                            }
                            alt="segment"
                            onError={(e) => (e.target.src = "/fallback.png")}
                          />
                        </span>
                        {segment?.name_i18n?.en || "No Data"}
                      </td>

                      <td>{segment?.name_i18n?.ar || "No Data"}</td>
                      <td>{segment?.key || "No Data"}</td>
                      <td>{segment?.slug || "No Data"}</td>
                      <td>{segment?.status || "No Data"}</td>

                      <td>
                        <button
                          className="seg-mgmt__btn-action seg-mgmt__btn-action--edit"
                          onClick={(e) => handleEdit(segment, e)}
                        >
                          Edit
                        </button>
                      </td>

                      <td>
                        <button
                          className="seg-mgmt__btn-action seg-mgmt__btn-action--details"
                          onClick={(e) => handleView(segment, e)}
                        >
                          Details
                        </button>
                      </td>

                      <td>
                        <button
                          className="seg-mgmt__btn-action seg-mgmt__btn-action--delete"
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

        {/* ── Drawer ── */}
        <div
          className={`seg-mgmt__drawer ${isDrawerOpen ? "seg-mgmt__drawer--open" : ""}`}
        >
          <div className="seg-mgmt__drawer-content">
            <div className="seg-mgmt__drawer-header">
              <h2>
                {drawerMode === "create"
                  ? "Add Segment"
                  : drawerMode === "edit"
                    ? "Edit Segment"
                    : "Segment Details"}
              </h2>
              <button
                className="seg-mgmt__drawer-close"
                onClick={() => setIsDrawerOpen(false)}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="seg-mgmt__drawer-body">
              <SegmentForm
                disabled={drawerMode === "view" || isSubmitting}
                formData={formData}
                setFormData={setFormData}
                imagePreview={imagePreview}
                handleUpload={handleUpload}
                handleRemove={handleRemove}
                isUploading={isUploading}
              />
            </div>

            {drawerMode !== "view" && (
              <div className="seg-mgmt__drawer-footer">
                <button
                  className="seg-mgmt__btn-submit"
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
        title="Delete Segment"
        message="Are you sure you want to delete this segment?"
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        loading={isDeleting}
      />
    </>
  );
};

export default SegmentsManagement;
