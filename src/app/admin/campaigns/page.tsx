'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Campaign {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string;
  short_description: string;
  goal_amount: number;
  current_amount: number;
  end_date: string;
  featured_image: string;
  status: 'pending' | 'approved' | 'rejected' | 'active';
  reason?: string;
  is_featured: boolean;
  backers_count: number;
  created_at: string;
  updated_at: string;
  creator_name: string;
  creator_email: string;
  category_name: string;
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'pending' | 'approved' | 'rejected' | 'active'
  >('pending');

  const fetchAllCampaigns = async () => {
    try {
      const response = await fetch('/api/admin/campaigns');
      if (response.ok) {
        const data = await response.json();
        setAllCampaigns(data.campaigns || []);
        // Filter campaigns based on active tab
        const filtered = (data.campaigns || []).filter(
          (campaign: Campaign) => campaign.status === activeTab
        );
        setCampaigns(filtered);
      } else {
        console.error('Failed to fetch campaigns');
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCampaigns();
  }, []);

  useEffect(() => {
    // Filter campaigns when tab changes
    const filtered = allCampaigns.filter(
      (campaign) => campaign.status === activeTab
    );
    setCampaigns(filtered);
  }, [activeTab, allCampaigns]);

  const handleApprove = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'approved',
          reviewedBy: 'Admin User', // In production, get from auth context
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCampaigns((prev) =>
          prev.map((campaign) =>
            campaign.id === campaignId ? data.campaign : campaign
          )
        );
        alert('Campaign approved successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error approving campaign:', error);
      alert('Failed to approve campaign. Please try again.');
    }
  };

  const handleReject = async (campaignId: string) => {
    const rejectionReason = prompt('Please provide a reason for rejection:');
    if (rejectionReason && rejectionReason.trim()) {
      try {
        const response = await fetch(`/api/admin/campaigns/${campaignId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'rejected',
            reason: rejectionReason.trim(),
            reviewedBy: 'Admin User', // In production, get from auth context
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setCampaigns((prev) =>
            prev.map((campaign) =>
              campaign.id === campaignId ? data.campaign : campaign
            )
          );
          alert('Campaign rejected successfully!');
        } else {
          const error = await response.json();
          alert(`Error: ${error.error}`);
        }
      } catch (error) {
        console.error('Error rejecting campaign:', error);
        alert('Failed to reject campaign. Please try again.');
      }
    }
  };

  const cancelCampaign = async (campaignId: string) => {
    if (
      !confirm(
        'Are you sure you want to cancel this campaign? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/campaigns/${campaignId}/cancel`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        alert('Campaign cancelled successfully!');
        fetchAllCampaigns(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to cancel campaign');
      }
    } catch (error) {
      console.error('Error cancelling campaign:', error);
      alert('Failed to cancel campaign. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'MYR',
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'active':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredCampaigns = campaigns.filter(
    (campaign) => filter === 'all' || campaign.status === filter
  );

  // Calculate counts from all campaigns
  const pendingCount = allCampaigns.filter(
    (c) => c.status === 'pending'
  ).length;
  const approvedCount = allCampaigns.filter(
    (c) => c.status === 'approved'
  ).length;
  const rejectedCount = allCampaigns.filter(
    (c) => c.status === 'rejected'
  ).length;
  const activeCount = allCampaigns.filter((c) => c.status === 'active').length;

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Campaign Management
        </h1>
        <p className="text-lg text-gray-600">
          Review and manage campaign submissions
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Review ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'approved'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Approved ({approvedCount})
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'rejected'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Rejected ({rejectedCount})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'active'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active ({activeCount})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-xl text-gray-600">Loading campaigns...</div>
            </div>
          ) : campaigns.length > 0 ? (
            <div className="space-y-6">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Campaign Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={
                          campaign.featured_image || '/api/placeholder/150/100'
                        }
                        alt={campaign.title}
                        className="w-full lg:w-40 h-24 object-cover rounded-lg"
                      />
                    </div>

                    {/* Campaign Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {campaign.title}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            by {campaign.creator_name} • Created{' '}
                            {new Date(campaign.created_at).toLocaleDateString()}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>
                              Goal: {formatCurrency(campaign.goal_amount)}
                            </span>
                            <span>
                              Raised: {formatCurrency(campaign.current_amount)}
                            </span>
                            <span>
                              Progress:{' '}
                              {Math.round(
                                (campaign.current_amount /
                                  campaign.goal_amount) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            campaign.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : campaign.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : campaign.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : campaign.status === 'active'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {campaign.status.charAt(0).toUpperCase() +
                            campaign.status.slice(1)}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {campaign.short_description || campaign.description}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={`/campaigns/${campaign.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          target="_blank"
                        >
                          View Campaign
                        </Link>

                        {activeTab === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(campaign.id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition duration-300"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(campaign.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition duration-300"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {activeTab === 'active' && (
                          <button
                            onClick={() => cancelCampaign(campaign.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition duration-300"
                          >
                            Cancel Campaign
                          </button>
                        )}

                        {activeTab === 'rejected' && campaign.reason && (
                          <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-2 w-full">
                            <h4 className="text-sm font-medium text-red-800 mb-1">
                              Rejection Reason:
                            </h4>
                            <p className="text-sm text-red-700">
                              {campaign.reason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No {activeTab} campaigns
              </h3>
              <p className="text-gray-600">
                {activeTab === 'pending'
                  ? 'All campaigns have been reviewed'
                  : activeTab === 'approved'
                  ? 'No approved campaigns at the moment'
                  : activeTab === 'rejected'
                  ? 'No rejected campaigns at the moment'
                  : 'No active campaigns at the moment'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ...existing code for rejection modal... */}
    </div>
  );
}
