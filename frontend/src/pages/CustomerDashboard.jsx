import React, { useState, useEffect } from 'react';
import CustomerLayout from '../components/CustomerLayout';
import { getCustomerDashboard, getCustomerRedeemableOffers, redeemCustomerOffer } from '../services/api';

function CustomerDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [redeemableOffers, setRedeemableOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    loadDashboard();
    loadRedeemableOffers();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCustomerDashboard();
      setDashboardData(data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRedeemableOffers = async () => {
    try {
      const offers = await getCustomerRedeemableOffers();
      setRedeemableOffers(offers || []);
    } catch (err) {
      console.error('Failed to load redeemable offers', err);
      setRedeemableOffers([]);
    }
  };

  const handleRedeem = async (redeemableOfferId) => {
    if (redeeming) return;
    
    try {
      setRedeeming(true);
      await redeemCustomerOffer(redeemableOfferId);
      // Reload offers after redemption
      await loadRedeemableOffers();
      alert('Offer marked for redemption! It will be applied on your next (5th) transaction.');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to redeem offer');
      console.error(err);
    } finally {
      setRedeeming(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="text-center py-8">Loading dashboard...</div>
      </CustomerLayout>
    );
  }

  if (error) {
    return (
      <CustomerLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </CustomerLayout>
    );
  }

  if (!dashboardData) {
    return (
      <CustomerLayout>
        <div className="text-center py-8">No data available</div>
      </CustomerLayout>
    );
  }

  const { customer, points, transaction_count, offers_count, transactions } = dashboardData || {};
  const recent_transactions = transactions || [];
  
  // Ensure all values have defaults
  const safeCustomer = customer || {};
  const safePoints = points || 0;
  const safeTransactionCount = transaction_count || 0;
  const safeOffersCount = offers_count || 0;

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {safeCustomer.name || safeCustomer.email || 'Customer'}!</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Points</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{safePoints}</p>
              </div>
              <div className="text-4xl">⭐</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Visits</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{safeTransactionCount}</p>
              </div>
              <div className="text-4xl">🚗</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Offers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{safeOffersCount}</p>
              </div>
              <div className="text-4xl">🎁</div>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-base font-medium text-gray-900">{safeCustomer.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-base font-medium text-gray-900">{safeCustomer.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-base font-medium text-gray-900">{safeCustomer.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Membership Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                safeCustomer.is_member
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {safeCustomer.is_member ? 'Member' : 'Non-Member'}
              </span>
            </div>
            {safeCustomer.membership_id && (
              <div>
                <p className="text-sm text-gray-600">Membership ID</p>
                <p className="text-base font-medium text-gray-900">{safeCustomer.membership_id}</p>
              </div>
            )}
          </div>
        </div>

        {/* Redeemable Offers - Show after 4 washes */}
        {redeemableOffers.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🎉 Special Offer Available!</h2>
            <p className="text-sm text-gray-600 mb-4">
              You've completed {safeTransactionCount} wash{es}. You're eligible for a special reward on your next (5th) wash!
            </p>
            <div className="space-y-3">
              {redeemableOffers.map((offer) => (
                <div key={offer.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {offer.customer_type === 'MEMBER' 
                          ? 'Member 5th Wash - 20% Discount'
                          : 'Non-Member 5th Wash Free'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {offer.customer_type === 'MEMBER'
                          ? 'Get 20% discount on your 5th car wash'
                          : 'Get your 5th car wash completely free'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRedeem(offer.id)}
                      disabled={redeeming || offer.is_redeemed}
                      className={`ml-4 px-4 py-2 rounded-md font-medium text-sm ${
                        offer.is_redeemed
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50'
                      }`}
                    >
                      {offer.is_redeemed ? 'Redeemed' : redeeming ? 'Processing...' : 'Redeem Now'}
                    </button>
                  </div>
                  {offer.is_redeemed && (
                    <p className="text-xs text-gray-500 mt-2">
                      This offer will be applied on your next transaction
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          {!recent_transactions || recent_transactions.length === 0 ? (
            <p className="text-gray-500">No transactions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      License Plate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recent_transactions.map((trans) => (
                    <tr key={trans.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(trans.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {trans.description || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trans.license_plate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trans.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${parseFloat(trans.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}

export default CustomerDashboard;

