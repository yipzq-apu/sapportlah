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
  status: 'draft' | 'active' | 'successful' | 'failed';
  endDate: string;
  createdDate: string;
}

interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalRaised: number;
  totalDonors: number;
  pendingQuestions: number;
}

function DashboardContent() {
  const [user, setUser] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if user is logged in
        const userData = localStorage.getItem('userData');
        if (!userData) {
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Fetch dashboard data from backend
        const response = await fetch(
          `/api/dashboard/creator?creatorId=${parsedUser.id}`
        );

        if (response.ok) {
          const data = await response.json();
          setCampaigns(data.campaigns || []);
          setStats(
            data.stats || {
              totalCampaigns: 0,
              activeCampaigns: 0,
              totalRaised: 0,
              totalDonors: 0,
              pendingQuestions: 0,
            }
          );
        } else {
          console.error('Failed to fetch dashboard data');
          // Fallback to empty data
          setCampaigns([]);
          setStats({
            totalCampaigns: 0,
            activeCampaigns: 0,
            totalRaised: 0,
            totalDonors: 0,
            pendingQuestions: 0,
          });
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setCampaigns([]);
        setStats({
          totalCampaigns: 0,
          activeCampaigns: 0,
          totalRaised: 0,
          totalDonors: 0,
          pendingQuestions: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading dashboard...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={null} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-xl text-gray-600 mb-4">
              Please log in to view your dashboard
            </div>
            <Link
              href="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Login
            </Link>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Creator Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Manage your campaigns and track your fundraising progress.
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3 flex-shrink-0">
                  <svg
                    className="w-5 h-5"
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
                <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3 flex-shrink-0">
                  <svg
                    className="w-5 h-5"
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
                <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3 flex-shrink-0">
                  <svg
                    className="w-5 h-5"
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
                <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 mr-3 flex-shrink-0">
                  <svg
                    className="w-5 h-5"
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
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-500 truncate">
                    Total Donors
                  </p>
                  <p className="text-lg font-bold text-gray-900 truncate">
                    {stats.totalDonors}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-red-100 text-red-600 mr-3 flex-shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-500 truncate">
                    Pending Q&A
                  </p>
                  <p className="text-lg font-bold text-gray-900 truncate">
                    {stats.pendingQuestions}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Campaigns */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Campaigns
            </h2>
            <Link
              href="/my-campaigns"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </Link>
          </div>

          {campaigns.length > 0 ? (
            <div className="space-y-4">
              {campaigns.slice(0, 3).map((campaign) => (
                <div
                  key={campaign.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {campaign.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(
                        campaign.status
                      )}`}
                    >
                      {campaign.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-700 font-medium">
                        Raised
                      </p>
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
                      <p className="text-sm text-gray-700 font-medium">
                        Donors
                      </p>
                      <p className="font-semibold text-gray-900">
                        {campaign.donorCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 font-medium">
                        Progress
                      </p>
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
                    <div className="space-x-2">
                      <Link
                        href={`/campaigns/${campaign.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No campaigns yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start your fundraising journey by creating your first campaign
              </p>
              <Link
                href="/create-campaign"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
              >
                Create Your First Campaign
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
