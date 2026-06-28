import { useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import {
  PRIMARY,
  PRIMARY_LIGHT,
  primaryBtnStyle,
  overlayIconBtn,
  emptySlotStyle,
  mainBadgeStyle,
} from "../styles/variantStyles";
import { uploadImage, imageUrl } from "../../../../../../helper/helper";

export default function VariantImagesModal({
  open,
  onClose,
  images = [],
  onUpdate,
  maxImages = 5,
}) {
  const fileInputRef = useRef(null);
  const replaceIndexRef = useRef(null);
  const [uploading, setUploading] = useState(false);

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
        };

        if (replaceIndexRef.current !== null) {
          entry.sortOrder = replaceIndexRef.current + 1;
          newImages[replaceIndexRef.current] = entry;
          replaceIndexRef.current = null;
        } else {
          newImages.push(entry);
        }
      } catch (err) {
        console.error("Variant image upload failed:", err);
      }
    }

    newImages.forEach((img, i) => { img.sortOrder = i + 1; });
    onUpdate(newImages);
    setUploading(false);
  };

  const handleDelete = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    newImages.forEach((img, i) => { img.sortOrder = i + 1; });
    onUpdate(newImages);
  };

  const openPicker = (replaceIdx = null) => {
    replaceIndexRef.current = replaceIdx;
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: "4px" } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #eee", pb: 2 }}>
        <span style={{ fontSize: "16px", fontWeight: 700, color: "#151515" }}>
          Variant images
          {uploading && <CircularProgress size={16} sx={{ ml: 1, color: PRIMARY }} />}
        </span>
        <IconButton onClick={onClose} size="small">
          <CloseIcon sx={{ width: "20px", height: "20px" }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${maxImages}, 1fr)`, gap: "12px", marginTop: "12px" }}>
          {Array.from({ length: maxImages }).map((_, index) => {
            const img = images[index];

            if (img) {
              return (
                <div key={index} style={{ position: "relative", aspectRatio: "1", borderRadius: "3px", overflow: "hidden", backgroundColor: "#f5f5f5" }}>
                  <img
                    src={img.url || `${imageUrl}${img.mediaId}`}
                    alt={img.altText || `variant-img-${index}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div
                    style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: 0, transition: "opacity 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                  >
                    <button type="button" onClick={() => openPicker(index)} style={overlayIconBtn} title="Replace" disabled={uploading}>
                      <EditOutlinedIcon sx={{ width: "16px", height: "16px", color: "#fff" }} />
                    </button>
                    <button type="button" onClick={() => handleDelete(index)} style={overlayIconBtn} title="Delete">
                      <DeleteOutlineIcon sx={{ width: "16px", height: "16px", color: "#fff" }} />
                    </button>
                  </div>
                  {index === 0 && <div style={mainBadgeStyle}>Main</div>}
                </div>
              );
            }

            return (
              <button
                key={index}
                type="button"
                onClick={() => openPicker()}
                disabled={uploading}
                style={emptySlotStyle}
                onMouseEnter={(e) => {
                  if (!uploading) {
                    e.currentTarget.style.borderColor = PRIMARY;
                    e.currentTarget.style.background = PRIMARY_LIGHT;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#c0c0c0";
                  e.currentTarget.style.background = "none";
                }}
              >
                {uploading && index === images.length ? (
                  <CircularProgress size={22} sx={{ color: "#bbb" }} />
                ) : (
                  <AddPhotoAlternateOutlinedIcon sx={{ width: "26px", height: "26px", color: "#bbb" }} />
                )}
              </button>
            );
          })}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <button onClick={onClose} style={primaryBtnStyle}>Done</button>
      </DialogActions>
    </Dialog>
  );
}