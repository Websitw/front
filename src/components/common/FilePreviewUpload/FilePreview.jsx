import { useController } from "react-hook-form";
import { useState, useEffect } from "react";
import "./FilePreview.css";

const FilePreview = ({ name, control }) => {
  const {
    field: { value, onChange },
  } = useController({ name, control });

  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }

    if (value instanceof File && value.type.startsWith("image/")) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }

    if (typeof value === "string") {
      const isPdf = value.toLowerCase().endsWith(".pdf");
      if (!isPdf) setPreview(value);
    }
  }, [value]);

  if (!value) return null;

  const fileName =
    value instanceof File
      ? value.name
      : typeof value === "string"
        ? value.split("/").pop()
        : "";

  const fileSize =
    value instanceof File ? value.size : null;

  const isPdf =
    (value instanceof File && value.type === "application/pdf") ||
    (typeof value === "string" && value.toLowerCase().endsWith(".pdf"));

  const formatSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div className="file-preview">
      <div className="file-preview__card">
        {isPdf ? (
          <div className="file-preview__icon">
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="36" height="36" rx="8" fill="#FEE2E2" />
              <path
                d="M12 9h8l5 5v12a2 2 0 01-2 2H12a2 2 0 01-2-2V11a2 2 0 012-2z"
                stroke="#DC3545"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M20 9v5h5"
                stroke="#DC3545"
                strokeWidth="1.5"
                fill="none"
              />
              <text
                x="18"
                y="24"
                textAnchor="middle"
                fill="#DC3545"
                fontSize="6"
                fontWeight="700"
                fontFamily="sans-serif"
              >
                PDF
              </text>
            </svg>
          </div>
        ) : (
          <div className="file-preview__thumbnail">
            <img src={preview} alt={fileName} />
          </div>
        )}

        <div className="file-preview__info">
          <span className="file-preview__name" title={fileName}>
            {fileName}
          </span>
          {fileSize > 0 && (
            <span className="file-preview__size">{formatSize(fileSize)}</span>
          )}
        </div>

        <button
          type="button"
          className="file-preview__remove"
          onClick={handleRemove}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 6L14 14M14 6L6 14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FilePreview;