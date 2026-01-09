import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listOffers, listOffersByStatus, createOffer } from '../services/api';
import BusinessLayout from '../components/BusinessLayout';

function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [ruleName, setRuleName] = useState('');
  const [description, setDescription] = useState('');
  const [customerType, setCustomerType] = useState('Member');
  const [specificWash, setSpecificWash] = useState('');
  const [action, setAction] = useState('Buys Wash');
  const [rewardType, setRewardType] = useState('Give Points');
  const [rewardValue, setRewardValue] = useState('');
  const [perUnit, setPerUnit] = useState('Per Transaction');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [usageLimit, setUsageLimit] = useState(false);
  const [maxUses, setMaxUses] = useState('');
  const [status, setStatus] = useState(true);
  const [priority, setPriority] = useState('1');
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [activeTab, setActiveTab] = useState('create');

  const loadOffers = async () => {
    setError('');
    try {
      let res;
      if (activeTab === 'active') {
        res = await listOffersByStatus('Active');
      } else if (activeTab === 'expired') {
        res = await listOffersByStatus('Expired');
      } else {
        res = await listOffers();
      }
      setOffers(res.data || []);
    } catch (err) {
      setError('Failed to load offers');
    }
  };

  useEffect(() => {
    if (activeTab !== 'create') {
      loadOffers();
    }
  }, [activeTab]);

  const handleReset = () => {
    setRuleName('');
    setDescription('');
    setCustomerType('Member');
    setSpecificWash('');
    setAction('Buys Wash');
    setRewardType('Give Points');
    setRewardValue('');
    setPerUnit('Per Transaction');
    setStartDate('');
    setEndDate('');
    setUsageLimit(false);
    setMaxUses('');
    setStatus(true);
    setPriority('1');
    setError('');
    setStatusMsg('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setStatusMsg('');

    if (!ruleName || !description || !rewardValue || !startDate || !endDate) {
      setError('All required fields must be filled');
      return;
    }

    try {
      // Map form fields to new RewardRules structure
      const rewardTypeMap = {
        'Give Points': 'POINTS',
        'Discount': 'DISCOUNT_PERCENT',
        'Free Service': 'FREE_MONTHS'
      };
      
      const customerTypeMap = {
        'Member': 'MEMBER',
        'Non-Member': 'NON_MEMBER'
      };
      
      const perUnitMap = {
        'Per Transaction': 'PER_TRANSACTION',
        'Per Visit': 'PER_VISIT',
        'Per Dollar': 'PER_DOLLAR'
      };
      
      const productTypeMap = {
        'Buys Wash': 'WASH',
        'Visits': 'WASH',
        'Referral': 'MEMBERSHIP'
      };
      
      const offerData = {
        name: ruleName,
        description: description,
        customer_type: customerTypeMap[customerType] || 'ANY',
        product_type: productTypeMap[action] || 'ANY',
        wash_type: specificWash ? specificWash.toUpperCase().replace(' ', '_') : null,
        membership_term: null, // Can be added later
        reward_type: rewardTypeMap[rewardType] || 'POINTS',
        reward_value: rewardValue,
        per_unit: perUnitMap[perUnit] || 'PER_TRANSACTION',
        priority: parseInt(priority, 10) || 1,
        max_uses_per_customer: usageLimit && maxUses ? parseInt(maxUses, 10) : null,
        start_date: startDate,
        end_date: endDate || null,
        is_active: status
      };
      
      await createOffer(offerData);
      
      setStatusMsg('Reward rule created successfully!');
      handleReset();
      
      if (activeTab === 'create') {
        setActiveTab('active');
      }
      await loadOffers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create reward rule');
    }
  };

  const isExpired = (offer) => {
    if (!offer.end_date) return false;
    return new Date(offer.end_date) < new Date();
  };

  const filteredOffers = activeTab === 'active' 
    ? offers.filter(o => o.is_active && !isExpired(o))
    : activeTab === 'expired'
    ? offers.filter(o => isExpired(o) || !o.is_active)
    : offers;

  // Generate rule preview text
  const getRulePreview = () => {
    if (!description) return 'Enter description to see preview...';
    return description;
  };

  return (
    <BusinessLayout>
      <div className="mb-4">
        <nav className="text-sm text-gray-600">
          <span className="text-gray-900">Reward Rules</span> <span className="mx-2">›</span> <span>Create Rewards Rule</span>
        </nav>
      </div>
        <div className="flex gap-4 mb-4 border-b border-gray-300">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'create' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            type="button"
            onClick={() => setActiveTab('create')}
          >
            Create Offers
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'active' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            type="button"
            onClick={() => setActiveTab('active')}
          >
            Active Offers
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'expired' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            type="button"
            onClick={() => setActiveTab('expired')}
          >
            Expired Offers
          </button>
        </div>

        {activeTab === 'create' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleCreate}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name</label>
                    <input
                      type="text"
                      value={ruleName}
                      onChange={(e) => setRuleName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Gold Wash Points for Non-Members"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="For non-members using Gold Wash, give 10 points."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Type</label>
                    <select
                      value={customerType}
                      onChange={(e) => setCustomerType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Member">Member</option>
                      <option value="Non-Member">Non-Member</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specific Wash</label>
                    <select
                      value={specificWash}
                      onChange={(e) => setSpecificWash(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Wash Type</option>
                      <option value="Gold Wash">Gold Wash</option>
                      <option value="Premium Wash">Premium Wash</option>
                      <option value="Basic Wash">Basic Wash</option>
                      <option value="Full Service">Full Service</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                    <select
                      value={action}
                      onChange={(e) => setAction(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Buys Wash">Buys Wash</option>
                      <option value="Visits">Visits</option>
                      <option value="Referral">Referral</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reward Type</label>
                    <select
                      value={rewardType}
                      onChange={(e) => setRewardType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Give Points">Give Points</option>
                      <option value="Discount">Discount</option>
                      <option value="Free Service">Free Service</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reward Type (Value)</label>
                    <select
                      value={rewardValue}
                      onChange={(e) => setRewardValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Points</option>
                      <option value="5">5 Points</option>
                      <option value="10">10 Points</option>
                      <option value="15">15 Points</option>
                      <option value="20">20 Points</option>
                      <option value="25">25 Points</option>
                      <option value="50">50 Points</option>
                      <option value="100">100 Points</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Per Unit</label>
                    <select
                      value={perUnit}
                      onChange={(e) => setPerUnit(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Per Transaction">Per Transaction</option>
                      <option value="Per Visit">Per Visit</option>
                      <option value="Per Dollar">Per Dollar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="usageLimit"
                      checked={usageLimit}
                      onChange={(e) => setUsageLimit(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="usageLimit" className="text-sm font-medium text-gray-700">Max Uses Per Member</label>
                  </div>

                  {usageLimit && (
                    <div>
                      <input
                        type="number"
                        value={maxUses}
                        onChange={(e) => setMaxUses(e.target.value)}
                        placeholder="Enter max uses"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="status"
                      checked={status}
                      onChange={(e) => setStatus(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="status" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      Active
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-3 top-2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Higher priority rules run first.</p>
                  </div>
                </div>

                {/* Right Column - Preview */}
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">Rule Preview</h3>
                        <p className="text-gray-700">{getRulePreview()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Rule Conditions</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Customer Type:</dt>
                        <dd className="text-sm font-medium text-gray-900">{customerType}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Action:</dt>
                        <dd className="text-sm font-medium text-gray-900">{action}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Specific Wash:</dt>
                        <dd className="text-sm font-medium text-gray-900">{specificWash || 'All'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Reward Type:</dt>
                        <dd className="text-sm font-medium text-gray-900">{rewardType}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Reward Value:</dt>
                        <dd className="text-sm font-medium text-gray-900">{rewardValue ? `${rewardValue} Points` : '-'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Per Unit:</dt>
                        <dd className="text-sm font-medium text-gray-900">{perUnit}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Start Date:</dt>
                        <dd className="text-sm font-medium text-gray-900">{startDate || '-'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">End Date:</dt>
                        <dd className="text-sm font-medium text-gray-900">{endDate || '-'}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>

              {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">{error}</div>}
              {statusMsg && <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">{statusMsg}</div>}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab !== 'create' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {activeTab === 'active' ? 'Active Offers' : 'Expired Offers'}
            </h2>
            {filteredOffers.length === 0 ? (
              <p className="text-gray-600">No {activeTab === 'active' ? 'active' : 'expired'} offers found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rule Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wash Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOffers.map((offer) => (
                      <tr key={offer.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{offer.name || offer.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{offer.wash_type || offer.category || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{offer.reward_type === 'POINTS' ? `${offer.reward_value} Points` : offer.reward_value}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{offer.priority}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{offer.is_active ? 'Active' : 'Inactive'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{offer.start_date ? new Date(offer.start_date).toLocaleDateString() : '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{offer.end_date ? new Date(offer.end_date).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
    </BusinessLayout>
  );
}

export default OffersPage;
