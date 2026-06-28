import React, { useRef, useCallback } from 'react';
import { Upload, Plus, Trash2, Info } from 'lucide-react';
import './ImageUploader.css';

const ImageUploader = ({
  images = [],
  onImagesChange,
  maxItems = 8,
  acceptedTypes = 'image/*,video/*',
  dropText = 'Drop your image here',
  browseText = 'Click to browse',
  infoText = '',
  disabled = false,
}) => {
  const fileInputRef = useRef(null);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      if (disabled) return;
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    },
    [disabled, images, maxItems]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleFiles = useCallback(
    (files) => {
      const remaining = maxItems - images.length;
      const newFiles = files.slice(0, remaining).map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
      }));
      onImagesChange?.([...images, ...newFiles]);
    },
    [images, maxItems, onImagesChange]
  );

  const handleBrowse = useCallback(() => {
    if (!disabled) fileInputRef.current?.click();
  }, [disabled]);

  const handleFileInput = useCallback(
    (e) => {
      const files = Array.from(e.target.files || []);
      handleFiles(files);
      e.target.value = '';
    },
    [handleFiles]
  );

  const handleRemove = useCallback(
    (id) => {
      const updated = images.filter((img) => img.id !== id);
      onImagesChange?.(updated);
    },
    [images, onImagesChange]
  );

  return (
    <div className="image-uploader">
      <div
        className={`image-uploader__dropzone ${disabled ? 'image-uploader__dropzone--disabled' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleBrowse}
      >
        <Upload size={24} className="image-uploader__icon" />
        <div className="image-uploader__text">
          <span>{dropText}</span>
          <span>
            or select <span className="image-uploader__browse">{browseText}</span>
          </span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        multiple
        onChange={handleFileInput}
        className="image-uploader__input"
      />

      {images.length > 0 && (
        <div className="image-uploader__grid">
          {images.map((img) => (
            <div key={img.id} className="image-uploader__thumb">
              <img src={img.preview} alt={img.name} />
              <button
                type="button"
                className="image-uploader__remove"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(img.id);
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {images.length < maxItems && (
            <button
              type="button"
              className="image-uploader__add-btn"
              onClick={handleBrowse}
            >
              <div className="image-uploader__add-icon">
                <Plus size={16} />
              </div>
            </button>
          )}
        </div>
      )}

      {infoText && (
        <div className="image-uploader__info">
          <Info size={16} />
          <span>{infoText}</span>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;