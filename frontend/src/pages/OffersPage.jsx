import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { listOffers, listOffersByStatus, createOffer } from '../services/api';

function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [rewardName, setRewardName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('25.00');
  const [costInPoints, setCostInPoints] = useState('100');
  const [status, setStatus] = useState('Active');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [activeTab, setActiveTab] = useState('create');
  const navigate = useNavigate();

  const loadOffers = async () => {
    setError('');
    try {
      let res;
      if (activeTab === 'active') {
        res = await listOffersByStatus('Active');
      } else if (activeTab === 'expired') {
        res = await listOffersByStatus('Expired');
      } else {
        res = await listOffers();
      }
      setOffers(res.data || []);
    } catch (err) {
      setError('Failed to load offers');
    }
  };

  useEffect(() => {
    if (activeTab !== 'create') {
      loadOffers();
    }
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleReset = () => {
    setRewardName('');
    setCategory('');
    setPrice('25.00');
    setCostInPoints('100');
    setStatus('Active');
    setStartDate('');
    setEndDate('');
    setError('');
    setStatusMsg('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setStatusMsg('');

    if (!rewardName || !category || !price || !costInPoints || !startDate || !endDate) {
      setError('All required fields must be filled');
      return;
    }

    try {
      const startDateObj = startDate ? new Date(startDate) : null;
      const endDateObj = endDate ? new Date(endDate) : null;
      
      await createOffer(
        rewardName,
        category,
        parseFloat(price),
        parseInt(costInPoints, 10),
        status,
        startDateObj ? startDateObj.toISOString() : null,
        endDateObj ? endDateObj.toISOString() : null,
        null
      );
      
      setStatusMsg('Reward created successfully!');
      handleReset();
      
      if (activeTab === 'create') {
        setActiveTab('active');
      }
      await loadOffers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create reward');
    }
  };

  const isExpired = (offer) => {
    if (!offer.expiry_date) return false;
    return new Date(offer.expiry_date) < new Date();
  };

  const filteredOffers = activeTab === 'active' 
    ? offers.filter(o => o.status === 'Active' && !isExpired(o))
    : activeTab === 'expired'
    ? offers.filter(o => isExpired(o) || o.status === 'Inactive')
    : offers;

  return (
    <div>
      <div className="navbar">
        <h1>Offers & Rewards</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="container">
        <div className="nav-tabs">
          <Link to="/business/dashboard" className="nav-tab no-underline">Dashboard</Link>
          <Link to="/business/pos" className="nav-tab no-underline">Customers</Link>
          <Link to="/business/offers" className="nav-tab active no-underline">Offers</Link>
          <Link to="/business/points" className="nav-tab no-underline">Points</Link>
          <Link to="/business/upload" className="nav-tab no-underline">Upload Transactions</Link>
          <Link to="/business/transactions" className="nav-tab no-underline">Transactions</Link>
        </div>

        <div className="card">
          <div className="nav-tabs mb-5 border-b-2 border-gray-300">
            <button
              className={`nav-tab ${activeTab === 'create' ? 'active' : ''} border-none bg-transparent cursor-pointer`}
              type="button"
              onClick={() => setActiveTab('create')}
            >
              Create Offers
            </button>
            <button
              className={`nav-tab ${activeTab === 'active' ? 'active' : ''} border-none bg-transparent cursor-pointer`}
              type="button"
              onClick={() => setActiveTab('active')}
            >
              Active Offers
            </button>
            <button
              className={`nav-tab ${activeTab === 'expired' ? 'active' : ''} border-none bg-transparent cursor-pointer`}
              type="button"
              onClick={() => setActiveTab('expired')}
            >
              Expired Offers
            </button>
          </div>

          {activeTab === 'create' && (
            <>
              <h2>Create New Reward</h2>
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label>Reward Name *</label>
                  <input
                    type="text"
                    value={rewardName}
                    onChange={(e) => setRewardName(e.target.value)}
                    placeholder="e.g., Free Premium Wash"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Car Wash Service"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="25.00"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Cost in Points *</label>
                  <input
                    type="number"
                    value={costInPoints}
                    onChange={(e) => setCostInPoints(e.target.value)}
                    placeholder="100"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-2 rounded border border-gray-300"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
                {error && <div className="error mt-2">{error}</div>}
                {statusMsg && <div className="success mt-2">{statusMsg}</div>}
                <div className="flex gap-2 mt-5 justify-end">
                  <button type="button" className="btn btn-secondary" onClick={handleReset}>
                    Reset
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Reward
                  </button>
                </div>
              </form>
            </>
          )}

          {activeTab !== 'create' && (
            <>
              <h2>{activeTab === 'active' ? 'Active Offers' : 'Expired Offers'}</h2>
              {filteredOffers.length === 0 ? (
                <p>No {activeTab === 'active' ? 'active' : 'expired'} offers found.</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Reward Name</th>
                      <th>Category</th>
                      <th>Price ($)</th>
                      <th>Cost in Points</th>
                      <th>Status</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOffers.map((offer) => (
                      <tr key={offer.id}>
                        <td>{offer.title}</td>
                        <td>{offer.category || '-'}</td>
                        <td>${parseFloat(offer.price || 0).toFixed(2)}</td>
                        <td>{offer.points_required}</td>
                        <td>{offer.status}</td>
                        <td>{offer.start_date ? new Date(offer.start_date).toLocaleDateString() : '-'}</td>
                        <td>{offer.expiry_date ? new Date(offer.expiry_date).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default OffersPage;

