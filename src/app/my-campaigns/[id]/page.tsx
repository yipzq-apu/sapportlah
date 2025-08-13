'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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

export default function CreatorCampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'donations' | 'qna'>('donations');

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        setUser(userData);
      }
    };

    checkAuth();
  }, []);

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
        // ...more donations
      ];

      const mockQuestions: Question[] = [
        {
          id: '1',
          question:
            'How will you ensure the water purification systems are maintained long-term?',
          answer:
            'We will train local technicians and establish a maintenance fund that covers repairs and replacements for the first 5 years.',
          askerName: 'David Kim',
          dateAsked: '2024-04-18T14:30:00Z',
          dateAnswered: '2024-04-19T09:15:00Z',
          anonymous: false,
        },
        {
          id: '2',
          question:
            'Can you provide more details about the solar technology being used?',
          answer: null,
          askerName: 'Emily Zhang',
          dateAsked: '2024-04-20T08:30:00Z',
          dateAnswered: null,
          anonymous: false,
        },
        // ...more questions
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

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
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
              <Link href="/my-campaigns" className="hover:text-blue-600">
                My Campaigns
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
                                    Answered by {campaign.creator.name}
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
                                This question is waiting for an answer.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Creator Management */}
          <div className="lg:col-span-1">
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

              {/* Creator Management Buttons */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Manage Campaign
                </h3>

                <Link
                  href={`/my-campaigns/${campaignId}/edit`}
                  className="block w-full text-center bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 transition duration-300"
                >
                  Edit Campaign
                </Link>

                <Link
                  href={`/my-campaigns/${campaignId}/donors`}
                  className="block w-full text-center bg-green-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-green-700 transition duration-300"
                >
                  View Donors ({campaign.donorCount})
                </Link>

                <Link
                  href={`/my-campaigns/${campaignId}/qna`}
                  className="block w-full text-center bg-purple-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-purple-700 transition duration-300"
                >
                  Manage Q&A ({questions.filter((q) => !q.answer).length}{' '}
                  pending)
                </Link>

                <div className="mt-4 text-xs text-gray-500 text-center">
                  Campaign management tools for creators
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
