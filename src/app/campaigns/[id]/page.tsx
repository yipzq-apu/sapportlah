'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import QuestionAnswerItem from '../../components/QuestionAnswerItem';

interface Campaign {
  id: number;
  title: string;
  description: string;
  short_description: string;
  goal_amount: number;
  current_amount: number;
  end_date: string;
  featured_image?: string;
  status: string;
  is_featured: boolean;
  backers_count: number;
  created_at: string;
  creator_name: string;
  creator_email: string;
  organization_name?: string; // Add organization_name field
  user_id?: number;
}

interface Donation {
  id: string;
  donorName: string;
  amount: number;
  message: string;
  date: string;
  anonymous: boolean;
}

interface Question {
  id: string;
  question: string;
  answer: string | null;
  askerName: string;
  dateAsked: string;
  dateAnswered: string | null;
  anonymous: boolean;
}

interface CampaignImage {
  id: number;
  image_url: string;
  caption: string;
  sort_order: number;
}

interface CampaignUpdate {
  id: string;
  title: string;
  content: string;
  isBackersOnly: boolean;
  createdAt: string;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationMessage, setDonationMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'donations' | 'qna' | 'updates'>(
    'donations'
  );
  const [campaignUpdates, setCampaignUpdates] = useState<CampaignUpdate[]>([]);
  const [isBacker, setIsBacker] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [isQuestionAnonymous, setIsQuestionAnonymous] = useState(false);
  const [campaignImages, setCampaignImages] = useState<CampaignImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(-1); // Changed from 0 to -1

  // Helper variables for user roles
  const isCreator =
    user &&
    user.role === 'creator' &&
    campaign &&
    (user.email === campaign.creator_email || user.id === campaign.user_id);
  const isAdmin = user && user.role === 'admin';
  const isDonor = user && user.role === 'donor';
  const canEditCampaign = isCreator && campaign?.status === 'pending';

