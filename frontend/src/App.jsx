import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import CreateOrgPage from './pages/CreateOrgPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import OrgDashboard from './pages/OrgDashboard.jsx';
import BusinessDashboard from './pages/BusinessDashboard.jsx';
import UploadPage from './pages/UploadPage.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import CustomerPOSPage from './pages/CustomerPOSPage.jsx';
import OffersPage from './pages/OffersPage.jsx';
import PointsPage from './pages/PointsPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

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
        <Route 
          path="/business/pos" 
          element={
            <ProtectedRoute requiredRole="business">
              <CustomerPOSPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/business/offers" 
          element={
            <ProtectedRoute requiredRole="business">
              <OffersPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/business/points" 
          element={
            <ProtectedRoute requiredRole="business">
              <PointsPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;

