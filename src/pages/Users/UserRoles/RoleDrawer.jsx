import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CustomSwitch from "../../../components/common/CustomSwitch";
import { getAdminModules } from "../../../store/slices/adminModules";
import {
  createAdminRole,
  updateAdminRole,
  deleteAdminRole,
  getAdminRoles,
  getAdminRole,
} from "../../../store/slices/adminRolesSlice";
import { showToast } from "../../../components/CustomToast/CustomToast";
import ConfirmDialog from "../../../components/Admin/Modal/Modal";


const roleSchema = z.object({
  name_en: z.string().min(1, "English name is required"),
  name_ar: z.string().min(1, "Arabic name is required"),
  description_en: z.string().min(1, "English description is required"),
  description_ar: z.string().min(1, "Arabic description is required"),
  modulePermissions: z
    .record(
      z.string(),
      z.object({
        enabled: z.boolean(),
        permissions: z.record(z.string(), z.boolean()),
      })
    )
    .refine(
      (modules) => {
        return Object.values(modules).some((module) => module.enabled);
      },
      {
        message: "At least one module must be enabled",
      }
    )
    .refine(
      (modules) => {
        return Object.entries(modules).every(([_, module]) => {
          if (module.enabled) {
            return Object.values(module.permissions).some(
              (perm) => perm === true
            );
          }
          return true;
        });
      },
      {
        message: "Each enabled module must have at least one permission selected",
      }
    ),
});

const buildInitialPermissions = (modules, roleData) => {
  const initialPermissions = {};

  modules.forEach((module) => {
    const moduleKey = module.moduleCode || module.code;
    initialPermissions[moduleKey] = {
      enabled: false,
      permissions: {},
    };

    if (module.permissions) {
      module.permissions.forEach((permission) => {
        const permKey = permission.permissionCode || permission.code;
        initialPermissions[moduleKey].permissions[permKey] = false;
      });
    }
  });

  if (roleData?.modules) {
    roleData.modules.forEach((roleModule) => {
      const moduleCode = roleModule.moduleCode;
      if (initialPermissions[moduleCode]) {
        initialPermissions[moduleCode].enabled = roleModule.active === true;

        roleModule.permissions?.forEach((permission) => {
          const permCode = permission.permissionCode || permission.code;
          if (
            initialPermissions[moduleCode].permissions[permCode] !== undefined
          ) {
            initialPermissions[moduleCode].permissions[permCode] =
              permission.active === true;
          }
        });
      }
    });
  } else if (roleData?.roleModules) {
    roleData.roleModules.forEach((roleModule) => {
      const moduleCode = roleModule.moduleCode;
      if (initialPermissions[moduleCode]) {
        initialPermissions[moduleCode].enabled = true;
        roleModule.permissionCodes.forEach((permCode) => {
          if (
            initialPermissions[moduleCode].permissions[permCode] !== undefined
          ) {
            initialPermissions[moduleCode].permissions[permCode] = true;
          }
        });
      }
    });
  }

  return initialPermissions;
};

const buildInitialExpandedSections = (modules) => {
  return modules.reduce((acc, module) => {
    acc[module.moduleCode || module.code] = false;
    return acc;
  }, {});
};

const transformFormData = (data) => {
  const roleModules = Object.entries(data.modulePermissions)
    .filter(([_, moduleData]) => moduleData.enabled)
    .map(([moduleCode, moduleData]) => ({
      moduleCode,
      permissionCodes: Object.entries(moduleData.permissions)
        .filter(([_, enabled]) => enabled)
        .map(([code]) => code),
    }))
    .filter((module) => module.permissionCodes.length > 0);

  return {
    roleRequest: {
      name: data.name_en,
      name_i18n: {
        en: data.name_en,
        ar: data.name_ar,
      },
      description: data.description_en,
      description_i18n: {
        en: data.description_en,
        ar: data.description_ar,
      },
      systemCode: "ADMIN",
    },
    roleModules,
  };
};

