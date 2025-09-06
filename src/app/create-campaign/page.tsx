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
  end_date: string;
  featured_image: string;
  video_url: string;
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
    end_date: '',
    featured_image: '',
    video_url: '',
  });
  const [campaignImages, setCampaignImages] = useState<CampaignImage[]>([]);

  useEffect(() => {
    const loadData = async () => {
      // Set temporary user for testing - NO AUTHENTICATION REQUIRED
      setUser({
        id: 'temp-creator',
        name: 'Temporary Creator',
        email: 'creator@temp.com',
        role: 'creator',
      });

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
  };

  const handleFileUpload = async (file: File, type: 'image' | 'video') => {
    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (response.ok) {
        const data = await response.json();
        if (type === 'image') {
          setFormData((prev) => ({ ...prev, featured_image: data.url }));
        } else {
          setFormData((prev) => ({ ...prev, video_url: data.url }));
        }
        alert('File uploaded successfully!');
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
      handleFileUpload(file, 'image');
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'video');
    }
  };

  const handleCampaignImageUpload = async (file: File) => {
    if (campaignImages.length >= 5) {
      alert('Maximum 5 campaign images allowed');
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

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
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login?returnUrl=/create-campaign');
        return;
      }

      // Create campaign first
      const response = await fetch('/api/campaigns/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
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
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                image_url: image.url,
                caption: image.caption,
                sort_order: i + 1,
              }),
            });
          }
        }

        alert('Campaign created successfully!');
        router.push('/dashboard');
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

  // Calculate minimum end date (30 days from now)
  const getMinEndDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
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
                />
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image *
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleImageChange}
                    disabled={uploading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 file:text-white file:bg-blue-600 file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 file:hover:bg-blue-700 file:cursor-pointer"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Main campaign image (JPEG, PNG, GIF, max 10MB)
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Video (Optional)
                  </label>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg"
                    onChange={handleVideoChange}
                    disabled={uploading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 file:text-white file:bg-blue-600 file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 file:hover:bg-blue-700 file:cursor-pointer"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Upload a video (MP4, WebM, OGG, max 10MB)
                  </p>
                  {formData.video_url && (
                    <div className="mt-2">
                      <video
                        src={formData.video_url}
                        controls
                        className="w-full h-32 rounded-md"
                      />
                      <p className="text-sm text-green-700 mt-1 font-medium">
                        ✓ Video uploaded successfully
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Campaign Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Campaign Images (Optional)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleCampaignImageChange}
                  disabled={uploading || campaignImages.length >= 5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 file:text-white file:bg-blue-600 file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 file:hover:bg-blue-700 file:cursor-pointer disabled:file:bg-gray-400 disabled:file:cursor-not-allowed"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Upload up to 5 additional images to showcase your campaign (
                  {campaignImages.length}/5)
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

          {/* Funding Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Funding Settings
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Funding Goal (SGD) *
                  </label>
                  <input
                    type="number"
                    name="goal_amount"
                    required
                    min="100"
                    step="0.01"
                    value={formData.goal_amount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-300"
                    placeholder="e.g. 10000"
                  />
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
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Minimum 30 days from today
                  </p>
                </div>
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
              disabled={loading || uploading}
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
