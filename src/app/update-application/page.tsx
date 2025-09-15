'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MapLocationPicker from '@/app/components/MapLocationPicker';
import Image from 'next/image';

export default function UpdateApplicationPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    idType: 'ic' as 'ic' | 'passport',
    idNumber: '',
    address: '',
    password: '',
    confirmPassword: '',
    role: 'donor' as 'donor' | 'creator',
    organizationName: '',
    supportingDocument: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [tempAddress, setTempAddress] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [ageError, setAgeError] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const reasonParam = searchParams.get('reason');

    if (emailParam) {
      setEmail(emailParam);
      setRejectionReason(reasonParam || '');
      fetchUserData(emailParam);
    }
  }, [searchParams]);

  const fetchUserData = async (userEmail: string) => {
    try {
      const response = await fetch(
        `/api/auth/user-data?email=${encodeURIComponent(userEmail)}`
      );
      if (response.ok) {
        const data = await response.json();
        const user = data.user;

        setFormData({
          email: user.email || '',
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          phone: user.phone || '',
          dateOfBirth: user.date_of_birth || '',
          idType: user.ic_passport_type || 'ic',
          idNumber: user.ic_passport_number || '',
          address: user.address || '',
          password: '',
          confirmPassword: '',
          role: user.role || 'donor',
          organizationName: user.organization_name || '',
          supportingDocument: user.supporting_document || '',
        });
        setUserExists(true);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Clear age error when user changes date of birth
    if (e.target.name === 'dateOfBirth') {
      setAgeError('');
    }
  };

  const validateAge = () => {
    if (!formData.dateOfBirth) return false;

    const today = new Date();
    const birthDate = new Date(formData.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 18) {
      setAgeError('You must be at least 18 years old to register');
      return false;
    }

    setAgeError('');
    return true;
  };

  const handleFileUpload = async (file: File) => {
    // Validate file type - only PDF allowed
    if (file.type !== 'application/pdf') {
      alert('Invalid file type. Only PDF files are allowed.');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('File size too large. Maximum size is 10MB.');
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('type', 'document');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({ ...prev, supportingDocument: data.url }));
        alert('Document uploaded successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate age before submission
    if (!validateAge()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/update-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Update failed');
      }

      // Redirect to success page
      window.location.href = '/application-updated';
    } catch (err: any) {
      setError(err.message || 'Update failed. Please try again.');
    } finally {
      setLoading(false);
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
    setFormData({
      ...formData,
      address: location.address,
    });
    setShowMap(false);
    setTempAddress('');
  };

  const handleMapOpen = () => {
    setTempAddress(formData.address);
    setShowMap(true);
  };

  const handleMapCancel = () => {
    setFormData({
      ...formData,
      address: tempAddress,
    });
    setShowMap(false);
    setTempAddress('');
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Invalid Access
          </h2>
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="flex justify-center">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="SapportLah Logo"
              width={200}
              height={60}
              className="h-12 w-auto"
            />
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Update Your Application
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please review and update your information below
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Rejection Reason Display */}
          {rejectionReason && (
            <div className="mb-6 border border-red-200 bg-red-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-800 mb-2">
                Reason for rejection:
              </h3>
              <p className="text-sm text-red-700">{rejectionReason}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Email Display */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
              />
            </div>

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="organizationName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Organization Name (Optional)
                  </label>
                  <div className="mt-1">
                    <input
                      id="organizationName"
                      name="organizationName"
                      type="text"
                      value={formData.organizationName}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="Enter your organization name (if applicable)"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Leave blank if registering as an individual
                  </p>
                </div>

                {/* Supporting Document Upload - Only show if organization name is filled */}
                {formData.organizationName && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supporting Document (Optional)
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleDocumentChange}
                      disabled={uploading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 file:text-white file:bg-blue-600 file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 file:hover:bg-blue-700 file:cursor-pointer disabled:file:bg-gray-400 disabled:file:cursor-not-allowed"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Upload organization registration certificate or other
                      supporting documents (PDF only, max 10MB)
                    </p>
                    {formData.supportingDocument && (
                      <div className="mt-2">
                        <div className="flex items-center text-sm text-green-700">
                          <span className="mr-2">📄</span>
                          <span className="font-medium">
                            Document uploaded successfully
                          </span>
                          <a
                            href={formData.supportingDocument}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 hover:text-blue-700 underline"
                          >
                            View
                          </a>
                        </div>
                      </div>
                    )}
                    {uploading && (
                      <div className="mt-2 text-center py-2">
                        <div className="text-blue-700 font-medium text-sm">
                          Uploading document... Please wait.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="dateOfBirth"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Date of Birth
                  </label>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    onBlur={validateAge}
                    max={
                      new Date(
                        new Date().setFullYear(new Date().getFullYear() - 18)
                      )
                        .toISOString()
                        .split('T')[0]
                    }
                    className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                      ageError ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    You must be at least 18 years old to register
                  </p>
                  {ageError && (
                    <p className="text-sm text-red-600 mt-1">{ageError}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="idType"
                    className="block text-sm font-medium text-gray-700"
                  >
                    ID Type
                  </label>
                  <select
                    id="idType"
                    name="idType"
                    value={formData.idType}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="ic">IC (Identity Card)</option>
                    <option value="passport">Passport</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="idNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {formData.idType === 'ic' ? 'IC Number' : 'Passport Number'}
                  </label>
                  <input
                    id="idNumber"
                    name="idNumber"
                    type="text"
                    required
                    value={formData.idNumber}
                    onChange={handleChange}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Contact Information
              </h3>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Address Information
              </h3>
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Street Address
                </label>
                <div className="mt-1 flex">
                  <input
                    id="address"
                    name="address"
                    type="text"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="flex-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-l-md placeholder-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={handleMapOpen}
                    className="px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    📍 Map
                  </button>
                </div>

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
            </div>

            {/* Password Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Password (Optional - Leave blank to keep current password)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    New Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/login"
                className="flex-1 text-center bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition duration-300"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition duration-300"
              >
                {loading
                  ? 'Updating...'
                  : uploading
                  ? 'Uploading document...'
                  : 'Update Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
