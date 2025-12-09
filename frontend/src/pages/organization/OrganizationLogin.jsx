import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function OrganizationLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = login(email, password, 'organization');

    if (result.success) {
      navigate('/organization/dashboard');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">O</span>
          </div>
          <h1 className="text-3xl font-bold text-purple-800 mb-2">Organization Portal</h1>
          <p className="text-gray-600">Sparkle Carwash - Executive Dashboard</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Organization Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
              placeholder="org@sparkle.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
              placeholder="Enter organization password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition duration-200 disabled:bg-gray-400"
          >
            {loading ? 'Logging in...' : 'Login to Organization'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-800 font-semibold mb-2">Demo Organization Credentials:</p>
          <p className="text-xs text-gray-600">Email: org@sparkle.com</p>
          <p className="text-xs text-gray-600">Password: org123</p>
        </div>

        {/* Links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-600">
            <Link to="/admin/login" className="text-purple-600 font-semibold hover:underline">
              Admin Login
            </Link>
            {' | '}
            <Link to="/customer/login" className="text-purple-600 font-semibold hover:underline">
              Customer Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default OrganizationLogin;
