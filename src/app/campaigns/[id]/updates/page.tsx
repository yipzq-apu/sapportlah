'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

interface CampaignUpdate {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface UpdateForm {
  title: string;
  content: string;
  image_url: string;
}

export default function CampaignUpdatesPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [updates, setUpdates] = useState<CampaignUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<UpdateForm>({
    title: '',
    content: '',
    image_url: '',
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

      // Mock updates data
      const mockUpdates: CampaignUpdate[] = [
        {
          id: 1,
          title: 'Great Progress on Water Well Construction!',
          content: 'We are excited to share that the water well construction is 70% complete! The local community has been incredibly supportive, and we expect to finish the project by next month. Thank you to all our supporters for making this possible.',
          image_url: '/api/placeholder/600/400',
          created_at: '2024-04-20T10:30:00Z',
          updated_at: '2024-04-20T10:30:00Z',
        },
        {
          id: 2,
          title: 'First Phase Completed Successfully',
          content: 'The initial site preparation and foundation work has been completed ahead of schedule. The engineering team confirmed that the soil conditions are perfect for a deep water well. We are now moving to the drilling phase.',
          created_at: '2024-04-15T14:20:00Z',
          updated_at: '2024-04-15T14:20:00Z',
        },
        {
          id: 3,
          title: 'Community Meeting and Project Kickoff',
          content: 'Had an amazing meeting with the local community leaders today. Everyone is excited about the clean water project. We also held a small ceremony to mark the official start of construction. The enthusiasm from the villagers is truly inspiring!',
          image_url: '/api/placeholder/600/400',
          created_at: '2024-04-10T09:15:00Z',
          updated_at: '2024-04-10T09:15:00Z',
        },
      ];

      setUpdates(mockUpdates);
      setLoading(false);
    };

    loadData();
  }, [campaignId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);

    try {
      // Mock posting update
      const newUpdate: CampaignUpdate = {
        id: Date.now(),
        title: formData.title,
        content: formData.content,
        image_url: formData.image_url || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUpdates(prev => [newUpdate, ...prev]);
      setFormData({ title: '', content: '', image_url: '' });
      setShowForm(false);
      alert('Update posted successfully!');
    } catch (error) {
      console.error('Error posting update:', error);
      alert('Failed to post update. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading updates...</div>
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
              Campaign Updates
            </h1>
            <p className="text-lg text-gray-600">
              Keep your supporters informed about your campaign progress.
            </p>
          </div>
          <div className="flex space-x-4">
            <Link
              href={`/campaigns/${campaignId}`}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View Campaign
            </Link>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              {showForm ? 'Cancel' : 'Post Update'}
            </button>
          </div>
        </div>

        {/* Post Update Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Post New Update
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                  placeholder="e.g., Great progress on our project!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Content *
                </label>
                <textarea
                  name="content"
                  required
                  rows={6}
                  value={formData.content}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                  placeholder="Share detailed information about your campaign progress, milestones achieved, or any important developments..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={posting}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {posting ? 'Posting...' : 'Post Update'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Updates List */}
        <div className="space-y-6">
          {updates.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No updates yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start sharing progress updates with your supporters!
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
              >
                Post Your First Update
              </button>
            </div>
          ) : (
            updates.map((update) => (
              <div key={update.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {update.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Posted on {formatDate(update.created_at)}
                  </p>
                </div>

                {update.image_url && (
                  <div className="mb-4">
                    <img
                      src={update.image_url}
                      alt={update.title}
                      className="w-full h-64 object-cover rounded-md"
                    />
                  </div>
                )}

                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {update.content}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Update #{update.id}
                  </span>
                  {update.updated_at !== update.created_at && (
                    <span className="text-sm text-gray-500">
                      Last edited: {formatDate(update.updated_at)}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
