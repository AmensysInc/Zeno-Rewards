import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole) {
    // Staff can ONLY access staff routes, not business routes
    if (role === 'staff') {
      // Staff should only access staff routes
      if (requiredRole === 'staff') {
        return children;
      } else {
        // Staff trying to access non-staff routes - redirect to staff portal
        return <Navigate to="/staff/customers" replace />;
      }
    }
    
    // Business users can access business routes
    if (requiredRole === 'business' && role === 'business') {
      return children;
    }
    
    // Customer role
    if (requiredRole === 'customer' && role === 'customer') {
      return children;
    }
    
    // Admin role
    if (requiredRole === 'admin' && role === 'admin') {
      return children;
    }
    
    // Organization role
    if (requiredRole === 'organization' && role === 'organization') {
      return children;
    }
    
    // If role doesn't match, redirect to login
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;

