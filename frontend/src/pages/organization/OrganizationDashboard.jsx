import { Link } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar';
import Card from '../../components/shared/Card';
import StatsCard from '../../components/shared/StatsCard';

function OrganizationDashboard() {
  // Mock businesses data (would come from API)
  const businesses = [
    {
      id: 1,
      name: "Sparkle Carwash Downtown",
      location: "123 Main St, City Center",
      customers: 245,
      revenue: 12450,
      status: "active"
    },
    {
      id: 2,
      name: "Sparkle Carwash Airport",
      location: "456 Airport Rd, Terminal 2",
      customers: 180,
      revenue: 9800,
      status: "active"
    },
    {
      id: 3,
      name: "Clean Stay Motel",
      location: "789 Highway 101",
      customers: 120,
      revenue: 7600,
      status: "active"
    }
  ];

  // Calculate aggregate stats
  const totalBusinesses = businesses.length;
  const totalCustomers = businesses.reduce((sum, b) => sum + b.customers, 0);
  const totalRevenue = businesses.reduce((sum, b) => sum + b.revenue, 0);
  const activeLocations = businesses.filter(b => b.status === 'active').length;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Organization Dashboard</h1>
          <p className="text-gray-600">Overview of all your business locations</p>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Businesses"
            value={totalBusinesses}
            icon="🏢"
            color="blue"
          />
          <StatsCard
            title="Total Customers"
            value={totalCustomers}
            icon="👥"
            color="green"
          />
          <StatsCard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            icon="💰"
            color="purple"
          />
          <StatsCard
            title="Active Locations"
            value={activeLocations}
            icon="✅"
            color="orange"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/organization/create-business">
              <Card className="hover:shadow-lg transition duration-200 cursor-pointer text-center bg-green-50">
                <div className="text-4xl mb-2">🏢</div>
                <h3 className="font-semibold text-gray-800">Create Business</h3>
                <p className="text-sm text-gray-600">Add new location</p>
              </Card>
            </Link>

            <Card className="hover:shadow-lg transition duration-200 cursor-pointer text-center bg-blue-50">
              <div className="text-4xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-800">View Reports</h3>
              <p className="text-sm text-gray-600">Organization analytics</p>
            </Card>

            <Card className="hover:shadow-lg transition duration-200 cursor-pointer text-center bg-purple-50">
              <div className="text-4xl mb-2">⚙️</div>
              <h3 className="font-semibold text-gray-800">Settings</h3>
              <p className="text-sm text-gray-600">Organization settings</p>
            </Card>
          </div>
        </div>

        {/* Business Locations List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Your Business Locations</h2>
            <Link to="/organization/create-business">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                + Add Business
              </button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <Card key={business.id} className="hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{business.name}</h3>
                    <p className="text-sm text-gray-600">{business.location}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    business.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {business.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customers:</span>
                    <span className="font-semibold">{business.customers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-semibold">${business.revenue.toLocaleString()}</span>
                  </div>
                </div>

                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                  View Details
                </button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganizationDashboard;