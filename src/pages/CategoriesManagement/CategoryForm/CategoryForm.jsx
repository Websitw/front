import { useState } from "react";
import LoadingIndicator from "../../../components/common/LoadingIndicator/LoadingIndicator";
import { UploadIcon } from "../../../assets/icons";
import "./CategoryForm.css";

const CategoryImage = ({ src, alt = "" }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="cat-form__image-wrapper">
      {!loaded && !error && (
        <div className="cat-form__image-loader">
          <LoadingIndicator size="sm" color="gray" />
        </div>
      )}
      {error ? (
        <div className="cat-form__image-error">Failed to load</div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`cat-form__image ${loaded ? "cat-form__image--visible" : ""}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
};

const CategoryForm = ({
  disabled,
  selectedSegmentId,
  setSelectedSegmentId,
  segmentData,
  formData,
  setFormData,
  imagePreview,
  handleUpload,
  handleRemove,
  isUploading = false,
}) => (
  <div className="cat-form">
    {/* ── Segment ── */}
    <div className="cat-form__field">
      <label className="cat-form__label">Segment</label>
      <select
        className="cat-form__select"
        value={selectedSegmentId}
        onChange={(e) => setSelectedSegmentId(e.target.value)}
        disabled={disabled}
      >
        <option value="">Select Segment</option>
        {segmentData.map((item) => (
          <option key={item.id} value={item.id}>
            {item?.name_i18n?.en || "No Name"}
          </option>
        ))}
      </select>
    </div>

    {/* ── Category Name ── */}
    <div className="cat-form__field">
      <label className="cat-form__label">Category Name</label>
      <input
        className="cat-form__input"
        placeholder="Category Name"
        value={formData.categoryName}
        onChange={(e) =>
          setFormData({ ...formData, categoryName: e.target.value })
        }
        disabled={disabled}
      />
    </div>

    {/* ── Key ── */}
    <div className="cat-form__field">
      <label className="cat-form__label">Key Name</label>
      <input
        className="cat-form__input"
        placeholder="Key name"
        value={formData.key}
        onChange={(e) => setFormData({ ...formData, key: e.target.value })}
        disabled={disabled}
      />
    </div>

    {/* ── Status ── */}
    <div className="cat-form__field">
      <label className="cat-form__label">Status</label>
      <select
        className="cat-form__select"
        value={formData.status}
        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        disabled={disabled}
      >
        <option value="ACTIVE">ACTIVE</option>
        <option value="INACTIVE">INACTIVE</option>
      </select>
    </div>

    {/* ── Image Upload ── */}
    <div className="cat-form__field">
      <label className="cat-form__label">Category Image</label>
      <div className="cat-form__upload-container">
        {isUploading ? (
          <div className="cat-form__upload-status">
            <LoadingIndicator size="sm" text="Uploading image..." />
          </div>
        ) : !imagePreview ? (
          <div className="cat-form__input-wrapper">
            <input
              className="cat-form__file-input"
              disabled={disabled}
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e.target.files[0])}
            />
            <span className="cat-form__upload-icon">
              <UploadIcon className="form-file-upload-button-icon" />
            </span>
          </div>
        ) : (
          <div className="cat-form__preview-container">
            <CategoryImage src={imagePreview} alt="preview" />
            <button
              type="button"
              className="cat-form__btn-remove"
              onClick={handleRemove}
              disabled={disabled}
            >
              ✕ Remove Image
            </button>
          </div>
        )}
      </div>
    </div>

    {/* ── Name EN ── */}
    <div className="cat-form__field">
      <label className="cat-form__label">Name in English</label>
      <input
        className="cat-form__input"
        placeholder="Name in English"
        value={formData.name_i18n.en}
        onChange={(e) =>
          setFormData({
            ...formData,
            name_i18n: { ...formData.name_i18n, en: e.target.value },
          })
        }
        disabled={disabled}
      />
    </div>

    {/* ── Name AR ── */}
    <div className="cat-form__field">
      <label className="cat-form__label">Name in Arabic</label>
      <input
        className="cat-form__input"
        placeholder="Name in Arabic"
        value={formData.name_i18n.ar}
        onChange={(e) =>
          setFormData({
            ...formData,
            name_i18n: { ...formData.name_i18n, ar: e.target.value },
          })
        }
        disabled={disabled}
      />
    </div>
  </div>
);

export default CategoryForm;