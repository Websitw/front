import React, { useState, useEffect } from "react";
import "./Users.css";
import { MdKeyboardArrowDown } from "react-icons/md";
import { Mail, Add, SearchIcon } from "../../assets/icons";
import AddIcon from "@mui/icons-material/Add";
import CreateUser from "./UserManagement/CreateUser";
import Congratulations from "./UserManagement/Congratulations";
import RoleDrawer from "./UserRoles/RoleDrawer";
import CloseIcon from "@mui/icons-material/Close";
import { showToast } from "../../components/CustomToast/CustomToast";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getAdmins } from "../../store/slices/adminSlice";
import { getAdminRoles, getAdminRole } from "../../store/slices/adminRolesSlice";

const Users = () => {
  const dispatch = useDispatch();
  const {
    admins: users,
    loading,
    pagination,
    lastKey,
  } = useSelector((state) => state.admin);
  const { items: roles } = useSelector((state) => state.adminRoles);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openRoleDrawer, setOpenRoleDrawer] = useState(false);
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState("management");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modeRole, setModeRole] = useState(1);
  const [emailLink, setEmailLink] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage] = useState(10);
  const [selectedRole, setSelectedRole] = useState(null);

  const closeDrawer = () => {
    setOpenDrawer(false);
    setStep(1);
  };

  const closeRoleDrawer = () => {
    setOpenRoleDrawer(false);
    setSelectedRole(null);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditMode(true);
    setOpenDrawer(true);
    setStep(1);
  };
  const handleAddUser = () => {
    setSelectedUser(null);
    setIsEditMode(false);
    setOpenDrawer(true);
    setStep(1);
  };
  const handleViewDetails = (role) => {
    setSelectedRole(role);
    setModeRole(2);
    setOpenRoleDrawer(true);
  };

  const handleAddNewRole = () => {
    setSelectedRole(null);
    setModeRole(1);
    setOpenRoleDrawer(true);
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setModeRole(3);
    setOpenRoleDrawer(true);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pagination?.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  console.log("currentPage>>", currentPage);

  const generatePageNumbers = () => {
    const totalPages = pagination?.totalPages || 1;
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxVisiblePages; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  const fetchUsers = async () => {
    try {
      await dispatch(
        getAdmins({
          page: currentPage,
          limit: itemsPerPage,
          // search: searchQuery,
          // lastKey: currentPage > 1 ? lastKey : null,
        })
      ).unwrap();
    } catch (err) {
      showToast.error("Failed to fetch users");
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  useEffect(() => {
    dispatch(getAdminRoles())
      .unwrap()
      .catch((err) => {
        console.error("Error fetching admin roles:", err);
        showToast.error(err?.message || "Failed to fetch admin roles");
      });
  }, []);

  // useEffect(() => {
  //   const delayDebounce = setTimeout(() => {
  //     if (searchQuery !== undefined) {
  //       fetchUsers();
  //     }
  //   }, 500);

  //   return () => clearTimeout(delayDebounce);
  // }, [searchQuery]);



  console.log("Users:", users);
  return (
    <>
      <div className="main-user-pofile">
        <div className="users-page">
          <div className="header">
            <div>
              <h1>Users Accounts</h1>
              <p>Manage and track your Accounts, leads and site members</p>
            </div>
          </div>

          <div className="tabs">
            <button
              className={`tab ${activeTab === "management" ? "active" : ""}`}
              onClick={() => setActiveTab("management")}
            >
              Users Management
            </button>
            <button
              className={`tab ${activeTab === "permissions" ? "active" : ""}`}
              onClick={() => setActiveTab("permissions")}
            >
              User Permissions & Roles
            </button>
          </div>

          <div className="card">
            {activeTab === "management" ? (
              <>
                <div className="filters">
                  <div className="search-box">
                    <SearchIcon className="search-icon" />
                    <input
                      placeholder="Search"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </div>

                  <div className="select-wrapper">
                    <select className="status-select">
                      <option>Member Role</option>
                      <option>Admin</option>
                      <option>Super Admin</option>
                    </select>
                    <MdKeyboardArrowDown className="select-arrow" />
                  </div>

                  <div className="action-buttons">
                    <button className="send-message-btn">
                      <Mail className="btn-icon" />
                      Send Message
                    </button>
                    <button className="add-user-btn" onClick={handleAddUser}>
                      <Add className="btn-icon" />
                      Add New User
                    </button>
                  </div>
                </div>

                <table>
                  <thead>
                    <tr>
                      <th className="checkbox-cell">
                        <input type="checkbox" />
                      </th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Member Role</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan="5"
                          style={{ textAlign: "center", padding: "20px" }}
                        >
                          Loading...
                        </td>
                      </tr>
                    ) : users?.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          style={{ textAlign: "center", padding: "20px" }}
                        >
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users?.map((user, index) => (
                        <tr key={user.id || index}>
                          <td className="checkbox-cell">
                            <input type="checkbox" />
                          </td>
                          <td className="name-cell">
                            <span className="avatar purple">
                              {user.name?.charAt(0) || "U"}
                            </span>
                            <span className="name-text">{user.name}</span>
                          </td>
                          <td className="td-email">{user.email}</td>
                          <td className="td-email">{user.programCode}</td>
                          <td className="actions">
                            <button className="action-link blue">
                              <Mail className="action-icon" />
                              Send Message
                            </button>
                            <button
                              className="action-link gray"
                              onClick={() => handleEditUser(user)}
                            >
                              Edit Account
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <div className="pagination">
                  <button
                    className="page-btn"
                    disabled={currentPage === 1 || loading}
                    onClick={handlePreviousPage}
                  >
                    <ChevronLeftIcon />
                    Previous
                  </button>

                  <div className="page-numbers">
                    {generatePageNumbers().map((page) => (
                      <button
                        key={page}
                        className={`page-number ${
                          currentPage === page ? "active" : ""
                        }`}
                        onClick={() => handlePageChange(page)}
                        disabled={loading}
                      >
                        {page}
                      </button>
                    ))}
                    {pagination?.totalPages > 5 &&
                      currentPage < pagination?.totalPages - 2 && (
                        <>
                          <span className="dots">...</span>
                          <button
                            className="page-number"
                            onClick={() =>
                              handlePageChange(pagination?.totalPages)
                            }
                            disabled={loading}
                          >
                            {pagination?.totalPages}
                          </button>
                        </>
                      )}
                  </div>

                  <button
                    className="page-btn"
                    onClick={handleNextPage}
                    disabled={loading || currentPage >= pagination?.totalPages}
                  >
                    Next
                    <ChevronRightIcon />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="filters">
                  <div className="search-box">
                    <SearchIcon className="search-icon" />
                    <input placeholder="Search" />
                  </div>

                  <div className="select-wrapper">
                    <select className="status-select">
                      <option>Member Role</option>
                      <option>Admin</option>
                      <option>Super Admin</option>
                    </select>
                    <MdKeyboardArrowDown className="select-arrow" />
                  </div>

                  <div className="action-buttons">
                    <button className="add-user-btn" onClick={handleAddNewRole}>
                      <AddIcon className="btn-icon" />
                      Create New Role
                    </button>
                  </div>
                </div>

                <table className="roles-table">
                  <thead>
                    <tr>
                      <th className="checkbox-cell">
                        <input type="checkbox" />
                      </th>
                      <th>Roles Name</th>
                      <th className="th-assigned">Assigned No.</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan="4"
                          style={{ textAlign: "center", padding: "20px" }}
                        >
                          Loading...
                        </td>
                      </tr>
                    ) : roles?.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          style={{ textAlign: "center", padding: "20px" }}
                        >
                          No roles found
                        </td>
                      </tr>
                    ) : (
                      roles?.map((role, index) => (
                        <tr key={role.id || index}>
                          <td className="checkbox-cell">
                            <input type="checkbox" />
                          </td>
                          <td className="role-info">
                            <div className="role-name">
                              {role.name_i18n?.en || role?.name }
                            </div>
                            <div className="role-description">
                              {role.description_i18n?.en || role.description }
                            </div>
                          </td>
                          <td className={`assigned-number ${role?.assignedCount ? "" : "not-assigned"}`}>
                            {role?.assignedCount || "Not assigned"}
                          </td>
                          <td className="role-actions">
                            <button
                              className="action-link blue"
                              onClick={() => handleViewDetails(role)}
                            >
                              View Details
                            </button>
                            <span className="separator"></span>
                            <button
                              onClick={() => handleEditRole(role)}
                              className="action-link blue"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>

        <div className={`drawer-overlay ${openDrawer ? "show" : ""}`}>
          <div className={`drawer ${openDrawer ? "open" : ""}`}>
            <div className="drawer-header">
              <h3>
                {step === 1 && isEditMode
                  ? "Edit Admin Account"
                  : "Create New Admin Account"}
                {step === 2 && ""}
              </h3>
              <CloseIcon className="close-icon" onClick={closeDrawer} />
            </div>

            {step === 1 && (
              <CreateUser
                fetchUsers={fetchUsers}
                setStep={setStep}
                isEditMode={isEditMode}
                setEmailLink={setEmailLink}
                selectedUser={selectedUser}
                closeDrawer={closeDrawer}
              />
            )}


            {step === 2 && <Congratulations emailLink={emailLink} />}
          </div>
        </div>

        <RoleDrawer
          setStep={setStep}
          modeRole={modeRole}
          openRoleDrawer={openRoleDrawer}
          closeRoleDrawer={closeRoleDrawer}
          roleData={selectedRole}
        />
      </div>
    </>
  );
};

export default Users;
