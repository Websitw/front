import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  X,
  Eye,
  EyeOff,
  Check,
  Edit,
  Info,
  ZoomIn,
} from "lucide-react";
import EditPhoneModal from "./components/EditPhoneModal";
import EditNameModal from "./components/EditNameModal";
import "./ProfileOverview.css";
import { selectUser, logout } from "../../../store/slices/authSlice";
import { useSelector } from "react-redux";
import axiosInstance from "../../../config/axiosInstance";
import { useDispatch } from "react-redux";
import EditEmail from "./components/EditEmail";
import { imageUrl } from "../../../helper/helper";
import ConfirmDialog from "../../../components/Admin/Modal/Modal";
import { showToast } from "../../../components/CustomToast/CustomToast";
import { deleteCompany } from "../../../store/slices/companySlice";
import { userCompanyStatus } from "../../../store/slices/usersSlice";
const PasswordValidationRule = ({ isValid, text }) => (
  <li className={isValid ? "valid" : "invalid"}>
    {isValid ? <Check size={16} /> : <X size={16} />}
    {text}
  </li>
);

const EditPasswordModal = ({ isOpen, onClose }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const hasUpperLower = /(?=.*[a-z])(?=.*[A-Z])/.test(password);
  const hasNumber = /\d/.test(password);
  const hasMinLength = password.length >= 8;

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Password</h3>
          <X onClick={onClose} style={{ cursor: "pointer" }} />
        </div>

        <div className="field">
          <label>Current password</label>
          <div className="input-wrapper">
            <input
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Your Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            {showCurrentPassword ? (
              <EyeOff
                size={20}
                onClick={() => setShowCurrentPassword(false)}
                style={{ cursor: "pointer" }}
              />
            ) : (
              <Eye
                size={20}
                onClick={() => setShowCurrentPassword(true)}
                style={{ cursor: "pointer" }}
              />
            )}
          </div>
          <span className="forgot">Forgot Your Password?</span>
        </div>

        <div className="field">
          <label>New Password</label>
          <div
            className={`input-wrapper ${password && !hasMinLength ? "error" : ""}`}
          >
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {showNewPassword ? (
              <EyeOff
                size={20}
                onClick={() => setShowNewPassword(false)}
                style={{ cursor: "pointer" }}
              />
            ) : (
              <Eye
                size={20}
                onClick={() => setShowNewPassword(true)}
                style={{ cursor: "pointer" }}
              />
            )}
          </div>

          <ul className="rules">
            <PasswordValidationRule
              isValid={hasMinLength}
              text="Minimum 8 characters"
            />
            <PasswordValidationRule
              isValid={hasNumber}
              text="Atleast 1 number (1-9)"
            />
            <PasswordValidationRule
              isValid={hasUpperLower}
              text="Atleast lowercase or uppercase letters"
            />
          </ul>
        </div>

        <div className="field" style={{ marginTop: "20px" }}>
          <label>Confirm Password</label>
          <div className="input-wrapper">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <button className="save-btn">Save</button>
      </div>
    </div>
  );
};

