'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface UserProfile {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'donor' | 'creator';
  avatar?: string;
  location?: string;
  bio?: string;
  phone?: string;
  joinDate: string;
  totalDonations: number;
  campaignsSupported: number;
  settings: {
    emailNotifications: boolean;
    publicProfile: boolean;
    anonymousDonations: boolean;
  };
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Check if user is logged in
        const userData = localStorage.getItem('userData');
        if (!userData) {
          setUser(null);
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(userData);

        // Fetch profile from backend
        const response = await fetch(`/api/profile?userId=${parsedUser.id}`);

        if (response.ok) {
          const data = await response.json();
          setUser(data.profile);
          setFormData(data.profile);
        } else {
          console.error('Failed to load profile');
          // Fallback to localStorage data
          const fallbackProfile: UserProfile = {
            id: parsedUser.id,
            name: `${parsedUser.firstName} ${parsedUser.lastName}`,
            firstName: parsedUser.firstName,
            lastName: parsedUser.lastName,
            email: parsedUser.email,
            role: parsedUser.role,
            avatar: `https://ui-avatars.com/api/?name=${parsedUser.firstName}&background=3b82f6&color=fff&size=150`,
            location: '',
            bio: '',
            phone: '',
            joinDate: new Date().toISOString(),
            totalDonations: 0,
            campaignsSupported: 0,
            settings: {
              emailNotifications: true,
              publicProfile: true,
              anonymousDonations: false,
            },
          };
          setUser(fallbackProfile);
          setFormData(fallbackProfile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      if (name.startsWith('settings.')) {
        const settingKey = name.split('.')[1];
        setFormData((prev) => ({
          ...prev,
          settings: {
            emailNotifications: false,
            publicProfile: false,
            anonymousDonations: false,
            ...prev.settings,
            [settingKey]: checkbox.checked,
          },
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: checkbox.checked }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
        }),
      });

      if (response.ok) {
        // Update local state
        const updatedUser = {
          ...user!,
          ...formData,
          name: `${formData.firstName} ${formData.lastName}`,
        };
        setUser(updatedUser);

        // Update localStorage
        const userData = localStorage.getItem('userData');
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          localStorage.setItem(
            'userData',
            JSON.stringify({
              ...parsedUserData,
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
            })
          );
        }

        setEditing(false);
        alert('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading profile...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={null} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-xl text-gray-600 mb-4">
              Please log in to view your profile
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Profile</h1>
          <p className="text-lg text-gray-600">
            Manage your account information and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <img
                  src={user.avatar || '/api/placeholder/150/150'}
                  alt={user.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4"
                />
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {user.name}
                </h2>
                <p className="text-gray-500 mb-2">{user.location}</p>
                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded-full capitalize">
                  {user.role}
                </span>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Member since</span>
                    <span
                      className="font-medium truncate ml-2"
                      title={formatDate(user.joinDate)}
                    >
                      {formatDate(user.joinDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total donated</span>
                    <span
                      className="font-medium truncate ml-2"
                      title={formatCurrency(user.totalDonations)}
                    >
                      {formatCurrency(user.totalDonations)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Campaigns supported</span>
                    <span className="font-medium truncate ml-2">
                      {user.campaignsSupported}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Profile Information
                </h3>
                <button
                  onClick={() => setEditing(!editing)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition duration-300"
                >
                  {editing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-900 placeholder-gray-400"
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-900 placeholder-gray-400"
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-900 placeholder-gray-400"
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-900 placeholder-gray-400"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-900 placeholder-gray-400"
                        placeholder="Enter your location (city, state, country)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      rows={4}
                      value={formData.bio || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-900 placeholder-gray-400 resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      Privacy Settings
                    </h4>
                    <div className="space-y-4">
                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          name="settings.emailNotifications"
                          checked={
                            formData.settings?.emailNotifications || false
                          }
                          onChange={handleInputChange}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-700">
                            Email notifications
                          </span>
                          <p className="text-xs text-gray-500">
                            Receive email notifications about campaign updates
                            and platform news
                          </p>
                        </div>
                      </label>
                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          name="settings.publicProfile"
                          checked={formData.settings?.publicProfile || false}
                          onChange={handleInputChange}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-700">
                            Public profile
                          </span>
                          <p className="text-xs text-gray-500">
                            Make my profile visible to other users on the
                            platform
                          </p>
                        </div>
                      </label>
                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          name="settings.anonymousDonations"
                          checked={
                            formData.settings?.anonymousDonations || false
                          }
                          onChange={handleInputChange}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-700">
                            Anonymous donations by default
                          </span>
                          <p className="text-xs text-gray-500">
                            Make all my donations anonymous by default (can be
                            changed per donation)
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition duration-300"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        First Name
                      </label>
                      <p className="text-gray-900">{user.firstName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Last Name
                      </label>
                      <p className="text-gray-900">{user.lastName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Email Address
                      </label>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Phone Number
                      </label>
                      <p className="text-gray-900">
                        {user.phone || 'Not provided'}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Location
                      </label>
                      <p className="text-gray-900">
                        {user.location || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      Privacy Settings
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          Email notifications
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            user.settings.emailNotifications
                              ? 'text-green-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {user.settings.emailNotifications
                            ? 'Enabled'
                            : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          Public profile
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            user.settings.publicProfile
                              ? 'text-green-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {user.settings.publicProfile ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          Anonymous donations
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            user.settings.anonymousDonations
                              ? 'text-green-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {user.settings.anonymousDonations
                            ? 'Default'
                            : 'Optional'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
