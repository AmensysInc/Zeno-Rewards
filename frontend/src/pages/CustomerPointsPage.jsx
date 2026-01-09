import React, { useState, useEffect } from 'react';
import CustomerLayout from '../components/CustomerLayout';
import { getCustomerPoints } from '../services/api';

function CustomerPointsPage() {
  const [pointsData, setPointsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPoints();
  }, []);

  const loadPoints = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCustomerPoints();
      setPointsData(data);
    } catch (err) {
      setError('Failed to load points data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="text-center py-8">Loading points...</div>
      </CustomerLayout>
    );
  }

  if (error) {
    return (
      <CustomerLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </CustomerLayout>
    );
  }

  if (!pointsData) {
    return (
      <CustomerLayout>
        <div className="text-center py-8">No data available</div>
      </CustomerLayout>
    );
  }

  const { current_points, next_offer, points_history } = pointsData;

  // Calculate progress percentage for next offer
  const progressPercentage = next_offer && next_offer.required_points
    ? Math.min((current_points / next_offer.required_points) * 100, 100)
    : 0;

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Points</h1>

        {/* Current Points Card */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-2">Current Balance</p>
              <p className="text-5xl font-bold">{current_points}</p>
              <p className="text-blue-100 text-sm mt-2">points</p>
            </div>
            <div className="text-6xl opacity-50">⭐</div>
          </div>
        </div>

        {/* Next Offer Unlock */}
        {next_offer ? (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Next Reward Unlock</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{next_offer.name}</span>
                  <span className="text-sm text-gray-600">
                    {current_points} / {next_offer.required_points} points
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {next_offer.points_needed} more points needed to unlock this reward
                </p>
              </div>
              {next_offer.description && (
                <p className="text-sm text-gray-700">{next_offer.description}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-gray-600">No upcoming rewards to unlock. Keep earning points!</p>
          </div>
        )}

        {/* Points History */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Points History</h2>
          {points_history.length === 0 ? (
            <p className="text-gray-500">No points history yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {points_history.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(entry.created_at)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        entry.points_earned >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {entry.points_earned >= 0 ? '+' : ''}{entry.points_earned}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.reward_type}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}

export default CustomerPointsPage;

