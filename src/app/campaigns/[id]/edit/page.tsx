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
  start_date: string;
  end_date: string;
  featured_image: string;
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
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [formData, setFormData] = useState<CampaignForm>({
    title: '',
    description: '',
    short_description: '',
    goal_amount: '',
    category_id: '',
    start_date: '',
    end_date: '',
    featured_image: '',
    status: 'pending',
  });
  const [dateErrors, setDateErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const loadData = async () => {
      // Check if user is logged in
      const userData = localStorage.getItem('userData');
      if (!userData) {
        console.log('No user data found, redirecting to login');
        router.push('/login?returnUrl=' + window.location.pathname);
        return;
      }

      const parsedUser = JSON.parse(userData);
      console.log('Parsed user:', parsedUser);

      if (parsedUser.role !== 'creator') {
        console.log('User is not a creator, redirecting to unauthorized');
        router.push('/unauthorized');
        return;
      }

      setUser(parsedUser);

      try {
        // Fetch campaign data
        console.log('Fetching campaign data for ID:', campaignId);
        const campaignResponse = await fetch(`/api/campaigns/${campaignId}`);
        console.log('Campaign response status:', campaignResponse.status);

        if (campaignResponse.ok) {
          const campaignData = await campaignResponse.json();
          const campaign = campaignData.campaign;
          console.log('Campaign data:', campaign);

          // Check if user owns this campaign
          if (campaign.user_id !== parsedUser.id) {
            console.log(
              'User does not own this campaign:',
              campaign.user_id,
              'vs',
              parsedUser.id
            );
            router.push('/unauthorized');
            return;
          }

          setFormData({
            title: campaign.title || '',
            description: campaign.description || '',
            short_description: campaign.short_description || '',
            goal_amount: campaign.goal_amount?.toString() || '',
            category_id: campaign.category_id?.toString() || '',
            start_date: campaign.start_date
              ? formatDateFromDB(campaign.start_date)
              : '',
            end_date: campaign.end_date
              ? formatDateFromDB(campaign.end_date)
              : '',
            featured_image: campaign.featured_image || '',
            status: campaign.status || 'pending',
          });
        } else {
          console.error(
            'Failed to fetch campaign:',
            campaignResponse.status,
            campaignResponse.statusText
          );
          const errorData = await campaignResponse.text();
          console.error('Error response:', errorData);
          alert('Failed to load campaign data. Please try again.');
        }

        // Fetch categories
        const categoriesResponse = await fetch('/api/categories');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.categories || []);
        } else {
          console.error(
            'Failed to fetch categories:',
            categoriesResponse.status
          );
        }

        // Fetch campaign images
        const imagesResponse = await fetch(
          `/api/campaigns/${campaignId}/media`
        );
        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json();
          setCampaignImages(
            imagesData.images?.map((img: any) => ({
              id: img.id,
              url: img.image_url,
              caption: img.caption || '',
            })) || []
          );
        } else {
          console.log(
            'No campaign images or failed to fetch:',
            imagesResponse.status
          );
          // Don't fail completely if images can't be loaded
          setCampaignImages([]);
        }
      } catch (error) {
        console.error('Error loading campaign data:', error);
        alert(
          'Failed to load campaign data. Please check your connection and try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [campaignId, router]);

  const canEdit =
    formData.status === 'pending' || formData.status === 'rejected';
  const canCancel = ['pending', 'approved', 'rejected', 'active'].includes(
    formData.status
  );

  // Add debugging for edit permissions
  console.log('Campaign status:', formData.status);
  console.log('Can edit:', canEdit);
  console.log('Can cancel:', canCancel);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (!canEdit) return;

    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear date errors when user changes dates
    if (name === 'start_date' || name === 'end_date') {
      setDateErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const formatDateFromDB = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateForAPI = (dateValue: string) => {
    if (!dateValue) return '';
    const [day, month, year] = dateValue.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const parseDate = (dateString: string) => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const formatDateFromInput = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const validateDates = () => {
    const errors: { [key: string]: string } = {};
    const today = new Date();
    const startDate = parseDate(formData.start_date);
    const endDate = parseDate(formData.end_date);

    // Validate start date
    if (formData.start_date && startDate) {
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
    if (formData.end_date && formData.start_date && startDate && endDate) {
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
    if (!canEdit) return;

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
    if (!canEdit) return;

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
        setCampaignImages((prev) => [
          ...prev,
          {
            id: Date.now(),
            url: data.url,
            caption: '',
          },
        ]);
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
    e.target.value = '';
  };

  const updateImageCaption = (imageId: number, caption: string) => {
    if (!canEdit) return;
    setCampaignImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, caption } : img))
    );
  };

  const removeImage = async (imageId: number) => {
    if (!canEdit) return;

    // Check if this is a new image (not yet saved to database)
    const isNewImage = imageId > 1000000;

    if (isNewImage) {
      // Just remove from local state for new images
      setCampaignImages((prev) => prev.filter((img) => img.id !== imageId));
      return;
    }

    // For existing images, confirm deletion
    if (
      !confirm(
        'Are you sure you want to delete this image? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      // Delete from database and Cloudinary
      const response = await fetch(
        `/api/campaigns/${campaignId}/images/${imageId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        // Remove from local state
        setCampaignImages((prev) => prev.filter((img) => img.id !== imageId));
        alert('Image deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canEdit) {
      alert('Campaign can only be edited while in pending status.');
      return;
    }

    // Validate dates before submission
    if (!validateDates()) {
      alert('Please fix the date validation errors before submitting.');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          goal_amount: parseInt(formData.goal_amount), // Convert to integer
          start_date: formatDateForAPI(formData.start_date),
          end_date: formatDateForAPI(formData.end_date),
          userId: user.id,
        }),
      });

      if (response.ok) {
        // Update campaign images - only add new images
        const newImages = campaignImages.filter((image) => image.id > 1000000);

        if (newImages.length > 0) {
          for (let i = 0; i < newImages.length; i++) {
            const image = newImages[i];
            await fetch(`/api/campaigns/${campaignId}/images`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                image_url: image.url,
                caption: image.caption,
                sort_order: campaignImages.indexOf(image) + 1,
              }),
            });
          }
        }

        // Update captions for existing images
        const existingImages = campaignImages.filter(
          (image) => image.id <= 1000000
        );
        for (const image of existingImages) {
          await fetch(`/api/campaigns/${campaignId}/images/${image.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              caption: image.caption,
            }),
          });
        }

        alert('Campaign updated successfully!');
        router.push(`/campaigns/${campaignId}`);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update campaign');
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      alert('Failed to update campaign. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelCampaign = async () => {
    setCancelling(true);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (response.ok) {
        alert('Campaign cancelled successfully!');
        router.push('/my-campaigns');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to cancel campaign');
      }
    } catch (error) {
      console.error('Error cancelling campaign:', error);
      alert('Failed to cancel campaign. Please try again.');
    } finally {
      setCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  const capitalizeStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
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
    const startDate = parseDate(formData.start_date);
    if (!startDate) return '';
    const date = new Date(startDate);
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };

  const getMaxEndDate = () => {
    if (!formData.start_date) return '';
    const startDate = parseDate(formData.start_date);
    if (!startDate) return '';
    const date = new Date(startDate);
    date.setDate(date.getDate() + 60);
    return date.toISOString().split('T')[0];
  };

  const getStatusMessage = () => {
    switch (formData.status) {
      case 'pending':
        return "Your campaign is under review. You can make changes until it's approved or rejected.";
      case 'approved':
        return 'Your campaign has been approved and will go live on the start date. Editing is no longer available.';
      case 'rejected':
        return 'Your campaign has been rejected. You can modify your application and resubmit for review.';
      case 'active':
        return 'Your campaign is currently live and accepting donations.';
      case 'cancelled':
        return 'This campaign has been cancelled.';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (formData.status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'approved':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'rejected':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'active':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'cancelled':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
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
              {canEdit ? 'Edit Campaign' : 'View Campaign Details'}
            </h1>
            <p className="text-lg text-gray-600">
              {canEdit
                ? 'Update your campaign details and settings.'
                : 'Campaign details (read-only)'}
            </p>
          </div>
          <div className="flex space-x-4">
            <Link
              href={`/campaigns/${campaignId}`}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View Public Page
            </Link>
            {canCancel && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={cancelling}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Campaign'}
              </button>
            )}
          </div>
        </div>

        {/* Status Alert */}
        <div className={`border rounded-lg p-4 mb-6 ${getStatusColor()}`}>
          <div className="flex items-center">
            <span className="font-medium">
              {capitalizeStatus(formData.status)} Campaign
            </span>
          </div>
          <p className="text-sm mt-1">{getStatusMessage()}</p>
          {!canEdit && (
            <p className="text-sm mt-2 font-medium text-red-600">
              ⚠️ Editing is only allowed while campaign status is "pending" or
              "rejected"
            </p>
          )}
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Cancel Campaign
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to cancel this campaign? This action
                  cannot be undone. All funding will be stopped and the campaign
                  will no longer be visible to donors.
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Keep Campaign
                  </button>
                  <button
                    onClick={handleCancelCampaign}
                    disabled={cancelling}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  disabled={uploading || !canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 file:text-white file:bg-blue-600 file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 file:hover:bg-blue-700 file:cursor-pointer disabled:file:bg-gray-400 disabled:file:cursor-not-allowed"
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
                  disabled={uploading || campaignImages.length >= 5 || !canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 file:text-white file:bg-blue-600 file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 file:hover:bg-blue-700 file:cursor-pointer disabled:file:bg-gray-400 disabled:file:cursor-not-allowed"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Upload up to 5 additional images to showcase your campaign
                  (PNG, JPG, JPEG, max 10MB each) ({campaignImages.length}/5)
                </p>

                {campaignImages.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {campaignImages.map((image) => (
                      <div
                        key={image.id}
                        className="border border-gray-200 rounded-md p-4"
                      >
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
                              onChange={(e) =>
                                updateImageCaption(image.id, e.target.value)
                              }
                              disabled={!canEdit}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                              placeholder="Describe this image..."
                              maxLength={100}
                            />
                            <p className="text-xs text-gray-600 mt-1">
                              {image.caption.length}/100 characters
                            </p>
                          </div>
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => removeImage(image.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Remove
                            </button>
                          )}
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
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    value={formatDateForInput(formData.start_date)}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      setFormData((prev) => ({
                        ...prev,
                        [name]: formatDateFromInput(value),
                      }));
                      // Clear date errors when user changes dates
                      if (name === 'start_date' || name === 'end_date') {
                        setDateErrors((prev) => ({ ...prev, [name]: '' }));
                      }
                    }}
                    onBlur={validateDates}
                    disabled={!canEdit}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed ${
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
                    value={formatDateForInput(formData.end_date)}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      setFormData((prev) => ({
                        ...prev,
                        [name]: formatDateFromInput(value),
                      }));
                      // Clear date errors when user changes dates
                      if (name === 'start_date' || name === 'end_date') {
                        setDateErrors((prev) => ({ ...prev, [name]: '' }));
                      }
                    }}
                    onBlur={validateDates}
                    disabled={!canEdit || !formData.start_date}
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
            <Link
              href={`/campaigns/${campaignId}`}
              className="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-300"
            >
              {canEdit ? 'Cancel' : 'Back to Campaign'}
            </Link>
            {canEdit && (
              <button
                type="submit"
                disabled={
                  saving || uploading || Object.keys(dateErrors).length > 0
                }
                className="px-6 py-3 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition duration-300"
              >
                {saving
                  ? formData.status === 'rejected'
                    ? 'Resubmitting...'
                    : 'Saving Changes...'
                  : formData.status === 'rejected'
                  ? 'Resubmit Campaign'
                  : 'Save Changes'}
              </button>
            )}
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
