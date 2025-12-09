import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/shared/Navbar';
import Card from '../../components/shared/Card';
import { Link } from 'react-router-dom';
import { transactions } from '../../data/mockData';

function CustomerDashboard() {
  const { currentUser } = useAuth();

  // Get user's recent transactions
  const userTransactions = transactions
    .filter(t => t.userId === currentUser?.id)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {currentUser?.name}! 👋
          </h1>
          <p className="text-gray-600">Member since {currentUser?.memberSince}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Total Points</h3>
            <p className="text-4xl font-bold">{currentUser?.points}</p>
            <p className="text-sm mt-2 opacity-90">Keep earning more!</p>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Total Spent</h3>
            <p className="text-4xl font-bold">${currentUser?.totalSpent}</p>
            <p className="text-sm mt-2 opacity-90">Lifetime spending</p>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Transactions</h3>
            <p className="text-4xl font-bold">{userTransactions.length}</p>
            <p className="text-sm mt-2 opacity-90">Total washes</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/customer/offers">
            <Card className="hover:shadow-lg transition duration-200 cursor-pointer text-center">
              <div className="text-4xl mb-2">🎁</div>
              <h3 className="font-semibold text-gray-800">View Offers</h3>
              <p className="text-sm text-gray-600">Check available deals</p>
            </Card>
          </Link>

          <Link to="/customer/redeem">
            <Card className="hover:shadow-lg transition duration-200 cursor-pointer text-center">
              <div className="text-4xl mb-2">💎</div>
              <h3 className="font-semibold text-gray-800">Redeem Points</h3>
              <p className="text-sm text-gray-600">Use your rewards</p>
            </Card>
          </Link>

          <Link to="/customer/transactions">
            <Card className="hover:shadow-lg transition duration-200 cursor-pointer text-center">
              <div className="text-4xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-800">History</h3>
              <p className="text-sm text-gray-600">View transactions</p>
            </Card>
          </Link>

          <Link to="/customer/profile">
            <Card className="hover:shadow-lg transition duration-200 cursor-pointer text-center">
              <div className="text-4xl mb-2">👤</div>
              <h3 className="font-semibold text-gray-800">Profile</h3>
              <p className="text-sm text-gray-600">Manage account</p>
            </Card>
          </Link>
        </div>

        {/* Recent Transactions */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Transactions</h2>
          {userTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Service</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-right py-3 px-4">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {userTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{transaction.date}</td>
                      <td className="py-3 px-4">{transaction.service}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          transaction.type === 'wash' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${
                        transaction.pointsEarned > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.pointsEarned > 0 ? '+' : ''}{transaction.pointsEarned}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No transactions yet</p>
          )}
          
          <div className="mt-4 text-center">
            <Link to="/customer/transactions" className="text-blue-600 hover:underline">
              View All Transactions →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default CustomerDashboard;