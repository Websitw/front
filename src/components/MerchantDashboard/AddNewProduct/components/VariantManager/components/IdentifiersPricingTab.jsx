import { useMemo } from "react";
import { useWatch } from "react-hook-form";
import TextField from "@mui/material/TextField";
import VariantFormInput from "./VariantFormInput";
import { labelStyle, textFieldSx } from "../styles/variantStyles";


//  barcode      → skus[].barcode
//  costPrice    → skus[].price.{country}.costPrice
//  salePercent  → skus[].price.{country}.salePercent
//  listPrice    → skus[].price.{country}.listPrice

export default function IdentifiersPricingTab({ variantIndex, control, variantErrors }) {
  const prefix = `variants.${variantIndex}`;

  const costPrice = useWatch({ control, name: `${prefix}.costPrice` });
  const listPrice = useWatch({ control, name: `${prefix}.listPrice` });

  const margin = useMemo(() => {
    const cost = parseFloat(costPrice) || 0;
    const retail = parseFloat(listPrice) || 0;
    if (retail <= 0) return "—";
    const pct = ((retail - cost) / retail) * 100;
    return `${pct.toFixed(1)}%`;
  }, [costPrice, listPrice]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px", padding: "20px 0" }}>
      <VariantFormInput
        name={`${prefix}.barcode`}
        control={control}
        label="Barcode / UPC / EAN"
        placeholder="Scan or type barcode..."
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <VariantFormInput
          name={`${prefix}.costPrice`}
          control={control}
          label="Cost price"
          placeholder="0.00"
          type="number"
          startAdornment="JOD"
          error={variantErrors?.costPrice?.message}
        />
        <VariantFormInput
          name={`${prefix}.salePercent`}
          control={control}
          label="Sale percent (optional)"
          placeholder="—"
          type="number"
          endAdornment="%"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <VariantFormInput
          name={`${prefix}.listPrice`}
          control={control}
          label="List price"
          placeholder="0.00"
          type="number"
          startAdornment="JOD"
          error={variantErrors?.listPrice?.message}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={labelStyle}>Margin</label>
          <TextField
            value={margin}
            disabled
            fullWidth
            size="small"
            sx={{
              ...textFieldSx,
              "& .MuiOutlinedInput-root": {
                ...textFieldSx["& .MuiOutlinedInput-root"],
                backgroundColor: "#fafafa",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}