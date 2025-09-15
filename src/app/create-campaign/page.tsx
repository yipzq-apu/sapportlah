'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface CampaignForm {
  title: string;
  description: string;
  short_description: string;
  goal_amount: string;
  category_id: string;
  start_date: string;
  end_date: string;
  featured_image: string;
}

interface Category {
  id: number;
  name: string;
}

interface CampaignImage {
  url: string;
  caption: string;
}

export default function CreateCampaignPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<CampaignForm>({
    title: '',
    description: '',
    short_description: '',
    goal_amount: '',
    category_id: '',
    start_date: '',
    end_date: '',
    featured_image: '',
  });
  const [campaignImages, setCampaignImages] = useState<CampaignImage[]>([]);
  const [dateErrors, setDateErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const loadData = async () => {
      // Check if user is logged in
      const userData = localStorage.getItem('userData');
      if (!userData) {
        router.push('/login?returnUrl=/create-campaign');
        return;
      }

      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'creator') {
        router.push('/unauthorized');
        return;
      }

      setUser(parsedUser);

      // Fetch categories
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    loadData();
  }, [router]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear date errors when user changes dates
    if (name === 'start_date' || name === 'end_date') {
      setDateErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateDates = () => {
    const errors: { [key: string]: string } = {};
    const today = new Date();
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);

    // Validate start date
    if (formData.start_date) {
      const minStartDate = new Date();
      minStartDate.setDate(today.getDate() + 3);
      const maxStartDate = new Date();
      maxStartDate.setDate(today.getDate() + 10);

      if (startDate < minStartDate) {
        errors.start_date = 'Start date must be at least 3 days from today';
      } else if (startDate > maxStartDate) {
        errors.start_date = 'Start date cannot be more than 10 days from today';
      }
    }

    // Validate end date
    if (formData.end_date && formData.start_date) {
      const minEndDate = new Date(startDate);
      minEndDate.setDate(startDate.getDate() + 7);
      const maxEndDate = new Date(startDate);
      maxEndDate.setDate(startDate.getDate() + 60);

      if (endDate < minEndDate) {
        errors.end_date = 'End date must be at least 7 days after start date';
      } else if (endDate > maxEndDate) {
        errors.end_date =
          'End date cannot be more than 60 days after start date';
      }
    }

    setDateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileUpload = async (file: File) => {
    // Validate file type before upload - only allow PNG, JPG, JPEG
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      alert('Invalid file type. Only PNG, JPG, and JPEG files are allowed.');
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
      uploadFormData.append('type', 'image'); // Specify image type

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({ ...prev, featured_image: data.url }));
        alert('Image uploaded successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
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

  const handleCampaignImageUpload = async (file: File) => {
    if (campaignImages.length >= 5) {
      alert('Maximum 5 campaign images allowed');
      return;
    }

    // Validate file type before upload - only allow PNG, JPG, JPEG
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      alert('Invalid file type. Only PNG, JPG, and JPEG files are allowed.');
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
      uploadFormData.append('type', 'image'); // Specify image type

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (response.ok) {
        const data = await response.json();
        setCampaignImages((prev) => [...prev, { url: data.url, caption: '' }]);
        alert('Campaign image uploaded successfully!');
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

  const handleCampaignImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handleCampaignImageUpload(file);
    }
    // Reset input value to allow uploading the same file again
    e.target.value = '';
  };

  const updateImageCaption = (index: number, caption: string) => {
    setCampaignImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, caption } : img))
    );
  };

  const removeImage = (index: number) => {
    setCampaignImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate dates before submission
    if (!validateDates()) {
      alert('Please fix the date validation errors before submitting.');
      return;
    }

    setLoading(true);

    try {
      if (!user) {
        router.push('/login?returnUrl=/create-campaign');
        return;
      }

      // Create campaign first with properly formatted goal_amount
      const response = await fetch('/api/campaigns/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          goal_amount: parseInt(formData.goal_amount), // Convert to integer
          userId: user.id,
        }),
      });

      if (response.ok) {
        const campaignData = await response.json();
        const campaignId = campaignData.campaignId;

        // Upload campaign images if any
        if (campaignImages.length > 0 && campaignId) {
          for (let i = 0; i < campaignImages.length; i++) {
            const image = campaignImages[i];
            await fetch(`/api/campaigns/${campaignId}/images`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                image_url: image.url,
                caption: image.caption,
                sort_order: i + 1,
              }),
            });
          }
        }

        alert(
          'Campaign created successfully! It will be reviewed before going live.'
        );
        router.push('/my-campaigns');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate date ranges for validation display
  const getMinStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toISOString().split('T')[0];
  };

  const getMaxStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 10);
    return date.toISOString().split('T')[0];
  };

  const getMinEndDate = () => {
    if (!formData.start_date) return '';
    const date = new Date(formData.start_date);
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };

  const getMaxEndDate = () => {
    if (!formData.start_date) return '';
    const date = new Date(formData.start_date);
    date.setDate(date.getDate() + 60);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Create New Campaign
          </h1>
          <p className="text-lg text-gray-600">
            Launch your fundraising campaign and bring your project to life.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Basic Information
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-300"
                  placeholder="Enter a compelling campaign title"
                  maxLength={100}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Keep it concise and compelling ({formData.title.length}/100
                  characters)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description *
                </label>
                <textarea
                  name="short_description"
                  required
                  rows={3}
                  value={formData.short_description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-300"
                  placeholder="Brief description of your campaign (150 characters max)"
                  maxLength={150}
                />
                <p className="text-sm text-gray-600 mt-1">
                  {formData.short_description.length}/150 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category_id"
                  required
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Campaign Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Campaign Details
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={8}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-300"
                  placeholder="Tell your story. Explain what you're raising money for, why it matters, and how the funds will be used..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image *
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpg,image/jpeg"
                  onChange={handleImageChange}
                  disabled={uploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 file:text-white file:bg-blue-600 file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 file:hover:bg-blue-700 file:cursor-pointer"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Main campaign image (PNG, JPG, JPEG, max 10MB)
                </p>
                {formData.featured_image && (
                  <div className="mt-2">
                    <img
                      src={formData.featured_image}
                      alt="Featured Preview"
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <p className="text-sm text-green-700 mt-1 font-medium">
                      ✓ Featured image uploaded successfully
                    </p>
                  </div>
                )}
              </div>

              {/* Campaign Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Campaign Images (Optional)
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpg,image/jpeg"
                  onChange={handleCampaignImageChange}
                  disabled={uploading || campaignImages.length >= 5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 file:text-white file:bg-blue-600 file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 file:hover:bg-blue-700 file:cursor-pointer disabled:file:bg-gray-400 disabled:file:cursor-not-allowed"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Upload up to 5 additional images to showcase your campaign
                  (PNG, JPG, JPEG, max 10MB each) ({campaignImages.length}/5)
                </p>

                {/* Display uploaded campaign images */}
                {campaignImages.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {campaignImages.map((image, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-md p-4"
                      >
                        <div className="flex items-start space-x-4">
                          <img
                            src={image.url}
                            alt={`Campaign image ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Caption (Optional)
                            </label>
                            <input
                              type="text"
                              value={image.caption}
                              onChange={(e) =>
                                updateImageCaption(index, e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-300"
                              placeholder="Describe this image..."
                              maxLength={100}
                            />
                            <p className="text-xs text-gray-600 mt-1">
                              {image.caption.length}/100 characters
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {uploading && (
                <div className="text-center py-4">
                  <div className="text-blue-700 font-medium">
                    Uploading file... Please wait.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Funding & Timeline Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Funding & Timeline Settings
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funding Goal (MYR) *
                </label>
                <input
                  type="number"
                  name="goal_amount"
                  required
                  min="100"
                  value={formData.goal_amount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-300"
                  placeholder="e.g. 10000"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Enter whole numbers only (e.g., 10000)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Start Date *
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    required
                    min={getMinStartDate()}
                    max={getMaxStartDate()}
                    value={formData.start_date}
                    onChange={handleInputChange}
                    onBlur={validateDates}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                      dateErrors.start_date
                        ? 'border-red-300'
                        : 'border-gray-300'
                    }`}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Must be 3-10 days from today
                  </p>
                  {dateErrors.start_date && (
                    <p className="text-sm text-red-600 mt-1">
                      {dateErrors.start_date}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign End Date *
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    required
                    min={getMinEndDate()}
                    max={getMaxEndDate()}
                    value={formData.end_date}
                    onChange={handleInputChange}
                    onBlur={validateDates}
                    disabled={!formData.start_date}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      dateErrors.end_date ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Must be 7-60 days after start date
                  </p>
                  {dateErrors.end_date && (
                    <p className="text-sm text-red-600 mt-1">
                      {dateErrors.end_date}
                    </p>
                  )}
                </div>
              </div>

              {/* Date validation summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Campaign Timeline Guidelines:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • Start date: 3-10 days from today (allows time for final
                    preparations)
                  </li>
                  <li>
                    • End date: 7-60 days after start date (optimal campaign
                    duration)
                  </li>
                  <li>
                    • Your campaign will be reviewed before the start date
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading || uploading || Object.keys(dateErrors).length > 0
              }
              className="px-6 py-3 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition duration-300"
            >
              {loading ? 'Creating Campaign...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
