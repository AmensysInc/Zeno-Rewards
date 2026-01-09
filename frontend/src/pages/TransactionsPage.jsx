import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getTransactions } from '../services/api';
import BusinessLayout from '../components/BusinessLayout';

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [filterPhone, setFilterPhone] = useState('');
  const [filterLicense, setFilterLicense] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const response = await getTransactions(
        filterPhone || null, 
        filterLicense || null,
        filterStartDate || null,
        filterEndDate || null
      );
      setTransactions(response.data || []);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    loadTransactions();
  };

  // Group transactions by customer
  // Group by: customer_id (if available), then phone_number, then name+email combination
  const groupedTransactions = useMemo(() => {
    const groups = {};
    
    transactions.forEach(trans => {
      // Determine customer key for grouping
      let customerKey;
      
      if (trans.customer_id) {
        customerKey = `customer_${trans.customer_id}`;
      } else if (trans.phone_number) {
        customerKey = `phone_${trans.phone_number}`;
      } else {
        // Fallback to phone_number as last resort
        customerKey = `phone_${trans.phone_number || 'unknown'}`;
      }
      
      if (!groups[customerKey]) {
        groups[customerKey] = {
          customerKey,
          customerId: trans.customer_id,
          phone: trans.phone_number,
          name: trans.customer_name,
          email: trans.customer_email,
          membershipId: trans.membership_id,
          transactions: []
        };
      }
      
      groups[customerKey].transactions.push(trans);
    });
    
    // Sort transactions within each group by date (newest first)
    Object.values(groups).forEach(group => {
      group.transactions.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });
    });
    
    // Convert to array and sort groups by most recent transaction
    return Object.values(groups).sort((a, b) => {
      const dateA = new Date(a.transactions[0]?.date || 0);
      const dateB = new Date(b.transactions[0]?.date || 0);
      return dateB - dateA;
    });
  }, [transactions]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const calculateGroupTotal = (transactions) => {
    const total = transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    return total.toFixed(2);
  };

  return (
    <BusinessLayout>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-gray-900">Transactions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Phone Number</label>
            <input
              type="text"
              value={filterPhone}
              onChange={(e) => setFilterPhone(e.target.value)}
              placeholder="Enter phone number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by License Plate</label>
            <input
              type="text"
              value={filterLicense}
              onChange={(e) => setFilterLicense(e.target.value)}
              placeholder="Enter license plate"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="mb-5">
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={handleFilter}
          >
            Filter
          </button>
          {(filterPhone || filterLicense || filterStartDate || filterEndDate) && (
            <button 
              className="ml-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              onClick={() => {
                setFilterPhone('');
                setFilterLicense('');
                setFilterStartDate('');
                setFilterEndDate('');
                setTimeout(loadTransactions, 100);
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : groupedTransactions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600 mb-4">No transactions found. Upload transactions to get started.</p>
            <Link to="/business/upload" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Upload Transactions
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedTransactions.map((group, groupIndex) => (
              <div key={group.customerKey} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {group.name || 'Unknown Customer'}
                      </h3>
                      <div className="mt-1 text-sm text-gray-600">
                        {group.transactions[0]?.customer_code && (
                          <span className="mr-4">Customer Code: {group.transactions[0].customer_code}</span>
                        )}
                        <span className="mr-4">Phone: {group.phone}</span>
                        {group.email && <span className="mr-4">Email: {group.email}</span>}
                        {group.membershipId && (
                          <span className="mr-4">
                            Membership ID: {group.membershipId}
                            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Member</span>
                          </span>
                        )}
                        {!group.membershipId && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">Non-Member</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Total Transactions: {group.transactions.length}</div>
                      <div className="text-lg font-semibold text-gray-900">
                        Total Amount: ${calculateGroupTotal(group.transactions)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Plate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {group.transactions.map((trans) => (
                        <tr key={trans.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(trans.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {trans.license_plate}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {trans.description || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {trans.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${parseFloat(trans.amount || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              trans.is_approved 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {trans.is_approved ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BusinessLayout>
  );
}

export default TransactionsPage;
