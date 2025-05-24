import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './features/auth/context/AuthContext';
import { LoginPage } from './features/auth/pages/LoginPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { ParentDashboard } from './features/dashboard/pages/ParentDashboard';
import { ChildDashboard } from './features/dashboard/pages/ChildDashboard';
import { ManageChildrenPage } from './features/children/pages/ManageChildren';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public routes */}
              <Route path="/auth/login" element={<LoginPage />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<ParentDashboard />} />
                  <Route path="/child-dashboard" element={<ChildDashboard />} />
                  <Route path="/manage-children" element={<ManageChildrenPage />} />
                </Route>
              </Route>
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App; 