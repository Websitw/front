import React, { useRef, useCallback } from 'react';
import { Upload } from 'lucide-react';
import { useController } from 'react-hook-form';
import './FileUploader.css';

const FileUploader = ({
  name,
  control,
  rules,
  acceptedTypes = '.pdf',
  dropText = 'Drop your PDF file here',
  browseText = 'Click to browse',
  disabled = false,
}) => {
  const fileInputRef = useRef(null);

  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ name, control, rules });

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      if (disabled) return;
      const droppedFile = e.dataTransfer.files?.[0];
      if (droppedFile) onChange(droppedFile);
    },
    [disabled, onChange]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleBrowse = useCallback(() => {
    if (!disabled) fileInputRef.current?.click();
  }, [disabled]);

  const handleFileInput = useCallback(
    (e) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) onChange(selectedFile);
      e.target.value = '';
    },
    [onChange]
  );

  return (
    <div className="file-uploader">
      <div
        className={`file-uploader__dropzone ${disabled ? 'file-uploader__dropzone--disabled' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleBrowse}
      >
        <Upload size={24} className="file-uploader__icon" />
        <div className="file-uploader__text">
          <span>{dropText}</span>
          <span>
            or select <span className="file-uploader__browse">{browseText}</span>
          </span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileInput}
        className="file-uploader__input"
      />

  

      {error && <span className="file-uploader__error">{error.message}</span>}
    </div>
  );
};

export default FileUploader;