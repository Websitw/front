import Switch from "@mui/material/Switch";
import { styled } from "@mui/material/styles";
import { Controller } from "react-hook-form";

const StyledSwitch = styled(Switch, {
  shouldForwardProp: (prop) =>
    !["containerWidth", "containerHeight", "thumbWidth", "thumbHeight", "activeColor", "inactiveColor", "thumbColor"].includes(prop),
})(({
  theme,
  containerWidth = 32,
  containerHeight = 16,
  thumbWidth = 12,
  thumbHeight = 12,
  activeColor = "#3b82f6",
  inactiveColor = "#cbd5e1",
  thumbColor = "#fff",
}) => ({
  width: containerWidth,
  height: containerHeight,
  padding: 0,
  display: "flex",
  flexShrink: 0,
  "&:active": {
    "& .MuiSwitch-thumb": { width: thumbWidth },
    "& .MuiSwitch-switchBase.Mui-checked": {
      transform: `translateX(${containerWidth - thumbWidth - 4}px)`,
    },
  },
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      transform: `translateX(${containerWidth - thumbWidth - 4}px)`,
      color: thumbColor,
      "& + .MuiSwitch-track": { opacity: 1, backgroundColor: activeColor },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
    width: thumbWidth,
    height: thumbHeight,
    borderRadius: thumbWidth / 2,
    transition: theme.transitions.create(["width"], { duration: 200 }),
  },
  "& .MuiSwitch-track": {
    borderRadius: containerHeight / 2,
    opacity: 1,
    backgroundColor: inactiveColor,
    boxSizing: "border-box",
  },
}));

export default function SwitchInput({
  // RHF props
  name,
  control,
  // Layout props
  label,
  gap = "10px",
  labelPosition = "start", // "start" | "end"
  // Switch sizing & colors
  containerWidth = 32,
  containerHeight = 16,
  thumbWidth = 12,
  thumbHeight = 12,
  activeColor = "#3b82f6",
  inactiveColor = "#cbd5e1",
  thumbColor = "#fff",
  // Misc
  disabled = false,
  onChange: onChangeProp,
}) {
  const labelEl = label && (
    <span
      style={{
        fontSize: "16px",
        color: "#151515",
        fontWeight: "400",
        lineHeight: 1,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {label}
    </span>
  );

  const renderSwitch = (checked, handleChange) => (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent:'space-between',
        gap,
        cursor: disabled ? "default" : "pointer",
      }}
      onClick={() => !disabled && handleChange(!checked)}
    >
      {labelPosition === "start" && labelEl}
      <StyledSwitch
        checked={checked}
        onChange={(e) => handleChange(e.target.checked)}
        disabled={disabled}
        containerWidth={containerWidth}
        containerHeight={containerHeight}
        thumbWidth={thumbWidth}
        thumbHeight={thumbHeight}
        activeColor={activeColor}
        inactiveColor={inactiveColor}
        thumbColor={thumbColor}
        onClick={(e) => e.stopPropagation()}
      />
      {labelPosition === "end" && labelEl}
    </div>
  );

  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        defaultValue={false}
        render={({ field }) =>
          renderSwitch(!!field.value, (val) => {
            field.onChange(val);
            onChangeProp?.(val);
          })
        }
      />
    );
  }

  return renderSwitch(false, (val) => onChangeProp?.(val));
}