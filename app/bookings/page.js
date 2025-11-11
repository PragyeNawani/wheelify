'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [driverBookings, setDriverBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cars'); // 'cars' or 'drivers'

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    } else if (status === 'authenticated') {
      fetchBookings();
      fetchDriverBookings();
    }
  }, [status, router]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      const data = await response.json();

      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchDriverBookings = async () => {
    try {
      const response = await fetch('/api/driver-bookings');
      const data = await response.json();

      if (data.success) {
        setDriverBookings(data.driverBookings);
      }
    } catch (error) {
      console.error('Error fetching driver bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      active: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const cancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Booking cancelled successfully');
        fetchBookings();
      } else {
        alert(data.error || 'Failed to cancel booking');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalBookings = bookings.length + driverBookings.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold mb-8">My Bookings</h1>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('cars')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'cars'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Car Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'drivers'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Driver Bookings ({driverBookings.length})
          </button>
        </div>
      </div>

      {totalBookings === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No bookings yet</h2>
          <p className="text-gray-600 mb-6">Start exploring our services to make your first booking.</p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/cars"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Browse Cars
            </Link>
            <Link
              href="/drivers"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Hire Drivers
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Car Bookings Tab */}
          {activeTab === 'cars' && (
            <div className="space-y-6">
              {bookings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                  <p className="text-gray-600 mb-4">No car bookings found.</p>
                  <Link
                    href="/cars"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Browse Cars
                  </Link>
                </div>
              ) : (
                bookings.map((booking) => (
                  <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="md:flex">
                      {/* Car Image */}
                      <div className="md:w-1/3">
                        <img
                          src={booking.car.images[0] || '/placeholder-car.jpg'}
                          alt={booking.car.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Booking Details */}
                      <div className="p-6 md:w-2/3">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-800">{booking.car.name}</h3>
                            <p className="text-gray-600">{booking.car.brand} • {booking.car.model}</p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPaymentStatusColor(booking.paymentStatus)}`}>
                              {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Start Date</p>
                            <p className="font-semibold">{new Date(booking.startDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">End Date</p>
                            <p className="font-semibold">{new Date(booking.endDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Pickup Location</p>
                            <p className="font-semibold">{booking.pickupLocation}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Days</p>
                            <p className="font-semibold">{booking.totalDays} days</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t">
                          <div>
                            <p className="text-sm text-gray-600">Total Price</p>
                            <p className="text-2xl font-bold text-blue-600">₹{booking.totalPrice}</p>
                          </div>

                          <div className="flex space-x-3">
                            {booking.paymentStatus === 'pending' && booking.status !== 'cancelled' && (
                              <Link
                                href={`/payment/${booking._id}`}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                              >
                                Pay Now
                              </Link>
                            )}
                            {booking.status === 'pending' && (
                              <button
                                onClick={() => cancelBooking(booking._id)}
                                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Driver Bookings Tab */}
          {activeTab === 'drivers' && (
            <div className="space-y-6">
              {driverBookings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                  <p className="text-gray-600 mb-4">No driver bookings found.</p>
                  <Link
                    href="/drivers"
                    className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    Hire Drivers
                  </Link>
                </div>
              ) : (
                driverBookings.map((booking) => (
                  <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="md:flex">
                      {/* Driver Image */}
                      <div className="md:w-1/4 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center p-6">
                        <img
                          src={booking.driverId?.photo || '/images/default-driver.png'}
                          alt={booking.driverId?.name || 'Driver'}
                          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      </div>

                      {/* Booking Details */}
                      <div className="p-6 md:w-3/4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <h3 className="text-2xl font-bold text-gray-800">
                                {booking.driverId?.name || 'Driver'}
                              </h3>
                            </div>
                            <p className="text-gray-600">
                              {booking.driverId?.licenceDetails?.licenceType || 'Professional Driver'} • 
                              {booking.driverId?.experience ? ` ${booking.driverId.experience} years exp.` : ''}
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.bookingStatus)}`}>
                              {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPaymentStatusColor(booking.paymentStatus)}`}>
                              {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Start Date</p>
                            <p className="font-semibold">{new Date(booking.startDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">End Date</p>
                            <p className="font-semibold">{new Date(booking.endDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Duration</p>
                            <p className="font-semibold">{booking.duration}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Contact</p>
                            <p className="font-semibold">{booking.driverId?.contactNumber || 'N/A'}</p>
                          </div>
                        </div>

                        {booking.specialRequirements && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Special Requirements:</p>
                            <p className="text-sm text-gray-800">{booking.specialRequirements}</p>
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-4 border-t">
                          <div>
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="text-2xl font-bold text-green-600">₹{booking.totalAmount?.toFixed(2)}</p>
                          </div>

                          <div className="flex space-x-3">
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Customer Details</p>
                              <p className="text-sm font-medium">{booking.customerName}</p>
                              <p className="text-xs text-gray-600">{booking.customerPhone}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}