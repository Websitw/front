import { Controller } from "react-hook-form";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import VariantEditPanel from "./VariantEditPanel";
import {
  PRIMARY,
  PRIMARY_LIGHT,
  sectionTitleStyle,
  thStyle,
  tableActionBtn,
  cellInputStyle,
} from "../styles/variantStyles";
import { imageUrl } from "../../../../../../helper/helper";

export default function VariantMatrix({
  variantFields,
  control,
  watch,
  errors,
  expandedVariant,
  onToggleExpand,
  onOpenImages,
  onCopyTiersToAll,
}) {
  if (variantFields.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={sectionTitleStyle}>Variants matrix</span>
        <span style={{ fontSize: "12px", color: "#999", fontWeight: 500 }}>
          {variantFields.length} variant{variantFields.length !== 1 ? "s" : ""} generated
        </span>
      </div>

      <div style={{ height: "1px", background: `linear-gradient(to right, ${PRIMARY}, transparent)` }} />

      <div style={{ border: "1px solid #e8e8e8", borderRadius: "4px", overflow: "hidden" }}>
        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "60px 2fr 1fr 1fr 1fr auto", background: "#f5f5f5", padding: "10px 16px", alignItems: "center" }}>
          <span style={thStyle}>Image</span>
          <span style={thStyle}>Variant</span>
          <span style={thStyle}>SKU</span>
          <span style={{ ...thStyle, textAlign: "center" }}>Price (JOD)</span>
          <span style={{ ...thStyle, textAlign: "center" }}>Stock</span>
          <span style={{ ...thStyle, minWidth: "160px" }} />
        </div>

        {/* Rows */}
        {variantFields.map((variant, vIdx) => {
          const vData = watch(`variants.${vIdx}`);
          const isExpanded = expandedVariant === vIdx;
          const firstImage = vData?.images?.[0];

          return (
            <div key={variant.id} style={{ borderTop: "1px solid #f0f0f0" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 2fr 1fr 1fr 1fr auto",
                  padding: "10px 16px",
                  alignItems: "center",
                  background: isExpanded ? PRIMARY_LIGHT : "#fff",
                  transition: "background 0.15s",
                }}
              >
                {/* Image preview */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{ width: "40px", height: "40px", border: `1px solid ${errors?.variants?.[vIdx]?.images ? "#ef4444" : "#e0e0e0"}`, borderRadius: "3px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa" }}>
                    {firstImage ? (
                      <img
                        src={firstImage.url || `${imageUrl}${firstImage.mediaId}`}
                        alt="variant"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <ImageOutlinedIcon sx={{ width: "18px", height: "18px", color: errors?.variants?.[vIdx]?.images ? "#ef4444" : "#ccc" }} />
                    )}
                  </div>
                </div>

                {/* Variant name + tags */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingLeft: "8px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#151515" }}>{vData?.name}</span>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {(vData?.tags || []).map((tag) => (
                      <span key={tag} style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.04em", padding: "2px 6px", borderRadius: "2px", color: "#fff", background: tag === "WHOLESALE" ? "#151515" : PRIMARY }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* SKU (code) */}
                <Controller
                  name={`variants.${vIdx}.code`}
                  control={control}
                  render={({ field }) => (
                    <span style={{ fontSize: "13px", color: "#666", fontFamily: "monospace" }}>{field.value}</span>
                  )}
                />

                {/* Price (listPrice) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <Controller
                    name={`variants.${vIdx}.listPrice`}
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        style={{
                          ...cellInputStyle,
                          textAlign: "center",
                          borderColor: errors?.variants?.[vIdx]?.listPrice ? "#ef4444" : undefined,
                        }}
                        placeholder="0.00"
                      />
                    )}
                  />
                  {errors?.variants?.[vIdx]?.listPrice && (
                    <span style={{ fontSize: "10px", color: "#ef4444" }}>{errors.variants[vIdx].listPrice.message}</span>
                  )}
                </div>

                {/* Stock */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <Controller
                    name={`variants.${vIdx}.stock`}
                    control={control}
                    render={({ field }) => (
                      <input {...field} type="number" style={{ ...cellInputStyle, textAlign: "center" }} placeholder="0" />
                    )}
                  />
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: "4px", minWidth: "160px", justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => onOpenImages(vIdx)} style={tableActionBtn} title="Add images">
                    <AddPhotoAlternateOutlinedIcon sx={{ width: "15px", height: "15px" }} />
                  </button>
                  <button type="button" onClick={() => onOpenImages(vIdx)} style={tableActionBtn} title="View images" disabled={!vData?.images?.length}>
                    <VisibilityOutlinedIcon sx={{ width: "15px", height: "15px" }} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleExpand(vIdx)}
                    style={{ ...tableActionBtn, fontSize: "12px", fontWeight: 600, gap: "3px", color: isExpanded ? PRIMARY : "#888" }}
                  >
                    Edit
                    {isExpanded ? <KeyboardArrowUpIcon sx={{ width: "16px", height: "16px" }} /> : <KeyboardArrowDownIcon sx={{ width: "16px", height: "16px" }} />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <VariantEditPanel
                  variantIndex={vIdx}
                  control={control}
                  variantErrors={errors?.variants?.[vIdx]}
                  onSave={() => onToggleExpand(null)}
                  onDiscard={() => onToggleExpand(null)}
                  onCopyTiersToAll={() => onCopyTiersToAll(vIdx)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}