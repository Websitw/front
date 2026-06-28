import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VariantTagInput from "./VariantTagInput";
import { PRIMARY, sectionTitleStyle, smallBtnStyle } from "../styles/variantStyles";

export default function DefineOptions({
  optionFields,
  options,
  onAddClick,
  onDeleteOption,
  onUpdateOptionValues,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={sectionTitleStyle}>Define options</span>
        <button
          type="button"
          onClick={onAddClick}
          style={{ ...smallBtnStyle, color: PRIMARY }}
        >
          <AddIcon sx={{ width: "16px", height: "16px" }} /> Add option
        </button>
      </div>

      <div
        style={{
          height: "1px",
          background: `linear-gradient(to right, ${PRIMARY}, transparent)`,
        }}
      />

      {optionFields.map((opt, oIdx) => (
        <div
          key={opt.id}
          style={{
            border: "1px solid #e8e8e8",
            borderRadius: "4px",
            padding: "16px 20px",
            background: "#fafafa",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <span
              style={{ fontSize: "13px", fontWeight: 700, color: "#151515" }}
            >
              {options?.[oIdx]?.name || "Option"}
            </span>
            <IconButton size="small" onClick={() => onDeleteOption(oIdx)}>
              <DeleteOutlineIcon
                sx={{
                  width: "16px",
                  height: "16px",
                  color: "#ccc",
                  "&:hover": { color: "#ef4444" },
                }}
              />
            </IconButton>
          </div>
          <VariantTagInput
            values={options?.[oIdx]?.values || []}
            onChange={(newVals) => onUpdateOptionValues(oIdx, newVals)}
            placeholder="New value..."
          />
        </div>
      ))}

      {optionFields.length === 0 && (
        <div
          style={{
            padding: "32px",
            textAlign: "center",
            color: "#ccc",
            fontSize: "13px",
            border: "1px dashed #ddd",
            borderRadius: "4px",
          }}
        >
          No options defined yet. Click "+ Add option" to get started.
        </div>
      )}
    </div>
  );
}