  // Check if user is logged in (simplified - no token auth)
  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    checkAuth();
  }, []);

  // Fetch campaign data from backend
  useEffect(() => {
    const fetchCampaignData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/campaigns/${campaignId}`);

        if (response.ok) {
          const data = await response.json();
          setCampaign(data.campaign);

          // Fetch donations, questions, media, and updates separately
          fetchDonations();
          fetchQuestions();
          fetchMedia();
          fetchUpdates();
        } else if (response.status === 404) {
          setError('Campaign not found');
        } else {
          setError('Failed to load campaign');
        }
      } catch (error) {
        console.error('Error fetching campaign:', error);
        setError('Failed to load campaign');
      } finally {
        setLoading(false);
      }
    };

    const fetchDonations = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/donations`);
        if (response.ok) {
          const data = await response.json();
          setRecentDonations(data.donations || []);
        }
      } catch (error) {
        console.error('Error fetching donations:', error);
      }
    };

    const fetchQuestions = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/questions`);
        if (response.ok) {
          const data = await response.json();
          setQuestions(data.questions || []);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    const fetchMedia = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/media`);
        if (response.ok) {
          const data = await response.json();
          setCampaignImages(data.images || []);
        }
      } catch (error) {
        console.error('Error fetching media:', error);
      }
    };

    const fetchUpdates = async () => {
      try {
        const url = user
          ? `/api/campaigns/${campaignId}/updates?userId=${user.id}`
          : `/api/campaigns/${campaignId}/updates`;

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setCampaignUpdates(data.updates || []);
          setIsBacker(data.isBacker || false);
        }
      } catch (error) {
        console.error('Error fetching updates:', error);
      }
    };

    if (campaignId) {
      fetchCampaignData();
    }
  }, [campaignId, user]);

  const calculatePercentage = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatDateWithTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push(`/login?returnUrl=/campaigns/${campaignId}`);
      return;
    }

    // Only donors can donate
    if (user.role !== 'donor') {
      alert('Only donors can make donations to campaigns.');
      return;
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/donate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          amount: parseFloat(donationAmount),
          message: donationMessage.trim() || null,
          anonymous: isAnonymous,
          paymentMethod: 'online',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update campaign state with new amounts
        if (campaign) {
          setCampaign({
            ...campaign,
            current_amount: data.campaign.current_amount,
            backers_count: data.campaign.backers_count,
          });
        }

        // Reset form
        setDonationAmount('');
        setDonationMessage('');
        setIsAnonymous(false);

        // Refresh donations list and updates (backer status may have changed)
        const donationsResponse = await fetch(
          `/api/campaigns/${campaignId}/donations`
        );
        if (donationsResponse.ok) {
          const donationsData = await donationsResponse.json();
          setRecentDonations(donationsData.donations || []);
        }

        // Refresh updates to check new backer status
        const url = user
          ? `/api/campaigns/${campaignId}/updates?userId=${user.id}`
          : `/api/campaigns/${campaignId}/updates`;

        const updatesResponse = await fetch(url);
        if (updatesResponse.ok) {
          const updatesData = await updatesResponse.json();
          setCampaignUpdates(updatesData.updates || []);
          setIsBacker(updatesData.isBacker || false);
        }

        alert('Thank you for your donation! Your support means a lot.');
      } else {
        alert(data.error || 'Failed to process donation. Please try again.');
      }
    } catch (error) {
      console.error('Error processing donation:', error);
      alert('Failed to process donation. Please try again.');
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push(`/login?returnUrl=/campaigns/${campaignId}`);
      return;
    }

    if (!newQuestion.trim()) return;

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: newQuestion.trim(),
          userId: user.id,
          anonymous: isQuestionAnonymous,
        }),
      });

      if (response.ok) {
        // Reset form
        setNewQuestion('');
        setIsQuestionAnonymous(false);

        // Refresh questions list
        const questionsResponse = await fetch(
          `/api/campaigns/${campaignId}/questions`
        );
        if (questionsResponse.ok) {
          const data = await questionsResponse.json();
          setQuestions(data.questions || []);
        }

        alert('Your question has been submitted successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to submit question. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting question:', error);
      alert('Failed to submit question. Please try again.');
    }
  };

  const handleAnswerQuestion = async (questionId: string, answer: string) => {
    if (!user || !isCreator) {
      alert('Only campaign creators can answer questions');
      return;
    }

    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/questions/${questionId}/answer`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            answer: answer.trim(),
            creatorId: user.id,
          }),
        }
      );

      if (response.ok) {
        // Refresh questions list
        const questionsResponse = await fetch(
          `/api/campaigns/${campaignId}/questions`
        );
        if (questionsResponse.ok) {
          const data = await questionsResponse.json();
          setQuestions(data.questions || []);
        }
        alert('Answer posted successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to post answer. Please try again.');
      }
    } catch (error) {
      console.error('Error posting answer:', error);
      alert('Failed to post answer. Please try again.');
    }
  };

  const handleDonationAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    // Allow empty string for clearing the field
    if (value === '') {
      setDonationAmount('');
      return;
    }

    // Check if the value matches the pattern for up to 2 decimal places
    const regex = /^\d+(\.\d{0,2})?$/;
    if (regex.test(value)) {
      setDonationAmount(value);
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

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-xl text-gray-600 mb-4">
              {error || 'Campaign not found'}
            </div>
            <Link
              href="/campaigns"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Browse Campaigns
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const percentage = calculatePercentage(
    campaign.current_amount,
    campaign.goal_amount
  );
  const daysLeft = getDaysLeft(campaign.end_date);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        {/* <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-blue-600">
                Home
              </Link>
            </li>
            <li>›</li>
            <li>
              <Link href="/campaigns" className="hover:text-blue-600">
                Campaigns
              </Link>
            </li>
            <li>›</li>
            <li className="text-gray-900">{campaign.title}</li>
          </ol>
        </nav> */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Campaign Media Gallery */}
            <div className="mb-6">
              {/* Main Image Display */}
              <div className="relative mb-4">
                <img
                  src={
                    selectedImageIndex >= 0 &&
                    campaignImages[selectedImageIndex]
                      ? campaignImages[selectedImageIndex].image_url
                      : campaign?.featured_image || '/api/placeholder/800/400'
                  }
                  alt={
                    selectedImageIndex >= 0 &&
                    campaignImages[selectedImageIndex]
                      ? campaignImages[selectedImageIndex].caption ||
                        campaign?.title
                      : campaign?.title
                  }
                  className="w-full h-64 md:h-96 object-cover rounded-lg"
                />
                {campaign?.is_featured === true && (
                  <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 text-sm font-semibold rounded">
                    Featured
                  </div>
                )}
              </div>

              {/* Image Caption */}
              {selectedImageIndex >= 0 &&
                campaignImages[selectedImageIndex]?.caption && (
                  <div className="mt-2 text-sm text-gray-600 text-center italic">
                    {campaignImages[selectedImageIndex].caption}
                  </div>
                )}

              {/* Thumbnail Gallery */}
              {campaignImages.length > 0 && (
                <div className="flex space-x-2 overflow-x-auto pb-2 mt-4">
                  {/* Main featured image thumbnail */}
                  <button
                    onClick={() => setSelectedImageIndex(-1)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === -1
                        ? 'border-blue-500'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={campaign?.featured_image || '/api/placeholder/80/80'}
                      alt="Main"
                      className="w-full h-full object-cover"
                    />
                  </button>

                  {/* Additional images thumbnails */}
                  {campaignImages.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                        selectedImageIndex === index
                          ? 'border-blue-500'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={image.image_url}
                        alt={image.caption || `Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Campaign Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {campaign?.title}
              </h1>

              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-300 mr-4 flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">
                    {(
                      campaign.organization_name || campaign.creator_name
                    )?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {campaign.organization_name ||
                      campaign.creator_name ||
                      'Unknown Creator'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {campaign.organization_name
                      ? 'Organization'
                      : 'Campaign Creator'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-sm">
                <div>
                  <span className="text-gray-500">Status:</span>
                  <p className="font-semibold capitalize text-gray-900">
                    {campaign.status}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <p className="font-semibold text-gray-900">
                    {formatDate(campaign.created_at)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">End Date:</span>
                  <p className="font-semibold text-gray-900">
                    {formatDate(campaign.end_date)}
                  </p>
                </div>
              </div>

              <p className="text-gray-700 text-lg leading-relaxed">
                {campaign.description}
              </p>
            </div>

            {/* Campaign Story */}
            {campaign.short_description && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Campaign Story
                </h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {campaign.short_description}
                  </p>
                </div>
              </div>
            )}

            {/* Recent Donations / Q&A / Updates Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Tab Headers */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab('donations')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'donations'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Recent Donations ({recentDonations.length})
                </button>
                <button
                  onClick={() => setActiveTab('updates')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ml-6 ${
                    activeTab === 'updates'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Updates ({campaignUpdates.length})
                </button>
                <button
                  onClick={() => setActiveTab('qna')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ml-6 ${
                    activeTab === 'qna'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Q&A ({questions.length})
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'donations' ? (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Recent Donations
                  </h2>
                  {recentDonations.length > 0 ? (
                    <div className="space-y-4">
                      {recentDonations.map((donation) => (
                        <div
                          key={donation.id}
                          className="border-b border-gray-200 pb-4 last:border-b-0"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center mb-1">
                                <span className="font-semibold text-gray-900">
                                  {donation.anonymous
                                    ? 'Anonymous User'
                                    : donation.donorName}
                                </span>
                                <span className="text-blue-600 font-bold ml-2">
                                  {formatCurrency(donation.amount)}
                                </span>
                              </div>
                              {donation.message && (
                                <p className="text-gray-600 text-sm mb-1">
                                  "{donation.message}"
                                </p>
                              )}
                              <p className="text-gray-400 text-xs">
                                {formatDateWithTime(donation.date)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-4">💝</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No donations yet
                      </h3>
                      <p className="text-gray-600">
                        Be the first to support this campaign!
                      </p>
                    </div>
                  )}
                </div>
              ) : activeTab === 'updates' ? (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Campaign Updates
                  </h2>
                  {isBacker && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 text-green-600 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm font-medium text-green-800">
                          You're a backer! You can see exclusive updates marked
                          with 🔒
                        </span>
                      </div>
                    </div>
                  )}

                  {campaignUpdates.length > 0 ? (
                    <div className="space-y-6">
                      {campaignUpdates.map((update) => (
                        <div
                          key={update.id}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition duration-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                              {update.isBackersOnly && (
                                <span
                                  className="text-yellow-600 mr-2"
                                  title="Backers Only"
                                >
                                  🔒
                                </span>
                              )}
                              {update.title}
                            </h3>
                            <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                              {formatDateWithTime(update.createdAt)}
                            </span>
                          </div>

                          <div className="prose max-w-none">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {update.content}
                            </p>
                          </div>

                          {update.isBackersOnly && (
                            <div className="mt-3 text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded inline-block">
                              Exclusive update for backers
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-4">📢</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No updates yet
                      </h3>
                      <p className="text-gray-600">
                        The campaign creator hasn't posted any updates yet.
                        Check back later!
                      </p>
                      {!user && (
                        <p className="text-sm text-gray-500 mt-2">
                          <Link
                            href="/login"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Log in
                          </Link>{' '}
                          and support this campaign to see exclusive backer
                          updates.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Questions & Answers
                  </h2>

                  {/* Ask Question Form */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Ask a Question
                    </h3>
                    <form onSubmit={handleQuestionSubmit} className="space-y-3">
                      <textarea
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        disabled={!user}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        rows={3}
                        placeholder={
                          user
                            ? 'Ask the campaign creator a question...'
                            : 'Please log in to ask a question'
                        }
                        required
                      />
                      <div className="flex items-center justify-between">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isQuestionAnonymous}
                            onChange={(e) =>
                              setIsQuestionAnonymous(e.target.checked)
                            }
                            disabled={!user}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:cursor-not-allowed"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Ask anonymously
                          </span>
                        </label>
                        <button
                          type="submit"
                          disabled={!user}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition duration-300 ${
                            user
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {user ? 'Submit Question' : 'Login to Ask'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Questions List */}
                  {questions.length > 0 ? (
                    <div className="space-y-6">
                      {questions.map((question) => (
                        <QuestionAnswerItem
                          key={question.id}
                          question={question}
                          campaign={campaign}
                          isCreator={isCreator}
                          onAnswerSubmit={handleAnswerQuestion}
                          formatDate={formatDateWithTime}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-4">❓</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No questions yet
                      </h3>
                      <p className="text-gray-600">
                        Be the first to ask the campaign creator a question!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Campaign Management Card for Creator/Admin */}
            {(isCreator || isAdmin) && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {isCreator ? 'Campaign Management' : 'Admin Actions'}
                </h3>
                <div className="space-y-3">
                  {isCreator && (
                    <>
                      <Link
                        href={`/campaigns/${campaign.id}/edit`}
                        className="block w-full text-center bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300 font-medium"
                      >
                        Edit Campaign
                      </Link>
                      <Link
                        href={`/my-campaigns/${campaign.id}/post-update`}
                        className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 font-medium"
                      >
                        Post Update
                      </Link>
                      <Link
                        href={`/my-campaigns/${campaign.id}/donors`}
                        className="block w-full text-center bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition duration-300 font-medium"
                      >
                        View Donors ({campaign.backers_count})
                      </Link>
                      <div className="text-center">
                        <span className="text-sm text-gray-600">
                          Answer questions in the Q&A section below
                        </span>
                      </div>
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <Link
                        href={`/admin/campaigns/${campaign.id}`}
                        className="block w-full text-center bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-300 font-medium"
                      >
                        Admin Panel
                      </Link>
                      <button
                        onClick={() => {
                          // Toggle featured status functionality for admin
                          console.log(
                            'Toggle featured status for campaign:',
                            campaign.id
                          );
                        }}
                        className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition duration-300 font-medium"
                      >
                        {campaign.is_featured
                          ? 'Remove Featured'
                          : 'Make Featured'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Donation Card - Only for Donors */}
            {(!user || isDonor) && (
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <div className="mb-6">
                  <div className="flex justify-between text-lg font-semibold mb-2 text-gray-900">
                    <span>
                      Raised: {formatCurrency(campaign.current_amount)}
                    </span>
                    <span>Goal: {formatCurrency(campaign.goal_amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span className="font-semibold text-blue-600">
                      {percentage.toFixed(1)}% funded
                    </span>
                    <span>{daysLeft} days left</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <span>{campaign.backers_count} backers</span>
                  </div>
                </div>

                {/* Donation Form */}
                <form onSubmit={handleDonate} className="space-y-4">
                  <div>
                    <label
                      htmlFor="amount"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Donation Amount (MYR)
                    </label>
                    <input
                      type="number"
                      id="amount"
                      min="1"
                      step="0.01"
                      required
                      value={donationAmount}
                      onChange={handleDonationAmountChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-gray-900"
                      placeholder="Enter amount (e.g. 10.50)"
                      disabled={user && user.role !== 'donor'}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Message (Optional)
                    </label>
                    <textarea
                      id="message"
                      rows={3}
                      value={donationMessage}
                      onChange={(e) => setDonationMessage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-gray-900"
                      placeholder="Leave a message of support"
                      disabled={user && user.role !== 'donor'}
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={user && user.role !== 'donor'}
                    />
                    <label
                      htmlFor="anonymous"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Donate anonymously
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={!user || user.role !== 'donor'}
                    className={`w-full py-3 px-4 rounded-md font-semibold transition duration-300 ${
                      user && user.role === 'donor'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {!user
                      ? 'Login to Donate'
                      : user.role === 'donor'
                      ? 'Donate Now'
                      : user.role === 'creator'
                      ? 'Creators Cannot Donate'
                      : 'Admins Cannot Donate'}
                  </button>
                </form>

                <div className="mt-4 text-xs text-gray-500 text-center">
                  {!user
                    ? 'Please log in as a donor to make a donation to this campaign.'
                    : user.role === 'donor'
                    ? 'Your donation is secure and will help this campaign reach its goal.'
                    : 'Only donors can make donations to campaigns.'}
                </div>
              </div>
            )}

            {/* Campaign Stats Card - Only for Creator/Admin */}
            {(isCreator || isAdmin) && (
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Campaign Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 font-medium">
                      Goal Amount
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(campaign.goal_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 font-medium">
                      Raised Amount
                    </span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(campaign.current_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 font-medium">
                      Progress
                    </span>
                    <span className="font-semibold text-blue-600">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 font-medium">
                      Total Backers
                    </span>
                    <span className="font-semibold text-gray-900">
                      {campaign.backers_count}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 font-medium">
                      Days Remaining
                    </span>
                    <span className="font-semibold text-gray-900">
                      {daysLeft} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 font-medium">
                      Status
                    </span>
                    <span className="font-semibold capitalize text-gray-900">
                      {campaign.status}
                    </span>
                  </div>
                  {campaign.is_featured && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 font-medium">
                        Featured
                      </span>
                      <span className="font-semibold text-blue-600">Yes</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
