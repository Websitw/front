import { Controller } from "react-hook-form";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { labelStyle, textFieldSx } from "../styles/variantStyles";

export default function VariantFormInput({
  name,
  control,
  label,
  placeholder,
  type = "text",
  disabled = false,
  startAdornment,
  endAdornment,
  error,
  fullWidth = true,
  size = "small",
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && <label style={labelStyle}>{label}</label>}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            fullWidth={fullWidth}
            size={size}
            error={!!error}
            helperText={error}
            InputProps={{
              startAdornment: startAdornment ? (
                <InputAdornment position="start">
                  <span style={{ fontSize: "13px", color: "#999", fontWeight: 500 }}>
                    {startAdornment}
                  </span>
                </InputAdornment>
              ) : undefined,
              endAdornment: endAdornment ? (
                <InputAdornment position="end">
                  <span style={{ fontSize: "13px", color: "#999", fontWeight: 500 }}>
                    {endAdornment}
                  </span>
                </InputAdornment>
              ) : undefined,
            }}
            sx={textFieldSx}
          />
        )}
      />
    </div>
  );
}