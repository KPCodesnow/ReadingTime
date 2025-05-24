import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<'parent' | 'child'>('parent');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      console.log('Attempting login with:', { email: formData.email, role: selectedRole });
      
      const userData = await login(formData.email, formData.password);
      console.log('Login successful, user data:', userData);

      // Verify role matches selection
      if (userData.role !== selectedRole) {
        console.error('Role mismatch:', { expected: selectedRole, actual: userData.role });
        setError(`This account is registered as a ${userData.role}. Please select the correct role.`);
        return;
      }

      // Get the redirect path
      const redirectPath = selectedRole === 'parent' ? '/dashboard' : '/child-dashboard';
      console.log('Redirecting to:', redirectPath);
      
      // Use replace: true to prevent going back to login page
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If user is already logged in, redirect to appropriate dashboard
  React.useEffect(() => {
    if (user) {
      const redirectPath = user.role === 'parent' ? '/dashboard' : '/child-dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to ReadingTime
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6">
            <div className="flex justify-center space-x-4">
              <button
                type="button"
                onClick={() => setSelectedRole('parent')}
                className={`px-4 py-2 rounded-md ${
                  selectedRole === 'parent'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Parent Login
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('child')}
                className={`px-4 py-2 rounded-md ${
                  selectedRole === 'child'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Child Login
              </button>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={selectedRole === 'parent' ? 'parent@example.com' : 'child.name@family.com'}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={selectedRole === 'parent' ? 'Enter your password' : 'Enter password from parent'}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Signing in...' : `Sign in as ${selectedRole === 'parent' ? 'Parent' : 'Child'}`}
              </button>
            </div>

            {selectedRole === 'child' && (
              <div className="mt-4 text-sm text-gray-500">
                <p>
                  Ask your parent for your login credentials if you haven't received them yet.
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
} 