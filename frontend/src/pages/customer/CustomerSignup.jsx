import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function CustomerSignup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...userData } = formData;
    const result = signup(userData);
    
    if (result.success) {
      navigate('/customer/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Signup Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo/Header */}
          <div className="mb-8">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#032D23' }}>
                <span className="text-white text-xl font-bold">S</span>
              </div>
              <span className="ml-3 text-2xl font-bold text-gray-800">Sparkle Carwash</span>
            </div>

            <h2 className="text-gray-600 text-lg mb-2">
              Join <span className="font-semibold" style={{ color: '#032D23' }}>Sparkle Carwash</span>
            </h2>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Sign Up</h1>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
                style={{ boxShadow: 'none' }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #032D23'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
                placeholder="John Doe"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
                style={{ boxShadow: 'none' }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #032D23'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
                placeholder="john@example.com"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
                style={{ boxShadow: 'none' }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #032D23'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
                placeholder="123-456-7890"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
                style={{ boxShadow: 'none' }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #032D23'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
                placeholder="Minimum 6 characters"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
                style={{ boxShadow: 'none' }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #032D23'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
                placeholder="Re-enter password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 rounded-lg font-semibold transition duration-200 disabled:bg-gray-400"
              style={{ backgroundColor: loading ? undefined : '#032D23' }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#021f18')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#032D23')}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          {/* Link */}
          <div className="mt-6">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold hover:underline" style={{ color: '#032D23' }}>
                Login
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-500">
              <p>Copyright © 2024 Sparkle Carwash. All rights reserved.</p>
              <a href="#" className="hover:text-gray-700">Terms & Conditions</a>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image Placeholder */}
      <div className="hidden lg:block lg:w-1/2 relative" style={{ background: 'linear-gradient(to bottom right, #032D23, #021410)' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Placeholder for image */}
          <div className="text-center text-white p-8">
            <div className="mb-4">
              <svg className="w-32 h-32 mx-auto text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-xl font-light">Image Placeholder</p>
            <p className="text-sm opacity-75 mt-2">Replace with your custom image</p>
          </div>
        </div>

        {/* Quote Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-center text-white">
          <h3 className="text-3xl font-serif mb-2">"Join the Sparkle Community"</h3>
          <p className="text-sm">— Start earning rewards today</p>
        </div>
      </div>
    </div>
  );
}

export default CustomerSignup;