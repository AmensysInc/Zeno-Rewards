import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import RuleManagementPage from './pages/RuleManagementPage.jsx';
import CustomerDashboard from './pages/CustomerDashboard.jsx';
import CustomerPointsPage from './pages/CustomerPointsPage.jsx';
import CustomerOffersPage from './pages/CustomerOffersPage.jsx';
import EmployeesPage from './pages/EmployeesPage.jsx';
import StaffCustomerPage from './pages/StaffCustomerPage.jsx';
import StaffRuleManagementPage from './pages/StaffRuleManagementPage.jsx';
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
        <Route 
          path="/business/rules" 
          element={
            <ProtectedRoute requiredRole="business">
              <RuleManagementPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/business/employees" 
          element={
            <ProtectedRoute requiredRole="business">
              <EmployeesPage />
            </ProtectedRoute>
          } 
        />
        {/* Staff Routes */}
        <Route 
          path="/staff/customers" 
          element={
            <ProtectedRoute requiredRole="staff">
              <StaffCustomerPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/rules" 
          element={
            <ProtectedRoute requiredRole="staff">
              <StaffRuleManagementPage />
            </ProtectedRoute>
          } 
        />
        {/* Redirect staff from any other route to customers page */}
        <Route 
          path="/staff/*" 
          element={
            <ProtectedRoute requiredRole="staff">
              <Navigate to="/staff/customers" replace />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/customer/dashboard" 
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/customer/points" 
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerPointsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/customer/offers" 
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerOffersPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;

