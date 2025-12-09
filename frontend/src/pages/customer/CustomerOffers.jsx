import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/shared/Navbar';
import Card from '../../components/shared/Card';
import { offers } from '../../data/mockData';

function CustomerOffers() {
  const { currentUser } = useAuth();
  const [selectedOffer, setSelectedOffer] = useState(null);

  const handleRedeem = (offer) => {
    if (currentUser.points >= offer.pointsRequired) {
      setSelectedOffer(offer);
      // In real app, this would update backend
      alert(`Offer "${offer.title}" redeemed successfully! Check your email for the coupon code.`);
    } else {
      alert(`You need ${offer.pointsRequired - currentUser.points} more points to redeem this offer.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Available Offers</h1>
          <p className="text-gray-600">
            You have <span className="font-bold text-blue-600">{currentUser?.points} points</span> to spend
          </p>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.filter(offer => offer.active).map((offer) => (
            <Card key={offer.id} className="hover:shadow-xl transition duration-200">
              {/* Offer Image */}
              <img 
                src={offer.image} 
                alt={offer.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />

              {/* Offer Details */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">{offer.title}</h3>
              <p className="text-gray-600 mb-4">{offer.description}</p>

              {/* Discount Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                  {offer.discount}% OFF
                </span>
                <span className="text-gray-600 text-sm">
                  Valid until {offer.validUntil}
                </span>
              </div>

              {/* Points Required */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-700 font-semibold">Points Required:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {offer.pointsRequired}
                  </span>
                </div>

                {/* Redeem Button */}
                <button
                  onClick={() => handleRedeem(offer)}
                  disabled={currentUser.points < offer.pointsRequired}
                  className={`w-full py-3 rounded-lg font-semibold transition duration-200 ${
                    currentUser.points >= offer.pointsRequired
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {currentUser.points >= offer.pointsRequired 
                    ? 'Redeem Offer' 
                    : `Need ${offer.pointsRequired - currentUser.points} more points`
                  }
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* No Offers Message */}
        {offers.filter(offer => offer.active).length === 0 && (
          <Card className="text-center py-12">
            <p className="text-gray-600 text-lg">No offers available at the moment.</p>
            <p className="text-gray-500 mt-2">Check back soon for exciting deals!</p>
          </Card>
        )}
      </div>
    </div>
  );
}

export default CustomerOffers;