'use client';

import { useState, useEffect } from 'react';

interface AdminDashboardData {
  platformStats: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalUsers: number;
    totalDonationsAmount: number;
  };
  campaignStats: {
    statusBreakdown: Array<{ status: string; count: number }>;
    featuredCount: number;
    successfulCampaigns: number;
    completionRates: Array<{ progress_level: string; count: number }>;
  };
  userStats: {
    roleBreakdown: Array<{ role: string; count: number }>;
    newUsersThisMonth: number;
    activeDonors: number;
    activeCreators: number;
  };
  financialStats: {
    monthlyTrends: Array<{
      month: string;
      donation_count: number;
      total_amount: number;
    }>;
    avgDonation: number;
    totalDonations: number;
    platformFees: number;
  };
  recentActivities: {
    recentCampaigns: Array<any>;
    recentDonations: Array<any>;
    recentUsers: Array<any>;
  };
  pendingItems: {
    pendingCampaigns: Array<any>;
    unansweredQuestions: Array<any>;
    failedDonations: Array<any>;
    counts: {
      pendingCampaigns: number;
      unansweredQuestions: number;
      failedDonations: number;
    };
  };
}

export default function AdminPage() {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-xl text-gray-600 mb-4">{error}</div>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const {
    platformStats,
    campaignStats,
    userStats,
    financialStats,
    recentActivities,
    pendingItems,
  } = dashboardData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Admin Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Platform analytics and key performance indicators.
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
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
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Campaigns
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {platformStats.totalCampaigns}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
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
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {platformStats.totalUsers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
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
            <div>
              <p className="text-sm font-medium text-gray-500">Total Raised</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(platformStats.totalDonationsAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
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
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Active Campaigns
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {platformStats.activeCampaigns}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Pending Items Alert */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4">
            ⚠️ Items Requiring Attention
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-red-700">Pending Campaigns</span>
              <span className="font-semibold text-red-900">
                {pendingItems.counts.pendingCampaigns}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-700">Unanswered Questions</span>
              <span className="font-semibold text-red-900">
                {pendingItems.counts.unansweredQuestions}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-700">Failed Donations</span>
              <span className="font-semibold text-red-900">
                {pendingItems.counts.failedDonations}
              </span>
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            User Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">New Users (This Month)</span>
              <span className="font-semibold text-gray-900">
                {userStats.newUsersThisMonth}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Donors</span>
              <span className="font-semibold text-gray-900">
                {userStats.activeDonors}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Creators</span>
              <span className="font-semibold text-gray-900">
                {userStats.activeCreators}
              </span>
            </div>
          </div>
        </div>

        {/* Financial Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Financial Overview
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Donations</span>
              <span className="font-semibold text-gray-900">
                {financialStats.totalDonations}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Donation</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(financialStats.avgDonation)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platform Fees</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(financialStats.platformFees)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Campaigns */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Campaigns
          </h3>
          <div className="space-y-3">
            {recentActivities.recentCampaigns.slice(0, 5).map((campaign) => (
              <div
                key={campaign.id}
                className="flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-900">{campaign.title}</p>
                  <p className="text-sm text-gray-500">
                    by {campaign.creator_name}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                    campaign.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : campaign.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {campaign.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Donations */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Donations
          </h3>
          <div className="space-y-3">
            {recentActivities.recentDonations.slice(0, 5).map((donation) => (
              <div
                key={donation.id}
                className="flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(donation.amount)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {donation.anonymous ? 'Anonymous' : donation.donor_name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {donation.campaign_title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(donation.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
