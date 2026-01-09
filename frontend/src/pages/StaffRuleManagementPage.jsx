import React, { useState, useEffect } from 'react';
import StaffLayout from '../components/StaffLayout';
import { getFixedRules, initializeFixedRules, lookupCustomerRewards } from '../services/api';

function StaffRuleManagementPage() {
  const [fixedRules, setFixedRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [phone, setPhone] = useState('');
  const [customerInfo, setCustomerInfo] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      setError('');
      const rules = await getFixedRules();
      setFixedRules(rules);
      
      // Auto-initialize if no rules found
      if (rules.length === 0) {
        await handleInitialize();
      }
    } catch (err) {
      console.error('Failed to load rules', err);
      setError('Failed to load rules. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    try {
      setError('');
      setSuccess('');
      await initializeFixedRules();
      setSuccess('Default rules initialized successfully!');
      await loadRules();
    } catch (err) {
      console.error('Failed to initialize rules', err);
      setError('Failed to initialize rules. Please try again.');
    }
  };

  const handleCustomerLookup = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Please enter a phone number');
      return;
    }

    try {
      setLookupLoading(true);
      setError('');
      setSuccess('');
      const data = await lookupCustomerRewards(phone);
      setCustomerInfo(data);
      setSuccess(`Customer found: ${data.customer.name || 'N/A'}`);
    } catch (err) {
      console.error('Failed to lookup customer', err);
      setError(err.response?.data?.detail || 'Customer not found');
      setCustomerInfo(null);
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <StaffLayout>
      <div className="space-y-6">
        {/* Customer Lookup Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Lookup</h2>
          <p className="text-sm text-gray-600 mb-4">
            Search for a customer by phone number to see their rewards and available offers
          </p>
          
          <form onSubmit={handleCustomerLookup} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter customer phone number"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={lookupLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {lookupLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {customerInfo && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Name:</span>
                  <p className="text-gray-900">{customerInfo.customer.name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Phone:</span>
                  <p className="text-gray-900">{customerInfo.customer.phone}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Plan:</span>
                  <p className="text-gray-900">{customerInfo.customer.plan || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <p className="text-gray-900">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      customerInfo.is_member
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customerInfo.is_member ? 'Member' : 'Non-Member'}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Points Balance:</span>
                  <p className="text-gray-900 font-semibold">{customerInfo.points_balance}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Total Washes:</span>
                  <p className="text-gray-900">{customerInfo.transaction_count}</p>
                </div>
              </div>

              {customerInfo.redeemable_offers && customerInfo.redeemable_offers.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-2">Available Rewards:</h4>
                  <div className="space-y-2">
                    {customerInfo.redeemable_offers.map((offer) => (
                      <div
                        key={offer.id}
                        className="p-3 bg-green-50 border border-green-200 rounded-md"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-green-900">
                              {offer.reward_type === 'DISCOUNT_PERCENT'
                                ? `${offer.reward_value}% Discount`
                                : offer.reward_type === 'FREE_WASH'
                                ? 'Free Car Wash'
                                : 'Special Offer'}
                            </p>
                            <p className="text-sm text-green-700">
                              {offer.customer_type === 'MEMBER' ? 'Member Special' : 'Non-Member Special'}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-medium rounded">
                            Available
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!customerInfo.redeemable_offers || customerInfo.redeemable_offers.length === 0) && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    No redeemable offers available. Customer has completed {customerInfo.transaction_count} wash(es).
                    {customerInfo.transaction_count >= 4 && ' They may be eligible for a reward on their next visit!'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rule Management Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Rule Management</h2>
            <button
              onClick={handleInitialize}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Initialize Default Rules
            </button>
          </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
            {success}
          </div>
        )}

        {loading ? (
          <p>Loading rules...</p>
        ) : fixedRules.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No rules found.</p>
            <button
              onClick={handleInitialize}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Initialize Default Rules
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {fixedRules.map((rule) => (
              <div
                key={rule.rule_id || rule.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{rule.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Customer Type:</span> {rule.customer_type}
                      </div>
                      <div>
                        <span className="font-medium">Reward Type:</span> {rule.reward_type}
                      </div>
                      <div>
                        <span className="font-medium">Reward Value:</span> {rule.reward_value}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>{' '}
                        <span className={rule.is_active ? 'text-green-600' : 'text-red-600'}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </StaffLayout>
  );
}

export default StaffRuleManagementPage;

