import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectRole } from '../store/slices/authSlice';

const RedirectBasedOnRole = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectRole);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (role === 'superadmin' || role === 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (role === 'M' || role === 'merchant') {
    return <Navigate to="/merchant/dashboard/home" replace />;
  }

  // if (role === 'company') {
  //   return <Navigate to="/CompanyRequest" replace />;
  // }

  return <Navigate to="/" replace />;
};

export default RedirectBasedOnRole;
