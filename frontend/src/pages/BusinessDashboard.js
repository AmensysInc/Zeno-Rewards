import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getBusinessDashboard } from '../services/api';
import './BusinessDashboard.css';

function BusinessDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await getBusinessDashboard();
      setDashboardData(response.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <div className="navbar">
        <h1>Business Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="container">
        <div className="card">
          <h2>Welcome, {dashboardData?.business_name}</h2>
          <p>This is your business dashboard. You can manage transactions and upload data from here.</p>
        </div>

        <div className="nav-tabs">
          <Link to="/business/dashboard" className="nav-tab active" style={{ textDecoration: 'none' }}>
            Dashboard
          </Link>
          <Link to="/business/upload" className="nav-tab" style={{ textDecoration: 'none' }}>
            Upload Transactions
          </Link>
          <Link to="/business/transactions" className="nav-tab" style={{ textDecoration: 'none' }}>
            Transactions
          </Link>
        </div>

        <div className="card">
          <h3>Quick Actions</h3>
          <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
            <Link to="/business/upload" className="btn btn-primary">
              Upload Transactions
            </Link>
            <Link to="/business/transactions" className="btn btn-secondary">
              View Transactions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessDashboard;

