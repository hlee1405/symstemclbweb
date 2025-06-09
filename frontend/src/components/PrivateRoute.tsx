import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  
  return <>{children}</>;
};

export default PrivateRoute;