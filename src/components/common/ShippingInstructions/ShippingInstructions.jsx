import { useState, useRef } from "react";
import { Controller } from "react-hook-form";
import CloseIcon from "@mui/icons-material/Close";
import "./ShippingInstructions.css";

const ShippingInstructions = ({
  name,
  control,
  label = "Shipping instructions",
  placeholder = "Type instruction and press Enter...",
  error,
}) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={[]}
      render={({ field }) => {
        const tags = Array.isArray(field.value) ? field.value : [];

        const addTag = (value) => {
          const trimmed = value.trim().toUpperCase();
          if (trimmed && !tags.includes(trimmed)) {
            field.onChange([...tags, trimmed]);
          }
          setInputValue("");
          inputRef.current?.focus();
        };

        const removeTag = (tag) => {
          field.onChange(tags.filter((t) => t !== tag));
        };

        const handleKeyDown = (e) => {
          if (e.key === "Enter" && inputValue.trim()) {
            e.preventDefault();
            addTag(inputValue);
          } else if (
            e.key === "Backspace" &&
            !inputValue &&
            tags.length > 0
          ) {
            removeTag(tags[tags.length - 1]);
          }
        };

        return (
          <div className="si-wrapper">
            {label && <span className="si-label">{label}</span>}

            <div className="si-divider" />

            <div className="si-input-container">
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="si-input"
              />
            </div>

            {tags.length > 0 && (
              <div className="si-tags">
                {tags.map((tag) => (
                  <span key={tag} className="si-tag">
                    {tag}
                    <CloseIcon
                      onClick={() => removeTag(tag)}
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
              </div>
            )}

            {error && <span className="si-error">{error}</span>}
          </div>
        );
      }}
    />
  );
};

export default ShippingInstructions;