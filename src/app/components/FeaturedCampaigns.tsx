'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Campaign {
  id: number;
  title: string;
  description: string;
  short_description: string;
  goal_amount: number;
  current_amount: number;
  featured_image?: string;
  creator_name: string;
}

export default function FeaturedCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedCampaigns = async () => {
      try {
        const response = await fetch('/api/campaigns/featured?limit=3');
        if (response.ok) {
          const data = await response.json();
          setCampaigns(data.campaigns || []);
        } else {
          console.error('Failed to fetch featured campaigns');
        }
      } catch (error) {
        console.error('Error fetching featured campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCampaigns();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-gray-600 text-xl">
              Loading featured campaigns...
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Campaigns
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing projects from creators around the world and help
            make them happen.
          </p>
        </div>

        {campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 flex flex-col h-full"
              >
                <img
                  src={campaign.featured_image || '/api/placeholder/300/200'}
                  alt={campaign.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 h-14 flex items-start">
                    {campaign.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    by {campaign.creator_name}
                  </p>
                  <p className="text-gray-600 mb-4 flex-grow">
                    {campaign.short_description || campaign.description}
                  </p>
                  <div className="mb-4 mt-auto">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>
                        Raised: {formatCurrency(campaign.current_amount)}
                      </span>
                      <span>Goal: {formatCurrency(campaign.goal_amount)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (campaign.current_amount / campaign.goal_amount) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <Link
                    href={`/campaigns/${campaign.id}`}
                    className="block w-full text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
                  >
                    View Campaign
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No featured campaigns available at the moment.
            </p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/campaigns"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300"
          >
            View All Campaigns
          </Link>
        </div>
      </div>
    </section>
  );
}
