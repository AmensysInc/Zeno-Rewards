import React, { useState, useEffect } from 'react';
import CustomerLayout from '../components/CustomerLayout';
import { getCustomerOffers } from '../services/api';

function CustomerOffersPage() {
  const [offersData, setOffersData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCustomerOffers();
      setOffersData(data);
    } catch (err) {
      setError('Failed to load offers');
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
      day: 'numeric'
    });
  };

  const getRewardTypeLabel = (type) => {
    const labels = {
      POINTS: 'Points',
      DISCOUNT_PERCENT: 'Discount',
      FREE_MONTHS: 'Free Months'
    };
    return labels[type] || type;
  };

  const getPerUnitLabel = (unit) => {
    const labels = {
      PER_TRANSACTION: 'Per Transaction',
      PER_DOLLAR: 'Per Dollar',
      PER_VISIT: 'Per Visit'
    };
    return labels[unit] || unit;
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="text-center py-8">Loading offers...</div>
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

  if (!offersData) {
    return (
      <CustomerLayout>
        <div className="text-center py-8">No data available</div>
      </CustomerLayout>
    );
  }

  const { customer_type, is_member, offers } = offersData;

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Available Offers</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            is_member
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {is_member ? 'Member' : 'Non-Member'}
          </span>
        </div>

        {offers.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
            <p className="text-gray-600">No offers available at this time.</p>
            <p className="text-sm text-gray-500 mt-2">Check back later for new offers!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{offer.name}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    Priority {offer.priority}
                  </span>
                </div>
                
                {offer.description && (
                  <p className="text-sm text-gray-600 mb-4">{offer.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Reward Type:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {getRewardTypeLabel(offer.reward_type)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Reward Value:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {offer.reward_value}
                      {offer.reward_type === 'DISCOUNT_PERCENT' && '%'}
                      {offer.reward_type === 'FREE_MONTHS' && ' months'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Per Unit:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {getPerUnitLabel(offer.per_unit)}
                    </span>
                  </div>
                  {offer.wash_type && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Wash Type:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {offer.wash_type}
                      </span>
                    </div>
                  )}
                  {offer.max_uses_per_customer && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Max Uses:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {offer.max_uses_per_customer}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {formatDate(offer.start_date)}
                      {offer.end_date && ` - ${formatDate(offer.end_date)}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">About Offers</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Offers are automatically applied to your transactions based on eligibility</li>
            <li>Higher priority offers are applied first</li>
            <li>Offers are filtered based on your membership status</li>
            <li>Check the Points page to see your progress toward unlocking rewards</li>
          </ul>
        </div>
      </div>
    </CustomerLayout>
  );
}

export default CustomerOffersPage;

