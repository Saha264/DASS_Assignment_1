import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

/**
 * A wrapper for routes that require authentication.
 * If `allowedRoles` is provided, it also checks if the user has permission.
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { userInfo } = useAuthStore();

  // If not logged in, redirect to login page
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required and the user's role isn't included, redirect
  if (allowedRoles.length > 0 && !allowedRoles.includes(userInfo.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated and authorized, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
