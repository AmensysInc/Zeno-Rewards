import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { uploadTransactionsPreview, approveTransactions } from '../services/api';
import './UploadPage.css';

function UploadPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [approved, setApproved] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setPreview([]);
    setApproved([]);
    setError('');
  };

  const handlePreview = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await uploadTransactionsPreview(file);
      setPreview(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to preview transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (preview.length === 0) {
      setError('No transactions to approve');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await approveTransactions(preview);
      setApproved([...approved, ...response.data]);
      setPreview([]);
      setFile(null);
      // Reset file input
      document.getElementById('file-input').value = '';
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to approve transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div>
      <div className="navbar">
        <h1>Upload Transactions</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="container">
        <div className="nav-tabs">
          <Link to="/business/dashboard" className="nav-tab" style={{ textDecoration: 'none' }}>
            Dashboard
          </Link>
          <Link to="/business/upload" className="nav-tab active" style={{ textDecoration: 'none' }}>
            Upload Transactions
          </Link>
          <Link to="/business/transactions" className="nav-tab" style={{ textDecoration: 'none' }}>
            Transactions
          </Link>
        </div>

        <div className="card">
          <h2>Upload Transaction File</h2>
          <p>Upload an Excel (.xlsx, .xls) or CSV file with columns: phone_number, license_plate, date, description (optional), quantity (optional), amount (optional)</p>
          
          <div className="form-group" style={{ marginTop: '20px' }}>
            <label>Select File</label>
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
            />
          </div>

          {file && (
            <div style={{ marginTop: '20px' }}>
              <p>Selected: {file.name}</p>
              <button className="btn btn-primary" onClick={handlePreview} disabled={loading}>
                {loading ? 'Processing...' : 'Preview'}
              </button>
            </div>
          )}

          {error && <div className="error" style={{ marginTop: '20px' }}>{error}</div>}
        </div>

        {preview.length > 0 && (
          <div className="card">
            <h2>Preview Transactions ({preview.length})</h2>
            <p>Review the transactions below and click Approve to save them.</p>
            <button className="btn btn-success" onClick={handleApprove} disabled={loading} style={{ marginBottom: '20px' }}>
              {loading ? 'Approving...' : 'Approve All'}
            </button>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Phone Number</th>
                  <th>License Plate</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((trans, index) => (
                  <tr key={index}>
                    <td>{new Date(trans.date).toLocaleDateString()}</td>
                    <td>{trans.phone_number}</td>
                    <td>{trans.license_plate}</td>
                    <td>{trans.description || '-'}</td>
                    <td>{trans.quantity}</td>
                    <td>${parseFloat(trans.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {approved.length > 0 && (
          <div className="card">
            <h2>Approved Transactions ({approved.length})</h2>
            <p>These transactions have been saved. View them in the Transactions page.</p>
            <div style={{ marginTop: '20px' }}>
              {approved.map((trans, index) => (
                <div key={index} style={{ padding: '10px', marginBottom: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
                  <strong>Date:</strong> {new Date(trans.date).toLocaleDateString()} | 
                  <strong> Phone:</strong> {trans.phone_number} | 
                  <strong> License:</strong> {trans.license_plate} | 
                  <strong> Description:</strong> {trans.description || '-'} | 
                  <strong> Quantity:</strong> {trans.quantity}
                </div>
              ))}
            </div>
            <Link to="/business/transactions" className="btn btn-primary" style={{ marginTop: '20px' }}>
              View All Transactions
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadPage;

