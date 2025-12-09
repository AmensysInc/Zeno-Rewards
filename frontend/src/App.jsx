import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import CreateOrganization from './pages/CreateOrganization';

// Unified Login
import Login from './pages/Login';

// Business Pages (formerly called Admin)
import AdminDashboard from './pages/admin/AdminDashboard';
import OffersPage from './pages/admin/OffersPage';
import TransactionsPage from './pages/admin/TransactionsPage';
import PointsPage from './pages/admin/PointsPage';
import UsersPage from './pages/admin/UsersPage';
import MembershipForm from './pages/admin/MembershipForm';
import UploadTransactions from './pages/admin/UploadTransactions';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerOffers from './pages/customer/CustomerOffers';
import RedeemRewards from './pages/customer/RedeemRewards';
import ProfilePage from './pages/customer/ProfilePage';

// Protected Route Component
function ProtectedRoute({ children, allowedTypes }) {
  const { isAuthenticated, currentUser } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedTypes && !allowedTypes.includes(currentUser?.userType)) {
    return <Navigate to="/login" />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Create Organization Route - Public access for product owner */}
<Route path="/create-organization" element={<CreateOrganization />} />

        {/* Organization Routes */}
        <Route
          path="/organization/dashboard"
          element={
            <ProtectedRoute allowedTypes={['organization']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Business Routes (formerly admin) */}
        <Route
          path="/business/dashboard"
          element={
            <ProtectedRoute allowedTypes={['business']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/offers"
          element={
            <ProtectedRoute allowedTypes={['business', 'organization']}>
              <OffersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/business/upload-transactions"
          element={
          <ProtectedRoute allowedTypes={['business', 'organization']}>
              <UploadTransactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/transactions"
          element={
            <ProtectedRoute allowedTypes={['business', 'organization']}>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/points"
          element={
            <ProtectedRoute allowedTypes={['business', 'organization']}>
              <PointsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/users"
          element={
            <ProtectedRoute allowedTypes={['business', 'organization']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/membership"
          element={
            <ProtectedRoute allowedTypes={['business', 'organization']}>
              <MembershipForm />
            </ProtectedRoute>
          }
        />

        {/* Customer Routes */}
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedTypes={['customer']}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/offers"
          element={
            <ProtectedRoute allowedTypes={['customer']}>
              <CustomerOffers />
            </ProtectedRoute>
          }
        />
       
        <Route
          path="/customer/redeem"
          element={
            <ProtectedRoute allowedTypes={['customer']}>
              <RedeemRewards />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/profile"
          element={
            <ProtectedRoute allowedTypes={['customer']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;