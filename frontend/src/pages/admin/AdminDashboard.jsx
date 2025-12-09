import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar';
import Card from '../../components/shared/Card';
import StatsCard from '../../components/shared/StatsCard';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';

function AdminDashboard() {
  const [recentUploads, setRecentUploads] = useState([]);
  const [uploadedTransactions, setUploadedTransactions] = useState([]);

  // Load data from localStorage
  useEffect(() => {
    const uploads = JSON.parse(localStorage.getItem('uploads') || '[]');
    const transactions = JSON.parse(localStorage.getItem('uploadedTransactions') || '[]');
    setRecentUploads(uploads);
    setUploadedTransactions(transactions);
  }, []);

  // Calculate stats from uploaded data
  const totalTransactions = uploadedTransactions.length;
  
  // Calculate total revenue
  const totalRevenue = uploadedTransactions.reduce((sum, t) => {
    const amount = t['Total $'] || t['Sales Dollars'] || 0;
    return sum + (parseFloat(amount) || 0);
  }, 0);

  // Count unique customers
  const uniqueCustomers = new Set(
    uploadedTransactions.map(t => t['Customer Code'] || t['Customer Name'])
      .filter(Boolean)
  ).size;

  const handleDeleteUpload = (id) => {
    if (window.confirm('Are you sure you want to delete this upload?')) {
      const uploads = JSON.parse(localStorage.getItem('uploads') || '[]');
      const updatedUploads = uploads.filter(upload => upload.id !== id);
      localStorage.setItem('uploads', JSON.stringify(updatedUploads));
      setRecentUploads(updatedUploads);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Business Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Cards - Using StatsCard Component */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Customers"
            value={uniqueCustomers}
            icon="👥"
            color="blue"
          />
          <StatsCard
            title="Total Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            icon="💰"
            color="green"
          />
          <StatsCard
            title="Transactions"
            value={totalTransactions}
            icon="📊"
            color="purple"
          />
          <StatsCard
            title="Uploads"
            value={recentUploads.length}
            icon="📤"
            color="orange"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/business/upload-transactions">
              <Card className="hover:shadow-lg transition duration-200 cursor-pointer text-center bg-orange-50">
                <div className="text-4xl mb-2">📤</div>
                <h3 className="font-semibold text-gray-800">Upload Transactions</h3>
                <p className="text-sm text-gray-600">Import transaction data</p>
              </Card>
            </Link>

            <Link to="/business/transactions">
              <Card className="hover:shadow-lg transition duration-200 cursor-pointer text-center bg-green-50">
                <div className="text-4xl mb-2">💳</div>
                <h3 className="font-semibold text-gray-800">Transactions</h3>
                <p className="text-sm text-gray-600">View all transactions</p>
              </Card>
            </Link>

            <Link to="/business/offers">
              <Card className="hover:shadow-lg transition duration-200 cursor-pointer text-center bg-blue-50">
                <div className="text-4xl mb-2">🎁</div>
                <h3 className="font-semibold text-gray-800">Manage Offers</h3>
                <p className="text-sm text-gray-600">Create & edit rewards</p>
              </Card>
            </Link>

            <Link to="/business/users">
              <Card className="hover:shadow-lg transition duration-200 cursor-pointer text-center bg-purple-50">
                <div className="text-4xl mb-2">👥</div>
                <h3 className="font-semibold text-gray-800">Manage Users</h3>
                <p className="text-sm text-gray-600">Add & manage customers</p>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Uploads - Using Badge Component */}
        {recentUploads.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Uploads</h2>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Description</th>
                      <th className="text-left py-3 px-4">Count</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUploads.map((upload) => (
                      <tr key={upload.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{upload.date}</td>
                        <td className="py-3 px-4">{upload.description}</td>
                        <td className="py-3 px-4">{upload.count} records</td>
                        <td className="py-3 px-4">
                          <Badge variant="success">{upload.status}</Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteUpload(upload.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Recent Transactions - Using Badge Component */}
        {uploadedTransactions.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Transactions</h2>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4">Sale ID</th>
                      <th className="text-left py-3 px-4">Customer Name</th>
                      <th className="text-left py-3 px-4">Site</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Created</th>
                      <th className="text-right py-3 px-4">Total $</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedTransactions.slice(0, 10).map((transaction, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{transaction['Sale ID']}</td>
                        <td className="py-3 px-4">{transaction['Customer Name'] || '-'}</td>
                        <td className="py-3 px-4">{transaction['Site'] || '-'}</td>
                        <td className="py-3 px-4">
                          <Badge variant="info">{transaction['Status'] || '-'}</Badge>
                        </td>
                        <td className="py-3 px-4">{transaction['Created'] || '-'}</td>
                        <td className="py-3 px-4 text-right">
                          ${parseFloat(transaction['Total $'] || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Transactions Yet</h3>
            <p className="text-gray-600 mb-4">Upload an Excel file to see transactions here</p>
            <Link to="/business/upload-transactions">
              <Button variant="primary" size="lg">
                Upload Transactions
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;