const RoleDrawer = ({
  setStep,
  modeRole,
  openRoleDrawer,
  closeRoleDrawer,
  roleData = null,
}) => {
  const dispatch = useDispatch();
  const modules = useSelector((state) => state.adminModules.items);
  const [expandedSections, setExpandedSections] = useState({});
  const [fullRoleData, setFullRoleData] = useState(null);
  const [isLoadingRole, setIsLoadingRole] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name_en: "",
      name_ar: "",
      description_en: "",
      description_ar: "",
      modulePermissions: {},
    },
  });

  const modulePermissions = watch("modulePermissions");

  useEffect(() => {
    dispatch(getAdminModules());
  }, [dispatch]);

  useEffect(() => {
    if (roleData && roleData.id && (modeRole === 2 || modeRole === 3)) {
      setIsLoadingRole(true);
      dispatch(getAdminRole(roleData.id))
        .unwrap()
        .then((data) => {
          setFullRoleData(data);
          setIsLoadingRole(false);
        })
        .catch((error) => {
          showToast.error(error?.message || "Failed to fetch role details");
          setIsLoadingRole(false);
        });
    } else {
      setFullRoleData(null);
    }
  }, [roleData, modeRole, dispatch]);

  useEffect(() => {
    if (modules && modules.length > 0) {
      const dataToUse = fullRoleData || roleData;

      if (dataToUse) {
        reset({
          name_en: dataToUse.name_i18n?.en || "",
          name_ar: dataToUse.name_i18n?.ar || "",
          description_en: dataToUse.description_i18n?.en || "",
          description_ar: dataToUse.description_i18n?.ar || "",
          modulePermissions: buildInitialPermissions(modules, fullRoleData),
        });
      } else {
        reset({
          name_en: "",
          name_ar: "",
          description_en: "",
          description_ar: "",
          modulePermissions: buildInitialPermissions(modules, null),
        });
      }

      setExpandedSections(buildInitialExpandedSections(modules));
    }
  }, [modules, fullRoleData, reset]);

  const toggleSection = (moduleCode) => {
    setExpandedSections((prev) => ({
      ...prev,
      [moduleCode]: !prev[moduleCode],
    }));
  };

  const handleModuleToggle = (moduleCode) => {
    const currentModule = modulePermissions[moduleCode];
    const newEnabled = !currentModule.enabled;

    const updatedPermissions = Object.keys(currentModule.permissions).reduce(
      (acc, key) => {
        acc[key] = false;
        return acc;
      },
      {}
    );

    setValue(`modulePermissions.${moduleCode}`, {
      enabled: newEnabled,
      permissions: updatedPermissions,
    });
  };

  const handlePermissionToggle = (moduleCode, permissionCode) => {
    const currentValue =
      modulePermissions[moduleCode].permissions[permissionCode];
    setValue(
      `modulePermissions.${moduleCode}.permissions.${permissionCode}`,
      !currentValue
    );
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const payload = transformFormData(data);

    try {
      const action =
        modeRole === 1
          ? createAdminRole(payload)
          : updateAdminRole({ id: roleData.id, data: payload });

      await dispatch(action).unwrap();

      showToast.success(
        modeRole === 1
          ? "Role created successfully"
          : "Role updated successfully"
      );
      dispatch(getAdminRoles());
      closeRoleDrawer();
      reset();
    } catch (error) {
      showToast.error(
        error?.message ||
          `Failed to ${modeRole === 1 ? "create" : "update"} role`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
        closeRoleDrawer();
        reset();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (roleData && roleData.id) {
      setIsDeleting(true);
      try {
        await dispatch(deleteAdminRole(roleData.id)).unwrap();
        showToast.success("Role deleted successfully");
        dispatch(getAdminRoles());
        setDeleteDialogOpen(false);
        closeRoleDrawer();
        reset();
      } catch (error) {
        showToast.error(error?.message || "Failed to delete role");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  };

  const isReadOnly = modeRole === 2;

  return (
    <div className={`drawer-overlay ${openRoleDrawer ? "show" : ""}`}>
      <div className={`drawer role-drawer ${openRoleDrawer ? "open" : ""}`}>
        <div className="drawer-header">
          <h3>
            {modeRole === 1 && "Create New Role"}
            {modeRole === 2 && "View Role"}
            {modeRole === 3 && "Edit Role"}
          </h3>
          <CloseIcon className="close-icon" onClick={handleClose} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="drawer-body">
          {isLoadingRole ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              Loading role details...
            </div>
          ) : (
            <>
              <label>Role Name (English)</label>
              <input
                {...register("name_en")}
                placeholder="Role Name in English"
                className="role-input"
                disabled={isReadOnly}
              />
              {errors.name_en && (
                <span className="error-message">{errors.name_en.message}</span>
              )}

              <label>Role Name (Arabic)</label>
              <input
                {...register("name_ar")}
                placeholder="Role Name in Arabic"
                className="role-input"
                disabled={isReadOnly}
              />
              {errors.name_ar && (
                <span className="error-message">{errors.name_ar.message}</span>
              )}

              <label>Role Description (English)</label>
              <textarea
                {...register("description_en")}
                placeholder="Role Description in English"
                className="role-textarea"
                rows={4}
                disabled={isReadOnly}
              />
              {errors.description_en && (
                <span className="error-message">
                  {errors.description_en.message}
                </span>
              )}

              <label>Role Description (Arabic)</label>
              <textarea
                {...register("description_ar")}
                placeholder="Role Description in Arabic"
                className="role-textarea"
                rows={4}
                disabled={isReadOnly}
              />
              {errors.description_ar && (
                <span className="error-message">
                  {errors.description_ar.message}
                </span>
              )}

              <div className="permissions-section">
                <h4>Permissions Type</h4>
                {errors.modulePermissions && (
                  <span className="error-message">
                    {errors.modulePermissions.message ||
                      "Please select at least one module with its permissions"}
                  </span>
                )}
                {modules &&
                  modules.map((module) => {
                    const moduleKey = module.moduleCode || module.code;
                    return (
                      <div key={moduleKey} className="permission-item">
                        <div
                          className="permission-header"
                          onClick={() =>
                            module.permissions && toggleSection(moduleKey)
                          }
                        >
                          <span>{module.name}</span>
                          <div className="permission-controls">
                            <Controller
                              name={`modulePermissions.${moduleKey}.enabled`}
                              control={control}
                              render={({ field }) => (
                                <CustomSwitch
                                  checked={field.value || false}
                                  onChange={() =>
                                    !isReadOnly && handleModuleToggle(moduleKey)
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  containerWidth={40}
                                  containerHeight={20}
                                  thumbWidth={16}
                                  thumbHeight={16}
                                  activeColor="#00619B"
                                  inactiveColor="#CACACA"
                                  disabled={isReadOnly}
                                />
                              )}
                            />
                            {module.permissions &&
                              module.permissions.length > 0 &&
                              (expandedSections[moduleKey] ? (
                                <KeyboardArrowUpIcon className="expand-icon" />
                              ) : (
                                <KeyboardArrowDownIcon className="expand-icon" />
                              ))}
                          </div>
                        </div>

                        {module.permissions &&
                          module.permissions.length > 0 &&
                          expandedSections[moduleKey] && (
                            <div className="sub-permissions">
                              {module.permissions.map((permission) => {
                                const permKey =
                                  permission.permissionCode || permission.code;
                                return (
                                  <div
                                    key={permKey}
                                    className="sub-permission-item"
                                  >
                                    <span>{permission.name}</span>
                                    <Controller
                                      name={`modulePermissions.${moduleKey}.permissions.${permKey}`}
                                      control={control}
                                      render={({ field }) => (
                                        <CustomSwitch
                                          checked={field.value || false}
                                          onChange={() =>
                                            !isReadOnly &&
                                            modulePermissions[moduleKey]
                                              ?.enabled &&
                                            handlePermissionToggle(
                                              moduleKey,
                                              permKey
                                            )
                                          }
                                          containerWidth={40}
                                          containerHeight={20}
                                          thumbWidth={16}
                                          thumbHeight={16}
                                          activeColor="#00619B"
                                          inactiveColor="#CACACA"
                                          disabled={
                                            isReadOnly ||
                                            !modulePermissions[moduleKey]
                                              ?.enabled
                                          }
                                        />
                                      )}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          )}
                      </div>
                    );
                  })}
              </div>

              {modeRole === 1 && (
                <button
                  type="submit"
                  className={`primary-btn create-role-btn ${isSubmitting ? "submitting" : ""}`}
                  disabled={isSubmitting}
                  
                >
                  {isSubmitting ? "Creating..." : "Create Role"}
                </button>
              )}

              {modeRole === 3 && (
                <>
                  <button
                    type="submit"
                    className={`primary-btn ${isSubmitting ? "submitting" : ""}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Updating..." : "Update Role"}
                  </button>
                  <button
                    type="button"
                    className={`remove-account ${isSubmitting ? "submitting" : ""}`}
                    onClick={handleDelete}
                    disabled={isSubmitting}
                  >
                    Remove Role
                  </button>
                </>
              )}
            </>
          )}
        </form>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Role"
        message="Are you sure you want to delete this role? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        loading={isDeleting}
      />
    </div>
  );
};

export default RoleDrawer;