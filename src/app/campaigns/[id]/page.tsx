'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

interface Campaign {
  id: string;
  title: string;
  description: string;
  story: string;
  image: string;
  goal: number;
  raised: number;
  donorCount: number;
  category: string;
  creator: {
    name: string;
    avatar: string;
    verified: boolean;
    location: string;
  };
  type: 'all-or-nothing' | 'keep-it-all';
  location: string;
  endDate: string;
  featured: boolean;
  createdDate: string;
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
  const [donationAmount, setDonationAmount] = useState('');
  const [donationMessage, setDonationMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null); // Add user state
  const [activeTab, setActiveTab] = useState<'donations' | 'qna'>('donations');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isQuestionAnonymous, setIsQuestionAnonymous] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = () => {
      // Replace with actual auth logic
      const token = localStorage.getItem('authToken');
      if (token) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        setUser(userData);
      }
    };

    checkAuth();
  }, []);

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchCampaignData = async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockCampaign: Campaign = {
        id: campaignId,
        title: 'Clean Water for Rural Communities',
        description:
          'Help us bring clean drinking water to underserved rural areas through sustainable water purification systems.',
        story: `Access to clean drinking water is a fundamental human right, yet millions of people in rural communities still lack this basic necessity. Our project aims to install solar-powered water purification systems in 5 remote villages, providing clean, safe drinking water to over 2,000 people.

The Problem:
These communities currently rely on contaminated water sources, leading to waterborne diseases that particularly affect children and elderly residents. The nearest clean water source is often miles away, forcing families to spend hours each day collecting water instead of working or attending school.

Our Solution:
We've partnered with local engineers and community leaders to design sustainable water purification systems that use solar energy and require minimal maintenance. Each system can purify up to 5,000 liters of water per day and has a lifespan of 15 years.

Impact:
- Provide clean water access to 2,000+ people
- Reduce waterborne diseases by 80%
- Save 3 hours per family per day previously spent collecting water
- Create local jobs for system maintenance
- Establish a model for expansion to other communities

Your support will directly fund:
- Equipment and materials ($30,000)
- Installation and setup ($10,000)
- Training local technicians ($5,000)
- Project monitoring for 2 years ($5,000)

Every contribution, no matter the size, brings us closer to transforming these communities and ensuring that clean water is accessible to all.`,
        image: '/api/placeholder/800/400',
        goal: 50000,
        raised: 32500,
        donorCount: 245,
        category: 'Environment',
        creator: {
          name: 'Water For All Foundation',
          avatar: '/api/placeholder/100/100',
          verified: true,
          location: 'Singapore',
        },
        type: 'all-or-nothing',
        location: 'Rural Philippines',
        endDate: '2024-06-15',
        featured: true,
        createdDate: '2024-03-15',
      };

      const mockDonations: Donation[] = [
        {
          id: '1',
          donorName: 'Sarah Chen',
          amount: 500,
          message:
            'This is such an important cause. Hope this helps reach the goal!',
          date: '2024-04-20T10:30:00Z',
          anonymous: false,
        },
        {
          id: '2',
          donorName: 'Anonymous',
          amount: 100,
          message: 'Every drop counts. Keep up the great work!',
          date: '2024-04-20T09:15:00Z',
          anonymous: true,
        },
        {
          id: '3',
          donorName: 'Michael Wong',
          amount: 250,
          message: 'Clean water should be available to everyone.',
          date: '2024-04-19T16:45:00Z',
          anonymous: false,
        },
        {
          id: '4',
          donorName: 'Anonymous',
          amount: 50,
          message: '',
          date: '2024-04-19T14:20:00Z',
          anonymous: true,
        },
        {
          id: '5',
          donorName: 'Lisa Tan',
          amount: 1000,
          message:
            'Amazing project! My company would love to partner with you for future initiatives.',
          date: '2024-04-19T11:30:00Z',
          anonymous: false,
        },
      ];

      const mockQuestions: Question[] = [
        {
          id: '1',
          question:
            'How will you ensure the water purification systems are maintained long-term?',
          answer:
            "We will train local technicians and establish a maintenance fund that covers repairs and replacements for the first 5 years. Additionally, we're partnering with the local government to ensure ongoing support.",
          askerName: 'David Kim',
          dateAsked: '2024-04-18T14:30:00Z',
          dateAnswered: '2024-04-19T09:15:00Z',
          anonymous: false,
        },
        {
          id: '2',
          question: "What happens if you don't reach the full funding goal?",
          answer:
            "Since this is an all-or-nothing campaign, if we don't reach our goal, all funds will be returned to donors. However, we have backup plans to seek additional funding from grants and corporate sponsors.",
          askerName: 'Anonymous',
          dateAsked: '2024-04-17T11:20:00Z',
          dateAnswered: '2024-04-17T16:45:00Z',
          anonymous: true,
        },
        {
          id: '3',
          question:
            'Can you provide more details about the solar technology being used?',
          answer: null,
          askerName: 'Emily Zhang',
          dateAsked: '2024-04-20T08:30:00Z',
          dateAnswered: null,
          anonymous: false,
        },
        {
          id: '4',
          question:
            'How will you measure the success and impact of this project?',
          answer:
            'We will track several metrics including water quality tests, health improvement surveys, time saved by families, and school attendance rates. Reports will be published quarterly and shared with all donors.',
          askerName: 'Anonymous',
          dateAsked: '2024-04-16T13:45:00Z',
          dateAnswered: '2024-04-16T20:30:00Z',
          anonymous: true,
        },
      ];

      setCampaign(mockCampaign);
      setRecentDonations(mockDonations);
      setQuestions(mockQuestions);
      setLoading(false);
    };

    fetchCampaignData();
  }, [campaignId]);

  const calculatePercentage = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
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

    // Check if user is logged in
    if (!user) {
      // Redirect to login page with return URL
      router.push(`/login?returnUrl=/campaign/${campaignId}`);
      return;
    }

    // Handle donation logic here
    console.log('Donation:', {
      amount: donationAmount,
      message: donationMessage,
      anonymous: isAnonymous,
    });
    alert('Thank you for your donation!');
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push(`/login?returnUrl=/campaign/${campaignId}`);
      return;
    }

    if (!newQuestion.trim()) return;

    // Handle question submission
    console.log('New question:', {
      question: newQuestion,
      anonymous: isQuestionAnonymous,
    });

    // Reset form
    setNewQuestion('');
    setIsQuestionAnonymous(false);
    alert('Your question has been submitted!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading campaign...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Campaign not found</div>
        </div>
        <Footer />
      </div>
    );
  }

  const percentage = calculatePercentage(campaign.raised, campaign.goal);
  const daysLeft = getDaysLeft(campaign.endDate);

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
                src={campaign.image}
                alt={campaign.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg"
              />
              {campaign.featured && (
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 text-sm font-semibold rounded">
                  Featured
                </div>
              )}
              <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 text-sm rounded">
                {campaign.category}
              </div>
            </div>

            {/* Campaign Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {campaign.title}
              </h1>

              <div className="flex items-center mb-4">
                <img
                  src={campaign.creator.avatar}
                  alt={campaign.creator.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-900">
                      {campaign.creator.name}
                    </span>
                    {campaign.creator.verified && (
                      <svg
                        className="w-5 h-5 text-blue-600 ml-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {campaign.creator.location}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                <div>
                  <span className="text-gray-500">Type:</span>
                  <p className="font-semibold capitalize">
                    {campaign.type.replace('-', ' ')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Location:</span>
                  <p className="font-semibold">{campaign.location}</p>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <p className="font-semibold">
                    {new Date(campaign.createdDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <p className="font-semibold">{campaign.category}</p>
                </div>
              </div>

              <p className="text-gray-700 text-lg leading-relaxed">
                {campaign.description}
              </p>
            </div>

            {/* Campaign Story */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Campaign Story
              </h2>
              <div className="prose max-w-none">
                {campaign.story.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-700 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

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
                                  ? 'Anonymous'
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
                                    ? 'Anonymous'
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
                                    Answered by {campaign?.creator.name}
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
                                This question is waiting for an answer from the
                                campaign creator.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {questions.length === 0 && (
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
                  <span>Raised: {formatCurrency(campaign.raised)}</span>
                  <span>Goal: {formatCurrency(campaign.goal)}</span>
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
                  <span>{campaign.donorCount} donors</span>
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
