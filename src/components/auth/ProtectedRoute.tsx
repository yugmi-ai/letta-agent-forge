import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOrganization?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireOrganization = false,
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { authState } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !authState.isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Redirect to organization setup if organization is required but user doesn't have one
  if (requireOrganization && authState.isAuthenticated && !authState.organization) {
    return <Navigate to="/setup/organization" state={{ from: location }} replace />;
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (authState.isAuthenticated && (location.pathname === '/login' || location.pathname === '/signup')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}