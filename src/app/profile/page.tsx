'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MapLocationPicker from '../components/MapLocationPicker';

interface UserProfile {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'donor' | 'creator';
  avatar?: string;
  organizationName?: string;
  phone?: string;
  address?: string;
  joinDate: string;
  totalDonations: number;
  campaignsSupported: number;
  notifications: boolean;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [tempAddress, setTempAddress] = useState('');

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

        // Use userId if available, fallback to email
        const userId = parsedUser.id;
        const email = parsedUser.email;

        // Prefer userId over email for API calls to avoid issues with changed emails
        const queryParam = userId
          ? `userId=${userId}`
          : `email=${encodeURIComponent(email)}`;

        // Fetch complete user profile from API
        const response = await fetch(`/api/auth/user-data?${queryParam}`);

        if (response.ok) {
          const data = await response.json();

          // Fetch user statistics
          const statsResponse = await fetch(
            `/api/profile/user-stats?userId=${data.user.id}`
          );

          let userStats = {
            totalDonated: 0,
            campaignsSupported: 0,
            totalDonations: 0,
          };

          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            userStats = statsData.stats;
          }

          const profile = {
            id: data.user.id,
            name:
              data.user.organization_name ||
              `${data.user.first_name} ${data.user.last_name}`,
            firstName: data.user.first_name,
            lastName: data.user.last_name,
            email: data.user.email, // Use the current email from database
            role: data.user.role,
            avatar:
              data.user.profile_image ||
              `https://ui-avatars.com/api/?name=${data.user.first_name}&background=3b82f6&color=fff&size=150`,
            organizationName: data.user.organization_name,
            phone: data.user.phone,
            address: data.user.address,
            joinDate: data.user.created_at,
            totalDonations: userStats.totalDonated,
            campaignsSupported: userStats.campaignsSupported,
            notifications: data.user.notifications === 1,
          };
          setUser(profile);
          setFormData(profile);

