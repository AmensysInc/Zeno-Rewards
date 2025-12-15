import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrganizationByAdmin, createBusinessByAdmin, listOrganizations, listAllBusinesses } from '../services/api';

function AdminPage() {
  const [organizations, setOrganizations] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [showCreateOrgForm, setShowCreateOrgForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [orgFormData, setOrgFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
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

  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await createOrganizationByAdmin(orgFormData.name, orgFormData.email, orgFormData.password);
      setSuccess('Organization created successfully!');
      setOrgFormData({ name: '', email: '', password: '' });
      setShowCreateOrgForm(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create organization');
    } finally {
      setLoading(false);
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
          <div className="flex justify-between items-center mb-5">
            <h2>Organizations</h2>
            <button className="btn btn-primary" onClick={() => setShowCreateOrgForm(!showCreateOrgForm)}>
              {showCreateOrgForm ? 'Cancel' : 'Create Organization'}
            </button>
          </div>

          {showCreateOrgForm && (
            <form onSubmit={handleCreateOrganization} className="mb-5 p-5 bg-gray-50 rounded">
              <div className="form-group">
                <label>Organization Name</label>
                <input
                  type="text"
                  value={orgFormData.name}
                  onChange={(e) => setOrgFormData({ ...orgFormData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={orgFormData.email}
                  onChange={(e) => setOrgFormData({ ...orgFormData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={orgFormData.password}
                  onChange={(e) => setOrgFormData({ ...orgFormData, password: e.target.value })}
                  required
                />
              </div>
              {error && <div className="error">{error}</div>}
              {success && <div className="success">{success}</div>}
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? 'Creating...' : 'Create Organization'}
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
          <div className="flex justify-between items-center mb-5">
            <h2>Businesses</h2>
            <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
              {showCreateForm ? 'Cancel' : 'Create Business'}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={handleCreateBusiness} className="mb-5 p-5 bg-gray-50 rounded">
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

