import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getTransactions, getTransactionSummary } from '../services/api';

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState([]);
  const [filterPhone, setFilterPhone] = useState('');
  const [filterLicense, setFilterLicense] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadTransactions();
    loadSummary();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const response = await getTransactions(filterPhone || null, filterLicense || null);
      setTransactions(response.data);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await getTransactionSummary();
      setSummary(response.data);
    } catch (err) {
      console.error('Failed to load summary:', err);
    }
  };

  const handleFilter = () => {
    loadTransactions();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div>
      <div className="navbar">
        <h1>Transactions</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="container">
        <div className="nav-tabs">
          <Link to="/business/dashboard" className="nav-tab no-underline">Dashboard</Link>
          <Link to="/business/pos" className="nav-tab no-underline">Customers</Link>
          <Link to="/business/offers" className="nav-tab no-underline">Offers</Link>
          <Link to="/business/points" className="nav-tab no-underline">Points</Link>
          <Link to="/business/upload" className="nav-tab no-underline">Upload Transactions</Link>
          <Link to="/business/transactions" className="nav-tab active no-underline">Transactions</Link>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-5">
            <h2>Transactions</h2>
            <div>
              <button
                className={`btn mr-2 ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('list')}
              >
                List View
              </button>
              <button
                className={`btn ${viewMode === 'summary' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('summary')}
              >
                Summary View
              </button>
            </div>
          </div>

          {viewMode === 'list' && (
            <>
              <div className="flex gap-5 mb-5">
                <div className="form-group flex-1">
                  <label>Filter by Phone Number</label>
                  <input
                    type="text"
                    value={filterPhone}
                    onChange={(e) => setFilterPhone(e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Filter by License Plate</label>
                  <input
                    type="text"
                    value={filterLicense}
                    onChange={(e) => setFilterLicense(e.target.value)}
                    placeholder="Enter license plate"
                  />
                </div>
                <div className="flex items-end">
                  <button className="btn btn-primary" onClick={handleFilter}>
                    Filter
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="loading">Loading...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-10">
                  <p>No transactions found. Upload transactions to get started.</p>
                  <Link to="/business/upload" className="btn btn-primary mt-5">
                    Upload Transactions
                  </Link>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Phone Number</th>
                      <th>License Plate</th>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((trans) => (
                      <tr key={trans.id}>
                        <td>{new Date(trans.date).toLocaleDateString()}</td>
                        <td>{trans.phone_number}</td>
                        <td>{trans.license_plate}</td>
                        <td>{trans.description || '-'}</td>
                        <td>{trans.quantity}</td>
                        <td>${parseFloat(trans.amount).toFixed(2)}</td>
                        <td>
                          <span className={trans.is_approved ? 'text-green-600' : 'text-yellow-500'}>
                            {trans.is_approved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {viewMode === 'summary' && (
            <div>
              {summary.length === 0 ? (
                <div className="text-center py-10">
                  <p>No transaction summary available. Upload and approve transactions to see summaries.</p>
                  <Link to="/business/upload" className="btn btn-primary mt-5">
                    Upload Transactions
                  </Link>
                </div>
              ) : (
                summary.map((item, index) => (
                  <div key={index} className="card mb-5">
                    <h3>Phone: {item.phone_number} | License: {item.license_plate}</h3>
                    <p><strong>Total Transactions:</strong> {item.total_transactions}</p>
                    <p><strong>Total Quantity:</strong> {item.total_quantity}</p>
                    <p><strong>Total Amount:</strong> ${item.total_amount.toFixed(2)}</p>
                    <details className="mt-3">
                      <summary className="cursor-pointer font-semibold">View Transactions</summary>
                      <table className="table mt-3">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Quantity</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.transactions.map((trans) => (
                            <tr key={trans.id}>
                              <td>{new Date(trans.date).toLocaleDateString()}</td>
                              <td>{trans.description || '-'}</td>
                              <td>{trans.quantity}</td>
                              <td>${parseFloat(trans.amount).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </details>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TransactionsPage;

