import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginAdmin, loginOrg, loginBusiness } from '../services/api';
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin'); // admin, organization, business
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
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Rewards Program</h1>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="admin">Admin</option>
              <option value="organization">Organization</option>
              <option value="business">Business</option>
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
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ marginBottom: '10px', color: '#666' }}>Don't have an organization account?</p>
          <Link to="/create-org" style={{ color: '#007bff', textDecoration: 'none', fontWeight: '500' }}>
            Create Organization Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

