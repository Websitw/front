import { useState, useRef } from "react";
import { Controller } from "react-hook-form";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

export default function TagsInput({
  name,
  control,
  label = "Tags",
  placeholder = "Search and add tags...",
  error,
  suggestions = [],
}) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(inputValue.toLowerCase()) && inputValue.trim()
  );

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={[]}
      render={({ field }) => {
        const tags = Array.isArray(field.value) ? field.value : [];

        const addTag = (tag) => {
          const trimmed = tag.trim().toUpperCase();
          if (trimmed && !tags.includes(trimmed)) {
            field.onChange([...tags, trimmed]);
          }
          setInputValue("");
          setShowSuggestions(false);
          inputRef.current?.focus();
        };

        const removeTag = (tag) => {
          field.onChange(tags.filter((t) => t !== tag));
        };

        const handleKeyDown = (e) => {
          if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
            e.preventDefault();
            addTag(inputValue);
          } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
            removeTag(tags[tags.length - 1]);
          }
        };

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {label && (
              <label
                style={{
                  fontSize: "16px",
                  fontWeight: "400",
                  color: "#151515",
                  letterSpacing: "0.08em",
                }}
              >
                {label}
              </label>
            )}

            <div style={{ position: "relative" }}>
              <TextField
                inputRef={inputRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder={placeholder}
                fullWidth
                size="small"
                error={!!error}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        sx={{ color: "#151515", width: "18px", height: "18px" }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "#fff",
                    minHeight: "48px",
                    fontSize: "16px",
                    color: "#9ca3af",
                    "& fieldset": {
                      borderColor: "#B4B4B4",
                      borderWidth: "1px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#151515",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#151515",
                      borderWidth: "1px",
                    },
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "#9ca3af",
                    opacity: 1,
                    fontSize: "16px",
                  },
                  "& .MuiInputAdornment-root": {
                    marginRight: "6px",
                  },
                }}
              />

              {showSuggestions && filteredSuggestions.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    right: 0,
                    background: "#fff",
                    border: "1px solid #d0d0d0",
                    borderRadius: "2px",
                    zIndex: 100,
                    maxHeight: "180px",
                    overflowY: "auto",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                >
                  {filteredSuggestions.map((s) => (
                    <div
                      key={s}
                      onMouseDown={() => addTag(s)}
                      style={{
                        padding: "8px 14px",
                        fontSize: "13px",
                        color: "#151515",
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f5f5f5")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {s.toUpperCase()}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "3px 10px",
                      border: "1px solid #151515",
                      borderRadius: "2px",
                      fontSize: "11px",
                      fontWeight: "600",
                      letterSpacing: "0.06em",
                      color: "#151515",
                      backgroundColor: "#fff",
                    }}
                  >
                    {tag}
                    <CloseIcon
                      onClick={() => removeTag(tag)}
                      sx={{
                        width: "12px",
                        height: "12px",
                        cursor: "pointer",
                        color: "#151515",
                        "&:hover": { color: "#ef4444" },
                        transition: "color 0.15s",
                      }}
                    />
                  </span>
                ))}
              </div>
            )}

            {error && (
              <span
                style={{
                  color: "#ef4444",
                  fontSize: "12px",
                  marginTop: "2px",
                }}
              >
                {error}
              </span>
            )}
          </div>
        );
      }}
    />
  );
}