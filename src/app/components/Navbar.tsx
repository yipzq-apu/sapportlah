'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: 'donor' | 'creator' | 'admin';
  email?: string;
  avatar?: string;
}

interface NavbarProps {
  user?: User | null;
}

export default function Navbar({ user: propUser }: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(propUser || null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load user data from localStorage on component mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setUser(null);
      }
    };

    loadUserData();

    // Listen for storage changes (in case user logs in/out in another tab)
    const handleStorageChange = () => {
      loadUserData();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, []);

  const handleLogout = () => {
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

  const renderAuthenticatedNav = () => {
    if (user?.role === 'creator') {
      return (
        <div className="ml-10 flex items-baseline space-x-4">
          <Link
            href="/dashboard"
            className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
          >
            Dashboard
          </Link>
          <Link
            href="/my-campaigns"
            className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
          >
            My Campaigns
          </Link>
          <Link
            href="/create-campaign"
            className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
          >
            Create Campaign
          </Link>
        </div>
      );
    } else if (user?.role === 'donor') {
      return (
        <div className="ml-10 flex items-baseline space-x-4">
          <Link
            href="/campaigns"
            className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
          >
            Discover
          </Link>
          <Link
            href="/my-donations"
            className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
          >
            My Donations
          </Link>
          <Link
            href="/favorites"
            className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
          >
            Favorites
          </Link>
          <Link
            href="/profile"
            className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
          >
            Profile
          </Link>
        </div>
      );
    }
  };

  const renderGuestNav = () => (
    <div className="ml-10 flex items-baseline space-x-4">
      <Link
        href="/"
        className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
      >
        Home
      </Link>
      <Link
        href="/campaigns"
        className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
      >
        Campaigns
      </Link>
      <Link
        href="/faq"
        className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
      >
        FAQ
      </Link>
    </div>
  );

  const renderAuthButtons = () => {
    if (user) {
      const userName = `${user.firstName} ${user.lastName}`;
      const profilePicture =
        user.avatar ||
        `https://ui-avatars.com/api/?name=${user.firstName}&background=3b82f6&color=fff&size=40`;

      return (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition duration-300"
          >
            <img
              src={profilePicture}
              alt={userName}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">
                  {user.email || 'No email'}
                </p>
              </div>

              <Link
                href="/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-200"
                onClick={() => setIsDropdownOpen(false)}
              >
                <svg
                  className="w-4 h-4 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                My Profile
              </Link>

              {user.role === 'donor' && (
                <>
                  <Link
                    href="/my-donations"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-200"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <svg
                      className="w-4 h-4 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    My Donations
                  </Link>
                  <Link
                    href="/favorites"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-200"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <svg
                      className="w-4 h-4 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                    Favorites
                  </Link>
                </>
              )}

              {user.role === 'creator' && (
                <>
                  <Link
                    href="/my-campaigns"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-200"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <svg
                      className="w-4 h-4 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    My Campaigns
                  </Link>
                </>
              )}

              <div className="border-t border-gray-100 mt-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition duration-200"
                >
                  <svg
                    className="w-4 h-4 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/login"
          className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Register
        </Link>
      </div>
    );
  };

  const getHomePage = () => {
    if (!user) return '/';

    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'creator':
        return '/dashboard';
      case 'donor':
        return '/';
      default:
        return '/';
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href={getHomePage()} className="flex items-center">
              <Image
                src="/logo.png"
                alt="SapportLah Logo"
                width={200}
                height={60}
                className="h-12 w-auto"
              />
            </Link>
          </div>

          <div className="hidden md:block">
            {user ? renderAuthenticatedNav() : renderGuestNav()}
          </div>

          {renderAuthButtons()}
        </div>
      </div>
    </nav>
  );
}
