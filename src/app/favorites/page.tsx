'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface FavoriteCampaign {
  id: string;
  title: string;
  shortDescription: string;
  goal: number;
  raised: number;
  progress: number;
  endDate: string;
  image: string;
  status: string;
  backersCount: number;
  creatorName: string;
  favoritedAt: string;
}

export default function FavoritesPage() {
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<FavoriteCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Set temporary user for testing - NO AUTHENTICATION REQUIRED
        setUser({
          id: 'temp-donor',
          name: 'Temporary Donor',
          email: 'donor@temp.com',
          role: 'donor',
        });

        // Mock favorites data
        const mockFavorites: FavoriteCampaign[] = [
          {
            id: '1',
            title: 'Clean Water for Rural Communities',
            shortDescription: 'Providing clean water access to remote villages',
            goal: 50000,
            raised: 32500,
            progress: 65,
            endDate: '2024-06-15',
            image: '/api/placeholder/300/200',
            status: 'active',
            backersCount: 245,
            creatorName: 'Water For All Foundation',
            favoritedAt: '2024-04-20T10:30:00Z',
          },
          {
            id: '2',
            title: 'Education Technology Initiative',
            shortDescription: 'Bringing modern technology to schools',
            goal: 25000,
            raised: 18750,
            progress: 75,
            endDate: '2024-07-20',
            image: '/api/placeholder/300/200',
            status: 'active',
            backersCount: 180,
            creatorName: 'TechEd Foundation',
            favoritedAt: '2024-04-18T14:20:00Z',
          },
          {
            id: '3',
            title: 'Community Garden Project',
            shortDescription: 'Creating sustainable community gardens',
            goal: 15000,
            raised: 15000,
            progress: 100,
            endDate: '2024-05-30',
            image: '/api/placeholder/300/200',
            status: 'successful',
            backersCount: 67,
            creatorName: 'Green Community',
            favoritedAt: '2024-04-15T09:15:00Z',
          },
        ];

        setFavorites(mockFavorites);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setError('Failed to load favorites. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const removeFavorite = (campaignId: string) => {
    setFavorites(prev => prev.filter(fav => fav.id !== campaignId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading favorites...</div>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            My Favorite Campaigns
          </h1>
          <p className="text-lg text-gray-600">
            Keep track of campaigns you're interested in supporting.
          </p>
        </div>

        {/* Favorites Grid */}
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative">
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => removeFavorite(campaign.id)}
                      className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                      title="Remove from favorites"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(
                        campaign.status
                      )}`}
                    >
                      {campaign.status}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <Link href={`/campaigns/${campaign.id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                      {campaign.title}
                    </h3>
                  </Link>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {campaign.shortDescription}
                  </p>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{campaign.progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(campaign.progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-sm mb-4">
                    <div>
                      <p className="text-gray-500">Raised</p>
                      <p className="font-semibold">{formatCurrency(campaign.raised)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Goal</p>
                      <p className="font-semibold">{formatCurrency(campaign.goal)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Days left</p>
                      <p className="font-semibold">{getDaysLeft(campaign.endDate)}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      <p>By {campaign.creatorName}</p>
                      <p>{campaign.backersCount} backers</p>
                    </div>
                    <Link
                      href={`/campaigns/${campaign.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      View Campaign
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">💝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No favorite campaigns yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start exploring campaigns and add them to your favorites!
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
