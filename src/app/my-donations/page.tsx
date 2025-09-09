'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Donation {
  id: string;
  campaignId: string;
  campaignTitle: string;
  campaignImage: string;
  amount: number;
  date: string;
  message: string;
  anonymous: boolean;
  campaignStatus: 'active' | 'successful' | 'failed';
  campaignProgress: number;
  campaignGoal: number;
  campaignRaised: number;
}

export default function MyDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    totalDonated: 0,
    campaignsSupported: 0,
    averageDonation: 0,
    totalDonations: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if user is logged in
        const userData = localStorage.getItem('userData');
        if (!userData) {
          setError('Please log in to view your donations');
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Fetch donations from backend
        const response = await fetch(
          `/api/donations/my-donations?userId=${parsedUser.id}&status=${filter}`
        );

        if (response.ok) {
          const data = await response.json();
          setDonations(data.donations || []);
          setStats(
            data.stats || {
              totalDonated: 0,
              campaignsSupported: 0,
              averageDonation: 0,
              totalDonations: 0,
            }
          );
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load donations');
        }
      } catch (error) {
        console.error('Error loading donations:', error);
        setError('Failed to load donations');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filter]);

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
    });
  };

  const getTotalDonated = () => {
    return donations.reduce((total, donation) => total + donation.amount, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-blue-600 bg-blue-100';
      case 'successful':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredDonations =
    filter === 'all'
      ? donations
      : donations.filter((donation) => donation.campaignStatus === filter);

  const generateReceipt = (donation: Donation) => {
    // Create receipt content
    const receiptContent = `
DONATION RECEIPT
================

Receipt ID: ${donation.id}
Date: ${formatDate(donation.date)}
Donor: ${user?.name || 'Anonymous'}
Email: ${user?.email}

Campaign: ${donation.campaignTitle}
Donation Amount: ${formatCurrency(donation.amount)}
${donation.message ? `Message: ${donation.message}` : ''}

Thank you for your generous donation!

SapportLah Platform
Generated on: ${new Date().toLocaleDateString()}
    `.trim();

    // Create and download file
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt_${donation.id}_${
      new Date().toISOString().split('T')[0]
    }.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const generatePDFReceipt = (donation: Donation) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Donation Receipt</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 30px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .header img {
            max-width: 120px;
            margin-bottom: 10px;
          }
          h1 {
            margin: 0;
            font-size: 22px;
            color: #111;
          }
          .platform-info {
            font-size: 12px;
            color: #555;
          }
          .content {
            margin: 20px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          table td {
            padding: 8px;
            vertical-align: top;
          }
          table tr:nth-child(odd) {
            background: #f9f9f9;
          }
          .amount {
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="/logo.png" alt="SapportLah Logo" />
          <h1>Donation Receipt</h1>
          <p class="platform-info">SapportLah Platform | support@sapportlah.com</p>
          <p><small>This receipt acknowledges your contribution</small></p>
        </div>

        <div class="content">
          <table>
            <tr>
              <td><strong>Receipt ID:</strong></td>
              <td>${donation.id}</td>
            </tr>
            <tr>
              <td><strong>Date:</strong></td>
              <td>${formatDate(donation.date)}</td>
            </tr>
            <tr>
              <td><strong>Donor:</strong></td>
              <td>${user?.name || 'Anonymous'}</td>
            </tr>
            <tr>
              <td><strong>Email:</strong></td>
              <td>${user?.email || '-'}</td>
            </tr>
            <tr>
              <td><strong>Campaign:</strong></td>
              <td>${donation.campaignTitle}</td>
            </tr>
            <tr>
              <td><strong>Donation Amount:</strong></td>
              <td class="amount">${formatCurrency(donation.amount)}</td>
            </tr>
            ${
              donation.message
                ? `<tr>
                     <td><strong>Message:</strong></td>
                     <td>${donation.message}</td>
                   </tr>`
                : ''
            }
          </table>

          <div style="margin-top: 25px;">
            <p><em>Thank you for your generous donation.  
            Your support helps us continue making a difference.</em></p>
            <p><small>Please keep this receipt for your records.  
            Generated on: ${new Date().toLocaleDateString()}</small></p>
          </div>
        </div>

        <div class="footer">
          <p>SapportLah © ${new Date().getFullYear()} | www.sapportlah.com</p>
        </div>
      </body>
    </html>
  `;

    // Open in new window for printing/saving as PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading donations...</div>
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

  // Stats calculations - use stats from API instead of local calculation
  const totalDonated = stats.totalDonated;
  const campaignsSupported = stats.campaignsSupported;
  const averageDonation = stats.averageDonation;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            My Donations
          </h1>
          <p className="text-lg text-gray-600">
            Track your contributions and see how the campaigns you support are
            progressing.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3 flex-shrink-0">
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
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 truncate">
                  Total Donated
                </p>
                <p
                  className="text-lg font-bold text-gray-900 truncate"
                  title={formatCurrency(stats.totalDonated)}
                >
                  {formatCurrency(stats.totalDonated)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3 flex-shrink-0">
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 truncate">
                  Campaigns Supported
                </p>
                <p className="text-lg font-bold text-gray-900 truncate">
                  {stats.campaignsSupported}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3 flex-shrink-0">
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 truncate">
                  Average Donation
                </p>
                <p
                  className="text-lg font-bold text-gray-900 truncate"
                  title={formatCurrency(stats.averageDonation)}
                >
                  {formatCurrency(stats.averageDonation)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Donations' },
                { key: 'active', label: 'Active' },
                { key: 'successful', label: 'Successful' },
                { key: 'failed', label: 'Failed' },
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

        {/* Donations List */}
        <div className="space-y-6">
          {filteredDonations.map((donation) => (
            <div
              key={donation.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Campaign Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={donation.campaignImage}
                      alt={donation.campaignTitle}
                      className="w-full lg:w-32 h-32 object-cover rounded-lg"
                    />
                  </div>

                  {/* Campaign Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        <Link
                          href={`/campaigns/${donation.campaignId}`}
                          className="hover:text-blue-600"
                        >
                          {donation.campaignTitle}
                        </Link>
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(
                          donation.campaignStatus
                        )}`}
                      >
                        {donation.campaignStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Your Donation</p>
                        <p className="text-lg font-bold text-blue-600">
                          {formatCurrency(donation.amount)}
                        </p>
                        <p className="text-xs text-gray-400">
                          on {formatDate(donation.date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Campaign Progress
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(donation.campaignRaised)} /{' '}
                          {formatCurrency(donation.campaignGoal)}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${donation.campaignProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {donation.message && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-600 italic">
                          "{donation.message}"
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/campaigns/${donation.campaignId}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition duration-300"
                      >
                        View Campaign
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Receipt and PDF buttons */}
                <div className="flex justify-end items-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => generateReceipt(donation)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      title="Download Text Receipt"
                    >
                      📄 Receipt
                    </button>
                    <button
                      onClick={() => generatePDFReceipt(donation)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                      title="Print/Save PDF Receipt"
                    >
                      📋 PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDonations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">💝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No donations found
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all'
                ? "You haven't made any donations yet. Start supporting amazing campaigns!"
                : `No ${filter} donations found. Try a different filter.`}
            </p>
            <Link
              href="/campaigns"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300"
            >
              Discover Campaigns
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
