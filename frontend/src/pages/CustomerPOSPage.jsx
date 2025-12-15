import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  createBusinessCustomer,
  listBusinessCustomers,
} from '../services/api';

function CustomerPOSPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const loadCustomers = async () => {
    try {
      const res = await listBusinessCustomers();
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to load customers', err);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleRegister = async () => {
    setError('');

    if (!firstName || !phone) {
      setError('First name and phone are required');
      return;
    }

    const fullName = lastName ? `${firstName} ${lastName}` : firstName;

    setLoading(true);
    try {
      await createBusinessCustomer({ phone, name: fullName, email });
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setLicensePlate('');
      await loadCustomers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="navbar">
        <h1>Customer Registration</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="container">
        <div className="nav-tabs">
          <Link to="/business/dashboard" className="nav-tab no-underline">Dashboard</Link>
          <Link to="/business/pos" className="nav-tab active no-underline">Customers</Link>
          <Link to="/business/offers" className="nav-tab no-underline">Offers</Link>
          <Link to="/business/points" className="nav-tab no-underline">Points</Link>
          <Link to="/business/upload" className="nav-tab no-underline">Upload Transactions</Link>
          <Link to="/business/transactions" className="nav-tab no-underline">Transactions</Link>
        </div>

        <div className="card">
          <h2>Create Customer</h2>
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Customer email"
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
            />
          </div>
          <div className="form-group">
            <label>License Plate</label>
            <input
              type="text"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              placeholder="License plate (optional)"
            />
          </div>
          {error && <div className="error mt-2">{error}</div>}
          <button className="btn btn-secondary" onClick={handleRegister} disabled={loading}>
            {loading ? 'Saving...' : 'Create Customer'}
          </button>
        </div>

        <div className="card">
          <h2>Existing Customers</h2>
          {customers.length === 0 ? (
            <p>No customers registered yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.phone}</td>
                    <td>{c.email}</td>
                    <td>{c.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerPOSPage;

