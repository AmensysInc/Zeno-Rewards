import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { listEarningRules, createEarningRule } from '../services/api';

function PointsPage() {
  const [rules, setRules] = useState([]);
  const [ruleName, setRuleName] = useState('');
  const [pointsAwarded, setPointsAwarded] = useState('');
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [activeSection, setActiveSection] = useState('registration');
  const navigate = useNavigate();

  const loadRules = async () => {
    setError('');
    try {
      const res = await listEarningRules();
      setRules(res.data || []);
    } catch (err) {
      setError('Failed to load points rules');
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

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

  return (
    <div>
      <div className="navbar">
        <h1>Points Management</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="container">
        <div className="nav-tabs">
          <Link to="/business/dashboard" className="nav-tab no-underline">Dashboard</Link>
          <Link to="/business/pos" className="nav-tab no-underline">Customers</Link>
          <Link to="/business/offers" className="nav-tab no-underline">Offers</Link>
          <Link to="/business/points" className="nav-tab active no-underline">Points</Link>
          <Link to="/business/upload" className="nav-tab no-underline">Upload Transactions</Link>
          <Link to="/business/transactions" className="nav-tab no-underline">Transactions</Link>
        </div>

        <div className="card">
          <div className="nav-tabs mb-5 border-b-2 border-gray-300">
            <button
              className={`nav-tab ${activeSection === 'registration' ? 'active' : ''} border-none bg-transparent cursor-pointer`}
              type="button"
              onClick={() => setActiveSection('registration')}
            >
              Registration Points
            </button>
            <button
              className={`nav-tab ${activeSection === 'categories' ? 'active' : ''} border-none bg-transparent cursor-pointer`}
              type="button"
              onClick={() => setActiveSection('categories')}
            >
              Category Points
            </button>
          </div>

          {activeSection === 'registration' && (
            <>
              <h2>Registration Bonus Points</h2>
              <p>Set the points awarded when a new customer registers.</p>
              
              {registrationRule ? (
                <div className="p-4 bg-green-50 rounded mb-5">
                  <p><strong>Current Setting:</strong> {registrationRule.points_awarded} points for registration</p>
                  <p className="text-sm text-gray-600">To change, create a new rule (this will update the default).</p>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 rounded mb-5">
                  <p>No registration points rule set yet. Default is 5 points.</p>
                </div>
              )}

              <form onSubmit={handleCreateRegistrationRule}>
                <div className="form-group">
                  <label>Points for Registration *</label>
                  <input
                    type="number"
                    value={pointsAwarded}
                    onChange={(e) => setPointsAwarded(e.target.value)}
                    placeholder="e.g., 5"
                    required
                  />
                  <small className="text-gray-600">Points awarded when a customer registers</small>
                </div>
                {error && <div className="error mt-2">{error}</div>}
                {statusMsg && <div className="success mt-2">{statusMsg}</div>}
                <button type="submit" className="btn btn-primary mt-2">
                  Save Registration Points
                </button>
              </form>
            </>
          )}

          {activeSection === 'categories' && (
            <>
              <h2>Points by Car Wash Category</h2>
              <p>Set points awarded for different car wash service types.</p>

              <div className="mb-8">
                <h3>Quick Setup - Common Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  {washCategories.map((cat) => {
                    const existingRule = rules.find(r => 
                      r.rule_name === cat.name || 
                      (r.conditions && JSON.parse(r.conditions || '{}').service_type === cat.name.toLowerCase().replace(/\s+/g, '_'))
                    );
                    return (
                      <div key={cat.name} className="p-4 border border-gray-300 rounded">
                        <h4>{cat.name}</h4>
                        {existingRule ? (
                          <p><strong>Current:</strong> {existingRule.points_awarded} points</p>
                        ) : (
                          <p className="text-gray-600">Not set (Suggested: {cat.defaultPoints} points)</p>
                        )}
                        <button
                          className="btn btn-secondary mt-2 w-full"
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

              <h3>Create Custom Category</h3>
              <form onSubmit={handleCreateCategoryRule}>
                <div className="form-group">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    placeholder="e.g., Premium Wash"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Points Awarded *</label>
                  <input
                    type="number"
                    value={pointsAwarded}
                    onChange={(e) => setPointsAwarded(e.target.value)}
                    placeholder="e.g., 20"
                    required
                  />
                </div>
                {error && <div className="error mt-2">{error}</div>}
                {statusMsg && <div className="success mt-2">{statusMsg}</div>}
                <button type="submit" className="btn btn-primary mt-2">
                  Create Category Rule
                </button>
              </form>

              <div className="mt-10">
                <h3>All Category Rules</h3>
                {rules.filter(r => r.rule_type === 'per_service').length === 0 ? (
                  <p>No category rules created yet.</p>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Points</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rules.filter(r => r.rule_type === 'per_service').map((rule) => (
                        <tr key={rule.id}>
                          <td>{rule.rule_name}</td>
                          <td>{rule.points_awarded}</td>
                          <td>{rule.active ? 'Active' : 'Inactive'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PointsPage;

