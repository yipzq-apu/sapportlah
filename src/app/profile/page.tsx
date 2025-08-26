'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface UserProfile {
  id: string;
  name: string;
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
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');

        if (!token) {
          // Redirect to login if no token
          window.location.href = '/login?returnUrl=/profile';
          return;
        }

        // Fetch user data from API
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token is invalid or expired, redirect to login
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            window.location.href = '/login?returnUrl=/profile';
            return;
          }
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        const user = data.user;

        // Create complete profile data
        const userProfile: UserProfile = {
          id: user.id.toString(),
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          role: user.role,
          avatar: user.profile_image || '/api/placeholder/150/150',
          location: user.address || 'Not provided',
          bio: user.bio || 'No bio provided',
          phone: user.phone,
          joinDate: user.created_at,
          totalDonations: 0, // This would come from donations table
          campaignsSupported: 0, // This would come from donations/campaigns data
          settings: {
            emailNotifications: true,
            publicProfile: true,
            anonymousDonations: false,
          },
        };

        setUser(userProfile);
        setFormData(userProfile);
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Handle error - maybe show error message or redirect to login
        alert('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
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
    // Handle profile update
    console.log('Updating profile:', formData);
    setUser(formData as UserProfile);
    setEditing(false);
    alert('Profile updated successfully!');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

  if (!user) return null;

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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      rows={4}
                      value={formData.bio || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      Privacy Settings
                    </h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="settings.emailNotifications"
                          checked={
                            formData.settings?.emailNotifications || false
                          }
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Receive email notifications about campaign updates
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="settings.publicProfile"
                          checked={formData.settings?.publicProfile || false}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Make my profile visible to other users
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="settings.anonymousDonations"
                          checked={
                            formData.settings?.anonymousDonations || false
                          }
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Make all my donations anonymous by default
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition duration-300"
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
                        Full Name
                      </label>
                      <p className="text-gray-900">{user.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Phone
                      </label>
                      <p className="text-gray-900">
                        {user.phone || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Location
                      </label>
                      <p className="text-gray-900">
                        {user.location || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Bio
                    </label>
                    <p className="text-gray-900">
                      {user.bio || 'No bio provided'}
                    </p>
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
