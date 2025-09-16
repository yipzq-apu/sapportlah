'use client';

import React, { useState, useEffect } from 'react';
import CheckoutPage from '../../../components/CheckoutPage';
import convertToSubcurrency from '../../../../lib/convertToSubcurrency';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined');
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function Payment() {
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const checkAuth = () => {
        try {
          const userData = localStorage.getItem('userData');
          if (userData) {
            setUser(JSON.parse(userData));
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      };

      checkAuth();

      const storedData = localStorage.getItem('amount');

      if (!storedData) {
        setError('No payment data found. Please start a new deposit.');
        return;
      }

      const parsedAmount = parseFloat(storedData);

      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setError('Invalid deposit amount. Please enter a valid amount.');
        return;
      }

      setTotalAmount(parsedAmount);
    } catch (err) {
      setError('An error occurred while retrieving payment data.');
    }
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-red-500 text-white p-4 rounded-lg shadow-md">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (totalAmount === null) {
    return (
      <p className="text-center text-gray-600">Loading payment details...</p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center min-h-screen text-white p-6 relative">
          <div className="bg-gradient-to-tr from-blue-500 to-purple-500 p-6 rounded-lg shadow-md w-96 ">
            <Elements
              stripe={stripePromise}
              options={{
                mode: 'payment',
                amount: convertToSubcurrency(totalAmount),
                currency: 'myr',
              }}
            >
              <CheckoutPage amount={totalAmount} />
            </Elements>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
