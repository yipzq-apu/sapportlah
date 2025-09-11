'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('userData');
    if (!userData) {
      router.push('/login?returnUrl=' + window.location.pathname);
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      router.push('/unauthorized');
      return;
    }

    setUser({
      ...parsedUser,
      avatar: '/api/placeholder/40/40',
    });
  }, [router]);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      setUser(null); // Update local state
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
      window.location.href = '/';
    }
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    {
      name: 'Featured Campaigns',
      href: '/admin/featured-campaigns',
      icon: '⭐',
    },
    { name: 'Campaign Reviews', href: '/admin/campaigns', icon: '📋' },
    {
      name: 'Status Updater',
      href: '/admin/campaigns/status-updater',
      icon: '🔄',
    },
    { name: 'User Management', href: '/admin/users', icon: '👥' },
    { name: 'Contact Messages', href: '/admin/messages', icon: '💬' },
    { name: 'Reports', href: '/admin/reports', icon: '📈' },
    { name: 'Profile', href: '/admin/profile', icon: '👤' },
    { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ];

  // Add null check for user
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={cancelLogout}
          />
          <div className="relative bg-white rounded-lg shadow-xl p-6 m-4 max-w-sm w-full">
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <span className="text-2xl">🚪</span>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Confirm Logout
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to logout? You will need to login again to
                access the admin panel.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelLogout}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex flex-col w-64 bg-white shadow-xl h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Admin Panel
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    pathname === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div
        className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
        }`}
      >
        <div className="flex flex-col bg-white border-r border-gray-200 h-full">
          <div className="flex items-center justify-between p-4 border-b">
            {!sidebarCollapsed && (
              <h2 className="text-lg font-semibold text-gray-900">
                SapportLah Admin
              </h2>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <span className={`${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`}>
                  {item.icon}
                </span>
                {!sidebarCollapsed && item.name}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t">
            {!sidebarCollapsed ? (
              <>
                <div className="flex items-center mb-3">
                  <img
                    src={user.avatar || '/api/placeholder/40/40'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <img
                  src={user.avatar || '/api/placeholder/40/40'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                  title={user.name}
                />
                <button
                  onClick={handleLogout}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Logout"
                >
                  🚪
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        }`}
      >
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              ☰
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
            <div className="w-6" />
          </div>
        </div>

        {/* Page content */}
        <main className="p-6 bg-gray-50 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
