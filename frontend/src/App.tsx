import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import { useAppSelector } from './hooks/redux';

// Pages
import UserLoginPage from './pages/student/LoginPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import StudentDashboard from './pages/student/Dashboard';
import EquipmentList from './pages/student/EquipmentList';
import EquipmentDetail from './pages/student/EquipmentDetail';
import BorrowHistory from './pages/student/BorrowHistory';
import AdminDashboard from './pages/admin/Dashboard';
import AdminEquipmentList from './pages/admin/EquipmentList';
import AdminEquipmentDetail from './pages/admin/EquipmentDetail';
import AdminRequestList from './pages/admin/RequestList';
import AdminRequestDetail from './pages/admin/RequestDetail';
import AdminStatistics from './pages/admin/Statistics';

// Components
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

const App: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Routes>
        {/* User login */}
        <Route path="/login" element={
          !isAuthenticated
            ? <UserLoginPage />
            : user?.isAdmin
              ? <Navigate to="/admin" replace />
              : <Navigate to="/" replace />
        } />

        {/* Admin login */}
        <Route path="/admin/login" element={
          !isAuthenticated || !user?.isAdmin
            ? <AdminLoginPage />
            : <Navigate to="/admin" replace />
        } />

        {/* Student routes */}
        <Route path="/" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
        <Route path="/equipment" element={<PrivateRoute><EquipmentList /></PrivateRoute>} />
        <Route path="/equipment/:id" element={<PrivateRoute><EquipmentDetail /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute><BorrowHistory /></PrivateRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/equipment" element={<AdminRoute><AdminEquipmentList /></AdminRoute>} />
        <Route path="/admin/equipment/:id" element={<AdminRoute><AdminEquipmentDetail /></AdminRoute>} />
        <Route path="/admin/requests" element={<AdminRoute><AdminRequestList /></AdminRoute>} />
        <Route path="/admin/requests/:id" element={<AdminRoute><AdminRequestDetail /></AdminRoute>} />
        <Route path="/admin/statistics" element={<AdminRoute><AdminStatistics /></AdminRoute>} />

        {/* Catch all */}
        <Route path="*" element={
          !isAuthenticated
            ? <Navigate to="/login" replace />
            : user?.isAdmin
              ? <Navigate to="/admin" replace />
              : <Navigate to="/" replace />
        } />
      </Routes>
    </Layout>
  );
};

export default App;