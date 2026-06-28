import { Controller } from "react-hook-form";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import CircleIcon from "@mui/icons-material/Circle";

export default function FormRadioButtons({
  name,
  control,
  label,
  options = [],
  error,
  multiple = true,
  direction = "row",
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {label && (
        <label
          style={{
            fontSize: "16px",
            color: "#333333",
            fontWeight: "500",
            marginBottom: "8px",
          }}
        >
          {label}
        </label>
      )}

      <Controller
        name={name}
        control={control}
        defaultValue={multiple ? [] : null}
        render={({ field }) => (
          <FormGroup
            sx={{
              gap: "10px",
              flexDirection: direction,
              flexWrap: direction === "row" ? "wrap" : "nowrap",
            }}
          >
            {options.map((option) => {
              const isChecked = multiple
                ? Array.isArray(field.value) && field.value.includes(option.value)
                : field.value === option.value;

              const handleToggle = () => {
                if (multiple) {
                  const currentValues = Array.isArray(field.value) ? [...field.value] : [];
                  if (isChecked) {
                    field.onChange(currentValues.filter((v) => v !== option.value));
                  } else {
                    field.onChange([...currentValues, option.value]);
                  }
                } else {
                  field.onChange(isChecked ? null : option.value);
                }
              };

              return (
                <FormControlLabel
                  key={option.value}
                  sx={{
                    margin: 0,
                    border: "none",
                    padding: "0px",
                    height: "auto",
                    alignItems: "center",
                    "& .MuiFormControlLabel-label": {
                      fontSize: "16px",
                      color: "#818181",
                      fontWeight: "400",
                      fontFamily: "inherit",
                    },
                  }}
                  control={
                    <Checkbox
                      checked={isChecked}
                      onChange={handleToggle}
                      icon={
                        <CircleOutlinedIcon
                          sx={{ width: "17px", height: "17px", color: "#818181" }}
                        />
                      }
                      checkedIcon={
                        <CircleIcon
                          sx={{ width: "14px", height: "14px", color: "#057234" }}
                        />
                      }
                      sx={{
                        padding: "4px",
                        "&:hover": { backgroundColor: "transparent" },
                      }}
                    />
                  }
                  label={option.label}
                />
              );
            })}
          </FormGroup>
        )}
      />

      {error && (
        <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>
          {error}
        </span>
      )}
    </div>
  );
}