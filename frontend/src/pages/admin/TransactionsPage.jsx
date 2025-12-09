import { useState, useEffect } from 'react';
import Navbar from '../../components/shared/Navbar';
import Card from '../../components/shared/Card';
import StatsCard from '../../components/shared/StatsCard';
import Input from '../../components/shared/Input';
import Table from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import { Link } from 'react-router-dom';

function TransactionsPage() {
  const [uploadedTransactions, setUploadedTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Load uploaded transactions
  useEffect(() => {
    const transactions = JSON.parse(localStorage.getItem('uploadedTransactions') || '[]');
    console.log('Loaded transactions:', transactions.length);
    setUploadedTransactions(transactions);
  }, []);

  // Get columns from uploaded data
  const columns = uploadedTransactions.length > 0 
    ? Object.keys(uploadedTransactions[0]).map(key => ({
        key: key,
        label: key,
        align: key === 'Total $' || key === 'Sales Dollars' ? 'right' : 'left'
      }))
    : [];

  // Filter transactions by search
  const filteredTransactions = uploadedTransactions.filter(transaction => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return Object.values(transaction).some(value => 
      String(value).toLowerCase().includes(searchLower)
    );
  });

  // Calculate stats
  const totalRevenue = uploadedTransactions.reduce((sum, t) => {
    const amount = t['Total $'] || t['Sales Dollars'] || 0;
    return sum + (parseFloat(amount) || 0);
  }, 0);

  const totalSales = uploadedTransactions.reduce((sum, t) => {
    const amount = t['Sales Dollars'] || 0;
    return sum + (parseFloat(amount) || 0);
  }, 0);

  const totalUpsells = uploadedTransactions.reduce((sum, t) => {
    const amount = t['Upsell Dollars'] || 0;
    return sum + (parseFloat(amount) || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Transactions</h1>
          <p className="text-gray-600">View and manage all transactions</p>
        </div>

        {uploadedTransactions.length === 0 ? (
          /* Empty State */
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
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatsCard
                title="Total Revenue"
                value={`$${totalRevenue.toFixed(2)}`}
                icon="💰"
                color="green"
              />
              <StatsCard
                title="Sales Dollars"
                value={`$${totalSales.toFixed(2)}`}
                icon="💵"
                color="blue"
              />
              <StatsCard
                title="Upsell Dollars"
                value={`$${totalUpsells.toFixed(2)}`}
                icon="📈"
                color="purple"
              />
            </div>

            {/* Search */}
            <Card className="mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full">
                  <Input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="text-sm text-gray-600 whitespace-nowrap">
                  Showing {filteredTransactions.length} of {uploadedTransactions.length} transactions
                </div>
              </div>
            </Card>

            {/* Transactions Table */}
            <Card>
              <Table
                columns={columns}
                data={filteredTransactions}
                emptyMessage="No transactions match your search"
              />
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default TransactionsPage;