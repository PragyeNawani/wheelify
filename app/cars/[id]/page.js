'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import BookingForm from '@/components/BookingForm';
import Link from 'next/link';

export default function CarDetailsPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDrivers, setShowDrivers] = useState(false);

  useEffect(() => {
    fetchCarDetails();
    fetchAvailableDrivers();
  }, [params.id]);

  const fetchCarDetails = async () => {
    try {
      const response = await fetch(`/api/cars/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setCar(data.car);
      }
    } catch (error) {
      console.error('Error fetching car details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableDrivers = async () => {
    try {
      const response = await fetch('/api/drivers?available=true');
      const data = await response.json();

      if (data.success) {
        setAvailableDrivers(data.data);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const handleDriverSelect = (driver) => {
    setSelectedDriver(driver);
    setShowDrivers(false);
  };

  const handleRemoveDriver = () => {
    setSelectedDriver(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Car not found</h1>
          <Link href="/cars" className="text-blue-600 hover:underline">
            Back to cars
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Car Details */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
            <img
              src={car.images[0] || '/placeholder-car.jpg'}
              alt={car.name}
              className="w-full h-96 object-cover"
            />
          </div>

          {/* Car Info */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold mb-2">{car.name}</h1>
            <p className="text-xl text-gray-600 mb-4">
              {car.brand} • {car.model} • {car.year}
            </p>

            <div className="flex items-center space-x-6 mb-6">
              <div className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{car.seats} Seats</span>
              </div>
              <div className="flex items-center text-gray-600 capitalize">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{car.transmission}</span>
              </div>
              <div className="flex items-center text-gray-600 capitalize">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>{car.fuelType}</span>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-blue-600">₹{car.pricePerDay}</span>
              <span className="text-gray-600 text-lg">/day</span>
            </div>

            {/* Description */}
            {car.description && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed">{car.description}</p>
              </div>
            )}

            {/* Features */}
            {car.features && car.features.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3">Features</h2>
                <div className="grid grid-cols-2 gap-3">
                  {car.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div>
              <h2 className="text-xl font-bold mb-3">Location</h2>
              <p className="text-gray-700">{car.location}</p>
            </div>
          </div>

          {/* Add Driver Section */}
          {session && car.available && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Need a Driver?</h2>
              
              {!selectedDriver ? (
                <div>
                  <p className="text-gray-600 mb-4">
                    Hire a professional driver for your journey. The driver's cost will be added to your total booking amount.
                  </p>
                  
                  {availableDrivers.length > 0 ? (
                    <button
                      onClick={() => setShowDrivers(!showDrivers)}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
                    >
                      {showDrivers ? 'Hide Drivers' : 'Browse Available Drivers'}
                    </button>
                  ) : (
                    <p className="text-gray-500 italic">No drivers available at the moment</p>
                  )}

                  {/* Driver List */}
                  {showDrivers && (
                    <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
                      {availableDrivers.map((driver) => (
                        <div 
                          key={driver._id} 
                          className="border border-gray-200 rounded-lg p-4 hover:border-green-500 transition cursor-pointer"
                          onClick={() => handleDriverSelect(driver)}
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={driver.photo || '/images/default-driver.png'}
                              alt={driver.name}
                              className="w-16 h-16 rounded-full object-cover"
                              onError={(e) => { e.target.src = '/images/default-driver.png'; }}
                            />
                            <div className="flex-1">
                              <h3 className="font-bold text-lg">{driver.name}</h3>
                              <p className="text-sm text-gray-600">
                                {driver.licenceDetails.licenceType} • {driver.experience} years exp.
                              </p>
                              <p className="text-sm font-semibold text-green-600 mt-1">
                                ₹{driver.salary.amount}/{driver.salary.paymentFrequency}
                              </p>
                            </div>
                            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm">
                              Select
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={selectedDriver.photo || '/images/default-driver.png'}
                        alt={selectedDriver.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-green-500"
                        onError={(e) => { e.target.src = '/images/default-driver.png'; }}
                      />
                      <div>
                        <h3 className="font-bold text-lg">{selectedDriver.name}</h3>
                        <p className="text-sm text-gray-600">
                          {selectedDriver.licenceDetails.licenceType} • {selectedDriver.experience} years exp.
                        </p>
                        <p className="text-sm font-semibold text-green-600 mt-1">
                          ₹{selectedDriver.salary.amount}/{selectedDriver.salary.paymentFrequency}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveDriver}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-3 pt-3 border-t border-green-300">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Contact:</span> {selectedDriver.contactNumber}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Email:</span> {selectedDriver.email}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-1">
          {session ? (
            car.available ? (
              <BookingForm 
                car={car} 
                userId={session.user.id}
                selectedDriver={selectedDriver}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Currently Unavailable</h3>
                  <p className="text-gray-600">This car is currently booked. Please check back later.</p>
                </div>
              </div>
            )
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Book This Car</h3>
              <p className="text-gray-600 mb-4">Please sign in to book this car.</p>
              <Link
                href="/api/auth/signin"
                className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Sign In to Book
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}