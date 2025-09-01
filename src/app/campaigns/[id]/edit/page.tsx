'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

interface CampaignForm {
  title: string;
  description: string;
  short_description: string;
  goal_amount: string;
  category_id: string;
  end_date: string;
  featured_image: string;
  video_url: string;
  status: string;
}

interface Category {
  id: number;
  name: string;
}

interface CampaignImage {
  id: number;
  url: string;
  caption: string;
}

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [campaignImages, setCampaignImages] = useState<CampaignImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    status: 'draft',
  });

  useEffect(() => {
    const loadData = async () => {
      // Set temporary user for testing
      setUser({
        id: 'temp-creator',
        name: 'Temporary Creator',
        email: 'creator@temp.com',
        role: 'creator',
      });

      // Mock categories
      const mockCategories: Category[] = [
        { id: 1, name: 'Education' },
        { id: 2, name: 'Healthcare' },
        { id: 3, name: 'Environment' },
        { id: 4, name: 'Community' },
        { id: 5, name: 'Technology' },
        { id: 6, name: 'Arts & Culture' },
        { id: 7, name: 'Sports' },
        { id: 8, name: 'Emergency' },
      ];

      // Mock existing campaign data
      const mockCampaign: CampaignForm = {
        title: 'Clean Water for Rural Communities',
        description: 'We are working to provide clean and safe drinking water to rural communities that lack access to basic water infrastructure. This project will install water wells and purification systems in 5 villages, benefiting over 2,000 people. The funds will be used for equipment, installation, training local maintenance staff, and ensuring sustainable operation for years to come.',
        short_description: 'Providing clean water access to remote villages through well installation and purification systems.',
        goal_amount: '50000',
        category_id: '3',
        end_date: '2024-06-15',
        featured_image: '/api/placeholder/600/400',
        video_url: '',
        status: 'active',
      };

      // Mock campaign images
      const mockImages: CampaignImage[] = [
        { id: 1, url: '/api/placeholder/300/200', caption: 'Current water source in the village' },
        { id: 2, url: '/api/placeholder/300/200', caption: 'Community meeting about the project' },
        { id: 3, url: '/api/placeholder/300/200', caption: 'Proposed well location' },
      ];

      setCategories(mockCategories);
      setFormData(mockCampaign);
      setCampaignImages(mockImages);
      setLoading(false);
    };

    loadData();
  }, [campaignId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (file: File, type: 'image' | 'video') => {
    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      // Mock upload
      const mockUrl = `/api/placeholder/600/400`;
      
      if (type === 'image') {
        setFormData(prev => ({ ...prev, featured_image: mockUrl }));
      } else {
        setFormData(prev => ({ ...prev, video_url: mockUrl }));
      }
      
      alert('File uploaded successfully!');
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

  const addCampaignImage = async (file: File) => {
    if (campaignImages.length >= 5) {
      alert('Maximum 5 campaign images allowed');
      return;
    }

    setUploading(true);
    try {
      // Mock upload
      const newImage: CampaignImage = {
        id: Date.now(),
        url: '/api/placeholder/300/200',
        caption: '',
      };
      
      setCampaignImages(prev => [...prev, newImage]);
      alert('Campaign image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCampaignImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addCampaignImage(file);
    }
    e.target.value = '';
  };

  const updateImageCaption = (imageId: number, caption: string) => {
    setCampaignImages(prev => 
      prev.map(img => 
        img.id === imageId ? { ...img, caption } : img
      )
    );
  };

  const removeImage = (imageId: number) => {
    setCampaignImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Mock saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Campaign updated successfully!');
      router.push(`/campaigns/${campaignId}`);
    } catch (error) {
      console.error('Error updating campaign:', error);
      alert('Failed to update campaign. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getMinEndDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading campaign...</div>
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Edit Campaign
            </h1>
            <p className="text-lg text-gray-600">
              Update your campaign details and settings.
            </p>
          </div>
          <div className="flex space-x-4">
            <Link
              href={`/campaigns/${campaignId}`}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View Campaign
            </Link>
            <Link
              href={`/campaigns/${campaignId}/updates`}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
            >
              Manage Updates
            </Link>
          </div>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.status === 'draft' && 'Campaign is not visible to public'}
                  {formData.status === 'active' && 'Campaign is live and accepting donations'}
                  {formData.status === 'paused' && 'Campaign is visible but not accepting donations'}
                </p>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
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
                        ✓ Featured image set
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
                        ✓ Video uploaded
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
                  Upload up to 5 additional images ({campaignImages.length}/5)
                </p>

                {campaignImages.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {campaignImages.map((image) => (
                      <div key={image.id} className="border border-gray-200 rounded-md p-4">
                        <div className="flex items-start space-x-4">
                          <img
                            src={image.url}
                            alt={`Campaign image ${image.id}`}
                            className="w-24 h-24 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Caption (Optional)
                            </label>
                            <input
                              type="text"
                              value={image.caption}
                              onChange={(e) => updateImageCaption(image.id, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                              placeholder="Describe this image..."
                              maxLength={100}
                            />
                            <p className="text-xs text-gray-600 mt-1">
                              {image.caption.length}/100 characters
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
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
                  <div className="text-blue-700 font-medium">Uploading file... Please wait.</div>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
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
                    Must be at least 1 day from today
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href={`/campaigns/${campaignId}`}
              className="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-300"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition duration-300"
            >
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
