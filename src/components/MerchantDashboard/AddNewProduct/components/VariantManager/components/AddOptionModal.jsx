import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import CloseIcon from "@mui/icons-material/Close";
import {
  labelStyle,
  textFieldSx,
  tagStyle,
  primaryBtnStyle,
  outlineBtnStyle,
} from "../styles/variantStyles";

export default function AddOptionModal({ open, onClose, onAdd }) {
  const [optionName, setOptionName] = useState("");
  const [values, setValues] = useState([]);
  const [valueInput, setValueInput] = useState("");

  const handleAddValue = (e) => {
    if (e.key === "Enter" && valueInput.trim()) {
      e.preventDefault();
      const val = valueInput.trim();
      if (!values.includes(val)) {
        setValues([...values, val]);
      }
      setValueInput("");
    }
  };

  const handleSubmit = () => {
    if (optionName.trim() && values.length > 0) {
      onAdd({ name: optionName.trim(), values });
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    setOptionName("");
    setValues([]);
    setValueInput("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={resetAndClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "4px", overflow: "visible" } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #eee",
          pb: 2,
        }}
      >
        <span
          style={{
            fontSize: "20px",
            fontWeight: 500,
            color: "#151515",
            letterSpacing: "0.03em",
          }}
        >
          Add variant option
        </span>
        <IconButton onClick={resetAndClose} size="small">
          <CloseIcon sx={{ width: "20px", height: "20px" }} />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{ pt: 3, display: "flex", flexDirection: "column", gap: "20px" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            marginTop: "16px",
          }}
        >
          <label style={labelStyle}>Option name</label>
          <TextField
            value={optionName}
            onChange={(e) => setOptionName(e.target.value)}
            placeholder="e.g., Size, Material"
            fullWidth
            size="small"
            sx={textFieldSx}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={labelStyle}>Add values</label>
          <div
            style={{
              border: "1px solid #d0d0d0",
              borderRadius: "3px",
              padding: "12px",
              minHeight: "80px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                marginBottom: values.length ? "10px" : 0,
              }}
            >
              {values.map((v) => (
                <span key={v} style={tagStyle}>
                  {v.toUpperCase()}
                  <CloseIcon
                    onClick={() => setValues(values.filter((x) => x !== v))}
                    sx={{
                      width: "13px",
                      height: "13px",
                      cursor: "pointer",
                      color: "#fff",
                      ml: "4px",
                    }}
                  />
                </span>
              ))}
            </div>
            <input
              value={valueInput}
              onChange={(e) => setValueInput(e.target.value)}
              onKeyDown={handleAddValue}
              placeholder="Type + Enter"
              style={{
                border: "none",
                outline: "none",
                fontSize: "13px",
                color: "#151515",
                fontFamily: "inherit",
                width: "100%",
                background: "transparent",
              }}
            />
          </div>
        </div>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: "10px" }}>
        <button onClick={resetAndClose} style={outlineBtnStyle}>
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          style={primaryBtnStyle}
          disabled={!optionName.trim() || values.length === 0}
        >
          Add option
        </button>
      </DialogActions>
    </Dialog>
  );
}