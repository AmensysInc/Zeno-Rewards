import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/shared/Navbar';
import Card from '../../components/shared/Card';
import { users, transactions, offers } from '../../data/mockData';

function OrganizationDashboard() {
  const { currentUser } = useAuth();

  // Calculate organization-wide statistics
  const totalCustomers = users.length;
  const totalTransactions = transactions.length;
  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalPointsDistributed = users.reduce((sum, u) => sum + u.points, 0);
  const activeOffers = offers.filter(o => o.active).length;

  // Recent activity
  const recentTransactions = transactions.slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome, {currentUser?.name}! 🏢
          </h1>
          <p className="text-gray-600">Organization-wide Overview & Analytics</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Total Locations</h3>
            <p className="text-4xl font-bold">{currentUser?.totalLocations}</p>
            <p className="text-sm mt-2 opacity-90">Across the region</p>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
            <p className="text-4xl font-bold">${currentUser?.totalRevenue?.toLocaleString()}</p>
            <p className="text-sm mt-2 opacity-90">All-time earnings</p>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Total Customers</h3>
            <p className="text-4xl font-bold">{totalCustomers}</p>
            <p className="text-sm mt-2 opacity-90">Active members</p>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Total Transactions</h3>
            <p className="text-4xl font-bold">{totalTransactions}</p>
            <p className="text-sm mt-2 opacity-90">Completed services</p>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Rewards Program</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Points Distributed</span>
                <span className="text-2xl font-bold text-purple-600">{totalPointsDistributed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Offers</span>
                <span className="text-2xl font-bold text-blue-600">{activeOffers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Points/Customer</span>
                <span className="text-2xl font-bold text-green-600">
                  {Math.round(totalPointsDistributed / totalCustomers)}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Revenue Insights</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">This Month</span>
                <span className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Transaction</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${(totalRevenue / totalTransactions).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Revenue/Customer</span>
                <span className="text-2xl font-bold text-purple-600">
                  ${(totalRevenue / totalCustomers).toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 bg-purple-100 hover:bg-purple-200 rounded-lg transition text-purple-800 font-semibold">
                📊 View Reports
              </button>
              <button className="w-full text-left px-4 py-3 bg-blue-100 hover:bg-blue-200 rounded-lg transition text-blue-800 font-semibold">
                👥 Manage Users
              </button>
              <button className="w-full text-left px-4 py-3 bg-green-100 hover:bg-green-200 rounded-lg transition text-green-800 font-semibold">
                🎁 Create Offer
              </button>
            </div>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Service</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Points</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50 transition">
                    <td className="py-3 px-4 text-gray-700">{transaction.date}</td>
                    <td className="py-3 px-4 text-gray-800 font-medium">{transaction.userName}</td>
                    <td className="py-3 px-4 text-gray-700">{transaction.service}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        transaction.type === 'wash'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700 font-semibold">
                      ${transaction.amount.toFixed(2)}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold ${
                      transaction.pointsEarned > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.pointsEarned > 0 ? '+' : ''}{transaction.pointsEarned}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Customers */}
        <Card className="mt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Top Customers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {users
              .sort((a, b) => b.totalSpent - a.totalSpent)
              .slice(0, 4)
              .map((user, index) => (
                <div
                  key={user.id}
                  className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-purple-600">#{index + 1}</span>
                    <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                      {user.points} pts
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">{user.name}</h3>
                  <p className="text-sm text-gray-600">Total Spent: ${user.totalSpent}</p>
                  <p className="text-xs text-gray-500 mt-1">Member since {user.memberSince}</p>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default OrganizationDashboard;
