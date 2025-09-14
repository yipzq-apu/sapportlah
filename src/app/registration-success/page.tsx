'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function RegistrationSuccessPage() {
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-4">
              <span className="text-3xl">✅</span>
            </div>

            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Registration Successful!
            </h2>

            <div className="border border-green-200 bg-green-50 rounded-lg p-4 mb-6">
              <p className="text-gray-700 text-sm leading-relaxed">
                Your account has been created successfully and is now under
                review. You'll receive an email notification once your account
                is approved.
              </p>
            </div>

            <div className="text-sm text-gray-600 mb-6">
              <p className="font-medium mb-2">What happens next?</p>
              <ul className="text-left space-y-1">
                <li>• Our team will review your application</li>
                <li>
                  • You'll receive an email notification about the decision
                </li>
                <li>• This process typically takes 1-3 business days</li>
                <li>
                  • Once approved, you can log in and start using the platform
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition duration-300"
              >
                Back to Home
              </Link>

              <Link
                href="/login"
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition duration-300"
              >
                Try Login Later
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
