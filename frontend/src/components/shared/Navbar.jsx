import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Navbar() {
  const { currentUser, logout, isAdmin, isOrganization } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const customerLinks = [
    { name: 'Dashboard', path: '/customer/dashboard' },
    { name: 'Offers', path: '/customer/offers' },
    { name: 'Redeem', path: '/customer/redeem' },
    { name: 'Profile', path: '/customer/profile' }
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Offers', path: '/admin/offers' },
    { name: 'Transactions', path: '/admin/transactions' },
    { name: 'Points', path: '/admin/points' },
    { name: 'Users', path: '/admin/users' },
    { name: 'Membership', path: '/admin/membership' }
  ];

  const organizationLinks = [
    { name: 'Dashboard', path: '/organization/dashboard' },
    { name: 'Analytics', path: '/organization/analytics' },
    { name: 'Locations', path: '/organization/locations' },
    { name: 'Reports', path: '/organization/reports' },
    { name: 'Settings', path: '/organization/settings' }
  ];

  const links = isOrganization ? organizationLinks : isAdmin ? adminLinks : customerLinks;

  const navBgColor = isOrganization ? 'bg-purple-600' : isAdmin ? 'bg-gray-800' : 'bg-blue-600';
  const dashboardPath = isOrganization ? '/organization/dashboard' : isAdmin ? '/admin/dashboard' : '/customer/dashboard';

  return (
    <nav className={`${navBgColor} text-white shadow-lg`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to={dashboardPath} className="text-2xl font-bold">
            Sparkle Carwash
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-6">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="hover:text-gray-200 transition duration-200"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-4">
            <span className="hidden md:block">
              {currentUser?.name}
              {!isAdmin && !isOrganization && (
                <span className="ml-2 bg-white text-blue-600 px-2 py-1 rounded-full text-sm font-semibold">
                  {currentUser?.points} pts
                </span>
              )}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;