'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
  totalCampaigns: number;
  pendingCampaigns: number;
  totalUsers: number;
  totalRaised: number;
  activeCampaigns: number;
  successfulCampaigns: number;
}

interface RecentActivity {
  id: string;
  type: 'campaign_created' | 'campaign_funded' | 'user_registered';
  title: string;
  description: string;
  time: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Mock data
      const mockStats: DashboardStats = {
        totalCampaigns: 156,
        pendingCampaigns: 8,
        totalUsers: 2847,
        totalRaised: 1250000,
        activeCampaigns: 89,
        successfulCampaigns: 59,
      };

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'campaign_created',
          title: 'New Campaign Submitted',
          description: 'Clean Water Initiative by Water For All Foundation',
          time: '2 hours ago',
        },
        {
          id: '2',
          type: 'campaign_funded',
          title: 'Campaign Funded',
          description: 'Education Technology reached 100% funding',
          time: '4 hours ago',
        },
        {
          id: '3',
          type: 'user_registered',
          title: 'New User Registration',
          description: '5 new users joined in the last hour',
          time: '1 hour ago',
        },
      ];

      setStats(mockStats);
      setRecentActivity(mockActivity);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening on SapportLah.
        </p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3 flex-shrink-0">
                📊
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 truncate">
                  Total Campaigns
                </p>
                <p className="text-lg font-bold text-gray-900 truncate">
                  {stats.totalCampaigns}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 mr-3 flex-shrink-0">
                ⏳
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 truncate">
                  Pending Reviews
                </p>
                <p className="text-lg font-bold text-gray-900 truncate">
                  {stats.pendingCampaigns}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3 flex-shrink-0">
                👥
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 truncate">
                  Total Users
                </p>
                <p className="text-lg font-bold text-gray-900 truncate">
                  {stats.totalUsers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3 flex-shrink-0">
                💰
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 truncate">
                  Total Raised
                </p>
                <p
                  className="text-lg font-bold text-gray-900 truncate"
                  title={formatCurrency(stats.totalRaised)}
                >
                  {formatCurrency(stats.totalRaised)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3 flex-shrink-0">
                🚀
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 truncate">
                  Active Campaigns
                </p>
                <p className="text-lg font-bold text-gray-900 truncate">
                  {stats.activeCampaigns}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3 flex-shrink-0">
                ✅
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 truncate">
                  Successful
                </p>
                <p className="text-lg font-bold text-gray-900 truncate">
                  {stats.successfulCampaigns}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/admin/campaigns"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300"
        >
          <div className="text-center">
            <div className="text-yellow-600 text-4xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Review Campaigns
            </h3>
            <p className="text-gray-600 text-sm">
              {stats?.pendingCampaigns} campaigns pending approval
            </p>
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300"
        >
          <div className="text-center">
            <div className="text-blue-600 text-4xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Manage Users
            </h3>
            <p className="text-gray-600 text-sm">
              View and manage user accounts
            </p>
          </div>
        </Link>

        <Link
          href="/admin/reports"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300"
        >
          <div className="text-center">
            <div className="text-green-600 text-4xl mb-4">📈</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              View Reports
            </h3>
            <p className="text-gray-600 text-sm">
              Platform analytics and insights
            </p>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Activity
          </h2>
          <Link
            href="/admin/activity"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </Link>
        </div>

        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex-shrink-0 mr-4">
                {activity.type === 'campaign_created' && (
                  <span className="text-2xl">📝</span>
                )}
                {activity.type === 'campaign_funded' && (
                  <span className="text-2xl">💰</span>
                )}
                {activity.type === 'user_registered' && (
                  <span className="text-2xl">👤</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  {activity.title}
                </h3>
                <p className="text-sm text-gray-600">{activity.description}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
