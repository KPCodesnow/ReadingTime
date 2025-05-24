import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

const parentNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Manage Children', href: '/manage-children', icon: '👶' },
  { name: 'Books', href: '/books', icon: '📚' },
  { name: 'Rewards', href: '/rewards', icon: '🎁' },
  { name: 'Progress', href: '/progress', icon: '📈' },
];

const childNavItems: NavItem[] = [
  { name: 'My Books', href: '/child-dashboard', icon: '📚' },
  { name: 'My Rewards', href: '/rewards', icon: '🌟' },
  { name: 'My Progress', href: '/progress', icon: '📈' },
];

export function MainNav() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = user?.role === 'parent' ? parentNavItems : childNavItems;

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to={user?.role === 'parent' ? '/dashboard' : '/child-dashboard'} className="text-xl font-bold text-blue-600">
                ReadingTime
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`${
                    location.pathname === item.href
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-sm text-gray-500 mr-4">
                Welcome, {user?.username} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 