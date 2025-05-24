import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function ProtectedRoute() {
  const { user, loading, error } = useAuth();
  const location = useLocation();

  // Show loading spinner for initial auth check with a delay
  if (loading) {
    return (
      <LoadingSpinner 
        message="Checking authentication..." 
        delay={500}
        isLoading={true}
      />
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <LoadingSpinner 
        isLoading={false} 
        error={error}
        retryAction={() => window.location.reload()}
      />
    );
  }

  // If no user, redirect to login
  if (!user) {
    // Store the attempted location for redirect after login
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  // If user exists but trying to access wrong dashboard
  if (user.role === 'parent' && location.pathname === '/child-dashboard') {
    return <Navigate to="/dashboard" replace />;
  }

  if (user.role === 'child' && location.pathname === '/dashboard') {
    return <Navigate to="/child-dashboard" replace />;
  }

  // If all checks pass, render the protected route
  return <Outlet />;
} 