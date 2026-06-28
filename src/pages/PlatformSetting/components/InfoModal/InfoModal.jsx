import React from "react";
import "./InfoModal.css";
import CloseIcon from "@mui/icons-material/Close";
import CustomSwitch from "../../../../components/common/CustomSwitch";

const InfoModal = ({ 
  isOpen, 
  onClose, 
  title, 
  columns, 
  data,
  onStatusChange 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-info-overlay" onClick={onClose}>
      <div className="modal-info-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-info-header">
          <div className="info-header-text">
          <h2>{title}</h2>
          <h4>Available {title}</h4>
          </div>
          <CloseIcon className="modal-close-icon" onClick={onClose} />
        </div>

        <div className="modal-info-body">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th key={index}>{column.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex}>
                      {column.key === 'status' ? (
                        <div className="status-info-cell">
                          <CustomSwitch
                            checked={row[column.key]}
                            onChange={() => onStatusChange && onStatusChange(rowIndex)}
                            containerWidth={40}
                            containerHeight={20}
                            thumbWidth={16}
                            thumbHeight={16}
                            // activeColor="#0D7C85"
                            // inactiveColor="#cbd5e1"
                          />
                          <span className={row[column.key] ? 'status-info-active' : 'status-info-inactive'}>
                            {row[column.key] ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      ) : (
                        row[column.key]
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;