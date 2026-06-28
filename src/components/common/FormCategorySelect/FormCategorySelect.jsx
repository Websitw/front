import React, { useState, useRef, useEffect, useMemo } from "react";
import { Controller } from "react-hook-form";
import { ChevronDown, ChevronRight, ArrowLeft } from "lucide-react";
import "./FormCategorySelect.css";

const FormCategorySelect = ({
  label,
  name,
  segments = [],
  required = false,
  disabled = false,
  placeholder = "Select Product Category",
  className = "",
  control,
  error,
  style = {},
  styleLabel = {},
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [navigationStack, setNavigationStack] = useState([]);
  const dropdownRef = useRef(null);

  const leafMap = useMemo(() => {
    const map = {};
    const traverse = (items, segmentName, segmentId) => {
      items.forEach((item) => {
        if (item.isLeaf) {
          map[item.id] = {
            ...item,
            segmentName,
            segmentId,
          };
        }
        if (item.children?.length) {
          traverse(item.children, segmentName, segmentId);
        }
      });
    };
    segments.forEach((segment) => {
      traverse(
        segment.children || [],
        segment.name_i18n?.en || segment.segmentName,
        segment.id
      );
    });
    return map;
  }, [segments]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setNavigationStack([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCurrentItems = () => {
    if (navigationStack.length === 0) {
      return segments.map((seg) => ({
        id: seg.id,
        label: seg.name_i18n?.en || seg.segmentName,
        hasChildren: seg.children?.length > 0,
        children: seg.children || [],
        isLeaf: false,
        type: "segment",
      }));
    }

    const current = navigationStack[navigationStack.length - 1];
    return (current.children || []).map((cat) => ({
      id: cat.id,
      label: cat.name_i18n?.en || cat.categoryName,
      hasChildren: cat.children?.length > 0,
      children: cat.children || [],
      isLeaf: cat.isLeaf,
      type: "category",
    }));
  };

  const getBreadcrumb = () => {
    return navigationStack.map((item) => item.label).join(" / ");
  };

  const handleItemClick = (item, onChange) => {
    if (item.isLeaf) {
      onChange(item.id);
      onSelect?.({ categoryId: item.id, segmentId: leafMap[item.id]?.segmentId });
      setIsOpen(false);
      setNavigationStack([]);
      return;
    }

    if (item.hasChildren) {
      setNavigationStack((prev) => [
        ...prev,
        { label: item.label, children: item.children },
      ]);
    }
  };

  const handleBack = () => {
    setNavigationStack((prev) => prev.slice(0, -1));
  };

  const getDisplayLabel = (value) => {
    if (!value) return "";
    const leaf = leafMap[value];
    return leaf ? leaf.name_i18n?.en || leaf.categoryName : "";
  };

  return (
    <div className={`catsel-group ${className}`} ref={dropdownRef}>
      <label htmlFor={name} className="catsel-label" style={styleLabel}>
        {label}
      </label>

      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange } }) => {
          const displayLabel = getDisplayLabel(value);
          const items = getCurrentItems();

          return (
            <>
              <button
                type="button"
                className={`catsel-trigger ${error ? "catsel-trigger--error" : ""}`}
                style={style}
                onClick={() => {
                  if (!disabled) {
                    setIsOpen((prev) => !prev);
                    if (!isOpen) setNavigationStack([]);
                  }
                }}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
              >
                <span
                  className={`catsel-trigger__text ${
                    !displayLabel ? "catsel-trigger__text--placeholder" : ""
                  }`}
                >
                  {displayLabel || placeholder}
                </span>
                <ChevronDown
                  className={`catsel-trigger__icon ${
                    isOpen ? "catsel-trigger__icon--open" : ""
                  }`}
                  size={20}
                />
              </button>

              {isOpen && (
                <div className="catsel-dropdown" role="listbox">
                  {navigationStack.length > 0 && (
                    <button
                      type="button"
                      className="catsel-dropdown__back"
                      onClick={handleBack}
                    >
                      <ArrowLeft size={16} />
                      <span className="catsel-dropdown__breadcrumb">
                        {getBreadcrumb()}
                      </span>
                    </button>
                  )}

                  <ul className="catsel-dropdown__list">
                    {items.map((item) => (
                      <li
                        key={item.id}
                        className={`catsel-dropdown__item ${
                          item.isLeaf
                            ? "catsel-dropdown__item--leaf"
                            : "catsel-dropdown__item--parent"
                        } ${value === item.id ? "catsel-dropdown__item--selected" : ""}`}
                        role="option"
                        aria-selected={value === item.id}
                        onClick={() => handleItemClick(item, onChange)}
                      >
                        <span className="catsel-dropdown__item-label">
                          {item.label}
                        </span>
                        {item.hasChildren && !item.isLeaf && (
                          <ChevronRight
                            size={18}
                            className="catsel-dropdown__item-chevron"
                          />
                        )}
                      </li>
                    ))}

                    {items.length === 0 && (
                      <li className="catsel-dropdown__empty">
                        No categories available
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </>
          );
        }}
      />

      {error && (
        <span className="catsel-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default FormCategorySelect;