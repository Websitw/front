import  { useEffect, useRef } from "react";
import "./RowActionsDropdown.css";
import {
    RowDiscount,
    RowEdit,
    RowMove,
    RowTrash
} from '../../../../assets/icons'



const RowActionsDropdown = ({ isOpen, onClose, onEdit, onAddDiscount, onMoveTo, onRemove }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="row-actions-dropdown" ref={dropdownRef}>
      <button className="row-actions-dropdown-item" onClick={onEdit}>
        <RowEdit />
        <span>Edit Product</span>
      </button>

      <div className="row-actions-dropdown-divider" />

      <button className="row-actions-dropdown-item" onClick={onAddDiscount}>
        <RowDiscount />
        <span>Add Discount</span>
      </button>

      <div className="row-actions-dropdown-divider" />

      <button className="row-actions-dropdown-item" onClick={onMoveTo}>
        <RowMove />
        <span>Move to</span>
      </button>

      <div className="row-actions-dropdown-divider" />

      <button className="row-actions-dropdown-item row-actions-dropdown-item--danger" onClick={onRemove}>
        <RowTrash />
        <span>Remove</span>
      </button>
    </div>
  );
};

export default RowActionsDropdown;