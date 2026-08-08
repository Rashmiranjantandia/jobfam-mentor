import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * ProtectedRoute — wraps any route that requires authentication.
 * Props:
 *   children  — the component to render if auth passes
 *   role      — optional; if provided, also checks req.user.role
 *
 * Unauthenticated users are redirected to /login.
 * Wrong-role users are redirected to / (prevents a candidate hitting /dashboard).
 */
const ProtectedRoute = ({ children, role }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
