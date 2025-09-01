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
  monthlyGrowth: {
    users: number;
    campaigns: number;
    donations: number;
  };
  categoryStats: {
    name: string;
    count: number;
    percentage: number;
  }[];
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      console.log('Admin page loading - NO AUTHENTICATION CHECKS');

      // Set a temporary admin user for testing - NO AUTHENTICATION REQUIRED
      setUser({
        id: 'temp-admin',
        name: 'Temporary Admin',
        email: 'admin@temp.com',
        role: 'admin',
      });

      // Enhanced mock data for stats with additional metrics
      const mockStats: DashboardStats = {
        totalCampaigns: 156,
        pendingCampaigns: 8,
        totalUsers: 2847,
        totalRaised: 1250000,
        activeCampaigns: 89,
        successfulCampaigns: 59,
        monthlyGrowth: {
          users: 12.5,
          campaigns: 8.3,
          donations: 15.7,
        },
        categoryStats: [
          { name: 'Education', count: 45, percentage: 28.8 },
          { name: 'Healthcare', count: 38, percentage: 24.4 },
          { name: 'Environment', count: 29, percentage: 18.6 },
          { name: 'Community', count: 25, percentage: 16.0 },
          { name: 'Technology', count: 12, percentage: 7.7 },
          { name: 'Others', count: 7, percentage: 4.5 },
        ],
      };

      setStats(mockStats);
      setLoading(false);
    };

    loadData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading admin panel...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Platform analytics and key performance indicators.
          </p>
        </div>

        {/* Main Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Total Users
                  </h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.totalUsers.toLocaleString()}
                  </p>
                </div>
                <div className="text-4xl text-blue-500">👥</div>
              </div>
              <div className="mt-4">
                <span className="text-green-500 text-sm font-medium">
                  +{stats.monthlyGrowth.users}%
                </span>
                <span className="text-gray-500 text-sm"> this month</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Active Campaigns
                  </h3>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.activeCampaigns}
                  </p>
                </div>
                <div className="text-4xl text-green-500">📋</div>
              </div>
              <div className="mt-4">
                <span className="text-green-500 text-sm font-medium">
                  +{stats.monthlyGrowth.campaigns}%
                </span>
                <span className="text-gray-500 text-sm"> this month</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Total Raised
                  </h3>
                  <p className="text-3xl font-bold text-purple-600">
                    {formatCurrency(stats.totalRaised)}
                  </p>
                </div>
                <div className="text-4xl text-purple-500">💰</div>
              </div>
              <div className="mt-4">
                <span className="text-green-500 text-sm font-medium">
                  +{stats.monthlyGrowth.donations}%
                </span>
                <span className="text-gray-500 text-sm"> this month</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Success Rate
                  </h3>
                  <p className="text-3xl font-bold text-orange-600">
                    {Math.round((stats.successfulCampaigns / stats.totalCampaigns) * 100)}%
                  </p>
                </div>
                <div className="text-4xl text-orange-500">🎯</div>
              </div>
              <div className="mt-4">
                <span className="text-gray-500 text-sm">
                  {stats.successfulCampaigns} of {stats.totalCampaigns} campaigns
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Campaign Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (stats!.activeCampaigns / stats!.totalCampaigns) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {stats!.activeCampaigns}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Successful</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (stats!.successfulCampaigns / stats!.totalCampaigns) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {stats!.successfulCampaigns}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-yellow-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (stats!.pendingCampaigns / stats!.totalCampaigns) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {stats!.pendingCampaigns}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Category Distribution
            </h3>
            <div className="space-y-2">
              {stats!.categoryStats.map((category, index) => (
                <div
                  key={category.name}
                  className="flex justify-between items-center"
                >
                  <span className="text-gray-600 text-sm">{category.name}</span>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                      <div
                        className={`h-1.5 rounded-full ${
                          index % 6 === 0
                            ? 'bg-blue-500'
                            : index % 6 === 1
                            ? 'bg-green-500'
                            : index % 6 === 2
                            ? 'bg-purple-500'
                            : index % 6 === 3
                            ? 'bg-yellow-500'
                            : index % 6 === 4
                            ? 'bg-red-500'
                            : 'bg-gray-500'
                        }`}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{category.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Monthly Growth
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">User Growth</span>
                <span className="text-green-600 font-semibold">
                  +{stats!.monthlyGrowth.users}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Campaign Growth</span>
                <span className="text-green-600 font-semibold">
                  +{stats!.monthlyGrowth.campaigns}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Donation Growth</span>
                <span className="text-green-600 font-semibold">
                  +{stats!.monthlyGrowth.donations}%
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="text-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats!.totalRaised / stats!.totalCampaigns)}
                  </span>
                  <p className="text-sm text-gray-500">Average per campaign</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
