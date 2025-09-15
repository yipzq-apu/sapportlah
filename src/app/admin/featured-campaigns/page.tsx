'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Campaign {
  id: number;
  title: string;
  description: string;
  short_description: string;
  goal_amount: number;
  current_amount: number;
  featured_image: string;
  status: string;
  is_featured: boolean;
  created_at: string;
  creator_name: string;
  organization_name?: string;
  category_name: string;
}

export default function FeaturedCampaignsAdminPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Replace single filter with multiple checkbox filters
  const [filters, setFilters] = useState({
    featured: {
      featured: true,
      notFeatured: true,
    },
    status: {
      pending: true,
      approved: true,
      rejected: true,
      active: true,
      successful: true,
      failed: true,
      cancelled: true,
    },
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/admin/campaigns/featured');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      } else {
        console.error('Failed to fetch campaigns');
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeaturedStatus = async (
    campaignId: number,
    currentStatus: boolean
  ) => {
    try {
      const response = await fetch('/api/admin/campaigns/featured', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: campaignId,
          isFeatured: !currentStatus,
        }),
      });

      if (response.ok) {
        // Update local state
        setCampaigns(
          campaigns.map((campaign) =>
            campaign.id === campaignId
              ? { ...campaign, is_featured: !currentStatus }
              : campaign
          )
        );

        const action = !currentStatus ? 'added to' : 'removed from';
        alert(`Campaign ${action} featured list successfully!`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update featured status');
      }
    } catch (error) {
      console.error('Error updating featured status:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const handleFeaturedFilterChange = (
    filterType: 'featured' | 'notFeatured'
  ) => {
    setFilters((prev) => ({
      ...prev,
      featured: {
        ...prev.featured,
        [filterType]: !prev.featured[filterType],
      },
    }));
  };

  const handleStatusFilterChange = (status: keyof typeof filters.status) => {
    setFilters((prev) => ({
      ...prev,
      status: {
        ...prev.status,
        [status]: !prev.status[status],
      },
    }));
  };

  const capitalizeStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    // Check search term
    const searchMatch =
      searchTerm === '' ||
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.creator_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.category_name.toLowerCase().includes(searchTerm.toLowerCase());

    // Check featured filter
    const featuredMatch =
      (campaign.is_featured && filters.featured.featured) ||
      (!campaign.is_featured && filters.featured.notFeatured);

    // Check status filter
    const statusMatch =
      filters.status[campaign.status as keyof typeof filters.status];

    return searchMatch && featuredMatch && statusMatch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCampaigns = filteredCampaigns.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  const featuredCount = campaigns.filter((c) => c.is_featured).length;
  const canAddMore = featuredCount < 3;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">Loading campaigns...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Manage Featured Campaigns
        </h1>
        <p className="text-lg text-gray-600">
          Add or remove campaigns from the featured section (Max: 3)
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">
              Search campaigns
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
              <input
                id="search"
                type="text"
                placeholder="Search by campaign title, creator name, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition duration-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Stats and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col gap-6">
          {/* Stats Row */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  featuredCount >= 3 ? 'text-red-600' : 'text-blue-600'
                }`}
              >
                {featuredCount}
              </div>
              <div className="text-sm text-gray-500">Featured (Max: 3)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {campaigns.length - featuredCount}
              </div>
              <div className="text-sm text-gray-500">Not Featured</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {campaigns.length}
              </div>
              <div className="text-sm text-gray-500">Total Campaigns</div>
            </div>
            {featuredCount >= 3 && (
              <div className="text-sm text-red-600 font-medium">
                ⚠️ Maximum featured limit reached
              </div>
            )}
          </div>

          {/* Filters Row */}
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Featured Status Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Featured Status
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.featured.featured}
                      onChange={() => handleFeaturedFilterChange('featured')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Featured ({campaigns.filter((c) => c.is_featured).length})
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.featured.notFeatured}
                      onChange={() => handleFeaturedFilterChange('notFeatured')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Not Featured (
                      {campaigns.filter((c) => !c.is_featured).length})
                    </span>
                  </label>
                </div>
              </div>

              {/* Campaign Status Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Campaign Status
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries({
                    pending: 'Pending',
                    approved: 'Approved',
                    rejected: 'Rejected',
                    active: 'Active',
                    successful: 'Successful',
                    failed: 'Failed',
                    cancelled: 'Cancelled',
                  }).map(([key, label]) => {
                    const count = campaigns.filter(
                      (c) => c.status === key
                    ).length;
                    return (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={
                            filters.status[key as keyof typeof filters.status]
                          }
                          onChange={() =>
                            handleStatusFilterChange(
                              key as keyof typeof filters.status
                            )
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span
                          className={`ml-2 text-sm ${
                            key === 'active'
                              ? 'text-green-700'
                              : key === 'pending'
                              ? 'text-yellow-700'
                              : key === 'approved'
                              ? 'text-blue-700'
                              : key === 'successful'
                              ? 'text-green-700'
                              : key === 'rejected' ||
                                key === 'failed' ||
                                key === 'cancelled'
                              ? 'text-red-700'
                              : 'text-gray-700'
                          }`}
                        >
                          {label} ({count})
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {filteredCampaigns.length} of {campaigns.length}{' '}
                campaigns
                {searchTerm && (
                  <span className="ml-1">(filtered by "{searchTerm}")</span>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    setFilters({
                      featured: { featured: true, notFeatured: true },
                      status: {
                        pending: true,
                        approved: true,
                        rejected: true,
                        active: true,
                        successful: true,
                        failed: true,
                        cancelled: true,
                      },
                    })
                  }
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition duration-200"
                >
                  Select All
                </button>
                <button
                  onClick={() =>
                    setFilters({
                      featured: { featured: false, notFeatured: false },
                      status: {
                        pending: false,
                        approved: false,
                        rejected: false,
                        active: false,
                        successful: false,
                        failed: false,
                        cancelled: false,
                      },
                    })
                  }
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition duration-200"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Campaigns ({filteredCampaigns.length})
          </h3>
        </div>

        {currentCampaigns.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {currentCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="p-6 hover:bg-gray-50 transition duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Campaign Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={campaign.featured_image || '/api/placeholder/120/80'}
                      alt={campaign.title}
                      className="w-full lg:w-32 h-20 object-cover rounded-lg"
                    />
                  </div>

                  {/* Campaign Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold text-gray-900 truncate">
                          {truncateText(campaign.title, 60)}
                        </h4>
                        <p className="text-sm text-gray-500 mb-2">
                          by{' '}
                          {campaign.organization_name || campaign.creator_name}{' '}
                          • {campaign.category_name}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            campaign.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : campaign.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : campaign.status === 'approved'
                              ? 'bg-blue-100 text-blue-800'
                              : campaign.status === 'successful'
                              ? 'bg-green-100 text-green-800'
                              : campaign.status === 'rejected' ||
                                campaign.status === 'failed' ||
                                campaign.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {capitalizeStatus(campaign.status)}
                        </span>
                        {campaign.is_featured === true && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>

                    <p
                      className="text-gray-600 text-sm mb-3"
                      title={campaign.short_description || campaign.description}
                    >
                      {truncateText(
                        campaign.short_description || campaign.description,
                        150
                      )}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(campaign.current_amount)}
                          </span>
                          <span className="text-gray-500"> raised of </span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(campaign.goal_amount)}
                          </span>
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${getProgressPercentage(
                                campaign.current_amount,
                                campaign.goal_amount
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/campaigns/${campaign.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          target="_blank"
                        >
                          View
                        </Link>
                        <button
                          onClick={() =>
                            toggleFeaturedStatus(
                              campaign.id,
                              campaign.is_featured
                            )
                          }
                          disabled={!campaign.is_featured && !canAddMore}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-300 ${
                            campaign.is_featured
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : canAddMore
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                          title={
                            !campaign.is_featured && !canAddMore
                              ? 'Maximum of 3 campaigns can be featured'
                              : ''
                          }
                        >
                          {campaign.is_featured
                            ? 'Remove Featured'
                            : 'Make Featured'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">
              {searchTerm ? '🔍' : '📋'}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No campaigns found' : 'No campaigns found'}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? `No campaigns match "${searchTerm}" with the current filters`
                : filters.featured.featured && !filters.featured.notFeatured
                ? 'No not featured campaigns available'
                : !filters.featured.featured && filters.featured.notFeatured
                ? 'No featured campaigns available'
                : 'No campaigns available'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(endIndex, filteredCampaigns.length)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">
                      {filteredCampaigns.length}
                    </span>{' '}
                    results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNumber
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
