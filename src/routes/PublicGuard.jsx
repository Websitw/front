import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectRole,
  selectIsInitialized,
} from "../store/slices/authSlice";
import Loading from "../components/Loading/Loading";

const PublicGuard = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectRole);
  const isInitialized = useSelector(selectIsInitialized);

  if (!isInitialized) {
    return (
      <div
        className="loading-page-loading">
        <Loading loadingPages={true}/>
      </div>
    );
  }

  if (isAuthenticated) {
    if (role === "superadmin" || role === "admin") {
      return <Navigate to="/dashboard" replace />;
    }
    if (role === "M" || role === "merchant") {
      return <Navigate to="/merchant/dashboard/home" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicGuard;
