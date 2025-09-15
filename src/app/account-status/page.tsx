'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function AccountStatusPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [reason, setReason] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const statusParam = searchParams.get('status');
    const messageParam = searchParams.get('message');
    const reasonParam = searchParams.get('reason');
    const emailParam = searchParams.get('email');

    setStatus(statusParam || '');
    setMessage(messageParam || '');
    setReason(reasonParam || '');
    setEmail(emailParam || '');
  }, [searchParams]);

  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return {
          title: 'Account Under Review',
          icon: '⏳',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
        };
      case 'rejected':
        return {
          title: 'Account Rejected',
          icon: '❌',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      case 'suspended':
        return {
          title: 'Account Suspended',
          icon: '🚫',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      default:
        return {
          title: 'Account Status',
          icon: 'ℹ️',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <Image
            src="/logo.png"
            alt="SapportLah Logo"
            width={200}
            height={60}
            className="h-12 w-auto"
          />
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${statusInfo.bgColor} mb-4`}
            >
              <span className="text-3xl">{statusInfo.icon}</span>
            </div>

            <h2 className={`text-2xl font-bold ${statusInfo.color} mb-4`}>
              {statusInfo.title}
            </h2>

            <div
              className={`border ${statusInfo.borderColor} ${statusInfo.bgColor} rounded-lg p-4 mb-6`}
            >
              <p className="text-gray-700 text-sm leading-relaxed">
                {message || 'Please check your account status.'}
              </p>

              {reason && status === 'rejected' && (
                <div className="mt-4 pt-4 border-t border-red-200">
                  <p className="text-sm font-medium text-red-800 mb-2">
                    Reason for rejection:
                  </p>
                  <p className="text-sm text-red-700 bg-red-100 p-3 rounded">
                    {reason}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {status === 'pending' && (
                <div className="text-sm text-gray-600">
                  <p>What happens next?</p>
                  <ul className="mt-2 text-left space-y-1">
                    <li>• Our team will review your application</li>
                    <li>
                      • You'll receive an email notification about the decision
                    </li>
                    <li>• This process typically takes 1-3 business days</li>
                  </ul>
                </div>
              )}

              {status === 'rejected' && (
                <div className="text-sm text-gray-600">
                  <p>
                    You can register again with correct information or contact
                    support for assistance.
                  </p>
                </div>
              )}

              {status === 'suspended' && (
                <div className="text-sm text-gray-600">
                  <p>Please contact our support team to resolve this issue.</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition duration-300"
                >
                  Back to Home
                </Link>

                {status === 'rejected' && (
                  <Link
                    href={`/update-application?email=${encodeURIComponent(
                      email
                    )}&reason=${encodeURIComponent(reason)}`}
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition duration-300"
                  >
                    Update Application
                  </Link>
                )}

                {(status === 'rejected' || status === 'suspended') && (
                  <a
                    href="mailto:support@sapportlah.com"
                    className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition duration-300"
                  >
                    Contact Support
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
