import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(emailOrPhone, password);
    
    if (result.success) {
      const userType = result.user.userType;
      
      // Redirect based on user type
      if (userType === 'organization') {
        navigate('/organization/dashboard');
      } else if (userType === 'business') {
        navigate('/business/dashboard');
      } else if (userType === 'customer') {
        navigate('/customer/dashboard');
      }
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl font-bold">S</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Sparkle Carwash</h1>
          <p className="text-gray-600">Login to your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email or Phone Number
            </label>
            <input
              type="text"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter your email or phone"
              autoComplete='off'
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Works for all user types (Organization, Admin, Customer)
            </p>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter your password"
              autoComplete='off'
              required
            />
          </div>

          <button
  type="submit"
  disabled={loading}
  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {loading ? 'Logging in...' : 'Login'}
</button>
        </form>
{/* Admin/Owner Link */}
<div className="mt-8 pt-6 border-t border-gray-200 text-center">
  <p className="text-xs text-gray-500 mb-2">Product Owner Only</p>
  <button
    onClick={() => navigate('/create-organization')}
    className="text-blue-600 text-sm hover:underline"
  >
    Create New Organization
  </button>
</div>
       

       
      </div>
    </div>
  );
}

export default Login;