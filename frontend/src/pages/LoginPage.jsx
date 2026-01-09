import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginAdmin, loginOrg, loginBusiness, loginStaff, loginCustomer } from '../services/api';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (role === 'admin') {
        response = await loginAdmin(email, password);
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('role', 'admin');
        navigate('/admin');
      } else if (role === 'organization') {
        response = await loginOrg(email, password);
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('role', 'organization');
        localStorage.setItem('org_id', response.data.org_id);
        navigate('/org/dashboard');
      } else if (role === 'business') {
        response = await loginBusiness(email, password);
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('role', 'business');
        localStorage.setItem('business_id', response.data.business_id);
        navigate('/business/dashboard');
      } else if (role === 'staff') {
        response = await loginStaff(email, password);
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('role', 'staff');
        localStorage.setItem('business_id', response.data.business_id);
        navigate('/staff/customers');
      } else if (role === 'customer') {
        response = await loginCustomer(email, password);
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('role', 'customer');
        localStorage.setItem('customer_id', response.data.customer_id);
        localStorage.setItem('business_id', response.data.business_id);
        navigate('/customer/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-center mb-2 text-gray-800 text-3xl font-bold">Rewards Program</h1>
        <h2 className="text-center mb-8 text-gray-600 text-xl font-normal">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="admin">Admin</option>
              <option value="organization">Organization</option>
              <option value="business">Business</option>
              <option value="staff">Business Staff</option>
              <option value="customer">Customer</option>
            </select>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="mt-5 text-center">
          <p className="mb-3 text-gray-600">Don't have an organization account?</p>
          <Link to="/create-org" className="text-blue-600 no-underline font-medium hover:underline">
            Create Organization Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

