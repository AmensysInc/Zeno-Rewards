import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/shared/Navbar';
import Card from '../../components/shared/Card';
import { offers, pointsConfig } from '../../data/mockData';

function RedeemRewards() {
  const { currentUser, updateUserPoints } = useAuth();
  const [redeemedOffer, setRedeemedOffer] = useState(null);

  const handleRedeem = (offer) => {
    if (currentUser.points >= offer.pointsRequired) {
      // Deduct points
      updateUserPoints(currentUser.id, -offer.pointsRequired);
      
      // Show success message
      setRedeemedOffer(offer);
      
      setTimeout(() => {
        setRedeemedOffer(null);
      }, 5000);
    }
  };

  // Calculate how much discount user can get with current points
  const maxDiscount = Math.floor(currentUser?.points / pointsConfig.redeemRate) * 10;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Redeem Rewards</h1>
          <p className="text-gray-600">Turn your points into amazing rewards!</p>
        </div>

        {/* Success Message */}
        {redeemedOffer && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg mb-6">
            <p className="font-semibold">🎉 Offer Redeemed Successfully!</p>
            <p className="text-sm mt-1">
              You've redeemed "{redeemedOffer.title}". Check your email for the coupon code.
            </p>
          </div>
        )}

        {/* Points Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Your Available Points</h3>
            <p className="text-5xl font-bold">{currentUser?.points}</p>
            <p className="text-sm mt-3 opacity-90">
              ≈ ${maxDiscount} in discounts
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Points Conversion</h3>
            <p className="text-2xl font-bold mb-2">
              {pointsConfig.redeemRate} points = $10 discount
            </p>
            <p className="text-sm opacity-90">
              Minimum {pointsConfig.minimumRedeem} points required to redeem
            </p>
          </Card>
        </div>

        {/* Redeemable Offers */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Rewards</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.filter(offer => offer.active).map((offer) => {
              const canRedeem = currentUser?.points >= offer.pointsRequired;
              
              return (
                <div 
                  key={offer.id} 
                  className={`border rounded-lg p-4 ${
                    canRedeem ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <img 
                    src={offer.image} 
                    alt={offer.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  
                  <h3 className="font-bold text-gray-800 mb-2">{offer.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{offer.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-semibold">
                      {offer.discount}% OFF
                    </span>
                    <span className="text-blue-600 font-bold text-lg">
                      {offer.pointsRequired} pts
                    </span>
                  </div>

                  <button
                    onClick={() => handleRedeem(offer)}
                    disabled={!canRedeem}
                    className={`w-full py-2 rounded-lg font-semibold transition duration-200 ${
                      canRedeem
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {canRedeem 
                      ? 'Redeem Now' 
                      : `Need ${offer.pointsRequired - currentUser?.points} more`
                    }
                  </button>
                </div>
              );
            })}
          </div>
        </Card>

        {/* How It Works */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">How Rewards Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Earn Points</h3>
              <p className="text-sm text-gray-600">
                Get 1 point for every $1 spent on carwash services
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">🎁</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Choose Reward</h3>
              <p className="text-sm text-gray-600">
                Browse available offers and select your favorite reward
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Redeem & Enjoy</h3>
              <p className="text-sm text-gray-600">
                Use your coupon code at checkout to save money
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default RedeemRewards;