          // Update localStorage with current data from database
          localStorage.setItem(
            'userData',
            JSON.stringify({
              ...parsedUser,
              firstName: data.user.first_name,
              lastName: data.user.last_name,
              email: data.user.email, // Update with current email from database
              profile_image: data.user.profile_image,
              organization_name: data.user.organization_name,
            })
          );
        } else {
          console.error('Failed to load profile');
          setUser(null);
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
      setFormData((prev) => ({ ...prev, [name]: checkbox.checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (file: File) => {
    // Validate file type - only allow PNG, JPG, JPEG
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      alert('Invalid file type. Only PNG, JPG, and JPEG files are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('type', 'image');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Image uploaded successfully:', data.url); // Debug log
        setFormData((prev) => ({ ...prev, avatar: data.url }));
        alert('Profile image uploaded successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password if changing
    if (showPasswordFields) {
      if (!passwordData.currentPassword) {
        alert('Please enter your current password');
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        alert('New passwords do not match');
        return;
      }
      if (passwordData.newPassword.length < 6) {
        alert('New password must be at least 6 characters long');
        return;
      }
    }

    try {
      const updateData = {
        userId: user?.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        organizationName: formData.organizationName,
        phone: formData.phone,
        address: formData.address,
        profileImage: formData.avatar,
        notifications: formData.notifications ? 1 : 0,
        ...(showPasswordFields && {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      };

      console.log(
        'Sending profile update with image:',
        updateData.profileImage
      );

      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        // Reload complete user profile data using userId instead of email
        const userResponse = await fetch(
          `/api/auth/user-data?userId=${user!.id}`
        );

        if (userResponse.ok) {
          const userData = await userResponse.json();
          const updatedUser = {
            ...user!,
            ...formData,
            avatar: userData.user.profile_image || formData.avatar,
            name:
              formData.organizationName ||
              `${formData.firstName} ${formData.lastName}`,
          };
          setUser(updatedUser);

          // Update localStorage with new profile data including updated email
          const localUserData = localStorage.getItem('userData');
          if (localUserData) {
            const parsedUserData = JSON.parse(localUserData);
            localStorage.setItem(
              'userData',
              JSON.stringify({
                ...parsedUserData,
                id: user!.id,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                profile_image: userData.user.profile_image,
                organization_name: formData.organizationName,
                phone: formData.phone,
                address: formData.address,
                notifications: formData.notifications ? 1 : 0,
                role: user!.role,
                // Keep both field name formats for compatibility
                first_name: formData.firstName,
                last_name: formData.lastName,
              })
            );
          }

          // Trigger a custom event to notify other components (like Navbar) to refresh
          window.dispatchEvent(
            new CustomEvent('userProfileUpdated', {
              detail: {
                profile_image: userData.user.profile_image,
                firstName: formData.firstName,
                lastName: formData.lastName,
                organization_name: formData.organizationName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                notifications: formData.notifications,
              },
            })
          );
        }

        setEditing(false);
        setShowPasswordFields(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        alert('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('Profile update failed:', errorData);
        alert(errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleLocationSelect = (location: {
    address: string;
    lat: number;
    lng: number;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      address: location.address,
    }));
    setShowMap(false);
    setTempAddress('');
  };

  const handleMapOpen = () => {
    setTempAddress(formData.address || '');
    setShowMap(true);
  };

  const handleMapCancel = () => {
    setFormData((prev) => ({
      ...prev,
      address: tempAddress,
    }));
    setShowMap(false);
    setTempAddress('');
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Profile</h1>
          <p className="text-lg text-gray-600">
            Manage your account information and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Profile Summary - Wider */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <img
                    src={
                      formData.avatar ||
                      user.avatar ||
                      '/api/placeholder/150/150'
                    }
                    alt={user.name}
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-gray-200"
                  />
                  {editing && (
                    <label className="absolute bottom-4 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      <input
                        type="file"
                        accept="image/png,image/jpg,image/jpeg"
                        onChange={handleImageChange}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                      <div className="text-white text-xs">Uploading...</div>
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                  {formData.organizationName ||
                    `${formData.firstName} ${formData.lastName}`}
                </h2>
                <p className="text-gray-500 mb-2">
                  {formData.address || 'No address provided'}
                </p>
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 text-sm font-medium rounded-full capitalize">
                  {user.role}
                </span>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">
                      Member since
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatDate(user.joinDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">
                      Total donated
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(user.totalDonations)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">
                      Campaigns supported
                    </span>
                    <span className="font-semibold text-gray-900">
                      {user.campaignsSupported}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">
                      Email notifications
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        user.notifications ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {user.notifications ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Profile Information
                </h3>
                <button
                  onClick={() => {
                    setEditing(!editing);
                    if (editing) {
                      setShowPasswordFields(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                    }
                  }}
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
                        First Name *
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
                        Last Name *
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
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Name (Optional)
                      </label>
                      <input
                        type="text"
                        name="organizationName"
                        value={formData.organizationName || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-900 placeholder-gray-400"
                        placeholder="Enter your organization name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
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
                        Address
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          name="address"
                          value={formData.address || ''}
                          onChange={handleInputChange}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-900 placeholder-gray-400"
                          placeholder="Enter your address or use map to select"
                        />
                        <button
                          type="button"
                          onClick={handleMapOpen}
                          className="px-4 py-3 bg-blue-600 text-white border border-blue-600 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition duration-200"
                        >
                          📍 Map
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password Change Section */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900">
                        Change Password
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswordFields(!showPasswordFields)
                        }
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        {showPasswordFields ? 'Cancel' : 'Change Password'}
                      </button>
                    </div>

                    {showPasswordFields && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password *
                          </label>
                          <input
                            type="password"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-900"
                            placeholder="Enter current password"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password *
                          </label>
                          <input
                            type="password"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-900"
                            placeholder="Enter new password"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password *
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-900"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notification Settings */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      Notification Settings
                    </h4>
                    <div className="space-y-4">
                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          name="notifications"
                          checked={formData.notifications || false}
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
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setShowPasswordFields(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        });
                      }}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition duration-300"
                    >
                      {uploading ? 'Uploading...' : 'Save Changes'}
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
                        Organization Name
                      </label>
                      <p className="text-gray-900">
                        {user.organizationName || 'Not provided'}
                      </p>
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
                        Address
                      </label>
                      <p className="text-gray-900">
                        {user.address || 'Not provided'}
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
                            user.notifications
                              ? 'text-green-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {user.notifications ? 'Enabled' : 'Disabled'}
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

      {/* Map Modal */}
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Select Your Location
              </h3>
              <button
                type="button"
                onClick={handleMapCancel}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition duration-200"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-6" style={{ height: '500px' }}>
              <MapLocationPicker
                onLocationSelect={handleLocationSelect}
                onCancel={handleMapCancel}
                initialLocation={undefined}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
