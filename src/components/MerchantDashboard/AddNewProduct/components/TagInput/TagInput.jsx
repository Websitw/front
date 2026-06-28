import React, { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import './TagInput.css';

const TagInput = ({
  tags = [],
  onTagsChange,
  placeholder = 'Add value...',
  disabled = false,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && inputValue.trim()) {
        e.preventDefault();
        if (!tags.includes(inputValue.trim())) {
          onTagsChange?.([...tags, inputValue.trim()]);
        }
        setInputValue('');
      }
      if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
        onTagsChange?.(tags.slice(0, -1));
      }
    },
    [inputValue, tags, onTagsChange]
  );

  const handleRemove = useCallback(
    (tagToRemove) => {
      onTagsChange?.(tags.filter((tag) => tag !== tagToRemove));
    },
    [tags, onTagsChange]
  );

  return (
    <div className={`tag-input ${className}`}>
      <div className="tag-input__container">
        {tags.map((tag) => (
          <span key={tag} className="tag-input__tag">
            {tag}
            <button
              type="button"
              className="tag-input__tag-remove"
              onClick={() => handleRemove(tag)}
              disabled={disabled}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          disabled={disabled}
          className="tag-input__field"
        />
      </div>
    </div>
  );
};

export default TagInput;