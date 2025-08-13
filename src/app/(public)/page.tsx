'use client';

import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FeaturedCampaigns from '../components/FeaturedCampaigns';
import ContactUs from '../components/ContactUs';
import Footer from '../components/Footer';

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} />
      <main>
        <HeroSection />
        <FeaturedCampaigns />
        <ContactUs />
      </main>
      <Footer />
    </div>
  );
}
