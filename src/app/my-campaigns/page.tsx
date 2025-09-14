'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Campaign {
  id: string;
  title: string;
  goal: number;
  raised: number;
  donorCount: number;
  status:
    | 'draft'
    | 'pending'
    | 'active'
    | 'successful'
    | 'failed'
    | 'approved'
    | 'rejected'
    | 'cancelled';
  endDate: string;
  createdDate: string;
}

export default function MyCampaignsPage() {
  const [user, setUser] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Check if user is logged in (simplified - no token auth)
        const userData = localStorage.getItem('userData');

        if (!userData) {
          setError('Please log in to view your campaigns');
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(userData);

        // Check if user is creator or admin
        if (parsedUser.role !== 'creator' && parsedUser.role !== 'admin') {
          setError('You must be a creator to view campaigns');
          setLoading(false);
          return;
        }

        setUser(parsedUser);

        // Fetch campaigns from backend
        const response = await fetch(
          `/api/campaigns/my-campaigns?userId=${parsedUser.id}`
        );

        if (response.ok) {
          const data = await response.json();
          setCampaigns(data.campaigns || []);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch campaigns');
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setError('Failed to load campaigns. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-blue-600 bg-blue-100';
      case 'successful':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'draft':
        return 'text-gray-600 bg-gray-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Filter and search campaigns
  const filteredCampaigns = campaigns
    .filter((campaign) => {
      const matchesFilter = filter === 'all' || campaign.status === filter;
      const matchesSearch = campaign.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort(
      (a, b) =>
        new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    ); // Latest first

  // Pagination
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCampaigns = filteredCampaigns.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset pagination when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading campaigns...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-xl text-gray-600 mb-4">{error}</div>
            {error.includes('log in') ? (
              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Login
              </Link>
            ) : (
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              My Campaigns
            </h1>
            <p className="text-lg text-gray-600">
              Manage your fundraising campaigns and track their progress.
            </p>
          </div>
          <Link
            href="/create-campaign"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300"
          >
            Create Campaign
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="flex border-b overflow-x-auto">
            {[
              'All',
              'Pending',
              'Approved',
              'Active',
              'Rejected',
              'Cancelled',
              'Successful',
              'Failed',
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => handleFilterChange(tab.toLowerCase())}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  filter === tab.toLowerCase()
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Campaigns List */}
        <div className="space-y-6">
          {paginatedCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <Link href={`/campaigns/${campaign.id}`}>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer transition duration-300">
                      {campaign.title}
                    </h3>
                  </Link>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(
                      campaign.status
                    )}`}
                  >
                    {campaign.status === 'pending'
                      ? 'Pending Approval'
                      : campaign.status}
                  </span>
                  {campaign.status === 'pending' && (
                    <p className="text-sm text-yellow-600 mt-2">
                      Your campaign is under review. We'll notify you once it's
                      approved.
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  {(campaign.status === 'pending' ||
                    campaign.status === 'rejected') && (
                    <Link
                      href={`/campaigns/${campaign.id}/edit`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      {campaign.status === 'rejected' ? 'Resubmit' : 'Edit'}
                    </Link>
                  )}
                  {campaign.status !== 'pending' &&
                    campaign.status !== 'rejected' && (
                      <Link
                        href={`/campaigns/${campaign.id}`}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        View Campaign
                      </Link>
                    )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-700 font-medium">Raised</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(campaign.raised)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">Goal</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(campaign.goal)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">Donors</p>
                  <p className="font-semibold text-gray-900">
                    {campaign.donorCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">Progress</p>
                  <p className="font-semibold text-gray-900">
                    {((campaign.raised / campaign.goal) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      (campaign.raised / campaign.goal) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Created: {formatDate(campaign.createdDate)}
                </span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    End Date: {formatDate(campaign.endDate)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}

        {/* Empty State */}
        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">
              {searchQuery ? '🔍' : filter === 'pending' ? '⏳' : '📋'}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No campaigns found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? `No campaigns match "${searchQuery}". Try a different search term.`
                : filter === 'all'
                ? "You haven't created any campaigns yet. Start your first campaign!"
                : filter === 'pending'
                ? 'No campaigns are pending approval.'
                : `No ${filter} campaigns found. Try a different filter.`}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-blue-600 hover:text-blue-700 font-medium mr-4"
              >
                Clear search
              </button>
            )}
            <Link
              href="/create-campaign"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300"
            >
              Create Your First Campaign
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
