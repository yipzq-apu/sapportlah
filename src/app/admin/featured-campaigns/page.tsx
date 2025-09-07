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
  category_name: string;
}

export default function FeaturedCampaignsAdminPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'featured' | 'not-featured'>(
    'all'
  );

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

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (filter === 'featured') return campaign.is_featured;
    if (filter === 'not-featured') return !campaign.is_featured;
    return true;
  });

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

      {/* Stats and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
          </div>

          <div className="flex flex-col items-end space-y-2">
            {featuredCount >= 3 && (
              <div className="text-sm text-red-600 font-medium">
                ⚠️ Maximum featured limit reached
              </div>
            )}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                Filter:
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Campaigns</option>
                <option value="featured">Featured Only</option>
                <option value="not-featured">Not Featured</option>
              </select>
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

        {filteredCampaigns.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredCampaigns.map((campaign) => (
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
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 truncate">
                          {campaign.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          by {campaign.creator_name} • {campaign.category_name}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            campaign.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : campaign.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {campaign.status}
                        </span>
                        {campaign.is_featured && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {campaign.short_description || campaign.description}
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
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No campaigns found
            </h3>
            <p className="text-gray-600">
              {filter === 'featured'
                ? 'No campaigns are currently featured'
                : filter === 'not-featured'
                ? 'All campaigns are featured'
                : 'No campaigns available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
