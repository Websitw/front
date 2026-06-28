import { useState } from "react";
import LoadingIndicator from "../../../components/common/LoadingIndicator/LoadingIndicator";
import "./BrandForm.css";

// ── Image with loading state ──
const BrandImage = ({ src, alt = "", width = "100px", className = "" }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`brand-form__image-wrapper ${className}`} style={{ width }}>
      {!loaded && !error && (
        <div className="brand-form__image-loader">
          <LoadingIndicator size="sm" color="gray" />
        </div>
      )}

      {error ? (
        <div className="brand-form__image-error">Failed to load</div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`brand-form__image ${loaded ? "brand-form__image--visible" : ""}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
};

const BrandForm = ({
  formData,
  setFormData,
  countries,
  disabled,
  handleSingleUpload,
  handleMediaUpload,
  imageBaseUrl,
  uploadingFields = {},
}) => {
  const imgUrl = imageBaseUrl || "";

  return (
    <div className="brand-form">
      {/* ── Brand Name ── */}
      <div className="brand-form__field">
        <label className="brand-form__label">Brand Name</label>
        <input
          className="brand-form__input"
          placeholder="Brand Name"
          value={formData.brandName}
          onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
          maxLength={12}
          disabled={disabled}
        />
        <small className="brand-form__hint">Max 12 characters.</small>
      </div>

      {/* ── Description ── */}
      <div className="brand-form__field">
        <label className="brand-form__label">Description</label>
        <textarea
          className="brand-form__textarea"
          placeholder="Description"
          value={formData.brandDescription}
          onChange={(e) =>
            setFormData({ ...formData, brandDescription: e.target.value })
          }
          disabled={disabled}
        />
      </div>

      {/* ── Description EN ── */}
      <div className="brand-form__field">
        <label className="brand-form__label">Description EN</label>
        <textarea
          className="brand-form__textarea"
          placeholder="Description EN"
          value={formData.brandDescription_i18n.en}
          onChange={(e) =>
            setFormData({
              ...formData,
              brandDescription_i18n: {
                ...formData.brandDescription_i18n,
                en: e.target.value,
              },
            })
          }
          disabled={disabled}
        />
      </div>

      {/* ── Description AR ── */}
      <div className="brand-form__field">
        <label className="brand-form__label">Description AR</label>
        <textarea
          className="brand-form__textarea"
          placeholder="Description AR"
          value={formData.brandDescription_i18n.ar}
          onChange={(e) =>
            setFormData({
              ...formData,
              brandDescription_i18n: {
                ...formData.brandDescription_i18n,
                ar: e.target.value,
              },
            })
          }
          disabled={disabled}
        />
      </div>

      {/* ── Country ── */}
      <div className="brand-form__field">
        <label className="brand-form__label">Country</label>
        <select
          className="brand-form__select"
          value={formData.countryOfRegistrationId}
          onChange={(e) =>
            setFormData({ ...formData, countryOfRegistrationId: e.target.value })
          }
          disabled={disabled}
        >
          <option value="">Select</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* ── Trademark Status ── */}
      <div className="brand-form__field">
        <label className="brand-form__label">Trademark Status</label>
        <select
          className="brand-form__select"
          value={formData.trademarkStatus}
          onChange={(e) =>
            setFormData({ ...formData, trademarkStatus: e.target.value })
          }
          disabled={disabled}
        >
          <option value="REGISTERED">REGISTERED</option>
          <option value="PENDING_REGISTRATION">PENDING_REGISTRATION</option>
        </select>
      </div>

      {/* ── Trademark Number ── */}
      <div className="brand-form__field">
        <label className="brand-form__label">Trademark Number</label>
        <input
          className="brand-form__input"
          placeholder="Trademark Number"
          value={formData.trademarkRegistrationNumber}
          onChange={(e) =>
            setFormData({
              ...formData,
              trademarkRegistrationNumber: e.target.value,
            })
          }
          disabled={disabled}
        />
      </div>

      {/* ── Owner ID ── */}
      <div className="brand-form__field">
        <label className="brand-form__label">Owner ID</label>
        <input
          className="brand-form__input"
          placeholder="Owner ID"
          value={formData.ownerId}
          onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
          disabled={disabled}
        />
      </div>

      {/* ── Creator Type ── */}
      <div className="brand-form__field">
        <label className="brand-form__label">Creator Type</label>
        <select
          className="brand-form__select"
          value={formData.creatorType}
          onChange={(e) =>
            setFormData({ ...formData, creatorType: e.target.value })
          }
          disabled={disabled}
        >
          <option value="ADMIN">ADMIN</option>
          <option value="MERCHANT">MERCHANT</option>
        </select>
      </div>

      {/* ── Approval Status ── */}
      <div className="brand-form__field">
        <label className="brand-form__label">Approval Status</label>
        <select
          className="brand-form__select"
          value={formData.approvalStatus}
          onChange={(e) =>
            setFormData({ ...formData, approvalStatus: e.target.value })
          }
          disabled={disabled}
        >
          <option value="UNDER_REVIEW">UNDER_REVIEW</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </div>

      {/* ── Comment ── */}
      <div className="brand-form__field">
        <label className="brand-form__label">Comment</label>
        <textarea
          className="brand-form__textarea"
          placeholder="Comment"
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          disabled={disabled}
        />
      </div>

      {/* ── Logo ── */}
      <div className="brand-form__field">
        <label className="brand-form__label">Logo</label>
        {uploadingFields.logoId ? (
          <div className="brand-form__upload-status">
            <LoadingIndicator size="sm" text="Uploading logo..." />
          </div>
        ) : formData.logoId ? (
          <div className="brand-form__preview">
            <BrandImage src={`${imgUrl}${formData.logoId}`} alt="Logo" />
            <button
              className="brand-form__btn-remove"
              onClick={() => setFormData({ ...formData, logoId: "" })}
              type="button"
            >
              Remove
            </button>
          </div>
        ) : (
          <input
            className="brand-form__file-input"
            type="file"
            disabled={disabled}
            onChange={(e) => handleSingleUpload(e.target.files[0], "logoId")}
          />
        )}
      </div>

      {/* ── Catalog ── */}
      <div className="brand-form__field">
        <label className="brand-form__label">Catalog</label>
        {uploadingFields.catalogId ? (
          <div className="brand-form__upload-status">
            <LoadingIndicator size="sm" text="Uploading catalog..." />
          </div>
        ) : formData.catalogId ? (
          <div className="brand-form__preview">
            <BrandImage src={`${imgUrl}${formData.catalogId}`} alt="Catalog" />
            <button
              className="brand-form__btn-remove"
              onClick={() => setFormData({ ...formData, catalogId: "" })}
              type="button"
            >
              Remove
            </button>
          </div>
        ) : (
          <input
            className="brand-form__file-input"
            type="file"
            disabled={disabled}
            onChange={(e) => handleSingleUpload(e.target.files[0], "catalogId")}
          />
        )}
      </div>

      {/* ── Brand Document ── */}
      <div className="brand-form__field">
        <label className="brand-form__label">Brand Document</label>
        {uploadingFields.brandDocumentId ? (
          <div className="brand-form__upload-status">
            <LoadingIndicator size="sm" text="Uploading document..." />
          </div>
        ) : formData.brandDocumentId ? (
          <div className="brand-form__preview">
            <BrandImage
              src={`${imgUrl}${formData.brandDocumentId}`}
              alt="Brand Document"
            />
            <button
              className="brand-form__btn-remove"
              onClick={() => setFormData({ ...formData, brandDocumentId: "" })}
              type="button"
            >
              Remove
            </button>
          </div>
        ) : (
          <input
            className="brand-form__file-input"
            type="file"
            disabled={disabled}
            onChange={(e) =>
              handleSingleUpload(e.target.files[0], "brandDocumentId")
            }
          />
        )}
      </div>

      {/* ── Media List ── */}
      <div className="brand-form__field">
        <label className="brand-form__label">Media List</label>
        {uploadingFields.mediaList ? (
          <div className="brand-form__upload-status">
            <LoadingIndicator size="sm" text="Uploading media..." />
          </div>
        ) : (
          <input
            className="brand-form__file-input"
            type="file"
            multiple
            disabled={disabled}
            onChange={(e) => handleMediaUpload(e.target.files)}
          />
        )}

        {formData.mediaList.length > 0 && (
          <div className="brand-form__media-grid">
            {formData.mediaList.map((media, index) => (
              <div key={index} className="brand-form__media-item">
                <BrandImage
                  src={`${imgUrl}${media.mediaId}`}
                  alt={media.altText}
                  width="80px"
                />
                <button
                  className="brand-form__btn-remove brand-form__btn-remove--small"
                  onClick={() => {
                    const updated = formData.mediaList.filter(
                      (_, i) => i !== index
                    );
                    setFormData({ ...formData, mediaList: updated });
                  }}
                  type="button"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Key ── */}
      <div className="brand-form__field">
        <label className="brand-form__label">Key</label>
        <input
          className="brand-form__input"
          placeholder="Key"
          value={formData.key}
          onChange={(e) => setFormData({ ...formData, key: e.target.value })}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default BrandForm;
