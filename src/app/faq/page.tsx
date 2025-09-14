'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItems, setOpenItems] = useState<string[]>([]);
  const router = useRouter();

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'How does SapportLah work?',
      answer:
        'SapportLah is a crowdfunding platform where creators can launch campaigns to raise funds for their projects, and supporters can contribute to causes they believe in. Simply browse campaigns, read about the projects, and make donations to support them.',
      category: 'general',
    },
    {
      id: '2',
      question: 'Is it free to create a campaign?',
      answer:
        'Creating a campaign on SapportLah is free. We only charge a small platform fee on successfully funded campaigns to help maintain and improve our services.',
      category: 'creators',
    },
    {
      id: '3',
      question: 'What payment methods do you accept?',
      answer:
        'We accept major credit cards (Visa, MasterCard, American Express), PayPal, and local payment methods including PayNow and GrabPay for Singapore users.',
      category: 'payments',
    },
    {
      id: '4',
      question: 'How do I know if a campaign is legitimate?',
      answer:
        'All campaigns undergo a review process before going live. We verify creator identities and project details. Look for verified badges, detailed project descriptions, and regular updates from creators.',
      category: 'safety',
    },
    {
      id: '5',
      question: "What happens if a campaign doesn't reach its goal?",
      answer:
        'This depends on the campaign type. For "All-or-Nothing" campaigns, funds are returned to backers if the goal isn\'t met. For "Keep-it-All" campaigns, creators receive whatever amount is raised.',
      category: 'creators',
    },
    {
      id: '6',
      question: 'Can I cancel my donation?',
      answer:
        "You can cancel your donation within 24 hours of making it, provided the campaign hasn't ended. After 24 hours, cancellations are subject to the creator's refund policy.",
      category: 'donors',
    },
    {
      id: '7',
      question: 'How long do campaigns run?',
      answer:
        'Campaign durations vary but typically run between 30-60 days. Creators set their own campaign length when launching their project.',
      category: 'general',
    },
    {
      id: '8',
      question: 'What fees does SapportLah charge?',
      answer:
        "We charge a 5% platform fee plus payment processing fees (2.9% + SGD 0.30 per transaction) on successful campaigns. No fees are charged if campaigns don't reach their funding goal.",
      category: 'creators',
    },
    {
      id: '9',
      question: 'Can I donate anonymously?',
      answer:
        "Yes, you can choose to make anonymous donations. Your name won't be displayed publicly, but creators may still see your information for fulfillment purposes.",
      category: 'donors',
    },
    {
      id: '10',
      question: 'How do I track my donations?',
      answer:
        "All your donations are tracked in your account dashboard. You'll receive email updates about campaign progress and can view your donation history anytime.",
      category: 'donors',
    },
    {
      id: '11',
      question: "What if I don't receive my rewards?",
      answer:
        "If you don't receive promised rewards, contact the campaign creator first. If unresolved, reach out to our support team for assistance with dispute resolution.",
      category: 'safety',
    },
    {
      id: '12',
      question: "Can I edit my campaign after it's live?",
      answer:
        "You can make certain edits to your campaign while it's live, such as adding updates and responding to comments. Major changes like funding goals require approval from our team.",
      category: 'creators',
    },
  ];

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'general', name: 'General' },
    { id: 'creators', name: 'For Creators' },
    { id: 'donors', name: 'For Donors' },
    { id: 'payments', name: 'Payments' },
    { id: 'safety', name: 'Safety & Trust' },
  ];

  const filteredFAQs =
    activeCategory === 'all'
      ? faqItems
      : faqItems.filter((item) => item.category === activeCategory);

  const toggleItem = (itemId: string) => {
    setOpenItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleContactClick = () => {
    // Navigate to home page with hash
    router.push('/');
    // Wait for navigation to complete, then scroll
    setTimeout(() => {
      const contactElement = document.getElementById('contact');
      if (contactElement) {
        contactElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 500); // Increased timeout to ensure page loads
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about using SapportLah. Can't find
            what you're looking for? Contact our support team.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition duration-300 ${
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition duration-300"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                  {item.question}
                </h3>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                    openItems.includes(item.id) ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {openItems.includes(item.id) && (
                <div className="px-6 pb-4">
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-gray-700 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-6">
            Our support team is here to help. Get in touch and we'll respond as
            soon as possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@sapportlah.com"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300"
            >
              Email Support
            </a>
            <Link
              href="/#contact"
              className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition duration-300"
            >
              Contact Form
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
