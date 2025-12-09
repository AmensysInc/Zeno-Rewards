import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Backend API base URL
const API_BASE_URL = 'http://localhost:8000';

// MOCK USERS FOR TESTING
const mockUsers = {
  // Organization
  'org@demo.com': {
    password: 'org123',
    user: {
      id: 1,
      email: 'org@demo.com',
      name: 'Demo Organization',
      userType: 'organization',
      role: 'organization',
      organization_id: 1
    }
  },
  // Business
  'business@demo.com': {
    password: 'business123',
    user: {
      id: 2,
      email: 'business@demo.com',
      name: 'Sparkle Carwash Downtown',
      userType: 'business',
      role: 'business',
      organization_id: 1,
      business_id: 2
    }
  },
  // Customer (by email)
  'customer@demo.com': {
    password: 'customer123',
    user: {
      id: 3,
      email: 'customer@demo.com',
      name: 'John Customer',
      phone: '1234567890',
      userType: 'customer',
      role: 'customer',
      organization_id: 1,
      business_id: 2,
      points: 450
    }
  },
  // Customer (by phone)
  '1234567890': {
    password: 'customer123',
    user: {
      id: 3,
      email: 'customer@demo.com',
      name: 'John Customer',
      phone: '1234567890',
      userType: 'customer',
      role: 'customer',
      organization_id: 1,
      business_id: 2,
      points: 450
    }
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [useMockAuth, setUseMockAuth] = useState(true); // MOCK AUTH ENABLED

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('currentUser');
    
    if (token && storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Helper function to detect if input is phone or email
  const isPhoneNumber = (input) => {
    return /^\d+$/.test(input);
  };

  // Login function
  const login = async (emailOrPhone, password) => {
    try {
      // MOCK AUTHENTICATION
      if (useMockAuth) {
        const mockUser = mockUsers[emailOrPhone.toLowerCase()];
        
        if (!mockUser || mockUser.password !== password) {
          return {
            success: false,
            message: 'Invalid credentials'
          };
        }

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const token = 'mock-jwt-token-' + Date.now();
        const user = mockUser.user;

        // Save tokens and user data
        localStorage.setItem('access_token', token);
        localStorage.setItem('refresh_token', 'mock-refresh-token');
        localStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentUser(user);

        return { success: true, user };
      }

      // REAL API AUTHENTICATION
      let response;
      let endpoint;
      
      if (isPhoneNumber(emailOrPhone)) {
        endpoint = '/auth/login-customer';
        response = await axios.post(`${API_BASE_URL}${endpoint}`, null, {
          params: { phone: emailOrPhone, password: password }
        });
      } else {
        try {
          endpoint = '/auth/login-org';
          response = await axios.post(`${API_BASE_URL}${endpoint}`, null, {
            params: { email: emailOrPhone, password: password }
          });
        } catch (orgError) {
          endpoint = '/auth/login-business';
          response = await axios.post(`${API_BASE_URL}${endpoint}`, null, {
            params: { email: emailOrPhone, password: password }
          });
        }
      }

      const data = response.data;
      
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);

      const user = {
        id: data.customer_id || data.business_id || data.org_id,
        email: emailOrPhone,
        userType: data.role,
        role: data.role,
        organization_id: data.org_id,
        business_id: data.business_id,
        customer_id: data.customer_id,
        points: data.points || 0
      };

      localStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentUser(user);

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Invalid credentials'
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  // Get user type for routing
  const getUserType = () => {
    return currentUser?.userType;
  };

  // Get user role
  const getUserRole = () => {
    return currentUser?.role;
  };

  const value = {
    currentUser,
    login,
    logout,
    getUserType,
    getUserRole,
    isAuthenticated: !!currentUser,
    isOrganization: currentUser?.userType === 'organization',
    isAdmin: currentUser?.userType === 'business',
    isCustomer: currentUser?.userType === 'customer',
    useMockAuth,
    setUseMockAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};