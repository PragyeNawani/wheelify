'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Wheelify
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            <Link
              href="/cars"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Browse Cars
            </Link>

            {status === 'authenticated' ? (
              <>
                <Link
                  href="/bookings"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  My Bookings
                </Link>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {session.user.image && (
                      <img
                        src={session.user.image}
                        alt={session.user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span className="text-gray-700 font-medium">
                      {session.user.name}
                    </span>
                  </div>

                  <button
                    onClick={() => signOut()}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={handleSignIn}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}