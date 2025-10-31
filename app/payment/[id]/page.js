'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PaymentButton from '@/components/PaymentButton';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    } else if (status === 'authenticated') {
      fetchBooking();
    }
  }, [status, params.id]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setBooking(data.booking);
      } else {
        alert('Booking not found');
        router.push('/bookings');
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      alert('Error loading booking');
      router.push('/bookings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold mb-8">Complete Your Payment</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Booking Summary</h2>

            <div className="flex items-center mb-6">
              <img
                src={booking.car.images[0] || '/placeholder-car.jpg'}
                alt={booking.car.name}
                className="w-32 h-24 object-cover rounded-lg mr-4"
              />
              <div>
                <h3 className="text-xl font-bold">{booking.car.name}</h3>
                <p className="text-gray-600">{booking.car.brand} • {booking.car.model}</p>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Start Date:</span>
                <span className="font-semibold">{new Date(booking.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">End Date:</span>
                <span className="font-semibold">{new Date(booking.endDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Days:</span>
                <span className="font-semibold">{booking.totalDays} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price per Day:</span>
                <span className="font-semibold">₹{booking.car.pricePerDay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pickup Location:</span>
                <span className="font-semibold">{booking.pickupLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dropoff Location:</span>
                <span className="font-semibold">{booking.dropoffLocation}</span>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Important Information
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Please carry your driver's license on the pickup date</li>
              <li>• The car will be available at the specified pickup location</li>
              <li>• Late returns may incur additional charges</li>
              <li>• Fuel charges are not included in the rental price</li>
              <li>• Please inspect the car thoroughly before pickup</li>
            </ul>
          </div>
        </div>

        {/* Payment Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Payment Details</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>₹{booking.totalPrice}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (0%):</span>
                <span>₹0</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="text-lg font-bold">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600">₹{booking.totalPrice}</span>
              </div>
            </div>

            {booking.paymentStatus === 'paid' ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center text-green-800">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-semibold">Payment Completed</span>
                </div>
              </div>
            ) : (
              <PaymentButton booking={booking} />
            )}

            <div className="mt-4 flex items-center justify-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secured by Razorpay
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}