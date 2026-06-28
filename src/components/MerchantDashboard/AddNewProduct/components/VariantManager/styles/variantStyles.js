export const PRIMARY = "#0D7C85";
export const PRIMARY_LIGHT = "#e8f4f5";
export const PRIMARY_DARK = "#0a636a";

export const labelStyle = {
  fontSize: "16px",
  fontWeight: 500,
  color: "#555",
  letterSpacing: "0.04em",
};

export const sectionTitleStyle = {
  fontSize: "15px",
  fontWeight: 500,
  color: "#151515",
  letterSpacing: "0.03em",
};

export const thStyle = {
  fontSize: "11px",
  fontWeight: 500,
  color: "#999",
  letterSpacing: "0.04em",
};

export const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "3px",
    fontSize: "13px",
    minHeight: "48px",
    color: "#151515",
    fontFamily: "inherit",
    "& fieldset": { borderColor: "#d0d0d0" },
    "&:hover fieldset": { borderColor: PRIMARY },
    "&.Mui-focused fieldset": { borderColor: PRIMARY, borderWidth: "1.5px" },
  },
  "& .MuiInputBase-input::placeholder": { color: "#bbb", opacity: 1 },
};

export const tagStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "5px 12px",
  backgroundColor: PRIMARY,
  color: "#fff",
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "0.04em",
  borderRadius: "3px",
  whiteSpace: "nowrap",
};

export const inlineInputStyle = {
  border: "1px solid #d0d0d0",
  borderRadius: "3px",
  padding: "6px 12px",
  fontSize: "13px",
  color: "#151515",
  outline: "none",
  background: "#fff",
  fontFamily: "inherit",
  minWidth: "110px",
};

export const primaryBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "9px 22px",
  backgroundColor: PRIMARY,
  color: "#fff",
  border: "none",
  borderRadius: "3px",
  fontSize: "16px",
  fontWeight: 500,
  cursor: "pointer",
  transition: "background 0.15s",
  letterSpacing: "0.02em",
};

export const outlineBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "9px 22px",
  backgroundColor: "#fff",
  color: "#151515",
  border: "1px solid #d0d0d0",
  borderRadius: "3px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.15s",
};

export const smallBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 600,
  padding: 0,
};

export const tableActionBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: "3px",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "5px 8px",
  borderRadius: "3px",
  color: "#888",
  transition: "all 0.15s",
  fontSize: "12px",
};

export const overlayIconBtn = {
  background: "rgba(255,255,255,0.18)",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  padding: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const emptySlotStyle = {
  aspectRatio: "1",
  border: "1.5px dashed #c0c0c0",
  borderRadius: "3px",
  background: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "border-color 0.15s, background 0.15s",
};

export const mainBadgeStyle = {
  position: "absolute",
  top: "6px",
  left: "6px",
  backgroundColor: PRIMARY,
  color: "#fff",
  fontSize: "9px",
  fontWeight: 500,
  padding: "2px 6px",
  borderRadius: "2px",
  letterSpacing: "0.04em",
};

export const cellInputStyle = {
  border: "none",
  background: "transparent",
  fontSize: "13px",
  color: "#151515",
  fontFamily: "inherit",
  width: "100%",
  outline: "none",
  padding: "4px 8px",
};