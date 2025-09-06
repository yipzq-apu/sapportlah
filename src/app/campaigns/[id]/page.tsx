'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

interface Campaign {
  id: number;
  title: string;
  description: string;
  short_description: string;
  goal_amount: number;
  current_amount: number;
  end_date: string;
  featured_image?: string;
  video_url?: string;
  status: string;
  is_featured: boolean;
  backers_count: number;
  created_at: string;
  creator_name: string;
  creator_email: string;
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
  const [activeTab, setActiveTab] = useState<'donations' | 'qna'>('donations');
  const [newQuestion, setNewQuestion] = useState('');
  const [isQuestionAnonymous, setIsQuestionAnonymous] = useState(false);

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

          // Fetch donations and questions separately for better performance
          fetchDonations();
          fetchQuestions();
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

    if (campaignId) {
      fetchCampaignData();
    }
  }, [campaignId]);

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
    return new Date(dateString).toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

        // Refresh donations list
        const donationsResponse = await fetch(
          `/api/campaigns/${campaignId}/donations`
        );
        if (donationsResponse.ok) {
          const donationsData = await donationsResponse.json();
          setRecentDonations(donationsData.donations || []);
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
        <nav className="mb-6">
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
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Campaign Image */}
            <div className="relative mb-6">
              <img
                src={campaign.featured_image || '/api/placeholder/800/400'}
                alt={campaign.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg"
              />
              {campaign.is_featured && (
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 text-sm font-semibold rounded">
                  Featured
                </div>
              )}
            </div>

            {/* Campaign Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {campaign.title}
              </h1>

              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-300 mr-4 flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">
                    {campaign.creator_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-900">
                      {campaign.creator_name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Campaign Creator</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-sm">
                <div>
                  <span className="text-gray-500">Status:</span>
                  <p className="font-semibold capitalize">{campaign.status}</p>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <p className="font-semibold">
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">End Date:</span>
                  <p className="font-semibold">
                    {new Date(campaign.end_date).toLocaleDateString()}
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

            {/* Recent Donations / Q&A Section */}
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
                                {formatDate(donation.date)}
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Ask the campaign creator a question..."
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
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Ask anonymously
                          </span>
                        </label>
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition duration-300"
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
                        <div
                          key={question.id}
                          className="border-b border-gray-200 pb-6 last:border-b-0"
                        >
                          {/* Question */}
                          <div className="mb-4">
                            <div className="flex items-start mb-2">
                              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-blue-600 font-semibold text-sm">
                                  Q
                                </span>
                              </div>
                              <div className="flex-1">
                                <p className="text-gray-900 font-medium">
                                  {question.question}
                                </p>
                                <div className="flex items-center mt-1 text-sm text-gray-500">
                                  <span>
                                    Asked by{' '}
                                    {question.anonymous
                                      ? 'Anonymous User'
                                      : question.askerName}
                                  </span>
                                  <span className="mx-2">•</span>
                                  <span>{formatDate(question.dateAsked)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Answer */}
                          {question.answer ? (
                            <div className="ml-11">
                              <div className="flex items-start">
                                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-green-600 font-semibold text-sm">
                                    A
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-gray-700">
                                    {question.answer}
                                  </p>
                                  <div className="flex items-center mt-1 text-sm text-gray-500">
                                    <span>
                                      Answered by {campaign?.creator_name}
                                    </span>
                                    <span className="mx-2">•</span>
                                    <span>
                                      {question.dateAnswered &&
                                        formatDate(question.dateAnswered)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="ml-11">
                              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                <p className="text-sm text-yellow-800">
                                  <span className="font-medium">Pending:</span>{' '}
                                  This question is waiting for an answer from
                                  the campaign creator.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
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
            {/* Donation Card */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="mb-6">
                <div className="flex justify-between text-lg font-semibold mb-2">
                  <span>Raised: {formatCurrency(campaign.current_amount)}</span>
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
                    Donation Amount (SGD)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    min="1"
                    step="1"
                    required
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter amount"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Leave a message of support"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 transition duration-300"
                >
                  {user ? 'Donate Now' : 'Login to Donate'}
                </button>
              </form>

              <div className="mt-4 text-xs text-gray-500 text-center">
                {user
                  ? 'Your donation is secure and will help this campaign reach its goal.'
                  : 'Please log in to make a donation to this campaign.'}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
