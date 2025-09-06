// Utility function to make authenticated API calls
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
) => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    throw new Error('No authentication token found');
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired or invalid, clear storage and redirect to login
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = '/login';
    throw new Error('Authentication failed');
  }

  return response;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('authToken');
  return !!token;
};

// Get current user role from token (without API call)
export const getCurrentUserRole = (): string | null => {
  const userData = localStorage.getItem('userData');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      return user.role;
    } catch {
      return null;
    }
  }
  return null;
};

// Redirect to login with return URL
export const redirectToLogin = (returnUrl?: string) => {
  const url = returnUrl
    ? `/login?returnUrl=${encodeURIComponent(returnUrl)}`
    : '/login';
  window.location.href = url;
};
