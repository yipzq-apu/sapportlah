'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

interface Campaign {
  id: number;
  title: string;
  status: string;
  creator_email: string;
}

export default function PostUpdatePage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [isBackersOnly, setIsBackersOnly] = useState(false);

  // Check authentication and load user
  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('userData');
        if (!userData) {
          router.push('/login');
          return;
        }

        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'creator') {
          router.push('/unauthorized');
          return;
        }

        setUser(parsedUser);
      } catch (error) {
        console.error('Error loading user data:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Fetch campaign data
  useEffect(() => {
    const fetchCampaign = async () => {
      if (!campaignId) return;

      try {
        const response = await fetch(`/api/campaigns/${campaignId}`);
        if (response.ok) {
          const data = await response.json();
          setCampaign(data.campaign);
        } else {
          setError('Campaign not found');
        }
      } catch (error) {
        console.error('Error fetching campaign:', error);
        setError('Failed to load campaign');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCampaign();
    }
  }, [campaignId, user]);

  // Check if user is the creator
  const isCreator = user && campaign && user.email === campaign.creator_email;

  useEffect(() => {
    if (!loading && campaign && !isCreator) {
      router.push('/unauthorized');
    }
  }, [loading, campaign, isCreator, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!updateTitle.trim() || !updateContent.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/post-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: updateTitle.trim(),
          content: updateContent.trim(),
          isBackersOnly: isBackersOnly,
          creatorId: user.id,
        }),
      });

      if (response.ok) {
        alert('Update posted successfully!');
        router.push(`/campaigns/${campaignId}`);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to post update. Please try again.');
      }
    } catch (error) {
      console.error('Error posting update:', error);
      alert('Failed to post update. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !campaign || !isCreator) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-xl text-gray-600 mb-4">
              {error || 'Unauthorized access'}
            </div>
            <Link
              href="/my-campaigns"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Back to My Campaigns
            </Link>
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
          <nav className="mb-4">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <Link href="/my-campaigns" className="hover:text-blue-600">
                  My Campaigns
                </Link>
              </li>
              <li>›</li>
              <li>
                <Link
                  href={`/campaigns/${campaignId}`}
                  className="hover:text-blue-600"
                >
                  {campaign.title}
                </Link>
              </li>
              <li>›</li>
              <li className="text-gray-900">Post Update</li>
            </ol>
          </nav>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Post Campaign Update
          </h1>
          <p className="text-lg text-gray-600">
            Keep your backers informed about your campaign progress
          </p>
        </div>

        {/* Campaign Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {campaign.title}
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Campaign ID: {campaign.id}</span>
            <span>
              Status:{' '}
              <span className="capitalize font-medium">{campaign.status}</span>
            </span>
          </div>
        </div>

        {/* Update Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Update Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Update Title *
              </label>
              <input
                type="text"
                id="title"
                value={updateTitle}
                onChange={(e) => setUpdateTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-900 placeholder-gray-400"
                placeholder="Enter a descriptive title for your update"
                required
                maxLength={200}
              />
              <div className="mt-1 text-xs text-gray-500">
                {updateTitle.length}/200 characters
              </div>
            </div>

            {/* Update Content */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Update Content *
              </label>
              <textarea
                id="content"
                value={updateContent}
                onChange={(e) => setUpdateContent(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none text-gray-900 placeholder-gray-400"
                placeholder="Share details about your campaign progress, milestones reached, challenges faced, or any important information for your backers..."
                required
              />
              <div className="mt-1 text-xs text-gray-500">
                Use line breaks to separate paragraphs. Be detailed and
                transparent with your backers.
              </div>
            </div>

            {/* Visibility Settings */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Visibility Settings
              </h3>

              <div className="space-y-3">
                <label className="flex items-start">
                  <input
                    type="radio"
                    name="visibility"
                    checked={!isBackersOnly}
                    onChange={() => setIsBackersOnly(false)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-700">
                      Public Update
                    </span>
                    <p className="text-xs text-gray-500">
                      Visible to everyone who visits your campaign page
                    </p>
                  </div>
                </label>

                <label className="flex items-start">
                  <input
                    type="radio"
                    name="visibility"
                    checked={isBackersOnly}
                    onChange={() => setIsBackersOnly(true)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-700">
                      Backers Only 🔒
                    </span>
                    <p className="text-xs text-gray-500">
                      Only visible to people who have donated to your campaign
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Link
                href={`/campaigns/${campaignId}`}
                className="text-gray-600 hover:text-gray-700 font-medium"
              >
                Cancel
              </Link>

              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setUpdateTitle('');
                    setUpdateContent('');
                    setIsBackersOnly(false);
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition duration-200"
                >
                  Clear Form
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting || !updateTitle.trim() || !updateContent.trim()
                  }
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200"
                >
                  {submitting ? 'Posting Update...' : 'Post Update'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            💡 Tips for Great Updates
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>
              • Be transparent about your progress and any challenges you're
              facing
            </li>
            <li>• Include specific details about how funds are being used</li>
            <li>
              • Share photos or videos when possible to show progress visually
            </li>
            <li>• Thank your backers for their continued support</li>
            <li>
              • Use backers-only updates for sensitive information or exclusive
              content
            </li>
            <li>• Post regular updates to keep your backers engaged</li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