const ProfileOverview = () => {
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [isEditPhoneOpen, setIsEditPhoneOpen] = useState(false);
  const [isEditPasswordOpen, setIsEditPasswordOpen] = useState(false);
  const [isEditEmail, setIsEditEmail] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [startDay, setStartDay] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [startYear, setStartYear] = useState("");
  const [taxId, setTaxId] = useState("");
  const userCheck = useSelector(selectUser);
  const { profileData } = useSelector((state) => state.users);

  const checkCompanyStatus = async () => {
    if (!userCheck || !userCheck.id) {
      return;
    }

    dispatch(userCompanyStatus(userCheck.id))
      .unwrap()
      .catch((error) => {
        console.error("Error fetching company status:", error);
      });
  };
  
  useEffect(() => {
    checkCompanyStatus();
  }, [userCheck]);

  const handleModalClose = (modalSetter) => {
    modalSetter(false);
  };
  useEffect(() => {
    if (profileData?.businessStartedDate) {
      const date = new Date(profileData.businessStartedDate);
      setStartDay(date.getDate());
      setStartMonth(date.getMonth() + 1);
      setStartYear(date.getFullYear());
    }
  }, [profileData]);

  const handleConfirmClose = async () => {
    setLoading(true);
    dispatch(deleteCompany(profileData.id))
      .unwrap()
      .then(() => {
        dispatch(logout());
        setOpenConfirmDialog(false);
        setLoading(false);
        showToast.success("Business account closed successfully");
      })
      .catch((error) => {
        showToast.error(
          error.message || "Failed to close account. Please try again.",
        );
        console.error("Error closing account:", error);
        setLoading(false);
      });
  };

  const handleCloseAccountClick = () => {
    setOpenConfirmDialog(true);
  };

  const handleCancelClose = () => {
    setOpenConfirmDialog(false);
  };

  return (
    <div className="profile-overview-container">
      <div className="section-wrapper">
        <h3 className="section-title">Business Info</h3>
        <div className="section-card business-info-card">
          <div className="business-info-content">
            <div className="form-fields-column">
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  value={profileData?.companyName || ""}
                  readOnly
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Commercial Name</label>
                <input
                  type="text"
                  value={profileData?.commercialName || "Futeric"}
                  readOnly
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Business Industry</label>
                <div className="select-wrapper">
                  <select
                    value={profileData?.industry?.name || ""}
                    className="form-select"
                    disabled
                  >
                    <option value="">Select Industry</option>
                    {profileData?.industry?.name && (
                      <option value={profileData.industry.name}>
                        {profileData.industry.name}
                      </option>
                    )}
                  </select>
                  <ChevronDown className="select-icon" size={20} />
                </div>
              </div>

              <div className="form-group">
                <label>Business Country</label>
                <div className="select-wrapper">
                  <select
                    value={profileData?.countryId?.name || ""}
                    className="form-select country-select"
                    disabled
                  >
                    {profileData?.countryId?.name && (
                      <option value={profileData.countryId.name}>
                        {profileData.countryId.name}
                      </option>
                    )}
                  </select>
                  <ChevronDown className="select-icon" size={20} />
                </div>
              </div>

              <div className="form-group">
                <label>
                  Business Started Date{" "}
                  <span className="optional-text">(optional)</span>
                </label>
                <div className="date-inputs-row">
                  <div className="select-wrapper date-select">
                    <select
                      value={startDay}
                      onChange={(e) => setStartDay(e.target.value)}
                      className="form-select"
                      disabled={!!profileData?.businessStartedDate}
                    >
                      <option value="">Day</option>
                      {[...Array(31)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="select-icon" size={16} />
                  </div>
                  <div className="select-wrapper date-select">
                    <select
                      value={startMonth}
                      onChange={(e) => setStartMonth(e.target.value)}
                      className="form-select"
                      disabled={!!profileData?.businessStartedDate}
                    >
                      <option value="">Month</option>
                      {[
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ].map((month, i) => (
                        <option key={i + 1} value={i + 1}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="select-icon" size={16} />
                  </div>
                  <div className="select-wrapper date-select">
                    <select
                      value={startYear}
                      onChange={(e) => setStartYear(e.target.value)}
                      className="form-select"
                      disabled={!!profileData?.businessStartedDate}
                    >
                      <option value="">Year</option>
                      {[...Array(50)].map((_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="select-icon" size={16} />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Tax ID</label>
                <input
                  type="text"
                  value={profileData?.taxId || ""}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="Tax ID"
                  className="form-input form-input-light"
                />
              </div>
            </div>

            <div className="license-column">
              <div className="license-file-section">
                <label className="license-label">Business license File</label>
                <div className="license-preview">
                  <img
                    src={`${imageUrl}${profileData?.commercialImageId}`}
                    alt="Business License"
                    className="license-image"
                  />
                  <button className="zoom-btn">
                    <ZoomIn size={16} />
                  </button>
                </div>
                <p className="file-name">File Name</p>
              </div>

              <div className="edit-info-box">
                <div className="edit-info-header">
                  <Info size={16} className="info-icon" />
                  <span className="edit-info-title">Edit Business Info</span>
                </div>
                <p className="edit-info-text">
                  Modifying and reassessing your Business account takes 1–3
                  business days. Trading transactions are suspended until the
                  account is reconfirmed.
                </p>
                <button
                  className="edit-link"
                  onClick={() => setIsEditNameOpen(true)}
                >
                  <Edit size={16} />
                  <span>Edit Business Info</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-wrapper">
        <h3 className="section-title">Contact Info</h3>
        <div className="section-card contact-info-card">
          <div className="contact-info-grid">
            {/* Email */}
            <div className="form-group">
              <label>
                Email
                <Info size={16} className="label-info-icon" />
              </label>
              <input
                type="email"
                value={profileData?.businessEmail}
                readOnly
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Business Phone Number</label>
              <div className="phone-input">
                <div className="country-code">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Flag_of_Jordan.svg/960px-Flag_of_Jordan.svg.png"
                    alt="JO"
                    className="flag"
                  />
                  <span className="code">
                    {profileData?.regMobileISDNCode || "+962"}
                  </span>
                  <ChevronDown size={16} className="dropdown-icon" />
                </div>
                <div className="phone-separator"></div>
                <input
                  type="text"
                  value={profileData?.businessPhone}
                  className="phone-field"
                  readOnly
                />
              </div>
            </div>

            <div className="form-group">
              <label>Additional Email</label>
              <input
                type="email"
                value={profileData?.additionalBusinessEmail || ""}
                readOnly
                className="form-input"
              />
              <button
                className="edit-link"
                onClick={() => {
                  setIsEditEmail(true);
                }}
              >
                <Edit size={16} />
                <span>Edit Email</span>
              </button>
            </div>

            <div className="form-group">
              <label>
                Additional Phone Number{" "}
                <span className="optional">(optional)</span>
              </label>
              <div className="phone-input">
                <div className="country-code">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Flag_of_Jordan.svg/960px-Flag_of_Jordan.svg.png"
                    alt="JO"
                    className="flag"
                  />
                  <span className="code">
                    {profileData?.regMobileISDNCode || "+962"}
                  </span>
                  <ChevronDown size={16} className="dropdown-icon" />
                </div>
                <div className="phone-separator"></div>
                <input
                  type="text"
                  value={profileData?.additionalBusinessPhone || ""}
                  className="phone-field"
                  readOnly
                />
              </div>
              <button
                className="edit-link"
                onClick={() => setIsEditPhoneOpen(true)}
              >
                <Edit size={16} />
                <span>Edit Phones Number</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="section-wrapper">
        <h3 className="section-title">Close Business Account</h3>
        <div className="section-card close-account-card">
          <p className="close-account-text">
            To close your Business account, first complete or cancel any pending
            requests. If you have active orders, you'll need to finalize them
            before proceeding.
          </p>
          <button
            className="close-account-btn"
            onClick={handleCloseAccountClick}
          >
            Close Business Account
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={openConfirmDialog}
        onClose={handleCancelClose}
        onConfirm={handleConfirmClose}
        title="Close Account?"
        message="Are you sure you want to close your Business account? This action cannot be undone."
        confirmText="Close Account"
        cancelText="Cancel"
        confirmColor="error"
        loading={loading}
      />

      <EditNameModal
        checkCompanyStatus={checkCompanyStatus}
        isOpen={isEditNameOpen}
        onClose={() => handleModalClose(setIsEditNameOpen)}
        userData={profileData}
        // onSave={handleUserDataUpdate}
      />

      <EditPhoneModal
        isOpen={isEditPhoneOpen}
        onClose={() => handleModalClose(setIsEditPhoneOpen)}
        userData={profileData}
        checkCompanyStatus={checkCompanyStatus}
        // onSave={handleUserDataUpdate}
      />

      <EditPasswordModal
        checkCompanyStatus={checkCompanyStatus}
        isOpen={isEditPasswordOpen}
        onClose={() => handleModalClose(setIsEditPasswordOpen)}
      />
      <EditEmail
        userData={profileData}
        checkCompanyStatus={checkCompanyStatus}
        isOpen={isEditEmail}
        onClose={() => setIsEditEmail(false)}
      />
    </div>
  );
};

export default ProfileOverview;
