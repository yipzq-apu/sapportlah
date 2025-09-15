'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HeroSection() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Turn Your Dreams Into Reality
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Join thousands of creators and supporters in building a better
            tomorrow. Start your campaign or support causes you believe in.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Only show Start a Campaign button if user is not a donor */}
            {(!user || user.role !== 'donor') && (
              <Link
                href="/login"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition duration-300"
              >
                Start a Campaign
              </Link>
            )}
            <Link
              href="/campaigns"
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition duration-300"
            >
              Explore Campaigns
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
