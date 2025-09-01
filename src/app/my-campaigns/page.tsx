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
  status: 'draft' | 'pending' | 'active' | 'successful' | 'failed';
  endDate: string;
  createdDate: string;
}

export default function MyCampaignsPage() {
  const [user, setUser] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadData = () => {
      // Set temporary user for testing - NO AUTHENTICATION REQUIRED
      setUser({
        id: 'temp-creator',
        name: 'Temporary Creator',
        email: 'creator@temp.com',
        role: 'creator',
      });

      // Mock campaigns data
      const mockCampaigns: Campaign[] = [
        {
          id: '1',
          title: 'Clean Water for Rural Communities',
          goal: 50000,
          raised: 32500,
          donorCount: 245,
          status: 'active',
          endDate: '2024-06-15',
          createdDate: '2024-03-15',
        },
        // ...add more mock campaigns as needed...
      ];

      setCampaigns(mockCampaigns);
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
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredCampaigns =
    filter === 'all'
      ? campaigns
      : campaigns.filter((campaign) => campaign.status === filter);

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
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
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

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                {
                  key: 'all',
                  label: 'All Campaigns',
                },
                {
                  key: 'pending',
                  label: 'Pending Approval',
                },
                {
                  key: 'active',
                  label: 'Active',
                },
                {
                  key: 'successful',
                  label: 'Successful',
                },
                {
                  key: 'failed',
                  label: 'Failed',
                },
                {
                  key: 'draft',
                  label: 'Draft',
                },
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
                  {tab.key === 'pending' && (
                    <span className="ml-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                      {campaigns.filter((c) => c.status === 'pending').length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="space-y-6">
          {filteredCampaigns.map((campaign) => (
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
                  {campaign.status !== 'pending' && (
                    <>
                      <Link
                        href={`/campaigns/${campaign.id}/edit`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/campaigns/${campaign.id}`}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        View Campaign
                      </Link>
                    </>
                  )}
                  {campaign.status === 'pending' && (
                    <Link
                      href={`/campaigns/${campaign.id}/edit`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Edit Draft
                    </Link>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-500">Raised</p>
                  <p className="font-semibold">
                    {formatCurrency(campaign.raised)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Goal</p>
                  <p className="font-semibold">
                    {formatCurrency(campaign.goal)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Donors</p>
                  <p className="font-semibold">{campaign.donorCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Progress</p>
                  <p className="font-semibold">
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
                  Created: {new Date(campaign.createdDate).toLocaleDateString()}
                </span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    End Date: {new Date(campaign.endDate).toLocaleDateString()}
                  </span>
                  {campaign.status === 'pending' && (
                    <span className="text-xs text-yellow-600 font-medium">
                      ⏳ Awaiting Review
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">
              {filter === 'pending' ? '⏳' : '📋'}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No campaigns found
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all'
                ? "You haven't created any campaigns yet. Start your first campaign!"
                : filter === 'pending'
                ? 'No campaigns are pending approval.'
                : `No ${filter} campaigns found. Try a different filter.`}
            </p>
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
