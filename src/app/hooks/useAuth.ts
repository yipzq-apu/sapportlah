import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  role: 'donor' | 'creator';
  avatar?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking authentication status
    // Replace with actual auth logic (e.g., checking JWT token, calling API)
    const checkAuth = async () => {
      try {
        // Example: Check localStorage or make API call
        const token = localStorage.getItem('authToken');
        if (token) {
          // Simulate API call to get user data
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
