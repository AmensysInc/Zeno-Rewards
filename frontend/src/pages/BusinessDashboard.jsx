import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getBusinessDashboard, getBusinessAnalytics } from '../services/api';

function BusinessDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
    loadAnalytics();
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

  const loadAnalytics = async () => {
    try {
      const response = await getBusinessAnalytics();
      setAnalytics(response.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
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
          <Link to="/business/dashboard" className="nav-tab active no-underline">
            Dashboard
          </Link>
          <Link to="/business/pos" className="nav-tab no-underline">
            Customers
          </Link>
          <Link to="/business/offers" className="nav-tab no-underline">
            Offers
          </Link>
          <Link to="/business/points" className="nav-tab no-underline">
            Points
          </Link>
          <Link to="/business/upload" className="nav-tab no-underline">
            Upload Transactions
          </Link>
          <Link to="/business/transactions" className="nav-tab no-underline">
            Transactions
          </Link>
        </div>

        <div className="card">
          <h3>Quick Actions</h3>
          <div className="flex gap-5 mt-5 flex-wrap">
            <Link to="/business/pos" className="btn btn-primary">
              Lookup / Register Customers
            </Link>
            <Link to="/business/offers" className="btn btn-secondary">
              Manage Offers
            </Link>
            <Link to="/business/upload" className="btn btn-primary">
              Upload Transactions
            </Link>
            <Link to="/business/transactions" className="btn btn-secondary">
              View Transactions
            </Link>
          </div>
        </div>

        {analytics && (
          <div className="card">
            <h3>Analytics</h3>
            <div className="flex gap-10 flex-wrap mt-3">
              <div>
                <strong>Total Customers</strong>
                <p>{analytics.total_customers}</p>
              </div>
              <div>
                <strong>Points Issued</strong>
                <p>{analytics.points_issued}</p>
              </div>
              <div>
                <strong>Points Redeemed</strong>
                <p>{analytics.points_redeemed}</p>
              </div>
              <div>
                <strong>Total Redemptions</strong>
                <p>{analytics.redemptions_count}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BusinessDashboard;

