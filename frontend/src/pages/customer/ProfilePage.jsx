import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/shared/Navbar';
import Card from '../../components/shared/Card';

function ProfilePage() {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In real app, this would update backend
    alert('Profile updated successfully!');
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center py-3 border-b">
                    <span className="text-gray-600 font-medium w-32">Name:</span>
                    <span className="text-gray-800 font-semibold">{currentUser?.name}</span>
                  </div>
                  <div className="flex items-center py-3 border-b">
                    <span className="text-gray-600 font-medium w-32">Email:</span>
                    <span className="text-gray-800">{currentUser?.email}</span>
                  </div>
                  <div className="flex items-center py-3 border-b">
                    <span className="text-gray-600 font-medium w-32">Phone:</span>
                    <span className="text-gray-800">{currentUser?.phone}</span>
                  </div>
                  <div className="flex items-center py-3 border-b">
                    <span className="text-gray-600 font-medium w-32">Member Since:</span>
                    <span className="text-gray-800">{currentUser?.memberSince}</span>
                  </div>
                  <div className="flex items-center py-3">
                    <span className="text-gray-600 font-medium w-32">Role:</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      Customer
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <h3 className="text-lg font-semibold mb-2">Reward Points</h3>
              <p className="text-4xl font-bold mb-2">{currentUser?.points}</p>
              <p className="text-sm opacity-90">Keep washing to earn more!</p>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <h3 className="text-lg font-semibold mb-2">Total Spent</h3>
              <p className="text-4xl font-bold mb-2">${currentUser?.totalSpent}</p>
              <p className="text-sm opacity-90">Lifetime purchases</p>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                  Change Password
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                  Notification Settings
                </button>
                <button className="w-full text-left px-4 py-3 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition">
                  Delete Account
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;