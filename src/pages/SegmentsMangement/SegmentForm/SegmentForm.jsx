import { useState } from "react";
import LoadingIndicator from "../../../components/common/LoadingIndicator/LoadingIndicator";
import { UploadIcon } from "../../../assets/icons";
import "./SegmentForm.css";

const SegmentImage = ({ src, alt = "", className = "" }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`seg-form__image-wrapper ${className}`}>
      {!loaded && !error && (
        <div className="seg-form__image-loader">
          <LoadingIndicator size="sm" color="gray" />
        </div>
      )}

      {error ? (
        <div className="seg-form__image-error">Failed to load</div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`seg-form__image ${loaded ? "seg-form__image--visible" : ""}`}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setError(true);
          }}
        />
      )}
    </div>
  );
};

const SegmentForm = ({
  disabled,
  formData,
  setFormData,
  imagePreview,
  handleUpload,
  handleRemove,
  isUploading = false,
}) => (
  <div className="seg-form">
    {/* ── Segment Name ── */}
    <div className="seg-form__field">
      <label className="seg-form__label">Segment Name</label>
      <input
        className="seg-form__input"
        placeholder="Segment Name"
        value={formData.segmentName}
        onChange={(e) =>
          setFormData({ ...formData, segmentName: e.target.value })
        }
        disabled={disabled}
      />
    </div>

    {/* ── Key ── */}
    <div className="seg-form__field">
      <label className="seg-form__label">Key Name</label>
      <input
        className="seg-form__input"
        placeholder="Key"
        value={formData.key}
        onChange={(e) => setFormData({ ...formData, key: e.target.value })}
        disabled={disabled}
      />
    </div>

    {/* ── Image Upload ── */}
    <div className="seg-form__field">
      <label className="seg-form__label">Segment Image</label>
      <div className="seg-form__upload-container">
        {isUploading ? (
          <div className="seg-form__upload-status">
            <LoadingIndicator size="sm" text="Uploading image..." />
          </div>
        ) : !imagePreview ? (
          <div className="seg-form__input-wrapper">
            <input
              className="seg-form__file-input"
              disabled={disabled}
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e.target.files[0])}
            />
            <span className="seg-form__upload-icon">
              <UploadIcon className="form-file-upload-button-icon" />
            </span>
          </div>
        ) : (
          <div className="seg-form__preview-container">
            <SegmentImage src={imagePreview} alt="preview" />
            <button
              type="button"
              className="seg-form__btn-remove"
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
    <div className="seg-form__field">
      <label className="seg-form__label">Name in English</label>
      <input
        className="seg-form__input"
        placeholder="Name EN"
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
    <div className="seg-form__field">
      <label className="seg-form__label">Name in Arabic</label>
      <input
        className="seg-form__input"
        placeholder="Name AR"
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

export default SegmentForm;