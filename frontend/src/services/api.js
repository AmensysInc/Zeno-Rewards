import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const loginAdmin = (email, password) => {
  return api.post('/auth/login-admin', { email, password });
};

export const loginOrg = (email, password) => {
  return api.post('/auth/login-org', { email, password });
};

export const loginBusiness = (email, password) => {
  return api.post('/auth/login-business', { email, password });
};

// Admin endpoints
export const createAdmin = (email, password) => {
  return api.post('/admin/create', { email, password });
};

export const createBusinessByAdmin = (orgId, name, email, password) => {
  return api.post('/admin/business/create', null, {
    params: { org_id: orgId, name, email, password }
  });
};

export const listOrganizations = () => {
  return api.get('/admin/organizations');
};

export const listAllBusinesses = () => {
  return api.get('/admin/businesses');
};

// Organization endpoints
export const createOrg = (name, email, password) => {
  return api.post('/organizations/create', { name, email, password });
};

export const createBusiness = (name, email, password) => {
  return api.post('/organizations/business/create', null, {
    params: { name, email, password }
  });
};

export const listMyBusinesses = () => {
  return api.get('/organizations/businesses');
};

export const getOrgDashboard = () => {
  return api.get('/organizations/dashboard');
};

// Business endpoints
export const getBusinessDashboard = () => {
  return api.get('/businesses/dashboard');
};

// Transaction endpoints
export const uploadTransactionsPreview = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/transactions/upload/preview', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const approveTransactions = (transactions) => {
  return api.post('/transactions/approve', transactions);
};

export const getTransactions = (phoneNumber = null, licensePlate = null) => {
  const params = {};
  if (phoneNumber) params.phone_number = phoneNumber;
  if (licensePlate) params.license_plate = licensePlate;
  return api.get('/transactions/', { params });
};

export const getTransactionSummary = () => {
  return api.get('/transactions/summary');
};

export default api;

