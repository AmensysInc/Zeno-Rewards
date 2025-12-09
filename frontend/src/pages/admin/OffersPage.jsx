import { useState } from 'react';
import Navbar from '../../components/shared/Navbar';
import Card from '../../components/shared/Card';
import { offers } from '../../data/mockData';

function OffersPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount: '',
    pointsRequired: '',
    validUntil: '',
    active: true
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingOffer) {
      // Update existing offer
      alert('Offer updated successfully!');
      setEditingOffer(null);
    } else {
      // Add new offer
      alert('New offer added successfully!');
      setShowAddForm(false);
    }
    // Reset form
    setFormData({
      title: '',
      description: '',
      discount: '',
      pointsRequired: '',
      validUntil: '',
      active: true
    });
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description,
      discount: offer.discount,
      pointsRequired: offer.pointsRequired,
      validUntil: offer.validUntil,
      active: offer.active
    });
    setShowAddForm(true);
  };

  const handleDelete = (offerId) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      alert('Offer deleted successfully!');
    }
  };

  const toggleStatus = (offerId) => {
    alert('Offer status updated!');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Offers Management</h1>
            <p className="text-gray-600">Create and manage promotional offers</p>
          </div>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingOffer(null);
              setFormData({
                title: '',
                description: '',
                discount: '',
                pointsRequired: '',
                validUntil: '',
                active: true
              });
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {showAddForm ? 'Cancel' : '+ Add New Offer'}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingOffer ? 'Edit Offer' : 'Add New Offer'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Offer Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g., Premium Wash Free"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g., 50"
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Describe the offer..."
                  rows="3"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Points Required</label>
                  <input
                    type="number"
                    name="pointsRequired"
                    value={formData.pointsRequired}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g., 100"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Valid Until</label>
                  <input
                    type="date"
                    name="validUntil"
                    value={formData.validUntil}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label className="ml-2 text-gray-700 font-medium">Active (visible to customers)</label>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                {editingOffer ? 'Update Offer' : 'Create Offer'}
              </button>
            </form>
          </Card>
        )}

        {/* Offers List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <Card key={offer.id} className="hover:shadow-xl transition duration-200">
              <img 
                src={offer.image} 
                alt={offer.title}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />

              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-800">{offer.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  offer.active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {offer.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <p className="text-gray-600 mb-3 text-sm">{offer.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-semibold text-green-600">{offer.discount}% OFF</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Points Required:</span>
                  <span className="font-semibold text-blue-600">{offer.pointsRequired} pts</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Valid Until:</span>
                  <span className="font-semibold text-gray-800">{offer.validUntil}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(offer)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleStatus(offer.id)}
                  className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition"
                >
                  {offer.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(offer.id)}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OffersPage;