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
  profile_image?: string;
  organization_name?: string;
  first_name?: string;
  last_name?: string;
}

interface NavbarProps {
  user?: User | null;
}

export default function Navbar({ user: propUser }: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(propUser || null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      <Link
        href="/about"
        className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
      >
        About Us
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
              src={
                user.profile_image ||
                `https://ui-avatars.com/api/?name=${
                  user.first_name || user.firstName
                }&background=3b82f6&color=fff&size=32`
              }
              alt={
                user.organization_name ||
                `${user.first_name || user.firstName} ${
                  user.last_name || user.lastName
                }`
              }
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900">
                {user.organization_name ||
                  `${user.first_name || user.firstName} ${
                    user.last_name || user.lastName
                  }`}
              </p>
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
                <p className="text-sm font-medium text-gray-900">
                  {user.organization_name ||
                    `${user.first_name || user.firstName} ${
                      user.last_name || user.lastName
                    }`}
                </p>
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

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedUser = JSON.parse(userData);

        // Fetch complete user data including profile image using userId if available, fallback to email
        try {
          const userId = parsedUser.id;
          const email = parsedUser.email;

          // Prefer userId over email for API calls
          const queryParam = userId
            ? `userId=${userId}`
            : `email=${encodeURIComponent(email)}`;
          const response = await fetch(`/api/auth/user-data?${queryParam}`);

          if (response.ok) {
            const data = await response.json();
            const updatedUser = {
              ...parsedUser,
              profile_image: data.user.profile_image,
              organization_name: data.user.organization_name,
              first_name: data.user.first_name,
              last_name: data.user.last_name,
              email: data.user.email, // Update email from database
            };
            setUser(updatedUser);

            // Update localStorage with fresh data
            localStorage.setItem('userData', JSON.stringify(updatedUser));
          } else {
            setUser(parsedUser);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(parsedUser);
        }
      }
    };

    fetchUserData();

    // Listen for profile updates
    const handleProfileUpdate = (event: CustomEvent) => {
      const updatedData = event.detail;
      setUser((prevUser) =>
        prevUser
          ? {
              ...prevUser,
              profile_image: updatedData.profile_image,
              first_name: updatedData.firstName,
              last_name: updatedData.lastName,
              firstName: updatedData.firstName,
              lastName: updatedData.lastName,
              organization_name: updatedData.organization_name,
              email: updatedData.email,
              phone: updatedData.phone,
              address: updatedData.address,
              notifications: updatedData.notifications,
            }
          : null
      );

      // Also update localStorage from the event data
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        localStorage.setItem(
          'userData',
          JSON.stringify({
            ...parsedUserData,
            firstName: updatedData.firstName,
            lastName: updatedData.lastName,
            email: updatedData.email,
            profile_image: updatedData.profile_image,
            organization_name: updatedData.organization_name,
            phone: updatedData.phone,
            address: updatedData.address,
            notifications: updatedData.notifications ? 1 : 0,
            // Keep both field name formats for compatibility
            first_name: updatedData.firstName,
            last_name: updatedData.lastName,
          })
        );
      }
    };

    window.addEventListener(
      'userProfileUpdated',
      handleProfileUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        'userProfileUpdated',
        handleProfileUpdate as EventListener
      );
    };
  }, []);

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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? renderAuthenticatedNav() : renderGuestNav()}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-100 transition duration-300"
            >
              <svg
                className="w-6 h-6 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>

            {isMobileMenuOpen && (
              <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t z-50">
                <div className="px-4 py-2 space-y-1">
                  <Link
                    href="/"
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/campaigns"
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Browse Campaigns
                  </Link>
                  <Link
                    href="/about"
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    About Us
                  </Link>
                  <Link
                    href="/faq"
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    FAQ
                  </Link>
                </div>
              </div>
            )}
          </div>

          {renderAuthButtons()}
        </div>
      </div>
    </nav>
  );
}
