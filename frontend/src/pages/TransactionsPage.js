import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getTransactions, getTransactionSummary } from '../services/api';
import './TransactionsPage.css';

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState([]);
  const [filterPhone, setFilterPhone] = useState('');
  const [filterLicense, setFilterLicense] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'summary'
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
          <Link to="/business/dashboard" className="nav-tab" style={{ textDecoration: 'none' }}>
            Dashboard
          </Link>
          <Link to="/business/upload" className="nav-tab" style={{ textDecoration: 'none' }}>
            Upload Transactions
          </Link>
          <Link to="/business/transactions" className="nav-tab active" style={{ textDecoration: 'none' }}>
            Transactions
          </Link>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Transactions</h2>
            <div>
              <button
                className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('list')}
                style={{ marginRight: '10px' }}
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
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Filter by Phone Number</label>
                  <input
                    type="text"
                    value={filterPhone}
                    onChange={(e) => setFilterPhone(e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Filter by License Plate</label>
                  <input
                    type="text"
                    value={filterLicense}
                    onChange={(e) => setFilterLicense(e.target.value)}
                    placeholder="Enter license plate"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button className="btn btn-primary" onClick={handleFilter}>
                    Filter
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="loading">Loading...</div>
              ) : transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p>No transactions found. Upload transactions to get started.</p>
                  <Link to="/business/upload" className="btn btn-primary" style={{ marginTop: '20px' }}>
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
                          <span style={{ color: trans.is_approved ? '#28a745' : '#ffc107' }}>
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
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p>No transaction summary available. Upload and approve transactions to see summaries.</p>
                  <Link to="/business/upload" className="btn btn-primary" style={{ marginTop: '20px' }}>
                    Upload Transactions
                  </Link>
                </div>
              ) : (
                summary.map((item, index) => (
                  <div key={index} className="card" style={{ marginBottom: '20px' }}>
                    <h3>Phone: {item.phone_number} | License: {item.license_plate}</h3>
                    <p><strong>Total Transactions:</strong> {item.total_transactions}</p>
                    <p><strong>Total Quantity:</strong> {item.total_quantity}</p>
                    <p><strong>Total Amount:</strong> ${item.total_amount.toFixed(2)}</p>
                    <details style={{ marginTop: '10px' }}>
                      <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>View Transactions</summary>
                      <table className="table" style={{ marginTop: '10px' }}>
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

