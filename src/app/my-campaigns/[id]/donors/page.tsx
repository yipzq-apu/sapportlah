'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

interface Donor {
  donation_id: number;
  amount: number;
  message: string;
  anonymous: boolean;
  donation_date: string;
  donor_name: string;
  donor_email: string;
  donor_id: number;
}

interface DonorSummary {
  totalDonations: number;
  totalAmount: number;
  anonymousDonors: number;
  uniqueDonors: number;
}

export default function CampaignDonorsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [summary, setSummary] = useState<DonorSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      // Check if user is logged in
      const userData = localStorage.getItem('userData');
      if (!userData) {
        router.push('/login?returnUrl=' + window.location.pathname);
        return;
      }

      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'creator') {
        router.push('/unauthorized');
        return;
      }

      setUser(parsedUser);

      try {
        // Fetch campaign details first
        const campaignResponse = await fetch(`/api/campaigns/${campaignId}`);
        if (campaignResponse.ok) {
          const campaignData = await campaignResponse.json();
          setCampaign(campaignData.campaign);

          // Check if user owns this campaign
          if (campaignData.campaign.user_id !== parsedUser.id) {
            router.push('/unauthorized');
            return;
          }
        } else {
          alert('Campaign not found');
          router.push('/my-campaigns');
          return;
        }

        // Fetch donors
        const donorsResponse = await fetch(
          `/api/campaigns/${campaignId}/donors?userId=${parsedUser.id}`
        );

        if (donorsResponse.ok) {
          const data = await donorsResponse.json();
          setDonors(data.donors || []);
          setSummary(data.summary);
        } else {
          const errorData = await donorsResponse.json();
          alert(errorData.error || 'Failed to load donors');
        }
      } catch (error) {
        console.error('Error loading campaign donors:', error);
        alert('Failed to load donor information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [campaignId, router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading donors...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Campaign Donors
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                {campaign?.title || 'Loading campaign...'}
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                href={`/campaigns/${campaignId}`}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                View Campaign
              </Link>
              <Link
                href="/my-campaigns"
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Back to My Campaigns
              </Link>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-blue-600">
                {summary.totalDonations}
              </div>
              <div className="text-sm font-medium text-gray-500">
                Total Donations
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalAmount)}
              </div>
              <div className="text-sm font-medium text-gray-500">
                Total Raised
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-purple-600">
                {summary.uniqueDonors}
              </div>
              <div className="text-sm font-medium text-gray-500">
                Unique Donors
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-orange-600">
                {summary.anonymousDonors}
              </div>
              <div className="text-sm font-medium text-gray-500">
                Anonymous Donors
              </div>
            </div>
          </div>
        )}

        {/* Donors List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Donations ({donors.length})
            </h2>
          </div>

          {donors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Donor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {donors.map((donor) => (
                    <tr key={donor.donation_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {donor.anonymous
                                  ? '?'
                                  : donor.donor_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {donor.donor_name}
                            </div>
                            {!donor.anonymous && (
                              <div className="text-sm text-gray-500">
                                {donor.donor_email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-green-600">
                          {formatCurrency(donor.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {donor.message || (
                            <span className="text-gray-400 italic">
                              No message
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(donor.donation_date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">💝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No donations yet
              </h3>
              <p className="text-gray-600">
                Your campaign hasn't received any donations yet. Share your
                campaign to start receiving support!
              </p>
              <div className="mt-6">
                <Link
                  href={`/campaigns/${campaignId}`}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  View Campaign
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Export Options */}
        {donors.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Export Data
            </h3>
            <p className="text-gray-600 mb-4">
              Download your donor information for record keeping or thank you
              messages.
            </p>
            <button
              onClick={() => {
                const csvContent = [
                  ['Donor Name', 'Email', 'Amount (MYR)', 'Message', 'Date'],
                  ...donors.map((donor) => [
                    donor.donor_name,
                    donor.anonymous ? 'Anonymous' : donor.donor_email,
                    donor.amount.toString(),
                    donor.message || '',
                    formatDate(donor.donation_date),
                  ]),
                ]
                  .map((row) => row.map((field) => `"${field}"`).join(','))
                  .join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `campaign-${campaignId}-donors.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
            >
              Download as CSV
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
