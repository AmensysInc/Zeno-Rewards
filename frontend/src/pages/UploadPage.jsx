import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { uploadTransactionsPreview, approveTransactions } from '../services/api';
import BusinessLayout from '../components/BusinessLayout';

function UploadPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [approved, setApproved] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      document.getElementById('file-input').value = '';
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to approve transactions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BusinessLayout>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Transaction File</h2>
          <p>Upload an Excel (.xlsx, .xls) or CSV file with columns: phone_number, license_plate, date, description (optional), quantity (optional), amount (optional), membership_id (optional)</p>
          
          <div className="form-group mt-5">
            <label>Select File</label>
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
            />
          </div>

          {file && (
            <div className="mt-5">
              <p>Selected: {file.name}</p>
              <button className="btn btn-primary" onClick={handlePreview} disabled={loading}>
                {loading ? 'Processing...' : 'Preview'}
              </button>
            </div>
          )}

          {error && <div className="error mt-5">{error}</div>}
        </div>

        {preview.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview Transactions ({preview.length})</h2>
            <p>Review the transactions below and click Approve to save them.</p>
            <button className="btn btn-success mb-5" onClick={handleApprove} disabled={loading}>
              {loading ? 'Approving...' : 'Approve All'}
            </button>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer Code</th>
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
                    <td>{trans.customer_code || '-'}</td>
                    <td>{trans.phone_number}</td>
                    <td>{trans.license_plate || '-'}</td>
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Approved Transactions ({approved.length})</h2>
            <p>These transactions have been saved. View them in the Transactions page.</p>
            <div className="mt-5">
              {approved.map((trans, index) => (
                <div key={index} className="p-3 mb-3 bg-gray-50 rounded">
                  <strong>Date:</strong> {new Date(trans.date).toLocaleDateString()} | 
                  <strong> Customer Code:</strong> {trans.customer_code || '-'} | 
                  <strong> Phone:</strong> {trans.phone_number} | 
                  <strong> License:</strong> {trans.license_plate || '-'} | 
                  <strong> Description:</strong> {trans.description || '-'} | 
                  <strong> Quantity:</strong> {trans.quantity}
                </div>
              ))}
            </div>
            <Link to="/business/transactions" className="btn btn-primary mt-5">
              View All Transactions
            </Link>
          </div>
        )}
    </BusinessLayout>
  );
}

export default UploadPage;

