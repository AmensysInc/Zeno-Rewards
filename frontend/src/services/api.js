import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
  console.log('API Request:', config.method?.toUpperCase(), config.url, 'Token:', token ? 'Present' : 'Missing');
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.message);
    console.error('Error config:', error.config);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    }
    return Promise.reject(error);
  }
);

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

export const loginStaff = (email, password) => {
  return api.post('/auth/login-staff', { email, password });
};

export const loginCustomer = (email, password) => {
  return api.post('/auth/login-customer', { email, password });
};

// Admin endpoints
export const createAdmin = (email, password) => {
  return api.post('/admin/create', { email, password });
};

export const createOrganizationByAdmin = (name, email, password) => {
  return api.post('/admin/organization/create', null, {
    params: { name, email, password }
  });
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

export const getBusinessAnalytics = () => {
  return api.get('/businesses/analytics');
};

// Business customer endpoints (POS-style)
export const lookupBusinessCustomer = (phone) => {
  return api.get('/business/customers/lookup', { params: { phone } });
};

export const createBusinessCustomer = (data) => {
  return api.post('/business/customers/', data);
};

export const listBusinessCustomers = () => {
  return api.get('/business/customers/all');
};

// Rewards / offers endpoints
export const listOffers = () => {
  return api.get('/rewards/offers');
};

export const createOffer = (offerData) => {
  return api.post('/rewards/offers/create', offerData);
};

export const listOffersByStatus = (status = null) => {
  const params = status ? { status } : {};
  return api.get('/rewards/offers', { params });
};

export const getEligibleOffersForCustomer = (customerId) => {
  return api.get(`/rewards/eligible/${customerId}`);
};

export const redeemOfferForCustomer = (customerId, offerId) => {
  return api.post(`/rewards/redeem/${customerId}/${offerId}`);
};

// Points / Earning Rules endpoints
export const listEarningRules = () => {
  return api.get('/rewards/earning-rules');
};

export const createEarningRule = (ruleData) => {
  return api.post('/rewards/earning-rules', ruleData);
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

export const getTransactions = (phoneNumber = null, licensePlate = null, startDate = null, endDate = null) => {
  const params = {};
  if (phoneNumber) params.phone_number = phoneNumber;
  if (licensePlate) params.license_plate = licensePlate;
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  return api.get('/transactions/', { params });
};

export const getTransactionSummary = () => {
  return api.get('/transactions/summary');
};

// Points Ledger endpoints
export const getPointsLedger = (customerId = null, limit = 100, offset = 0) => {
  const params = { limit, offset };
  if (customerId) params.customer_id = customerId;
  return api.get('/rewards/points/ledger', { params });
};

export const getPointBalances = (customerId = null) => {
  const params = {};
  if (customerId) params.customer_id = customerId;
  return api.get('/rewards/points/balances', { params });
};

export const getCustomerBalance = (customerId) => {
  return api.get(`/rewards/points/balance/${customerId}`);
};

export const getCustomerLedger = (customerId, limit = 100, offset = 0) => {
  return api.get(`/rewards/points/ledger/${customerId}`, { params: { limit, offset } });
};

// Rule Management APIs
export const listRules = async (activeOnly = false) => {
  const response = await api.get(`/rewards/rules`, {
    params: { active_only: activeOnly }
  });
  return response.data;
};

export const getRule = async (ruleId) => {
  const response = await api.get(`/rewards/rules/${ruleId}`);
  return response.data;
};

export const toggleRule = async (ruleId) => {
  const response = await api.put(`/rewards/rules/${ruleId}/toggle`);
  return response.data;
};

export const deleteRule = async (ruleId) => {
  const response = await api.delete(`/rewards/rules/${ruleId}`);
  return response.data;
};

export const testRuleApplication = async (transactionId) => {
  const response = await api.post(`/rewards/rules/test?transaction_id=${transactionId}`);
  return response.data;
};

// Customer Portal APIs
export const getCustomerDashboard = async () => {
  const response = await api.get('/customer/dashboard');
  return response.data;
};

export const getCustomerPoints = async () => {
  const response = await api.get('/customer/points');
  return response.data;
};

export const getCustomerOffers = async () => {
  const response = await api.get('/customer/offers');
  return response.data;
};

export const getCustomerRedeemableOffers = async () => {
  const response = await api.get('/rewards/customer/redeemable-offers');
  return response.data;
};

export const redeemCustomerOffer = async (redeemableOfferId) => {
  const response = await api.post('/rewards/customer/redeem-offer', {
    redeemable_offer_id: redeemableOfferId
  });
  return response.data;
};

// Fixed Rules APIs
export const getFixedRules = async () => {
  try {
    console.log('Calling API: /rewards/fixed-rules');
    console.log('API Base URL:', API_BASE_URL);
    const response = await api.get('/rewards/fixed-rules');
    console.log('API Response:', response);
    return response.data;
  } catch (error) {
    console.error('getFixedRules error:', error);
    console.error('Error response:', error.response);
    throw error;
  }
};

export const initializeFixedRules = async () => {
  try {
    console.log('Calling API: /rewards/fixed-rules/initialize');
    const response = await api.post('/rewards/fixed-rules/initialize');
    console.log('Initialize response:', response);
    return response.data;
  } catch (error) {
    console.error('initializeFixedRules error:', error);
    console.error('Error response:', error.response);
    throw error;
  }
};

export const checkCustomerEligibility = async (phone) => {
  const response = await api.get(`/rewards/customer-eligibility?phone=${phone}`);
  return response.data;
};

export const applyRuleReward = async (ruleId, customerId, rewardOption = null) => {
  const response = await api.post('/rewards/apply-rule', {
    rule_id: ruleId,
    customer_id: customerId,
    reward_option: rewardOption
  });
  return response.data;
};

// Customer lookup (already exists in cust_flows but we'll use it)
export const lookupCustomer = async (phone) => {
  const response = await api.get(`/business/customers/lookup?phone=${phone}`);
  return response.data;
};

// Staff/Employee Management APIs
export const createStaff = (data) => {
  return api.post('/business/staff/', data);
};

export const listStaff = () => {
  return api.get('/business/staff/');
};

export const updateStaff = (staffId, data) => {
  return api.put(`/business/staff/${staffId}`, data);
};

export const deleteStaff = (staffId) => {
  return api.delete(`/business/staff/${staffId}`);
};

export const activateStaff = (staffId) => {
  return api.patch(`/business/staff/${staffId}/activate`);
};

// Staff Customer Lookup API
export const lookupCustomerRewards = async (phone) => {
  const response = await api.get(`/staff/customer/lookup/${phone}`);
  return response.data;
};

export default api;

