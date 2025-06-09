import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default AdminRoute;