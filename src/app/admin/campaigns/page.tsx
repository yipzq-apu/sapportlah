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

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [campaignToReject, setCampaignToReject] = useState<Campaign | null>(
    null
  );

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/admin/campaigns');
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

  const handleRejectCampaign = (campaign: Campaign) => {
    setCampaignToReject(campaign);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const confirmRejectCampaign = async () => {
    if (!campaignToReject || !rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/campaigns/${campaignToReject.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'rejected',
            reason: rejectionReason.trim(),
            reviewedBy: 'admin',
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Update local state
        setCampaigns((prev) =>
          prev.map((campaign) =>
            campaign.id === campaignToReject.id
              ? { ...campaign, status: 'rejected' }
              : campaign
          )
        );
        alert(
          'Campaign rejected successfully! Creator has been notified via email.'
        );
        setShowRejectModal(false);
        setCampaignToReject(null);
        setRejectionReason('');
      } else {
        console.error('API Error:', data);
        alert(data.error || 'Failed to reject campaign');
      }
    } catch (error) {
      console.error('Error rejecting campaign:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  const updateCampaignStatus = async (
    campaignId: number,
    newStatus: string
  ) => {
    // Add confirmation dialog for approval
    if (newStatus === 'approved') {
      if (!confirm('Are you sure you want to approve this campaign?')) {
        return;
      }
    }

    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          reviewedBy: 'admin',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state
        setCampaigns((prev) =>
          prev.map((campaign) =>
            campaign.id === campaignId
              ? { ...campaign, status: newStatus }
              : campaign
          )
        );
        alert(
          `Campaign ${newStatus} successfully! Creator has been notified via email.`
        );
      } else {
        console.error('API Error:', data);
        alert(data.error || `Failed to ${newStatus} campaign`);
      }
    } catch (error) {
      console.error(`Error ${newStatus} campaign:`, error);
      alert('Network error. Please check your connection and try again.');
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
      campaign.category_name?.toLowerCase().includes(searchTerm.toLowerCase());

    // Check filter
    if (filter === 'all') return searchMatch;
    return searchMatch && campaign.status === filter;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCampaigns = filteredCampaigns.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading campaigns...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Campaign Management
        </h1>
        <p className="text-lg text-gray-600">
          Review and manage all campaigns on the platform.
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

      {/* Filters and Stats */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 text-gray-600 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Campaigns</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="active">Active</option>
              <option value="successful">Successful</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredCampaigns.length} of {campaigns.length} campaigns
            {searchTerm && (
              <span className="ml-1">(filtered by "{searchTerm}")</span>
            )}
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
                        <h4
                          className="text-lg font-semibold text-gray-900 truncate"
                          title={campaign.title}
                        >
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
                        {campaign.status === 'pending' && (
                          <>
                            <button
                              onClick={() =>
                                updateCampaignStatus(campaign.id, 'approved')
                              }
                              className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium hover:bg-green-200 transition duration-200"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectCampaign(campaign)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200 transition duration-200"
                            >
                              Reject
                            </button>
                          </>
                        )}
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
              {searchTerm ? 'No campaigns found' : 'No campaigns available'}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? `No campaigns match "${searchTerm}" with the current filter`
                : 'No campaigns have been created yet.'}
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

      {/* Rejection Reason Modal */}
      {showRejectModal && campaignToReject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Reject Campaign
                </h3>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                You are about to reject the campaign{' '}
                <strong>"{campaignToReject.title}"</strong>. Please provide a
                reason for rejection that will be sent to the campaign creator.
              </p>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-400"
                rows={4}
                placeholder="Enter detailed reason for rejection (e.g., inappropriate content, missing information, etc.)..."
                required
              />

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRejectCampaign}
                  disabled={!rejectionReason.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  Reject Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
