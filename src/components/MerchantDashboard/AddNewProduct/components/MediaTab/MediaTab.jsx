import { useRef, useState } from "react";
import { Controller } from "react-hook-form";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import CircularProgress from "@mui/material/CircularProgress";
import { uploadImage, imageUrl } from "../../../../../helper/helper";

export default function ProductImagesInput({
  name,
  control,
  label = "Product Images",
  description = "Images shared across all variations. Variant-specific images are managed in the variants tab.",
  maxImages = 4,
  error,
}) {
  const fileInputRef = useRef(null);
  const replaceIndexRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const openFilePicker = (replaceIndex = null) => {
    replaceIndexRef.current = replaceIndex;
    fileInputRef.current?.click();
  };

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={[]}
      render={({ field }) => {
        const images = Array.isArray(field.value) ? field.value : [];

        const handleFiles = async (files) => {
          setUploading(true);
          const newImages = [...images];

          for (const file of Array.from(files)) {
            if (replaceIndexRef.current === null && newImages.length >= maxImages) break;

            try {
              const response = await uploadImage(file);
              const mediaId = response?.result?.id;

              if (!mediaId) continue;

              const entry = {
                mediaId,
                type: "IMAGE",
                altText: file.name,
                sortOrder: newImages.length + 1,
                url: `${imageUrl}${mediaId}`,
                isMain: newImages.length === 0,
              };

              if (replaceIndexRef.current !== null) {
                entry.isMain = newImages[replaceIndexRef.current]?.isMain;
                entry.sortOrder = replaceIndexRef.current + 1;
                newImages[replaceIndexRef.current] = entry;
                replaceIndexRef.current = null;
              } else {
                newImages.push(entry);
              }
            } catch (err) {
              console.error("Image upload failed:", err);
            }
          }

          newImages.forEach((img, i) => { img.sortOrder = i + 1; });
          field.onChange(newImages);
          setUploading(false);
        };

        const handleDelete = (index) => {
          const newImages = images.filter((_, i) => i !== index);
          if (images[index]?.isMain && newImages.length > 0) {
            newImages[0] = { ...newImages[0], isMain: true };
          }
          newImages.forEach((img, i) => { img.sortOrder = i + 1; });
          field.onChange(newImages);
        };

        const slots = Array.from({ length: maxImages });

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {label && (
                  <span style={{ fontSize: "16px", fontWeight: "500", color: "#151515", letterSpacing: "0.05em" }}>
                    {label}
                  </span>
                )}
                {description && (
                  <span style={{ fontSize: "14px", color: "#888", letterSpacing: "0.02em" }}>
                    {description}
                  </span>
                )}
                <div style={{ height: "1px", backgroundColor: "#e0e0e0", marginTop: "6px", width: "100%" }} />
              </div>

              {images.length < maxImages && (
                <button
                  type="button"
                  onClick={() => openFilePicker()}
                  disabled={uploading}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    background: "none",
                    border: "none",
                    cursor: uploading ? "not-allowed" : "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#151515",
                    padding: "0",
                    flexShrink: 0,
                    marginLeft: "16px",
                    opacity: uploading ? 0.5 : 1,
                  }}
                >
                  {uploading ? (
                    <CircularProgress size={14} sx={{ color: "#151515" }} />
                  ) : (
                    <AddIcon sx={{ width: "16px", height: "16px" }} />
                  )}
                  {uploading ? "Uploading..." : "Add image"}
                </button>
              )}
            </div>

            {/* Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${maxImages}, 1fr)`,
                gap: "12px",
              }}
            >
              {slots.map((_, index) => {
                const img = images[index];

                if (img) {
                  return (
                    <div
                      key={index}
                      style={{
                        position: "relative",
                        aspectRatio: "1",
                        borderRadius: "2px",
                        overflow: "hidden",
                        backgroundColor: "#f0f0f0",
                      }}
                    >
                      <img
                        src={`${imageUrl}${img.mediaId}`}
                        alt={img.altText || `product-${index}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />

                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(0,0,0,0.45)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "10px",
                          opacity: 0,
                          transition: "opacity 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                      >
                        <button
                          type="button"
                          onClick={() => openFilePicker(index)}
                          style={iconBtnStyle}
                          title="Replace"
                          disabled={uploading}
                        >
                          <EditOutlinedIcon sx={{ width: "18px", height: "18px", color: "#fff" }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(index)}
                          style={iconBtnStyle}
                          title="Delete"
                        >
                          <DeleteOutlineIcon sx={{ width: "18px", height: "18px", color: "#fff" }} />
                        </button>
                      </div>

                      {img.isMain && (
                        <div
                          style={{
                            position: "absolute",
                            top: "8px",
                            left: "8px",
                            backgroundColor: "var(--color-primary)",
                            color: "#fff",
                            fontSize: "10px",
                            fontWeight: "700",
                            letterSpacing: "0.06em",
                            padding: "2px 7px",
                            borderRadius: "2px",
                          }}
                        >
                          Main
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => openFilePicker()}
                    disabled={uploading}
                    style={{
                      aspectRatio: "1",
                      border: "1.5px dashed #c0c0c0",
                      borderRadius: "2px",
                      background: "none",
                      cursor: uploading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "border-color 0.15s, background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!uploading) {
                        e.currentTarget.style.borderColor = "#151515";
                        e.currentTarget.style.background = "#fafafa";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#c0c0c0";
                      e.currentTarget.style.background = "none";
                    }}
                  >
                    {uploading && index === images.length ? (
                      <CircularProgress size={24} sx={{ color: "#bbb" }} />
                    ) : (
                      <AddPhotoAlternateOutlinedIcon sx={{ width: "28px", height: "28px", color: "#bbb" }} />
                    )}
                  </button>
                );
              })}
            </div>

            {error && (
              <span style={{ color: "#ef4444", fontSize: "12px" }}>{error}</span>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
        );
      }}
    />
  );
}

const iconBtnStyle = {
  background: "rgba(255,255,255,0.15)",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  padding: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.15s",
};