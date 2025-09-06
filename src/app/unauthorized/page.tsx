import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="text-6xl mb-8">🚫</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            You don't have permission to access this page.
          </p>
          <div className="space-x-4">
            <Link
              href="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300"
            >
              Go Home
            </Link>
            <Link
              href="/login"
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition duration-300"
            >
              Login
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
