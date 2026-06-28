import FormInput from "../../../components/common/FormInput";
import FormSelect from "../../../components/common/FormSelect";
import { Controller } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAdminDefaultValues, AdminSchema } from "../../../components/Admin/Schemas/adminSchema";
import { useTranslation } from "react-i18next";
import {
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from "../../../store/slices/adminSlice";
import { getAdminRoles } from "../../../store/slices/adminRolesSlice";
import {
  createUserRole,
  updateUserRole,
} from "../../../store/slices/userRoles";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../../components/CustomToast/CustomToast";
import { environment } from "../../../environments/environment";
import { useEffect, useState } from "react";
import ConfirmDialog from "../../../components/Admin/Modal/Modal";
import axiosInstance from "../../../config/axiosInstance";
const CreateUser = ({
  setStep,
  isEditMode,
  fetchUsers,
  setEmailLink,
  selectedUser,
  closeDrawer,
}) => {
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(AdminSchema),
    defaultValues: getAdminDefaultValues(),
  });

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { items: adminRoles } = useSelector((state) => state.adminRoles);
  const rolesOptions = adminRoles.map((role) => {
    return { value: role.id, label: role.name };
  });
  const confirmDelete = () => {
    if (confirmDeleteId) {
      setIsDeleting(true);
      dispatch(deleteAdmin(confirmDeleteId))
        .unwrap()
        .then(() => {
          showToast.success("User deleted successfully");
          fetchUsers();
          setIsDeleting(false);
          setIsDeleteDialogOpen(false);
          reset();
          if (closeDrawer) {
            closeDrawer();
          }
        })
        .catch((error) => {
          setIsDeleting(false);
          setIsDeleteDialogOpen(false);
          showToast.error(error?.message || "Failed to delete user");
          console.error("Error deleting user:", error);
        });
    }
  };

  const handleDeleteUser = (userId) => {
    setConfirmDeleteId(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setConfirmDeleteId(null);
  };

  useEffect(() => {
    if (isEditMode && selectedUser) {
      // Split the full name into first and last name
      const nameParts = selectedUser.name?.split(" ") || ["", ""];
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
    console.log("Selected User:", selectedUser);
      reset({
        userName: selectedUser.userName || "",
        firstName: firstName,
        lastName: lastName,
        email: selectedUser.email || "",
        phoneNumber: selectedUser.regMobileNumber || "",
        role: selectedUser.programCode || "",
      });
    } else {
      reset(getAdminDefaultValues());
    }
  }, [isEditMode, selectedUser, reset]);

  const onSubmit = async (data) => {
    if (isEditMode && selectedUser) {
      const updatePayload = {
        userName: data.userName,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        regMobileNumber: data.phoneNumber,
        programCode: "admin",
      };

      await dispatch(
        updateAdmin({ adminId: selectedUser.id, adminData: updatePayload })
      )
        .unwrap()
        .then((result) => {
          axiosInstance
            .get(`roles/user?q=properties.userId:${result?.id}`)
            .then((res) => {
              dispatch(
                updateUserRole({
                  id: res?.data?.items[0]?.id,
                  data: {
                    roleId: data.role,
                    userId: result?.id,
                  },
                })
              )
                .unwrap()
                .then(() => {
                  fetchUsers();
                });
            });
          showToast.success("User updated successfully");

          reset();
          if (closeDrawer) {
            closeDrawer();
          }
        })
        .catch((error) => {
          showToast.error(error?.message || "Failed to update user");
          console.error("Error updating user:", error);
        });
    } else {
      const appOrigin = (environment.appOrigin || window.location.origin).replace(/\/$/, "");
      const passwordNonce =
        window.crypto?.randomUUID?.().replace(/-/g, "").slice(0, 16) ||
        Date.now().toString(36);
      const temporaryPassword = `Sawa-${passwordNonce}!9`;
      const payload = {
        appid: environment.appid,
        provider: "password",
        type: "user",
        groups: "users",
        customerType: 1,
        onBoardingType: 1,
        programCode: "admin",
        vipFlag: 0,
        kycStatus: 0,
        kycRemark: "",
        picture: "base46",
        regMobileISDNCode: "00962",
        regMobileNumber: "790456951",
        mobileNumber: data.phoneNumber,
        verType: "link",
        verStatus: true,
        verWay: "E",
        languagePreference: "en",
        name: `${data.firstName} ${data.lastName}`,
        logoUrl: "https://futeric.com/images/logo.png",
        urlLink: `${appOrigin}/change-password?identifier=${encodeURIComponent(data.userName)}`,
        appName: "Sawa",
        welcomeTeam: "Sawa Team",
        cmpName: "بنك بن دول للتمويل الأصغر الإسلامي",
        regEmailId: data.email,
        password: temporaryPassword,
        userName: data.userName,
        countryCode: 480,
      };

      await dispatch(createAdmin(payload))
        .unwrap()
        .then((response) => {
          dispatch(
            createUserRole({
              roleId: data.role,
              userId: response?.id,
            })
          );
          setEmailLink(data?.email);
          setStep(2);
          fetchUsers();
          reset();
        })
        .catch((error) => {
          showToast.error(error?.message || "Failed to create user");
          console.error("Error creating user:", error);
        });
    }
  };

  useEffect(() => {
    dispatch(getAdminRoles());
  }, [dispatch]);

  return (
    <div className="drawer-create-admin">
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={confirmDelete}
        title={"Remove Account"}
        message={"Are you sure you want to remove this Account?"}
        confirmText={t("users.delete_confirm")}
        cancelText={t("users.delete_cancel")}
        confirmColor="error"
        loading={isDeleting}
      />
      <form className="drawer-body" onSubmit={handleSubmit(onSubmit)}>
        <FormInput
          label={t("user.form.userName")}
          name="userName"
          placeholder={t("user.form.userNamePlaceholder")}
          control={control}
          error={t(errors.userName?.message)}
          bgColor="var(--color-white)"
          styleLabel={{ marginTop: "10px", marginBottom: "0px" }}
          styleGroup={{ marginBottom: "10px" }}
        />
        <FormInput
          label={t("user.form.firstName")}
          name="firstName"
          placeholder={t("user.form.firstNamePlaceholder")}
          control={control}
          error={t(errors.firstName?.message)}
          bgColor="var(--color-white)"
          styleLabel={{ marginBottom: "0px" }}
          styleGroup={{ marginBottom: "10px" }}
        />

        <FormInput
          label={t("user.form.lastName")}
          name="lastName"
          placeholder={t("user.form.lastNamePlaceholder")}
          control={control}
          error={t(errors.lastName?.message)}
          bgColor="var(--color-white)"
          styleLabel={{ marginBottom: "0px" }}
          styleGroup={{ marginBottom: "10px" }}
        />

        <FormInput
          label={t("user.form.email")}
          name="email"
          type="email"
          placeholder={t("user.form.emailPlaceholder")}
          control={control}
          error={t(errors.email?.message)}
          bgColor="var(--color-white)"
          styleLabel={{ marginBottom: "0px" }}
          styleGroup={{ marginBottom: "10px" }}
        />

        <label className="phone-label">Phone Number</label>
        <div className="phone-input">
          <span className="flag">
          
          <img 
          style={{
            width:'25px',
            height:'25px',
            objectFit:"contain"
          }}
          src='https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Flag_of_Jordan.svg/960px-Flag_of_Jordan.svg.png'/>
           +962</span>
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                placeholder={t("user.form.phoneNumberPlaceholder")}
                style={{ flex: 1 }}
              />
            )}
          />
        </div>
        {errors.phoneNumber && (
          <p
            style={{
              marginBottom: "10px",
            }}
            className="form-error-message"
          >
            {t(errors.phoneNumber.message)}
          </p>
        )}
        <FormSelect
          label={"User Role"}
          placeholder="User Role"
          name="role"
          control={control}
          options={rolesOptions}
          variant="bordered"
          bgColor="var(--color-white)"
          style={{
            padding: "11px 20px",
          }}
          error={t(errors.role?.message)}
          styleLabel={{ marginBottom: "0px", marginTop: "10px" }}
        />
        {!isEditMode && (
          <button
            className={`primary-btn ${isSubmitting ? "submitting" : ""}`}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Sending verification link..."
              : "Send verification link"}
          </button>
        )}
        {isEditMode && (
          <>
            <button
              className={`primary-btn ${isSubmitting ? "submitting" : ""}`}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating Account..." : "Update Account"}
            </button>
            <button
              className={`remove-account ${isSubmitting ? "submitting" : ""}`}
              type="button"
              disabled={isSubmitting}
              onClick={() => handleDeleteUser(selectedUser?.id)}
            >
              Remove Account
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default CreateUser;
