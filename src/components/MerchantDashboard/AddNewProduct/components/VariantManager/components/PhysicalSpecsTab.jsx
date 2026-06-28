import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VariantFormInput from "./VariantFormInput";

export default function PhysicalSpecsTab({ variantIndex, control, variantErrors }) {
  const prefix = `variants.${variantIndex}`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        padding: "20px 0",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: "16px",
        }}
      >
        <VariantFormInput
          name={`${prefix}.weight`}
          control={control}
          label="Weight"
          placeholder="0.00"
          type="number"
          endAdornment="KG"
          error={variantErrors?.weight?.message}
        />
        <VariantFormInput
          name={`${prefix}.length`}
          control={control}
          label="Length"
          placeholder="0"
          type="number"
          endAdornment="CM"
          error={variantErrors?.length?.message}
        />
        <VariantFormInput
          name={`${prefix}.width`}
          control={control}
          label="Width"
          placeholder="0"
          type="number"
          endAdornment="CM"
          error={variantErrors?.width?.message}
        />
        <VariantFormInput
          name={`${prefix}.height`}
          control={control}
          label="Height"
          placeholder="0"
          type="number"
          endAdornment="CM"
          error={variantErrors?.height?.message}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "14px 16px",
          background: "#f8f8f8",
          borderRadius: "3px",
        }}
      >
        <InfoOutlinedIcon sx={{ width: "16px", height: "16px", color: "#999" }} />
        <span style={{ fontSize: "12px", color: "#888" }}>
          Dimensions are used for shipping cost calculations
        </span>
      </div>
    </div>
  );
}