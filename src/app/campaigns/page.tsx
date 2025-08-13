'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Campaign {
  id: string;
  title: string;
  description: string;
  image: string;
  goal: number;
  raised: number;
  donorCount: number;
  category: string;
  creator: string;
  endDate: string;
  featured: boolean;
}

export default function CampaignsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState<any>(null);
  const campaignsPerPage = 6;

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        setUser(userData);
      }
    };

    checkAuth();
  }, []);

  // Mock data - replace with actual API call
  const campaigns: Campaign[] = [
    {
      id: '1',
      title: 'Clean Water for Rural Communities',
      description:
        'Help us bring clean drinking water to underserved rural areas. This project will install water purification systems in 5 villages.',
      image: '/api/placeholder/400/250',
      goal: 50000,
      raised: 32500,
      donorCount: 245,
      category: 'Environment',
      creator: 'Water For All Foundation',
      endDate: '2024-06-15',
      featured: true,
    },
    {
      id: '2',
      title: 'Education Technology for Schools',
      description:
        'Providing tablets and internet access to students in need. Every child deserves access to digital learning tools.',
      image: '/api/placeholder/400/250',
      goal: 25000,
      raised: 18750,
      donorCount: 156,
      category: 'Education',
      creator: 'Digital Learning Initiative',
      endDate: '2024-05-30',
      featured: false,
    },
    {
      id: '3',
      title: 'Emergency Medical Equipment',
      description:
        'Supporting local hospitals with essential medical equipment including ventilators and monitoring devices.',
      image: '/api/placeholder/400/250',
      goal: 75000,
      raised: 45000,
      donorCount: 320,
      category: 'Healthcare',
      creator: 'Medical Aid Society',
      endDate: '2024-07-20',
      featured: true,
    },
    {
      id: '4',
      title: 'Community Food Garden',
      description:
        'Creating sustainable food sources for low-income families through community gardens and farming education.',
      image: '/api/placeholder/400/250',
      goal: 15000,
      raised: 8900,
      donorCount: 78,
      category: 'Community',
      creator: 'Green Communities Project',
      endDate: '2024-08-10',
      featured: false,
    },
    {
      id: '5',
      title: 'Wildlife Conservation Initiative',
      description:
        'Protecting endangered species and their habitats through conservation efforts and research programs.',
      image: '/api/placeholder/400/250',
      goal: 100000,
      raised: 67500,
      donorCount: 445,
      category: 'Environment',
      creator: 'Wildlife Protection Fund',
      endDate: '2024-09-15',
      featured: true,
    },
    {
      id: '6',
      title: 'Tech Skills Training Program',
      description:
        'Providing coding and digital skills training to unemployed youth to improve their job prospects.',
      image: '/api/placeholder/400/250',
      goal: 35000,
      raised: 22100,
      donorCount: 189,
      category: 'Education',
      creator: 'Future Skills Academy',
      endDate: '2024-06-30',
      featured: false,
    },
  ];

  const categories = [
    'all',
    'Education',
    'Healthcare',
    'Environment',
    'Community',
    'Technology',
  ];

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || campaign.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredCampaigns.length / campaignsPerPage);
  const startIndex = (currentPage - 1) * campaignsPerPage;
  const endIndex = startIndex + campaignsPerPage;
  const currentCampaigns = filteredCampaigns.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const calculatePercentage = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
    }).format(amount);
  };

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Campaigns
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find amazing projects from creators around the world and help make
            them happen.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              />
            </div>
            <div className="md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            Showing {startIndex + 1}-
            {Math.min(endIndex, filteredCampaigns.length)} of{' '}
            {filteredCampaigns.length} campaigns
          </p>
          {totalPages > 1 && (
            <p className="text-gray-600">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentCampaigns.map((campaign) => {
            const percentage = calculatePercentage(
              campaign.raised,
              campaign.goal
            );
            const daysLeft = getDaysLeft(campaign.endDate);

            return (
              <div
                key={campaign.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300"
              >
                {/* Campaign Image */}
                <div className="relative">
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-48 object-cover"
                  />
                  {campaign.featured && (
                    <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 text-xs font-semibold rounded">
                      Featured
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 text-xs rounded">
                    {campaign.category}
                  </div>
                </div>

                <div className="p-6">
                  {/* Title and Creator */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {campaign.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    by {campaign.creator}
                  </p>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {campaign.description}
                  </p>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Raised: {formatCurrency(campaign.raised)}</span>
                      <span>Goal: {formatCurrency(campaign.goal)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-blue-600">
                        {percentage.toFixed(1)}% funded
                      </span>
                      <span className="text-gray-600">
                        {daysLeft} days left
                      </span>
                    </div>
                  </div>

                  {/* Donor Count */}
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{campaign.donorCount} donors</span>
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/campaigns/${campaign.id}`}
                    className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 font-medium"
                  >
                    View Campaign
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                Previous
              </button>

              {/* Page Numbers */}
              {generatePageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() =>
                    typeof page === 'number' ? setCurrentPage(page) : null
                  }
                  disabled={typeof page !== 'number'}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : typeof page === 'number'
                      ? 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                      : 'text-gray-400 cursor-default'
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next Button */}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                Next
              </button>
            </nav>
          </div>
        )}

        {/* No Results */}
        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No campaigns found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setCurrentPage(1);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
