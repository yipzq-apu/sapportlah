'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AboutPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in (optional)
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
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About SapportLah
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering dreams and creating positive change through the power of
            community-driven crowdfunding.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                At SapportLah, we believe that every great idea deserves a
                chance to come to life. Our mission is to democratize funding by
                connecting passionate creators with supportive communities who
                believe in their vision.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                We're not just a crowdfunding platform – we're a catalyst for
                innovation, creativity, and positive change in our communities.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-64 h-64 mx-auto flex items-center justify-center">
                <span className="text-6xl">🚀</span>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Community First
              </h3>
              <p className="text-gray-600">
                We foster genuine connections between creators and supporters,
                building a community that thrives on mutual support and shared
                success.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Trust & Transparency
              </h3>
              <p className="text-gray-600">
                We maintain the highest standards of transparency and security,
                ensuring every transaction is safe and every campaign is
                genuine.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Innovation
              </h3>
              <p className="text-gray-600">
                We continuously evolve our platform to provide the best tools
                and experiences for both creators and supporters.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-gray-100 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How SapportLah Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                1
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Create
              </h4>
              <p className="text-gray-600 text-sm">
                Creators launch campaigns with compelling stories and clear
                funding goals
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                2
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Discover
              </h4>
              <p className="text-gray-600 text-sm">
                Supporters browse and discover projects that resonate with their
                interests
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                3
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Support
              </h4>
              <p className="text-gray-600 text-sm">
                Community members contribute to campaigns they believe in
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                4
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Succeed
              </h4>
              <p className="text-gray-600 text-sm">
                Projects come to life with the power of community backing
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Story
          </h2>
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                SapportLah was born from a simple belief: that great ideas
                shouldn't fail due to lack of funding. Founded in 2024, we
                started as a small team passionate about democratizing access to
                capital and empowering creators across all industries.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Today, we've grown into a thriving platform that has helped
                hundreds of creators bring their visions to life, from
                innovative tech products to artistic endeavors, from social
                causes to entrepreneurial ventures.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                Our platform has facilitated millions in funding, but more
                importantly, we've built a community where dreams become reality
                through the power of collective support.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-blue-600 rounded-lg p-8 mb-16 text-white">
          <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-200">Campaigns Launched</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-200">Supporters</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">RM 2M+</div>
              <div className="text-blue-200">Funds Raised</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">85%</div>
              <div className="text-blue-200">Success Rate</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Whether you're a creator with a brilliant idea or a supporter
            looking to make a difference, SapportLah is here to help you
            succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/login"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300"
            >
              Start a Campaign
            </a>
            <a
              href="/campaigns"
              className="bg-gray-200 text-gray-900 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-300 transition duration-300"
            >
              Explore Campaigns
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
