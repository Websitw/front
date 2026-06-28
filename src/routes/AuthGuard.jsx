import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectRole,
  selectIsInitialized,
} from "../store/slices/authSlice";
import Loading from "../components/Loading/Loading";

const AuthGuard = ({ allowedRoles }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectRole);
  const isInitialized = useSelector(selectIsInitialized);

  if (!isInitialized) {
    return (
      <div className="loading-page-loading">
        <Loading loadingPages={true} />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (
      allowedRoles &&
      (allowedRoles.includes("superadmin") || allowedRoles.includes("admin"))
    ) {
      return <Navigate to="/admin" replace />;
    }
    if (
      allowedRoles &&
      (allowedRoles.includes("M") || allowedRoles.includes("merchant"))
    ) {
      return <Navigate to="/Signin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  if (!role) {
    return (
      <div className="loading-page-loading">
        <Loading />
      </div>
    );
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    if (role === "superadmin" || role === "admin") {
      return <Navigate to="/dashboard" replace />;
    }
    if (role === "M" || role === "merchant") {
      return <Navigate to="/merchant/dashboard/home" replace />;
    }
    // if (role === "company") {
    //   return <Navigate to="/CompanyRequest" replace />;
    // }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
