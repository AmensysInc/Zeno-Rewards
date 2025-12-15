import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBusiness, listMyBusinesses, getOrgDashboard } from '../services/api';

function OrgDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dashboardRes, businessesRes] = await Promise.all([
        getOrgDashboard(),
        listMyBusinesses()
      ]);
      setDashboardData(dashboardRes.data);
      setBusinesses(businessesRes.data);
    } catch (err) {
      setError('Failed to load data');
    }
  };

  const handleCreateBusiness = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await createBusiness(formData.name, formData.email, formData.password);
      setSuccess('Business created successfully!');
      setFormData({ name: '', email: '', password: '' });
      setShowCreateForm(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create business');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div>
      <div className="navbar">
        <h1>Organization Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="container">
        {dashboardData && (
          <div className="card">
            <h2>Welcome, {dashboardData.organization_name}</h2>
            <p>Total Businesses: {dashboardData.business_count}</p>
          </div>
        )}

        <div className="card">
          <div className="flex justify-between items-center mb-5">
            <h2>My Businesses</h2>
            <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
              {showCreateForm ? 'Cancel' : 'Create Business'}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={handleCreateBusiness} className="mb-5 p-5 bg-gray-50 rounded">
              <div className="form-group">
                <label>Business Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              {error && <div className="error">{error}</div>}
              {success && <div className="success">{success}</div>}
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? 'Creating...' : 'Create Business'}
              </button>
            </form>
          )}

          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((biz) => (
                <tr key={biz.id}>
                  <td>{biz.name}</td>
                  <td>{biz.email}</td>
                  <td>{new Date(biz.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OrgDashboard;

