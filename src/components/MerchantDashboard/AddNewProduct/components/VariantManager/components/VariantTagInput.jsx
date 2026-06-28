import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { tagStyle, inlineInputStyle } from "../styles/variantStyles";

export default function VariantTagInput({
  values = [],
  onChange,
  placeholder = "New value...",
}) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      const newVal = input.trim().toUpperCase();
      if (!values.includes(newVal)) {
        onChange([...values, newVal]);
      }
      setInput("");
    }
  };

  const removeValue = (val) => {
    onChange(values.filter((v) => v !== val));
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
      {values.map((val) => (
        <span key={val} style={tagStyle}>
          {val}
          <CloseIcon
            onClick={() => removeValue(val)}
            sx={{
              width: "13px",
              height: "13px",
              cursor: "pointer",
              color: "#fff",
              ml: "4px",
              "&:hover": { opacity: 0.7 },
            }}
          />
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={inlineInputStyle}
      />
    </div>
  );
}