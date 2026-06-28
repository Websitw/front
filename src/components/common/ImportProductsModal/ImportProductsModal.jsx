import React, { useState, useRef, useCallback } from "react";
import { X, Paperclip, CheckCircle, AlertTriangle, Loader } from "lucide-react";
import { useUpload } from "../../../hooks/useUpload";
import useLocalStorage from "../../../hooks/useLocalStorage";
import "./ImportProductsModal.css";
import axios from "axios";
import { environment } from "../../../environments/environment";
const STORE_ID = "1941218518439563264";

const STEPS = {
  UPLOAD: "upload",
  VALIDATED: "validated",
  FAILED: "failed",
};

const ImportProductsModal = ({ isOpen, onClose }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [fileId, setFileId] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [options, setOptions] = useState({
    retailOnly: true,
    retailAndWholesale: false,
    overwrite: false,
  });

  const fileInputRef = useRef(null);
  const [userData] = useLocalStorage("userData", null);
  const { upload, validate, uploadData, loading } = useUpload();
  const getImportBody = useCallback(() => {
    return {
      sheetId: fileId,
      merchantId: userData?.cbCusId,
      storeId: STORE_ID,
    };
  }, [fileId, userData?.cbCusId]);

  const resetModal = useCallback(() => {
    setFile(null);
    setStep(STEPS.UPLOAD);
    setFileId(null);
    setValidationResult(null);
    setOptions({ retailOnly: true, retailAndWholesale: false, overwrite: false });
  }, []);

  const handleClose = useCallback(() => {
    resetModal();
    onClose();
  }, [onClose, resetModal]);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setStep(STEPS.UPLOAD);
      setFileId(null);
      setValidationResult(null);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
      setStep(STEPS.UPLOAD);
      setFileId(null);
      setValidationResult(null);
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleOptionChange = (key) => {
    if (key === "retailOnly") {
      setOptions({ retailOnly: true, retailAndWholesale: false, overwrite: options.overwrite });
    } else if (key === "retailAndWholesale") {
      setOptions({ retailOnly: false, retailAndWholesale: true, overwrite: options.overwrite });
    } else {
      setOptions((prev) => ({ ...prev, overwrite: !prev.overwrite }));
    }
  };

  const handleReplaceFile = () => {
    setFile(null);
    setStep(STEPS.UPLOAD);
    setFileId(null);
    setValidationResult(null);
    setTimeout(() => fileInputRef.current?.click(), 50);
  };

  const handleUploadAndValidate = async () => {
    if (!file) return;

    const uploadResult = await upload(file);
    if (!uploadResult.success) return;

    const uploadedFileId = uploadResult.data?.result?.id;
    if (!uploadedFileId) return;

    setFileId(uploadedFileId);

    const body = {
      sheetId: uploadedFileId,
      merchantId: userData?.cbCusId,
      storeId: STORE_ID,
    };

    const validateResult = await validate(body);

    if (validateResult.success) {
      const result = validateResult.data?.result;
      setValidationResult(result);
      const missingRequired = result?.missingRequiredHeaders || [];
      setStep(missingRequired.length === 0 ? STEPS.VALIDATED : STEPS.FAILED);
    } else {
      const errorResult = validateResult.error?.result;
      if (errorResult) {
        setValidationResult(errorResult);
        setStep(STEPS.FAILED);
      }
    }
  };

  const handleImportData = async () => {
    const body = getImportBody();
    const result = await uploadData(body);
    if (result.success) handleClose();
  };


  const downloadTemplate = async ()=>{
    try{

     const file =  await axios.get(`${environment.serverOrigin}import-sheet/template` , 
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      )
      const fileID = file?.data?.result?.templateId
      console.log(fileID);

      const downLoadFile = await axios.get(`${environment.serverOrigin}_attachments/${fileID}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }
      )

      console.log('downLoadFile' , downLoadFile);
    }catch(err){
      console.log('error when download the template ' , err);
    }
  }
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  if (!isOpen) return null;

  const missingRequired = validationResult?.missingRequiredHeaders || [];
  const missingOptional = validationResult?.missingOptionalHeaders || [];
  const unmatchedHeaders = validationResult?.unmatchedExcelHeaders || [];
  const hasMissingRequired = missingRequired.length > 0;

  return (
    <div className="import-modal__backdrop" onClick={handleBackdropClick}>
      <div className="import-modal__card" role="dialog" aria-modal="true" aria-labelledby="import-modal-title">
        <div className="import-modal__header">
          <h2 id="import-modal-title" className="import-modal__title">Import products by Excel</h2>
          <button className="import-modal__close-btn" onClick={handleClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="import-modal__body">
          {!file ? (
            <div
              className={`import-modal__drop-zone ${isDragging ? "import-modal__drop-zone--dragging" : ""}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <button className="import-modal__add-file-btn" type="button">
                <span className="import-modal__plus-icon">+</span> Add File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="import-modal__hidden-input"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <>
              <div className="import-modal__file-row">
                <div className="import-modal__file-info">
                  <div className="import-modal__file-icon">
                    <Paperclip size={26} color="#0D7C85" />
                  </div>
                  <span className="import-modal__file-name">{file.name}</span>
                </div>
                <button className="import-modal__replace-btn" onClick={handleReplaceFile} type="button">
                  Replace File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="import-modal__hidden-input"
                  onChange={handleFileChange}
                />
              </div>

              {/* {step === STEPS.UPLOAD && (
                <div className="import-modal__options-list">
                  <label className="import-modal__option-row">
                    <input
                      type="checkbox"
                      checked={options.retailOnly}
                      onChange={() => handleOptionChange("retailOnly")}
                      className="import-modal__option-checkbox"
                    />
                    <span className="import-modal__option-label">Add it as a retail product only.</span>
                  </label>

                  <label className="import-modal__option-row">
                    <input
                      type="checkbox"
                      checked={options.retailAndWholesale}
                      onChange={() => handleOptionChange("retailAndWholesale")}
                      className="import-modal__option-checkbox"
                    />
                    <span className="import-modal__option-label">Add it as both a retail and wholesale product.</span>
                  </label>

                  <label className="import-modal__option-row import-modal__option-row--stacked">
                    <div className="import-modal__option-row-top">
                      <input
                        type="checkbox"
                        checked={options.overwrite}
                        onChange={() => handleOptionChange("overwrite")}
                        className="import-modal__option-checkbox"
                      />
                      <span className="import-modal__option-label">Overwrite products with matching handles.</span>
                    </div>
                    <p className="import-modal__option-hint">
                      Existing values will be replaced for all columns included in the Excel file.
                    </p>
                  </label>
                </div>
              )} */}

              {step === STEPS.VALIDATED && !hasMissingRequired && (
                <div className="import-modal__validation-success">
                  <CheckCircle size={20} color="#16a34a" />
                  <div>
                    <span>Sheet validated successfully. All headers match. You may proceed with import.</span>
                    {validationResult?.matchedHeaders > 0 && (
                      <p className="import-modal__validation-stat">
                        {validationResult.matchedHeaders} / {validationResult.totalExcelHeaders} headers matched.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {step === STEPS.FAILED && hasMissingRequired && (
                <div className="import-modal__validation-error">
                  <AlertTriangle size={20} color="#dc2626" />
                  <div className="import-modal__validation-error-content">
                    <span className="import-modal__validation-error-title">
                      Sheet validation failed. Fix the issues below before importing.
                    </span>

                    <div className="import-modal__validation-section">
                      <span className="import-modal__validation-section-title">
                        Missing Required Headers ({missingRequired.length})
                      </span>
                      <ul className="import-modal__missing-headers">
                        {missingRequired.map((header) => (
                          <li key={header.expectedHeader}>
                            <code className="import-modal__header-code">{header.expectedHeader}</code>
                            <span className="import-modal__header-desc"> — {header.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {unmatchedHeaders.length > 0 && (
                      <div className="import-modal__validation-section">
                        <span className="import-modal__validation-section-title">
                          Unrecognized Headers in Your File ({unmatchedHeaders.length})
                        </span>
                        <ul className="import-modal__missing-headers">
                          {unmatchedHeaders.map((header) => (
                            <li key={header.excelHeader}>
                              <code className="import-modal__header-code">{header.excelHeader}</code>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p className="import-modal__validation-fix-hint">
                      Please fix your Excel file and re-upload using the "Replace File" button above.
                    </p>
                  </div>
                </div>
              )}

              {missingOptional.length > 0 && !hasMissingRequired && step !== STEPS.UPLOAD && (
                <div className="import-modal__validation-warning">
                  <AlertTriangle size={20} color="#ca8a04" />
                  <div>
                    <span className="import-modal__validation-section-title">
                      Missing Optional Headers ({missingOptional.length}) — defaults will be used
                    </span>
                    <ul className="import-modal__missing-headers">
                      {missingOptional.map((header) => (
                        <li key={header.expectedHeader}>
                          <code className="import-modal__header-code">{header.expectedHeader}</code>
                          <span className="import-modal__header-desc"> — default: {header.defaultValue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="import-modal__footer">
          <p
          style={{
            cursor:'pointer'
          }}
           className="import-modal__download-link" onClick={downloadTemplate}>
            Download Sample Excel
          </p>
          <div className="import-modal__footer-actions">
            <button className="import-modal__btn-cancel" onClick={handleClose} type="button">
              Cancel
            </button>

            {(step === STEPS.UPLOAD || step === STEPS.FAILED) && (
              <button
                className={`import-modal__btn-upload ${!file || loading ? "import-modal__btn-upload--disabled" : ""}`}
                onClick={handleUploadAndValidate}
                disabled={!file || loading}
                type="button"
              >
                {loading && <Loader size={16} className="import-modal__spinner" />}
                {loading ? "Processing..." : step === STEPS.FAILED ? "Re-upload & Validate" : "Upload & Validate"}
              </button>
            )}

            {step === STEPS.VALIDATED && !hasMissingRequired && (
              <button
                className={`import-modal__btn-import ${loading ? "import-modal__btn-upload--disabled" : ""}`}
                onClick={handleImportData}
                disabled={loading}
                type="button"
              >
                {loading && <Loader size={16} className="import-modal__spinner" />}
                {loading ? "Importing..." : "Import Products"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportProductsModal;