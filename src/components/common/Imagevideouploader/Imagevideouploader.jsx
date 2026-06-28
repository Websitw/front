import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Controller } from "react-hook-form";
import { z } from "zod";
import { Trash as TrashIcon } from "../../../assets/icons";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"];
const ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES];
const DEFAULT_MAX_FILES = 10;

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg"];
const VIDEO_URL_PATTERNS = ["youtube.com", "youtu.be", "vimeo.com"];

export const mediaFileSchema = (options = {}) => {
  const {
    min = 1,
    max = DEFAULT_MAX_FILES,
    maxSize = MAX_FILE_SIZE,
    required = true,
  } = options;

  let schema = z
    .array(
      z.object({
        file: z.instanceof(File).optional(),
        url: z.string().optional(),
        preview: z.string(),
        type: z.enum(["image", "video"]),
      })
    )
    .max(max, `Maximum ${max} files allowed`)
    .refine(
      (f) => f.every((i) => !i.file || i.file.size <= maxSize),
      `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
    )
    .refine(
      (f) => f.every((i) => !i.file || ACCEPTED_TYPES.includes(i.file.type)),
      "Unsupported file type"
    );

  if (required)
    schema = schema.refine(
      (f) => f.length >= min,
      `Please upload at least ${min} file(s)`
    );

  return schema;
};

function getMediaTypeFromUrl(url) {
  const lower = url.toLowerCase();
  if (VIDEO_URL_PATTERNS.some((p) => lower.includes(p))) return "video";
  if (VIDEO_EXTENSIONS.some((ext) => lower.includes(ext))) return "video";
  if (IMAGE_EXTENSIONS.some((ext) => lower.includes(ext))) return "image";
  return "image";
}

function getPreviewFromUrl(url) {
  const lower = url.toLowerCase();
  let videoId;
  if (lower.includes("youtube.com/watch")) {
    videoId = new URL(url).searchParams.get("v");
    if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  if (lower.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1]?.split(/[?&#]/)[0];
    if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return url;
}

const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const PlusIcon = ({ size = 16, color = "#344054" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#344054" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);


const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);


function UrlModal({ open, onClose, onAdd }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (open) setUrl("");
  }, [open]);

  if (!open) return null;

  const handleAdd = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    const mediaType = getMediaTypeFromUrl(trimmed);
    const preview = getPreviewFromUrl(trimmed);
    onAdd({ url: trimmed, preview, type: mediaType });
    setUrl("");
    onClose();
  };

  return (
    <div style={styles.urlOverlay} onClick={onClose}>
      <div style={styles.urlModal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.urlHeader}>
          <h3 style={styles.urlTitle}>Add media from URL</h3>
          <button type="button" style={styles.closeBtn} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div style={styles.urlBody}>
          <label style={styles.urlLabel}>Image, YouTube, or Vimeo URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Https://Sawa.com/product/sku"
            style={styles.urlInput}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            autoFocus
          />
        </div>
        <div style={styles.urlFooter}>
          <button type="button" style={styles.urlAddBtn} onClick={handleAdd}>
            Add Media
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───── Main Component ───── */
export default function ImageVideoUploader({
  control,
  name = "media",
  errors,
  maxFiles = DEFAULT_MAX_FILES,
  maxFileSize = MAX_FILE_SIZE,
  acceptImages = true,
  acceptVideos = true,
  disabled = false,
  guidelines,
  infoText,
  onFilesChange,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tempFiles, setTempFiles] = useState([]);
  const [modalErrors, setModalErrors] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isTriggerDragging, setIsTriggerDragging] = useState(false);

  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const onChangeRef = useRef(null);
  const currentValueRef = useRef([]);

  const acceptedTypes = useMemo(
    () => [
      ...(acceptImages ? ACCEPTED_IMAGE_TYPES : []),
      ...(acceptVideos ? ACCEPTED_VIDEO_TYPES : []),
    ],
    [acceptImages, acceptVideos]
  );

  const defaultGuidelines = guidelines || [
    "Images must have a 1:1 aspect ratio (1,200 x 1,200 pixels).",
    "The primary image must feature the product clearly against a solid white background.",
    `The maximum file size allowed is ${Math.round(maxFileSize / 1024 / 1024)} MB per image.`,
  ];

  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClick);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [dropdownOpen]);

  const processFiles = useCallback(
    (rawFiles, current) => {
      const fileErrors = [];
      const validFiles = [];

      Array.from(rawFiles).forEach((f) => {
        if (!acceptedTypes.includes(f.type)) {
          fileErrors.push(`"${f.name}" — unsupported file type`);
          return;
        }
        if (f.size > maxFileSize) {
          fileErrors.push(
            `"${f.name}" — exceeds ${Math.round(maxFileSize / 1024 / 1024)}MB limit`
          );
          return;
        }
        validFiles.push({
          file: f,
          preview: URL.createObjectURL(f),
          type: ACCEPTED_IMAGE_TYPES.includes(f.type) ? "image" : "video",
        });
      });

      const total = [...current, ...validFiles];
      if (total.length > maxFiles) {
        const overflow = total.length - maxFiles;
        fileErrors.push(`${overflow} file(s) skipped — max ${maxFiles} allowed`);
      }

      setModalErrors(fileErrors);
      if (fileErrors.length > 0) {
        setTimeout(() => setModalErrors([]), 5000);
      }

      return total.slice(0, maxFiles);
    },
    [acceptedTypes, maxFiles, maxFileSize]
  );

  const openModal = useCallback(
    (currentFiles) => {
      if (disabled) return;
      setTempFiles([...currentFiles]);
      setModalErrors([]);
      setDropdownOpen(false);
      setModalOpen(true);
    },
    [disabled]
  );

  const handleAddFiles = useCallback(
    (rawFiles) => {
      setTempFiles((prev) => processFiles(rawFiles, prev));
    },
    [processFiles]
  );

  const handleAddUrl = useCallback(
    (mediaItem) => {
      setTempFiles((prev) => {
        const next = [...prev, mediaItem];
        if (next.length > maxFiles) {
          setModalErrors([`Max ${maxFiles} files allowed`]);
          setTimeout(() => setModalErrors([]), 5000);
          return prev;
        }
        return next;
      });
    },
    [maxFiles]
  );

  const handleRemoveTemp = useCallback((index) => {
    setTempFiles((prev) => {
      const item = prev[index];
      if (item.file) URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== index);
    });
    setModalErrors([]);
  }, []);

  const handleConfirm = useCallback(() => {
    if (onChangeRef.current) {
      onChangeRef.current(tempFiles);
      onFilesChange?.(tempFiles);
    }
    setModalOpen(false);
    setDropdownOpen(false);
    setModalErrors([]);
  }, [tempFiles, onFilesChange]);

  const handleCancel = useCallback(() => {
    tempFiles.forEach((f) => {
      if (
        f.file &&
        !currentValueRef.current.some((c) => c.preview === f.preview)
      ) {
        URL.revokeObjectURL(f.preview);
      }
    });
    setTempFiles([]);
    setModalOpen(false);
    setDropdownOpen(false);
    setModalErrors([]);
  }, [tempFiles]);

  const handleModalDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files?.length) handleAddFiles(e.dataTransfer.files);
    },
    [handleAddFiles]
  );

  const onModalDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onModalDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const openPicker = useCallback(() => {
    setDropdownOpen(false);
    setTimeout(() => fileInputRef.current?.click(), 50);
  }, []);

  const fieldError = name.split(".").reduce((obj, key) => obj?.[key], errors);
  const errorMessage = fieldError?.message || fieldError?.root?.message;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value = [], onChange } }) => {
        onChangeRef.current = onChange;
        currentValueRef.current = value;

        return (
          <div style={{ width: "100%" }}>
            <div style={styles.triggerZone}>
              <div
                style={{
                  ...styles.dropzone,
                  ...(isTriggerDragging
                    ? { borderColor: "var(--color-primary)", backgroundColor: "#f0fdfa" }
                    : {}),
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsTriggerDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsTriggerDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsTriggerDragging(false);
                  const files = e.dataTransfer.files;
                  openModal(value);
                  if (files?.length) {
                    setTimeout(() => {
                      setTempFiles((prev) =>
                        processFiles(files, prev.length ? prev : [...value])
                      );
                    }, 0);
                  }
                }}
                onClick={() => openModal(value)}
              >
                <UploadIcon />
                <div style={styles.dropzoneText}>
                  <span>Drop your image here</span>
                  <span>
                    or select{" "}
                    <span style={styles.browseLink}>Click to browse</span>
                  </span>
                </div>
              </div>

              {value.length > 0 && (
                <div style={styles.thumbGrid}>
                  {value.map((item, i) => (
                    <div key={`trigger-${i}`} style={styles.thumbItem}>
                      {item.type === "image" ? (
                        <img src={item.preview} alt="" style={styles.thumbMedia} />
                      ) : (
                        <>
                          {item.file ? (
                            <video src={item.preview} muted style={styles.thumbMedia} />
                          ) : (
                            <img src={item.preview} alt="" style={styles.thumbMedia} />
                          )}
                          <span style={styles.videoBadge}>VIDEO</span>
                        </>
                      )}
                      <button
                        type="button"
                        style={styles.thumbRemove}
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = value.filter((_, idx) => idx !== i);
                          if (item.file) URL.revokeObjectURL(item.preview);
                          onChange(updated);
                          onFilesChange?.(updated);
                        }}
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  ))}
                  {value.length < maxFiles && (
                    <button
                      type="button"
                      style={styles.thumbAdd}
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(value);
                      }}
                    >
                      <PlusIcon size={16} color="#98a2b3" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {infoText && (
              <div style={styles.infoRow}>
                <InfoIcon />
                <span style={styles.infoTextStyle}>{infoText}</span>
              </div>
            )}

            {errorMessage && <p style={styles.error}>{errorMessage}</p>}

            {/* ─── Main Modal ─── */}
            {modalOpen && (
              <div style={styles.overlay} onClick={handleCancel}>
                <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                  {/* Header */}
                  <div style={styles.modalHeader}>
                    <h2 style={styles.modalTitle}>Adding Images and videos</h2>
                    <button type="button" style={styles.closeBtn} onClick={handleCancel}>
                      <CloseIcon />
                    </button>
                  </div>

                  <div style={styles.modalBody}>
                    <div
                      style={{
                        ...styles.modalDropzone,
                        ...(isDragging
                          ? { borderColor: "var(--color-primary)", backgroundColor: "#f0fdfa" }
                          : {}),
                      }}
                      onDragOver={onModalDragOver}
                      onDragLeave={onModalDragLeave}
                      onDrop={handleModalDrop}
                    >
                      <div style={styles.addMediaWrapper} ref={dropdownRef}>
                        <div style={styles.addMediaBtnGroup}>
                          <button
                            type="button"
                            style={styles.addMediaMainBtn}
                            onClick={openPicker}
                          >
                            <PlusIcon size={14} color="#344054" />
                            <span>Add Media</span>
                          </button>
                          <button
                            type="button"
                            style={styles.addMediaDropdownBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDropdownOpen((p) => !p);
                            }}
                          >
                            <ChevronDown />
                          </button>
                        </div>
                        {dropdownOpen && (
                          <div style={styles.dropdownMenu}>
                            <button
                              type="button"
                              style={styles.dropdownItem}
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={() => openPicker()}
                            >
                              Upload from device
                            </button>
                            <button
                              type="button"
                              style={styles.dropdownItem}
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={() => {
                                setDropdownOpen(false);
                                setUrlModalOpen(true);
                              }}
                            >
                              Add from URL
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {modalErrors.length > 0 && (
                      <div style={styles.modalErrorBox}>
                        {modalErrors.map((err, i) => (
                          <p key={i} style={styles.modalErrorText}>{err}</p>
                        ))}
                      </div>
                    )}

                    <ul style={styles.guidelines}>
                      {defaultGuidelines.map((g, i) => (
                        <li key={i} style={styles.guidelineItem}>{g}</li>
                      ))}
                    </ul>

                    {tempFiles.length > 0 && (
                      <div style={styles.previewSection}>
                        <div style={styles.previewGrid}>
                          {tempFiles.map((item, i) => (
                            <div key={`modal-${i}`} style={styles.previewThumb}>
                              {item.type === "image" ? (
                                <img src={item.preview} alt="" style={styles.thumbMedia} />
                              ) : (
                                <>
                                  {item.file ? (
                                    <video src={item.preview} muted style={styles.thumbMedia} />
                                  ) : (
                                    <img src={item.preview} alt="" style={styles.thumbMedia} />
                                  )}
                                  <span style={styles.videoBadge}>VIDEO</span>
                                </>
                              )}
                              <button
                                type="button"
                                style={styles.removeBtn}
                                onClick={() => handleRemoveTemp(i)}
                              >
                                <TrashIcon size={12} />
                              </button>
                            </div>
                          ))}
                          {tempFiles.length < maxFiles && (
                            <button
                              type="button"
                              style={styles.previewAddBtn}
                              onClick={openPicker}
                            >
                              <PlusIcon size={18} color="#98a2b3" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div style={styles.modalFooter}>
                    <button type="button" style={styles.cancelBtn} onClick={handleCancel}>
                      Cancel
                    </button>
                    <button type="button" style={styles.confirmBtn} onClick={handleConfirm}>
                      Add Media
                    </button>
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedTypes.join(",")}
                    multiple
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        handleAddFiles(e.target.files);
                      }
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>
            )}

            <UrlModal
              open={urlModalOpen}
              onClose={() => setUrlModalOpen(false)}
              onAdd={handleAddUrl}
            />
          </div>
        );
      }}
    />
  );
}

const styles = {
  triggerZone: {
    width: "100%",
  },
  dropzone: {
    border: "1px dashed #AAAAAA",
    borderRadius: 12,
    backgroundColor: "#F9FBFC",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    gap: 8,
  },
  dropzoneText: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontSize: 13,
    color: "#667085",
    gap: 2,
  },
  browseLink: {
    color: "var(--color-primary)",
    fontWeight: 500,
    cursor: "pointer",
  },
  thumbGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  thumbItem: {
    position: "relative",
    width: 75,
    height: 75,
    borderRadius: 8,
    overflow: "hidden",
    border: "1px dashed #AAAAAA",
  },
  thumbRemove: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: "50%",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  thumbAdd: {
    width: 75,
    height: 75,
    borderRadius: 8,
    border: "1px dashed #AAAAAA",
    backgroundColor: "#F9FBFC",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  infoTextStyle: {
    fontSize: 13,
    color: "#667085",
  },
  thumbMedia: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  videoBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 3,
    padding: "1px 5px",
    fontSize: 9,
    color: "#fff",
    fontWeight: 700,
  },
  error: {
    color: "#ef4444",
    fontSize: 12,
    margin: "6px 0 0",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 20,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 14,
    width: "100%",
    maxWidth: 746,
    maxHeight: 649,
    height:'100%',
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px 16px",
    borderBottom: "1px solid #f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: "#101828",
    margin: 0,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    padding: "20px 24px",
    overflowY: "auto",
    flex: 1,
  },


  modalDropzone: {
    border: "1px dashed #AAAAAA",
    borderRadius: 10,
    backgroundColor: "#F6F6F6",
    minHeight: 190,
    display: "flex",

    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    transition: "all 0.2s ease",
  },
  addMediaWrapper: {
    position: "relative",
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
  },
  addMediaBtnGroup: {
    display: "inline-flex",
    alignItems: "stretch",
    borderRadius: 8,
    border: "1px solid #d0d5dd",
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  addMediaMainBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    border: "none",
    backgroundColor: "transparent",
    fontSize: 14,
    fontWeight: 500,
    color: "#344054",
    cursor: "pointer",
  },
  addMediaDropdownBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 10px",
    border: "none",
    borderLeft: "1px solid #d0d5dd",
    backgroundColor: "transparent",
    cursor: "pointer",
  },
  dropdownMenu: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#fff",
    borderRadius: 8,
    boxShadow: "0 4px 16px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)",
    minWidth: 180,
    zIndex: 10,
    overflow: "hidden",
  },
  dropdownItem: {
    display: "block",
    width: "100%",
    padding: "10px 16px",
    border: "none",
    backgroundColor: "transparent",
    fontSize: 13,
    color: "#344054",
    cursor: "pointer",
    textAlign: "left",
  },
  modalErrorBox: {
    marginTop: 12,
    padding: "10px 14px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 8,
  },
  modalErrorText: {
    fontSize: 13,
    color: "#dc2626",
    margin: "2px 0",
    lineHeight: 1.4,
  },
  guidelines: {
    margin: "20px 0 0",
    padding: "0 0 0 16px",
    listStyle: "disc",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  guidelineItem: {
    fontSize: 13,
    color: "#475467",
    lineHeight: 1.5,
  },
  previewSection: {
    marginTop: 20,
  },
  previewGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },
  previewThumb: {
    position: "relative",
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
    border: "2px solid #e5e7eb",
    backgroundColor: "var(--color-white)",
  },
  removeBtn: {
    position: "absolute",
    bottom: 3,
    right: 3,
    width: 22,
    height: 22,
    borderRadius: "50%",
    backgroundColor: "white",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  previewAddBtn: {
    width: 100,
    height: 100,
    borderRadius: 5,
    border: "1px dashed #d0d5dd",
    backgroundColor: "#F6F6F6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  modalFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    padding: "16px 24px",
    borderTop: "1px solid #f0f0f0",
  },
  cancelBtn: {
    padding: "10px 28px",
    borderRadius: 8,
    border: "1px solid #d0d5dd",
    backgroundColor: "#fff",
    fontSize: 14,
    fontWeight: 500,
    color: "#344054",
    cursor: "pointer",
  },
  confirmBtn: {
    padding: "10px 28px",
    borderRadius: 8,
    border: "none",
    backgroundColor: "var(--color-primary)",
    fontSize: 14,
    fontWeight: 500,
    color: "#fff",
    cursor: "pointer",
  },
  urlOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10001,
    padding: 20,
  },
  urlModal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
    overflow: "hidden",
  },
  urlHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 20px 14px",
  },
  urlTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#101828",
    margin: 0,
  },
  urlBody: {
    padding: "0 20px 16px",
  },
  urlLabel: {
    fontSize: 13,
    color: "#475467",
    display: "block",
    marginBottom: 8,
  },
  urlInput: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #d0d5dd",
    fontSize: 14,
    color: "#101828",
    outline: "none",
    boxSizing: "border-box",
  },
  urlFooter: {
    padding: "0 20px 18px",
  },
  urlAddBtn: {
    padding: "10px 24px",
    borderRadius: 8,
    border: "none",
    backgroundColor: "var(--color-primary)",
    fontSize: 14,
    fontWeight: 500,
    color: "#fff",
    cursor: "pointer",
  },
};