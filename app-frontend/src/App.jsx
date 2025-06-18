import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from './config';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserHome from './pages/UserHome';
import AdminHome from './pages/AdminHome';
import AdminUsers from './pages/AdminUsers';
import AdminAddUser from './pages/AdminAddUser';
import AdminUserDetail from './pages/AdminUserDetail';
import AdminStores from './pages/AdminStores';
import AdminStoreForm from './pages/AdminStoreForm';
import StoreOwnerHome from './pages/StoreOwnerHome';
import StoreForm from './pages/StoreForm';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route 
            path="/user" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserHome />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminHome />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/stores" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminStores />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/stores/new" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminStoreForm />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/users/new" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAddUser />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/users/:id" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUserDetail />
              </ProtectedRoute>
            } 
          />
          
          {/* Store Owner routes */}
          <Route 
            path="/owner" 
            element={
              <ProtectedRoute allowedRoles={['store_owner']}>
                <StoreOwnerHome />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/owner/store/new" 
            element={
              <ProtectedRoute allowedRoles={['store_owner']}>
                <StoreForm />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;