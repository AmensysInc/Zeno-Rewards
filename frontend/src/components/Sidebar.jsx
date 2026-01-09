import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar({ isOpen }) {
  const location = useLocation();
  const role = localStorage.getItem('role');

  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // If user is staff, don't show business sidebar (they should use StaffLayout)
  if (role === 'staff') {
    return null;
  }

  const menuItems = [
    { path: '/business/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/business/pos', label: 'Customers', icon: '👥' },
    { path: '/business/employees', label: 'Employees', icon: '👨‍💼' },
    { path: '/business/offers', label: 'Offers', icon: '🎁' },
    { path: '/business/rules', label: 'Rule Management', icon: '⚙️' },
    { path: '/business/points', label: 'Points', icon: '⭐' },
    { path: '/business/upload', label: 'Upload Transactions', icon: '📤' },
    { path: '/business/transactions', label: 'Transactions', icon: '📋' },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-40 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      <div className={`p-6 border-b border-gray-200 ${!isOpen ? 'px-4' : ''} transition-all duration-300`}>
        <h1 className={`text-xl font-semibold text-gray-900 whitespace-nowrap transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 hidden'
        }`}>
          Loyalty Program
        </h1>
        {!isOpen && (
          <div className="text-xl font-semibold text-gray-900 text-center">LP</div>
        )}
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center rounded-md transition-colors ${
                  isOpen ? 'px-4 py-3' : 'px-3 py-3 justify-center'
                } ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={!isOpen ? item.label : ''}
              >
                <span className={`${isOpen ? 'mr-3' : ''} text-lg`}>{item.icon}</span>
                <span className={`whitespace-nowrap transition-opacity duration-300 ${
                  isOpen ? 'opacity-100' : 'opacity-0 hidden'
                }`}>
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;

