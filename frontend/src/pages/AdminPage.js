import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBusinessByAdmin, listOrganizations, listAllBusinesses } from '../services/api';
import './AdminPage.css';

function AdminPage() {
  const [organizations, setOrganizations] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    orgId: '',
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
      const [orgsRes, bizRes] = await Promise.all([
        listOrganizations(),
        listAllBusinesses()
      ]);
      setOrganizations(orgsRes.data);
      setBusinesses(bizRes.data);
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
      await createBusinessByAdmin(formData.orgId, formData.name, formData.email, formData.password);
      setSuccess('Business created successfully!');
      setFormData({ orgId: '', name: '', email: '', password: '' });
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
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="container">
        <div className="card">
          <h2>Organizations</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((org) => (
                <tr key={org.id}>
                  <td>{org.name}</td>
                  <td>{org.email}</td>
                  <td>{new Date(org.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Businesses</h2>
            <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
              {showCreateForm ? 'Cancel' : 'Create Business'}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={handleCreateBusiness} style={{ marginBottom: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '4px' }}>
              <div className="form-group">
                <label>Organization</label>
                <select
                  value={formData.orgId}
                  onChange={(e) => setFormData({ ...formData, orgId: e.target.value })}
                  required
                >
                  <option value="">Select Organization</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
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
                <th>Organization ID</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((biz) => (
                <tr key={biz.id}>
                  <td>{biz.name}</td>
                  <td>{biz.email}</td>
                  <td>{biz.org_id}</td>
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

export default AdminPage;

