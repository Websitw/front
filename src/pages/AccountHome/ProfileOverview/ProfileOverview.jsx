import React, { useState, useEffect, useRef, use } from "react";
import { Camera, Edit, ChevronDown } from "lucide-react";

import ConfirmDialog from "../../../components/Admin/Modal/Modal";
import EditNameModal from "./components/EditNameModal";
import EditPhoneModal from "./components/EditPhoneModal";
import EditPasswordModal from "./components/EditPasswordModal";
import axiosInstance from "../../../config/axiosInstance";
import { logout } from "../../../store/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../../components/CustomToast/CustomToast";
import { uploadImage, imageUrl } from "../../../helper/helper";
import { updateUserProfile } from "../../../store/slices/usersSlice";
import useLocalStorage from "../../../hooks/useLocalStorage";
import { getDataProfile } from "../../../store/slices/authReducer";

const ProfileOverview = () => {
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [isEditPhoneOpen, setIsEditPhoneOpen] = useState(false);
  const [isEditPasswordOpen, setIsEditPasswordOpen] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const { additionalInfo } = useSelector((state) => state.authRegister);
  const [user] = useLocalStorage("userData", null);
  const [imageLoading, setImageLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleCloseAccountClick = () => {
    setOpenConfirmDialog(true);
  };
  const handleConfirmClose = async () => {
    setLoading(true);
    await axiosInstance
      .delete("profile")
      .then(() => {
        dispatch(logout());
        setOpenConfirmDialog(false);
        setLoading(false);
      })
      .catch((error) => {
        showToast.error(
          error.message || "Failed to close account. Please try again.",
        );
        console.error("Error closing account:", error);
        setLoading(false);
      });
  };

  const handleCancelClose = () => {
    setOpenConfirmDialog(false);
  };

  const loadUserDataFromStorage = () => {
    try {
      const storedData = localStorage.getItem("userData");
      if (storedData) {
        return JSON.parse(storedData);
      }
    } catch (error) {
      console.error("Error reading userData from localStorage:", error);
    }

    return {
      id: "demo-user",
      name: "John Doe",
      email: "john.doe@example.com",
      regMobileNumber: "79555522",
      regMobileISDNCode: "+962",
      languagePreference: "English",
      picture: "",
    };
  };

  const [userData, setUserData] = useState(loadUserDataFromStorage);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "userData" && e.newValue) {
        try {
          setUserData(JSON.parse(e.newValue));
        } catch (error) {
          console.error("Error parsing userData from storage event:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);
  useEffect(() => {
    dispatch(getDataProfile()).unwrap();
  }, [dispatch]);

  const handleUserDataUpdate = (updatedUser) => {
    setUserData(updatedUser);
    try {
      localStorage.setItem("userData", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Error saving userData to localStorage:", error);
    }
  };

  const handleModalClose = (modalSetter) => {
    modalSetter(false);
    const latestData = loadUserDataFromStorage();
    setUserData(latestData);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showToast.error(
        "Please select a valid image file (JPEG, PNG, GIF, WEBP)",
      );
      return;
    }

    setImageLoading(true);
    try {
      const result = await uploadImage(file);
      const response = await dispatch(
        updateUserProfile({
          userId: userData.id,
          profileData: { picture: result?.result?.id },
        }),
      ).unwrap();

      const updatedUser = { ...userData, picture: result?.result?.id };
      handleUserDataUpdate(updatedUser);
      showToast.success("Profile image updated successfully");
    } catch (error) {
      showToast.error(error.message || "Failed to upload image");
    } finally {
      setImageLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async () => {
    if (!userData.picture) return;

    setImageLoading(true);
    try {
      await dispatch(
        updateUserProfile({
          userId: userData.id,
          profileData: { picture: "" },
        }),
      ).unwrap();

      const updatedUser = { ...userData, picture: "" };
      handleUserDataUpdate(updatedUser);
      showToast.success("Profile image removed successfully");
    } catch (error) {
      showToast.error(error.message || "Failed to remove image");
    } finally {
      setImageLoading(false);
    }
  };

  const getFirstName = () => {
    return userData.name ? userData.name.split(" ")[0] : "";
  };

  const getLastName = () => {
    return userData.name ? userData.name.split(" ").slice(1).join(" ") : "";
  };

  console.log("userData.picture,,", userData);
  return (
    <div style={{ maxWidth: "1200px" }}>
      <div className="profile-form">
        <h3
          className="section-title"
          style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px" }}
        >
          Profile Details
        </h3>
        <div className="profile-details">
          <div
            className="profile-header"
            style={{
              display: "flex",
              gap: "40px",
              flexWrap: "wrap",
              marginBottom: "30px",
            }}
          >
            <div className="profile-fields" style={{ flex: 1 }}>
              <div
                className="form-row"
                style={{ display: "flex", gap: "20px", marginBottom: "15px" }}
              >
                <div className="form-group" style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    className="account-home-input"
                    value={getFirstName()}
                    readOnly
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Last Name
                  </label>
                  <input
                    className="account-home-input"
                    type="text"
                    value={getLastName()}
                    readOnly
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                    }}
                  />
                </div>
              </div>

              <div
                className="form-row-security"
                // style={{ display: "flex", gap: "20px", alignItems: "center" }}
              >
                <div className="form-group" style={{ flex: 1 }}>
                  <div>
                    <label>Account Language</label>
                    <select
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        appearance: "none",
                      }}
                    >
                      <option>English</option>
                    </select>
                    <ChevronDown
                      className="select-arrow-icon"
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "47px",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      marginTop: "10px",
                    }}
                    onClick={() => setIsEditNameOpen(true)}
                    className="edit-link"
                  >
                    <Edit size={16} /> Edit Personal Info
                  </span>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "50px",
                    }}
                  >
                    <div
                    style={{
                      marginTop:"20px",
                    }}
                    >
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontSize: "16px",
                          fontWeight: "400",
                          color: "#151515",
                        }}
                      >
                        Birthday
                      </label>
                      <span
                        style={{
                          fontSize: "16px",
                          color: "#4A4A4A",
                          fontWeight: "400",
                        }}
                      >
                        {additionalInfo?.birthdate}
                      </span>
                    </div>
                    <div 
                    style={{
                      marginTop:"20px",
                    }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontSize: "16px",
                          fontWeight: "400",
                          color: "#151515",
                        }}
                      >
                        Gender
                      </label>
                      <span
                        style={{
                          fontSize: "16px",
                          color: "#4A4A4A",
                          fontWeight: "400",
                          textTransform:"capitalize"
                        }}
                      >
                        {additionalInfo?.gender?.toLowerCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="profile-avatar"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div className="avatar-wrapper" style={{ position: "relative" }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
                {userData.picture &&
                !userData.picture?.includes("avatar") &&
                !userData.picture.includes("base") ? (
                  <img
                    src={`${imageUrl}${userData.picture}`}
                    alt="Profile"
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    className="user-avatar"
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      backgroundColor: "#2BA9A8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "32px",
                      fontWeight: "600",
                    }}
                  >
                    {getFirstName().charAt(0)}
                    {getLastName().charAt(0)}
                  </div>
                )}
                {imageLoading && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(0,0,0,0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "12px",
                    }}
                  >
                    Uploading...
                  </div>
                )}
                <button
                  className="avatar-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageLoading}
                  style={{
                    position: "absolute",
                    bottom: "0",
                    right: "0",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: "white",
                    border: "2px solid #2BA9A8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: imageLoading ? "not-allowed" : "pointer",
                  }}
                >
                  <Camera size={14} color="#2BA9A8" />
                </button>
              </div>
              <span
                className="remove-image"
                onClick={handleRemoveImage}
                style={{
                  marginTop: "10px",
                  fontSize: "14px",
                  cursor: imageLoading ? "not-allowed" : "pointer",
                  opacity:
                    userData.picture && !userData.picture?.includes("avatar")
                      ? 1
                      : 0.5,
                  pointerEvents:
                    !userData.picture || userData.picture?.includes("base") ||
                    userData.picture?.includes("avatar") ||
                    imageLoading
                      ? "none"
                      : "auto",
                }}
              >
                Remove Image
              </span>
            </div>
          </div>
        </div>

        <h3
          className="section-title"
          style={{ fontSize: "18px", fontWeight: "600", margin: "30px 0 20px" }}
        >
          Login & Security
        </h3>
        <div className="loginAndSecurity">
          <div className="form-row-security">
            <div className="form-group">
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={userData.email ? userData.email : userData.identifier}
                disabled
                className="account-home-input"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>

            <div className="form-group">
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Phone Number
              </label>
              <div
                className="phone-input"
                style={{
                  display: "flex",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  className="country-code"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "10px",
                  }}
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Flag_of_Jordan.svg/960px-Flag_of_Jordan.svg.png"
                    alt="JO"
                    className="flag"
                    style={{ width: "20px" }}
                  />
                  {/* regMobileISDNCode */}
                  {/* <span>ss</span> */}
                  {/* <span className="code">{userData?.country?.phoneCode}</span> */}
                  {/* <span className="code">+962</span> */}


                  <span className="code">{additionalInfo?.country?.phoneCode}</span>

                  {/* additionalInfo */}
                  <ChevronDown size={16} className="dropdown-icon" />
                </div>
                <input
                  type="text"
                  value={userData.regMobileNumber}
                  className="phone-field"
                  readOnly
                />
              </div>
              <span
                className="edit-link"
                onClick={() => setIsEditPhoneOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  cursor: "pointer",
                  marginTop: "14px",
                  fontSize: "14px",
                }}
              >
                <Edit size={16} /> Edit Phone Number
              </span>
            </div>

            <div className="form-group">
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Password
              </label>
              <input
                type="password"
                className="account-home-input"
                value="********"
                readOnly
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
              <span
                onClick={() => setIsEditPasswordOpen(true)}
                style={{
                  marginTop: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
                className="edit-link"
              >
                <Edit size={16} /> Edit Password
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="close-account-wrapper">
        <h2 className="close-account-title">Close Account</h2>
        <div className="close-account-box">
          <p className="close-account-text">
            To close your account, first complete or cancel any pending
            requests. If you have active orders, you'll need to finalize them
            before proceeding.
          </p>

          <button
            onClick={handleCloseAccountClick}
            className="close-account-btn"
          >
            Close My Account
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={openConfirmDialog}
        onClose={handleCancelClose}
        onConfirm={handleConfirmClose}
        title="Close Account?"
        message="Are you sure you want to close your account? This action cannot be undone."
        confirmText="Close Account"
        cancelText="Cancel"
        confirmColor="error"
        loading={loading}
      />

      <EditNameModal
        isOpen={isEditNameOpen}
        onClose={() => handleModalClose(setIsEditNameOpen)}
        userData={additionalInfo}
        onSave={handleUserDataUpdate}
      />

      <EditPhoneModal
        isOpen={isEditPhoneOpen}
        onClose={() => handleModalClose(setIsEditPhoneOpen)}
        userData={userData}
        onSave={handleUserDataUpdate}
      />

      <EditPasswordModal
        isOpen={isEditPasswordOpen}
        onClose={() => handleModalClose(setIsEditPasswordOpen)}
      />
    </div>
  );
};

export default ProfileOverview;
