'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

interface Donor {
  id: string;
  name: string;
  amount: number;
  date: string;
  message: string;
  anonymous: boolean;
  email: string;
}

export default function CampaignDonorsPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');

        if (token && userData) {
          const user = JSON.parse(userData);
          setUser(user);
        }

        // Mock donors data
        const mockDonors: Donor[] = [
          {
            id: '1',
            name: 'Sarah Chen',
            amount: 500,
            date: '2024-04-20T10:30:00Z',
            message:
              'This is such an important cause. Hope this helps reach the goal!',
            anonymous: false,
            email: 'sarah.chen@email.com',
          },
          {
            id: '2',
            name: 'Anonymous',
            amount: 100,
            date: '2024-04-20T09:15:00Z',
            message: 'Every drop counts. Keep up the great work!',
            anonymous: true,
            email: 'anonymous@hidden.com',
          },
          {
            id: '3',
            name: 'Michael Wong',
            amount: 250,
            date: '2024-04-19T16:45:00Z',
            message: 'Clean water should be available to everyone.',
            anonymous: false,
            email: 'michael.wong@email.com',
          },
          {
            id: '4',
            name: 'Lisa Tan',
            amount: 1000,
            date: '2024-04-19T11:30:00Z',
            message:
              'Amazing project! My company would love to partner with you for future initiatives.',
            anonymous: false,
            email: 'lisa.tan@company.com',
          },
          {
            id: '5',
            name: 'Anonymous',
            amount: 50,
            date: '2024-04-19T14:20:00Z',
            message: '',
            anonymous: true,
            email: 'anonymous@hidden.com',
          },
        ];

        setDonors(mockDonors);
      } catch (error) {
        console.error('Error fetching donors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [campaignId]);

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTotalDonations = () => {
    return donors.reduce((sum, donor) => sum + donor.amount, 0);
  };

  const filteredDonors = donors.filter((donor) => {
    const matchesSearch =
      donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'anonymous' && donor.anonymous) ||
      (filter === 'named' && !donor.anonymous);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading donors...</div>
        </div>
        <Footer />
      </div>
    );
  }

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
            <li>
              <Link
                href={`/my-campaigns/${campaignId}`}
                className="hover:text-blue-600"
              >
                Campaign Details
              </Link>
            </li>
            <li>›</li>
            <li className="text-gray-900">Donors</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Campaign Donors
          </h1>
          <p className="text-lg text-gray-600">
            View and manage your campaign supporters and their contributions.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Donors
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {donors.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
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
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Raised
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(getTotalDonations())}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
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
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Average Donation
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(getTotalDonations() / donors.length)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search donors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:w-48">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Donors</option>
                <option value="named">Named Donors</option>
                <option value="anonymous">Anonymous Donors</option>
              </select>
            </div>
          </div>
        </div>

        {/* Donors List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Donors ({filteredDonors.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredDonors.map((donor) => (
              <div key={donor.id} className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {donor.anonymous ? 'Anonymous Donor' : donor.name}
                      </h3>
                      <span className="ml-3 bg-blue-100 text-blue-800 px-2 py-1 text-sm font-medium rounded-full">
                        {formatCurrency(donor.amount)}
                      </span>
                    </div>
                    {!donor.anonymous && (
                      <p className="text-sm text-gray-500 mb-2">
                        {donor.email}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Donated on {formatDate(donor.date)}
                    </p>
                  </div>
                </div>

                {donor.message && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 italic">
                      "{donor.message}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredDonors.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">👥</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No donors found
              </h3>
              <p className="text-gray-600">
                {searchTerm || filter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : "Your campaign doesn't have any donors yet."}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
