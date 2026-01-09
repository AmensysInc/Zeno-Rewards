import React, { useState, useEffect } from 'react';
import { listEarningRules, createEarningRule, getPointsLedger, getPointBalances } from '../services/api';
import BusinessLayout from '../components/BusinessLayout';

function PointsPage() {
  const [rules, setRules] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [balances, setBalances] = useState([]);
  const [ruleName, setRuleName] = useState('');
  const [pointsAwarded, setPointsAwarded] = useState('');
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [activeSection, setActiveSection] = useState('ledger');
  const [loading, setLoading] = useState(false);

  const loadRules = async () => {
    setError('');
    try {
      const res = await listEarningRules();
      setRules(res.data || []);
    } catch (err) {
      setError('Failed to load points rules');
    }
  };

  const loadLedger = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPointsLedger(null, 100, 0);
      setLedger(res.data || []);
    } catch (err) {
      setError('Failed to load points ledger');
    } finally {
      setLoading(false);
    }
  };

  const loadBalances = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPointBalances();
      setBalances(res.data || []);
    } catch (err) {
      setError('Failed to load point balances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
    if (activeSection === 'ledger') {
      loadLedger();
    } else if (activeSection === 'balances') {
      loadBalances();
    }
  }, [activeSection]);

  const handleCreateRegistrationRule = async (e) => {
    e.preventDefault();
    setError('');
    setStatusMsg('');

    if (!pointsAwarded) {
      setError('Points awarded is required');
      return;
    }

    try {
      await createEarningRule({
        rule_name: 'Registration Bonus',
        rule_type: 'bonus',
        points_awarded: parseInt(pointsAwarded, 10),
        conditions: JSON.stringify({ type: 'registration' })
      });
      setStatusMsg('Registration points rule created successfully!');
      setPointsAwarded('');
      await loadRules();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create rule');
    }
  };

  const handleCreateCategoryRule = async (e) => {
    e.preventDefault();
    setError('');
    setStatusMsg('');

    if (!ruleName || !pointsAwarded) {
      setError('Category name and points are required');
      return;
    }

    try {
      await createEarningRule({
        rule_name: ruleName,
        rule_type: 'per_service',
        points_awarded: parseInt(pointsAwarded, 10),
        conditions: JSON.stringify({ service_type: ruleName.toLowerCase().replace(/\s+/g, '_') })
      });
      setStatusMsg('Category points rule created successfully!');
      setRuleName('');
      setPointsAwarded('');
      await loadRules();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create rule');
    }
  };

  const washCategories = [
    { name: 'Basic Wash', defaultPoints: 10 },
    { name: 'Standard Wash', defaultPoints: 20 },
    { name: 'Premium Wash', defaultPoints: 30 },
    { name: 'Deluxe Wash', defaultPoints: 50 },
  ];

  const registrationRule = rules.find(r => 
    r.rule_type === 'bonus' && 
    r.conditions && 
    JSON.parse(r.conditions || '{}').type === 'registration'
  );

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const getRewardTypeLabel = (type) => {
    const labels = {
      'POINTS': 'Points',
      'DISCOUNT_PERCENT': 'Discount %',
      'FREE_MONTH': 'Free Month'
    };
    return labels[type] || type;
  };

  return (
    <BusinessLayout>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex gap-4 mb-6 border-b border-gray-300">
            <button
              className={`px-4 py-2 font-medium ${activeSection === 'ledger' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              type="button"
              onClick={() => setActiveSection('ledger')}
            >
              Points Ledger
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeSection === 'balances' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              type="button"
              onClick={() => setActiveSection('balances')}
            >
              Point Balances
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeSection === 'registration' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              type="button"
              onClick={() => setActiveSection('registration')}
            >
              Registration Points
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeSection === 'categories' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              type="button"
              onClick={() => setActiveSection('categories')}
            >
              Category Points
            </button>
          </div>

          {activeSection === 'ledger' && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Points Ledger</h2>
              <p className="text-gray-600 mb-4">Complete history of all point transactions.</p>
              
              {loading ? (
                <p className="text-gray-600">Loading ledger...</p>
              ) : ledger.length === 0 ? (
                <p className="text-gray-600">No ledger entries found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rule ID</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {ledger.map((entry) => (
                        <tr key={entry.points_id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(entry.created_at)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.customer_id || entry.member_id || '-'}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${entry.points_earned >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {entry.points_earned >= 0 ? '+' : ''}{entry.points_earned}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getRewardTypeLabel(entry.reward_type_applied)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.transaction_id ? entry.transaction_id.substring(0, 8) + '...' : '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.rule_id ? entry.rule_id.substring(0, 8) + '...' : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {activeSection === 'balances' && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Point Balances</h2>
              <p className="text-gray-600 mb-4">Current point balances for all customers.</p>
              
              {loading ? (
                <p className="text-gray-600">Loading balances...</p>
              ) : balances.length === 0 ? (
                <p className="text-gray-600">No balances found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Points</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {balances.map((balance) => (
                        <tr key={balance.customer_id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{balance.customer_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">{balance.total_points}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(balance.last_updated_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {activeSection === 'registration' && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Registration Bonus Points</h2>
              <p className="text-gray-600 mb-4">Set the points awarded when a new customer registers.</p>
              
              {registrationRule ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded mb-5">
                  <p><strong>Current Setting:</strong> {registrationRule.points_awarded} points for registration</p>
                  <p className="text-sm text-gray-600">To change, create a new rule (this will update the default).</p>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded mb-5">
                  <p>No registration points rule set yet. Default is 5 points.</p>
                </div>
              )}

              <form onSubmit={handleCreateRegistrationRule} className="max-w-md">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Points for Registration *</label>
                  <input
                    type="number"
                    value={pointsAwarded}
                    onChange={(e) => setPointsAwarded(e.target.value)}
                    placeholder="e.g., 5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <small className="text-gray-600">Points awarded when a customer registers</small>
                </div>
                {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">{error}</div>}
                {statusMsg && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">{statusMsg}</div>}
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Save Registration Points
                </button>
              </form>
            </>
          )}

          {activeSection === 'categories' && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Points by Car Wash Category</h2>
              <p className="text-gray-600 mb-4">Set points awarded for different car wash service types.</p>

              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Setup - Common Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {washCategories.map((cat) => {
                    const existingRule = rules.find(r => 
                      r.rule_name === cat.name || 
                      (r.conditions && JSON.parse(r.conditions || '{}').service_type === cat.name.toLowerCase().replace(/\s+/g, '_'))
                    );
                    return (
                      <div key={cat.name} className="p-4 border border-gray-300 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">{cat.name}</h4>
                        {existingRule ? (
                          <p className="text-sm text-gray-600 mb-3"><strong>Current:</strong> {existingRule.points_awarded} points</p>
                        ) : (
                          <p className="text-sm text-gray-600 mb-3">Not set (Suggested: {cat.defaultPoints} points)</p>
                        )}
                        <button
                          className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                          onClick={async () => {
                            setRuleName(cat.name);
                            setPointsAwarded(cat.defaultPoints.toString());
                            try {
                              await createEarningRule({
                                rule_name: cat.name,
                                rule_type: 'per_service',
                                points_awarded: cat.defaultPoints,
                                conditions: JSON.stringify({ service_type: cat.name.toLowerCase().replace(/\s+/g, '_') })
                              });
                              setStatusMsg(`${cat.name} rule created with ${cat.defaultPoints} points!`);
                              await loadRules();
                            } catch (err) {
                              setError(err.response?.data?.detail || 'Failed to create rule');
                            }
                          }}
                        >
                          Set to {cat.defaultPoints} Points
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-gray-300 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create Custom Category</h3>
                <form onSubmit={handleCreateCategoryRule} className="max-w-md">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
                    <input
                      type="text"
                      value={ruleName}
                      onChange={(e) => setRuleName(e.target.value)}
                      placeholder="e.g., Premium Wash"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Points Awarded *</label>
                    <input
                      type="number"
                      value={pointsAwarded}
                      onChange={(e) => setPointsAwarded(e.target.value)}
                      placeholder="e.g., 20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">{error}</div>}
                  {statusMsg && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">{statusMsg}</div>}
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Create Category Rule
                  </button>
                </form>
              </div>

              <div className="mt-10 border-t border-gray-300 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">All Category Rules</h3>
                {rules.filter(r => r.rule_type === 'per_service').length === 0 ? (
                  <p className="text-gray-600">No category rules created yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {rules.filter(r => r.rule_type === 'per_service').map((rule) => (
                          <tr key={rule.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rule.rule_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rule.points_awarded}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rule.active ? 'Active' : 'Inactive'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
    </BusinessLayout>
  );
}

export default PointsPage;
