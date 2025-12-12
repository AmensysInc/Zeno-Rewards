import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/shared/Navbar';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Badge from '../../components/shared/Badge';

const API_BASE_URL = 'http://localhost:8000';

function OffersPage() {
  const [activeTab, setActiveTab] = useState('create');
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser, useMockAuth } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    rewardName: '',
    category: '',
    price: '',
    costInPoints: '',
    status: 'active',
    fromDate: '',
    endDate: ''
  });

  const [errors, setErrors] = useState({});

  // Load offers on mount
  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = () => {
    if (useMockAuth) {
      const savedOffers = JSON.parse(localStorage.getItem('offers') || '[]');
      setOffers(savedOffers);
    } else {
      const savedOffers = JSON.parse(localStorage.getItem('offers') || '[]');
      setOffers(savedOffers);
    }
  };

  // Filter offers by active/expired
  const activeOffers = offers.filter(offer => {
    const today = new Date();
    const endDate = new Date(offer.endDate);
    return offer.status === 'active' && endDate >= today;
  });

  const expiredOffers = offers.filter(offer => {
    const today = new Date();
    const endDate = new Date(offer.endDate);
    return offer.status === 'inactive' || endDate < today;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.rewardName.trim()) {
      newErrors.rewardName = 'Reward name is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.costInPoints || parseInt(formData.costInPoints) <= 0) {
      newErrors.costInPoints = 'Valid points cost is required';
    }

    if (!formData.fromDate) {
      newErrors.fromDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.fromDate && formData.endDate && new Date(formData.fromDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (useMockAuth) {
        await handleMockCreate();
      } else {
        await handleRealCreate();
      }
    } catch (error) {
      console.error('Error creating offer:', error);
      alert('Failed to create reward: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleMockCreate = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newOffer = {
      id: Date.now(),
      name: formData.rewardName,
      category: formData.category,
      price: parseFloat(formData.price),
      points: parseInt(formData.costInPoints),
      status: formData.status,
      fromDate: formData.fromDate,
      endDate: formData.endDate,
      businessId: currentUser?.business_id,
      createdAt: new Date().toISOString()
    };

    const existingOffers = JSON.parse(localStorage.getItem('offers') || '[]');
    existingOffers.push(newOffer);
    localStorage.setItem('offers', JSON.stringify(existingOffers));

    setOffers(existingOffers);
    resetForm();
    setActiveTab('active');
    alert('Reward created successfully!');
  };

  const handleRealCreate = async () => {
    const token = localStorage.getItem('access_token');
    const businessId = currentUser.business_id;

    const payload = {
      name: formData.rewardName,
      category: formData.category,
      price: parseFloat(formData.price),
      cost_in_points: parseInt(formData.costInPoints),
      status: formData.status,
      from_date: formData.fromDate,
      end_date: formData.endDate,
      business_id: businessId
    };

    const response = await axios.post(
      `${API_BASE_URL}/rewards/offers/create`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('Offer created:', response.data);
    resetForm();
    setActiveTab('active');
    alert('Reward created successfully!');
    loadOffers();
  };

  const resetForm = () => {
    setFormData({
      rewardName: '',
      category: '',
      price: '',
      costInPoints: '',
      status: 'active',
      fromDate: '',
      endDate: ''
    });
    setErrors({});
  };

  const handleDelete = (offerId) => {
    if (window.confirm('Are you sure you want to delete this reward?')) {
      const updatedOffers = offers.filter(o => o.id !== offerId);
      setOffers(updatedOffers);
      localStorage.setItem('offers', JSON.stringify(updatedOffers));
      alert('Reward deleted successfully!');
    }
  };

  const tabs = [
    { id: 'create', label: 'Create Offers' },
    { id: 'active', label: 'Active Offers' },
    { id: 'expired', label: 'Expired Offers' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Manage Rewards</h1>
          <p className="text-gray-600">Create and manage reward offers</p>
        </div>

        {/* Mode Indicator */}
        <div className="mb-6">
          <span className={`text-sm px-3 py-1 rounded-full ${
            useMockAuth 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {useMockAuth ? '📝 Mock Mode (localStorage)' : '🔗 Connected to Backend API'}
          </span>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
                {tab.id === 'active' && activeOffers.length > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                    {activeOffers.length}
                  </span>
                )}
                {tab.id === 'expired' && expiredOffers.length > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {expiredOffers.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'create' && (
           <div className="max-w-3xl mx-auto"> 
          <Card>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Reward</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Reward Name */}
              <Input
                label="Reward Name"
                name="rewardName"
                value={formData.rewardName}
                onChange={handleInputChange}
                placeholder="e.g., Free Premium Wash"
                required
                error={errors.rewardName}
              />

              {/* Category */}
              <Input
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="e.g., Car Wash Service"
                required
                error={errors.category}
              />

              {/* Price and Points */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Price ($)"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="25.00"
                  required
                  error={errors.price}
                />

                <Input
                  label="Cost in Points"
                  name="costInPoints"
                  type="number"
                  value={formData.costInPoints}
                  onChange={handleInputChange}
                  placeholder="100"
                  required
                  error={errors.costInPoints}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Start Date"
                  name="fromDate"
                  type="date"
                  value={formData.fromDate}
                  onChange={handleInputChange}
                  required
                  error={errors.fromDate}
                />

                <Input
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                  error={errors.endDate}
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={resetForm}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Reward'}
                </Button>
              </div>
            </form>
          </Card>
          </div>
        )}

        {activeTab === 'active' && (
          <div>
            {activeOffers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeOffers.map((offer) => (
                  <Card key={offer.id} className="hover:shadow-lg transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{offer.name}</h3>
                        <p className="text-sm text-gray-600">{offer.category}</p>
                      </div>
                      <Badge variant="success">Active</Badge>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-semibold">${parseFloat(offer.price).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Points:</span>
                        <span className="font-semibold text-blue-600">{offer.points} pts</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Valid Until:</span>
                        <span>{new Date(offer.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(offer.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <div className="text-6xl mb-4">🎁</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Active Rewards</h3>
                <p className="text-gray-600 mb-4">Create your first reward to get started</p>
                <Button
                  variant="primary"
                  onClick={() => setActiveTab('create')}
                >
                  Create Reward
                </Button>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'expired' && (
          <div>
            {expiredOffers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {expiredOffers.map((offer) => (
                  <Card key={offer.id} className="opacity-75">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{offer.name}</h3>
                        <p className="text-sm text-gray-600">{offer.category}</p>
                      </div>
                      <Badge variant="danger">Expired</Badge>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-semibold">${parseFloat(offer.price).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Points:</span>
                        <span className="font-semibold text-gray-600">{offer.points} pts</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Expired On:</span>
                        <span className="text-red-600">{new Date(offer.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <Button
                      variant="danger"
                      size="sm"
                      className="w-full"
                      onClick={() => handleDelete(offer.id)}
                    >
                      Delete
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Expired Rewards</h3>
                <p className="text-gray-600">Expired rewards will appear here</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default OffersPage;