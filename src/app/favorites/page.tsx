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
  organizationName?: string;
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
        // Check if user is logged in
        const userData = localStorage.getItem('userData');
        if (!userData) {
          setError('Please log in to view your favorites');
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Fetch favorites from backend
        const response = await fetch(
          `/api/favorites/campaigns?userId=${parsedUser.id}`
        );

        if (response.ok) {
          const data = await response.json();
          setFavorites(data.favorites || []);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load favorites');
        }
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
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
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

  const removeFavorite = async (campaignId: string) => {
    if (!user) return;

    try {
      const response = await fetch(
        `/api/favorites?userId=${user.id}&campaignId=${campaignId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        setFavorites((prev) => prev.filter((fav) => fav.id !== campaignId));
      } else {
        alert('Failed to remove from favorites');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Something went wrong. Please try again.');
    }
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={null} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-xl text-gray-600 mb-4">
              Please log in to view your favorites
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
            My Favorite Campaigns
          </h1>
          <p className="text-lg text-gray-600">
            Keep track of campaigns you're interested in supporting.
          </p>
          <div className="mt-2 text-sm text-gray-500">
            {favorites.length}/6 favorites used
          </div>
          {favorites.length >= 6 && (
            <div className="mt-2 text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                <span>
                  You've reached the maximum of 6 favorite campaigns. Remove
                  some to add new ones.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Favorites Grid */}
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((campaign) => {
              const percentage = (campaign.raised / campaign.goal) * 100 || 0;
              const daysLeft = getDaysLeft(campaign.endDate);

              return (
                <div
                  key={campaign.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 flex flex-col h-full"
                >
                  {/* Campaign Image */}
                  <div className="relative">
                    <img
                      src={campaign.image || '/api/placeholder/400/250'}
                      alt={campaign.title}
                      className="w-full h-48 object-cover"
                    />
                    {/* Remove from favorites button */}
                    <button
                      onClick={() => removeFavorite(campaign.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition duration-200"
                      title="Remove from favorites"
                    >
                      <svg
                        className="w-5 h-5 text-red-500 fill-current"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    {/* Title and Creator */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                      {campaign.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      by {campaign.organizationName || campaign.creatorName}
                    </p>

                    {/* Description - Fixed height */}
                    <div className="mb-4 flex-1">
                      <p className="text-gray-600 line-clamp-2 h-[3rem] overflow-hidden">
                        {campaign.shortDescription}
                      </p>
                    </div>

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
                      <span>{campaign.backersCount} backers</span>
                    </div>

                    {/* Action Button - Always at bottom */}
                    <Link
                      href={`/campaigns/${campaign.id}`}
                      className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 font-medium mt-auto"
                    >
                      View Campaign
                    </Link>
                  </div>
                </div>
              );
            })}
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
