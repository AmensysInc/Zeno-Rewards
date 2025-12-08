import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CreateOrgPage from './pages/CreateOrgPage';
import AdminPage from './pages/AdminPage';
import OrgDashboard from './pages/OrgDashboard';
import BusinessDashboard from './pages/BusinessDashboard';
import UploadPage from './pages/UploadPage';
import TransactionsPage from './pages/TransactionsPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/create-org" element={<CreateOrgPage />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/org/dashboard" 
          element={
            <ProtectedRoute requiredRole="organization">
              <OrgDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/business/dashboard" 
          element={
            <ProtectedRoute requiredRole="business">
              <BusinessDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/business/upload" 
          element={
            <ProtectedRoute requiredRole="business">
              <UploadPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/business/transactions" 
          element={
            <ProtectedRoute requiredRole="business">
              <TransactionsPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;

