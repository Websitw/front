import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectRole, selectIsInitialized } from '../store/slices/authSlice';
import Loading from '../components/Loading/Loading';

const GuestGuard = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectRole);
  const isInitialized = useSelector(selectIsInitialized);

  if (!isInitialized) {
    return <div className="loading-page-loading">
      <Loading loadingPages={true} />
    </div>
  }

  if (isAuthenticated && role !== 'U') {
    if (role === 'superadmin') {
      return <Navigate to="/dashboard" replace />;
    }
    if (role === 'M' || role === 'merchant') {
      return <Navigate to="/merchant/dashboard/home" replace />;
    }
    // if (role === 'company') {
    //   return <Navigate to="/CompanyRequest" replace />;
    // }
  }

  return <Outlet />;
};

export default GuestGuard;
