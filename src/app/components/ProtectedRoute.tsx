'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        const currentPath = window.location.pathname;
        router.push(
          `${redirectTo}?returnUrl=${encodeURIComponent(currentPath)}`
        );
        return;
      }

      try {
        // Verify token with backend
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Invalid token');
        }

        const data = await response.json();
        const userRole = data.user.role;

        // Check if user role is allowed
        if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
          router.push('/unauthorized');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        // Clear invalid token
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');

        const currentPath = window.location.pathname;
        router.push(
          `${redirectTo}?returnUrl=${encodeURIComponent(currentPath)}`
        );
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, allowedRoles, redirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Checking authentication...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
