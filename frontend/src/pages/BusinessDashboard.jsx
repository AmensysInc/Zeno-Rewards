import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBusinessDashboard, getBusinessAnalytics } from '../services/api';
import BusinessLayout from '../components/BusinessLayout';

function BusinessDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <BusinessLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
      </BusinessLayout>
    );
  }

  return (
    <BusinessLayout>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome, {dashboardData?.business_name}</h2>
        <p className="text-gray-600">This is your business dashboard. You can manage transactions and upload data from here.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex gap-4 flex-wrap">
          <Link to="/business/pos" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Lookup / Register Customers
          </Link>
          <Link to="/business/offers" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
            Manage Offers
          </Link>
          <Link to="/business/upload" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Upload Transactions
          </Link>
          <Link to="/business/transactions" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
            View Transactions
          </Link>
        </div>
      </div>

      {analytics && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Customers</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.total_customers}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Points Issued</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.points_issued}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Points Redeemed</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.points_redeemed}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Redemptions</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.redemptions_count}</p>
            </div>
          </div>
        </div>
      )}
    </BusinessLayout>
  );
}

export default BusinessDashboard;

