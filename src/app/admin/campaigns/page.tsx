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
  status: 'pending' | 'approved' | 'rejected';
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
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch(`/api/admin/campaigns?status=${filter}`);
        if (response.ok) {
          const data = await response.json();
          setCampaigns(data.campaigns);
        } else {
          console.error('Failed to fetch campaigns');
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [filter]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredCampaigns = campaigns.filter(
    (campaign) => filter === 'all' || campaign.status === filter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading campaigns...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Campaign Reviews
        </h1>
        <p className="text-gray-600">Review and approve submitted campaigns.</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'pending', label: 'Pending Review' },
              { key: 'approved', label: 'Approved' },
              { key: 'rejected', label: 'Rejected' },
              { key: 'all', label: 'All Campaigns' },
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

      {/* Campaigns List */}
      <div className="space-y-6">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 mr-3">
                    {campaign.title}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(
                      campaign.status
                    )}`}
                  >
                    {campaign.status}
                  </span>
                  {campaign.is_featured && (
                    <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      ⭐ Featured
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-3">{campaign.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Creator:</span>
                    <p className="font-medium">{campaign.creator_name}</p>
                    <p className="text-gray-500">{campaign.creator_email}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Goal:</span>
                    <p className="font-medium">
                      {formatCurrency(campaign.goal_amount)}
                    </p>
                    <span className="text-gray-500">Raised:</span>
                    <p className="font-medium">
                      {formatCurrency(campaign.current_amount)}
                    </p>
                    <span className="text-gray-500">Category:</span>
                    <p className="font-medium">{campaign.category_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Submitted:</span>
                    <p className="font-medium">
                      {formatDate(campaign.created_at)}
                    </p>
                    <span className="text-gray-500">Backers:</span>
                    <p className="font-medium">{campaign.backers_count}</p>
                    <span className="text-gray-500">End Date:</span>
                    <p className="font-medium">
                      {formatDate(campaign.end_date)}
                    </p>
                  </div>
                </div>

                {campaign.reason && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">
                      <span className="font-medium">Rejection Reason:</span>{' '}
                      {campaign.reason}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <Link
                  href={`/admin/campaigns/${campaign.id}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Details
                </Link>
              </div>

              {campaign.status === 'pending' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleReject(campaign.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition duration-300"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(campaign.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition duration-300"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No campaigns found
          </h3>
          <p className="text-gray-600">
            {filter === 'pending'
              ? 'No campaigns are currently pending review.'
              : `No ${filter} campaigns found.`}
          </p>
        </div>
      )}
    </div>
  );
}
