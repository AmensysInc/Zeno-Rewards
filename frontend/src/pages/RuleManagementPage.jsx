import React, { useState } from 'react';
import BusinessLayout from '../components/BusinessLayout';
import { getFixedRules, initializeFixedRules, lookupCustomer, checkCustomerEligibility, applyRuleReward } from '../services/api';

function RuleManagementPage() {
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [fixedRules, setFixedRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedRewardOption, setSelectedRewardOption] = useState({}); // rule_id -> option

  // Load fixed rules on mount
  React.useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token');
    if (token) {
      loadFixedRules();
    } else {
      setError('Please log in to view rules');
    }
  }, []);

  const loadFixedRules = async () => {
    try {
      setError(null);
      console.log('Loading fixed rules...');
      const data = await getFixedRules();
      console.log('Loaded fixed rules:', data);
      console.log('Number of rules:', data?.length || 0);
      if (data && Array.isArray(data)) {
        setFixedRules(data);
        if (data.length > 0) {
          console.log('Rules found:', data.map(r => ({ id: r.id, name: r.name, type: r.customer_type })));
        }
      } else {
        console.warn('Expected array but got:', typeof data, data);
        setFixedRules([]);
      }
    } catch (err) {
      console.error('Failed to load fixed rules:', err);
      console.error('Error details:', err.response?.data);
      console.error('Error message:', err.message);
      console.error('Error code:', err.code);
      
      let errorMessage = 'Failed to load fixed rules: ';
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network')) {
        errorMessage += 'Cannot connect to backend server. Please check if the backend is running on http://localhost:8000';
      } else if (err.response?.status === 401) {
        errorMessage += 'Authentication required. Please log in again.';
      } else {
        errorMessage += err.response?.data?.detail || err.message || 'Unknown error';
      }
      
      setError(errorMessage);
      setFixedRules([]);
    }
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Please enter a phone number');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setCustomer(null);
      setEligibility(null);

      // Lookup customer
      const customerData = await lookupCustomer(phone);
      if (!customerData) {
        setError('Customer not found');
        setLoading(false);
        return;
      }

      setCustomer(customerData);

      // Check eligibility
      const eligibilityData = await checkCustomerEligibility(phone);
      setEligibility(eligibilityData);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to lookup customer');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyRule = async (rule) => {
    if (!customer) return;

    // For non-member rule with options, check if option is selected
    if (rule.reward_options && !selectedRewardOption[rule.rule_id]) {
      setError('Please select a reward option (Free Wash or Points)');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const rewardOption = rule.reward_options ? selectedRewardOption[rule.rule_id] : null;
      const result = await applyRuleReward(rule.rule_id, customer.id, rewardOption);

      setSuccess(result.message || 'Reward applied successfully');
      
      // Reload eligibility to refresh data
      if (phone) {
        const eligibilityData = await checkCustomerEligibility(phone);
        setEligibility(eligibilityData);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to apply rule');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRewardOptionChange = (ruleId, option) => {
    setSelectedRewardOption(prev => ({
      ...prev,
      [ruleId]: option
    }));
  };

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Rule Management</h1>

        {/* Fixed Rules Info */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Fixed Rules {fixedRules.length > 0 && `(${fixedRules.length})`}
            </h2>
            {fixedRules.length === 0 && (
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    setError(null);
                    setSuccess(null);
                    const result = await initializeFixedRules();
                    console.log('Initialize result:', result);
                    await loadFixedRules();
                    setSuccess(result.message || 'Fixed rules initialized successfully!');
                  } catch (err) {
                    console.error('Initialize error:', err);
                    setError('Failed to initialize fixed rules: ' + (err.response?.data?.detail || err.message));
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
              >
                {loading ? 'Initializing...' : 'Initialize Default Rules'}
              </button>
            )}
          </div>
          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-2 bg-gray-100 text-xs text-gray-600 rounded">
              Debug: Rules array length: {fixedRules.length}, Type: {Array.isArray(fixedRules) ? 'Array' : typeof fixedRules}
            </div>
          )}
          
          {fixedRules.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-4">No fixed rules configured.</p>
              <p className="text-sm text-gray-400">Click "Initialize Default Rules" to create the default Member and Non-Member rules.</p>
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {fixedRules.map((rule) => (
                <div key={rule.id || rule.rule_id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900">{rule.name || 'Unnamed Rule'}</h3>
                      <p className="text-sm text-gray-600 mt-1">{rule.description || 'No description'}</p>
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <span className={`px-2 py-1 rounded ${
                          rule.customer_type === 'MEMBER' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {rule.customer_type === 'MEMBER' ? 'Member' : 'Non-Member'}
                        </span>
                        <span className="text-gray-700">
                          Reward: {rule.reward_type === 'DISCOUNT_PERCENT' 
                            ? `${rule.reward_value}% Discount`
                            : rule.reward_type === 'FREE_WASH'
                              ? 'Free Wash'
                              : rule.reward_options 
                                ? `${rule.reward_value} Points or Free Wash`
                                : `${rule.reward_value} Points`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Lookup */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Lookup</h2>
          
          <form onSubmit={handleLookup} className="mb-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Enter customer phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Looking up...' : 'Lookup Customer'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {/* Customer Info */}
          {customer && (
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium text-gray-900">{customer.name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium text-gray-900">{customer.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <span className="ml-2 font-medium text-gray-900">{customer.phone}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                    customer.membership_id 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {customer.membership_id ? 'Member' : 'Non-Member'}
                  </span>
                </div>
                {customer.membership_id && (
                  <div>
                    <span className="text-gray-600">Membership ID:</span>
                    <span className="ml-2 font-medium text-gray-900">{customer.membership_id}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Eligibility & Rules */}
          {eligibility && eligibility.eligible_rules.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Eligible Rules</h3>
              {eligibility.visit_count > 0 && (
                <p className="text-sm text-gray-600 mb-3">
                  Total Visits: <span className="font-medium">{eligibility.visit_count}</span>
                  {eligibility.visit_count >= 4 && (
                    <span className="ml-2 text-green-600 font-medium">✓ Eligible for 4th wash reward!</span>
                  )}
                </p>
              )}
              
              <div className="space-y-4">
                {eligibility.eligible_rules.map((rule) => (
                  <div key={rule.rule_id} className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{rule.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                        
                        {rule.reward_options && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Select Reward:</p>
                            <div className="flex gap-3">
                              {rule.reward_options.map((option) => (
                                <label key={option} className="flex items-center">
                                  <input
                                    type="radio"
                                    name={`reward_${rule.rule_id}`}
                                    value={option}
                                    checked={selectedRewardOption[rule.rule_id] === option}
                                    onChange={() => handleRewardOptionChange(rule.rule_id, option)}
                                    className="mr-2"
                                  />
                                  <span className="text-sm text-gray-700">
                                    {option === 'FREE_WASH' ? 'Free Wash' : '20 Points'}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleApplyRule(rule)}
                        disabled={loading || (rule.reward_options && !selectedRewardOption[rule.rule_id])}
                        className="ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                      >
                        Apply Rule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {eligibility && eligibility.eligible_rules.length === 0 && (
            <div className="border border-gray-200 rounded-lg p-4 text-center text-gray-500">
              Customer is not eligible for any fixed rules at this time.
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">How to Use</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Enter customer phone number to lookup their account</li>
            <li>View customer information and membership status</li>
            <li>See which fixed rules the customer is eligible for</li>
            <li>For non-member 4th wash reward, select between Free Wash or 20 Points</li>
            <li>Click "Apply Rule" to apply the selected reward to the customer</li>
          </ul>
        </div>
      </div>
    </BusinessLayout>
  );
}

export default RuleManagementPage;
