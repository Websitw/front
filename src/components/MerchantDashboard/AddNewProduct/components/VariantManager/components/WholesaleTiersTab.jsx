import { useFieldArray, Controller } from "react-hook-form";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import { PRIMARY, smallBtnStyle, thStyle, cellInputStyle } from "../styles/variantStyles";


//  minQty    skus[].price.{country}.wholesalePriceList[].minQty
//  price      skus[].price.{country}.wholesalePriceList[].price
//  priceType  skus[].price.{country}.wholesalePriceList[].priceType (VALUE|RATE)

export default function WholesaleTiersTab({ variantIndex, control, onCopyToAll }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `variants.${variantIndex}.wholesaleTiers`,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "20px 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "12px", color: "#888" }}>
          Set volume-based pricing for B2B buyers
        </span>
        <button
          type="button"
          onClick={() => append({ minQty: 5, price: 0, priceType: "VALUE" })}
          style={{ ...smallBtnStyle, color: PRIMARY }}
        >
          <AddIcon sx={{ width: "15px", height: "15px" }} /> Add tier
        </button>
      </div>

      {fields.length > 0 && (
        <div style={{ border: "1px solid #e8e8e8", borderRadius: "3px", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 40px", background: "#f5f5f5", padding: "10px 14px" }}>
            <span style={thStyle}>Min qty</span>
            <span style={thStyle}>Price (JOD)</span>
            <span style={thStyle}>Type</span>
            <span />
          </div>

          {fields.map((tier, tIdx) => (
            <div
              key={tier.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 40px",
                padding: "8px 14px",
                borderTop: "1px solid #f0f0f0",
                alignItems: "center",
              }}
            >
              <Controller
                name={`variants.${variantIndex}.wholesaleTiers.${tIdx}.minQty`}
                control={control}
                render={({ field }) => (
                  <input {...field} type="number" style={cellInputStyle} placeholder="5" />
                )}
              />
              <Controller
                name={`variants.${variantIndex}.wholesaleTiers.${tIdx}.price`}
                control={control}
                render={({ field }) => (
                  <input {...field} type="number" style={cellInputStyle} placeholder="0.00" />
                )}
              />
              <Controller
                name={`variants.${variantIndex}.wholesaleTiers.${tIdx}.priceType`}
                control={control}
                render={({ field }) => (
                  <select {...field} style={{ ...cellInputStyle, cursor: "pointer" }}>
                    <option value="VALUE">Value</option>
                    <option value="RATE">Rate %</option>
                  </select>
                )}
              />
              <IconButton size="small" onClick={() => remove(tIdx)}>
                <DeleteOutlineIcon sx={{ width: "15px", height: "15px", color: "#ccc", "&:hover": { color: "#ef4444" } }} />
              </IconButton>
            </div>
          ))}
        </div>
      )}

      {onCopyToAll && (
        <button
          type="button"
          onClick={onCopyToAll}
          style={{ ...smallBtnStyle, color: PRIMARY, opacity: 0.8 }}
        >
          <ContentCopyOutlinedIcon sx={{ width: "14px", height: "14px" }} />
          Copy tiers to all variants
        </button>
      )}
    </div>
  );
}