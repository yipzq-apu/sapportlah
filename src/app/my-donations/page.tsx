'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Donation {
  id: string;
  campaignId: string;
  campaignTitle: string;
  campaignImage: string;
  amount: number;
  date: string;
  message: string;
  anonymous: boolean;
  campaignStatus: 'active' | 'successful' | 'failed';
  campaignProgress: number;
  campaignGoal: number;
  campaignRaised: number;
}

export default function MyDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      // Check authentication
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');

      if (token && userData) {
        const user = JSON.parse(userData);
        setUser(user);
      }

      // Mock donations data
      const mockDonations: Donation[] = [
        {
          id: '1',
          campaignId: '1',
          campaignTitle: 'Clean Water for Rural Communities',
          campaignImage: '/api/placeholder/300/200',
          amount: 500,
          date: '2024-04-20T10:30:00Z',
          message:
            'This is such an important cause. Hope this helps reach the goal!',
          anonymous: false,
          campaignStatus: 'active',
          campaignProgress: 65,
          campaignGoal: 50000,
          campaignRaised: 32500,
        },
        {
          id: '2',
          campaignId: '3',
          campaignTitle: 'Emergency Medical Equipment',
          campaignImage: '/api/placeholder/300/200',
          amount: 250,
          date: '2024-04-15T14:20:00Z',
          message: 'Every contribution matters for healthcare!',
          anonymous: false,
          campaignStatus: 'successful',
          campaignProgress: 100,
          campaignGoal: 75000,
          campaignRaised: 75000,
        },
        {
          id: '3',
          campaignId: '2',
          campaignTitle: 'Education Technology for Schools',
          campaignImage: '/api/placeholder/300/200',
          amount: 100,
          date: '2024-04-10T09:15:00Z',
          message: '',
          anonymous: true,
          campaignStatus: 'active',
          campaignProgress: 75,
          campaignGoal: 25000,
          campaignRaised: 18750,
        },
        {
          id: '4',
          campaignId: '6',
          campaignTitle: 'Community Garden Project',
          campaignImage: '/api/placeholder/300/200',
          amount: 75,
          date: '2024-03-28T16:45:00Z',
          message: 'Love this initiative for the community!',
          anonymous: false,
          campaignStatus: 'failed',
          campaignProgress: 45,
          campaignGoal: 15000,
          campaignRaised: 6750,
        },
      ];

      setDonations(mockDonations);
      setLoading(false);
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTotalDonated = () => {
    return donations.reduce((total, donation) => total + donation.amount, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-blue-600 bg-blue-100';
      case 'successful':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredDonations =
    filter === 'all'
      ? donations
      : donations.filter((donation) => donation.campaignStatus === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading donations...</div>
        </div>
        <Footer />
      </div>
    );
  }

  // Stats calculations
  const totalDonated = getTotalDonated();
  const campaignsSupported = donations.length;
  const averageDonation = donations.length
    ? totalDonated / donations.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            My Donations
          </h1>
          <p className="text-lg text-gray-600">
            Track your contributions and see how the campaigns you support are
            progressing.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3 flex-shrink-0">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 truncate">
                  Total Donated
                </p>
                <p
                  className="text-lg font-bold text-gray-900 truncate"
                  title={formatCurrency(totalDonated)}
                >
                  {formatCurrency(totalDonated)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3 flex-shrink-0">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 truncate">
                  Campaigns Supported
                </p>
                <p className="text-lg font-bold text-gray-900 truncate">
                  {campaignsSupported}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3 flex-shrink-0">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 truncate">
                  Average Donation
                </p>
                <p
                  className="text-lg font-bold text-gray-900 truncate"
                  title={formatCurrency(averageDonation)}
                >
                  {formatCurrency(averageDonation)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Donations' },
                { key: 'active', label: 'Active' },
                { key: 'successful', label: 'Successful' },
                { key: 'failed', label: 'Failed' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Donations List */}
        <div className="space-y-6">
          {filteredDonations.map((donation) => (
            <div
              key={donation.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Campaign Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={donation.campaignImage}
                      alt={donation.campaignTitle}
                      className="w-full lg:w-32 h-32 object-cover rounded-lg"
                    />
                  </div>

                  {/* Campaign Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        <Link
                          href={`/campaigns/${donation.campaignId}`}
                          className="hover:text-blue-600"
                        >
                          {donation.campaignTitle}
                        </Link>
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(
                          donation.campaignStatus
                        )}`}
                      >
                        {donation.campaignStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Your Donation</p>
                        <p className="text-lg font-bold text-blue-600">
                          {formatCurrency(donation.amount)}
                        </p>
                        <p className="text-xs text-gray-400">
                          on {formatDate(donation.date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Campaign Progress
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(donation.campaignRaised)} /{' '}
                          {formatCurrency(donation.campaignGoal)}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${donation.campaignProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {donation.message && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-600 italic">
                          "{donation.message}"
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/campaigns/${donation.campaignId}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition duration-300"
                      >
                        View Campaign
                      </Link>
                      {donation.campaignStatus === 'active' && (
                        <Link
                          href={`/campaigns/${donation.campaignId}`}
                          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition duration-300"
                        >
                          Donate Again
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDonations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">💝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No donations found
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all'
                ? "You haven't made any donations yet. Start supporting amazing campaigns!"
                : `No ${filter} donations found. Try a different filter.`}
            </p>
            <Link
              href="/campaigns"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300"
            >
              Discover Campaigns
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
