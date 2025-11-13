'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BookingForm({ car, userId, selectedDriver }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    pickupLocation: car.location || '',
    dropoffLocation: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });
  const [totalDays, setTotalDays] = useState(0);
  const [carPrice, setCarPrice] = useState(0);
  const [driverPrice, setDriverPrice] = useState(0);
  const [insurancePrice, setInsurancePrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [insuranceAccepted, setInsuranceAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculatePrice();
  }, [formData.startDate, formData.endDate, selectedDriver]);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const calculatePrice = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      if (days > 0) {
        setTotalDays(days);
        const carCost = car.pricePerDay * days;
        setCarPrice(carCost);

        // Calculate driver price if driver is selected
        let driverCost = 0;
        if (selectedDriver) {
          const { amount, paymentFrequency } = selectedDriver.salary;
          
          if (paymentFrequency === 'daily') {
            driverCost = amount * days;
          } else if (paymentFrequency === 'weekly') {
            driverCost = amount * (days / 7);
          } else if (paymentFrequency === 'monthly') {
            driverCost = amount * (days / 30);
          }
        }
        setDriverPrice(driverCost);

        // Calculate insurance (10% of booking total - car + driver)
        const bookingSubtotal = carCost + driverCost;
        const insurance = bookingSubtotal * 0.10;
        setInsurancePrice(insurance);

        // Total including insurance
        setTotalPrice(bookingSubtotal + insurance);
      } else {
        setTotalDays(0);
        setCarPrice(0);
        setDriverPrice(0);
        setInsurancePrice(0);
        setTotalPrice(0);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (totalDays <= 0) {
      alert('Please select valid dates');
      return;
    }

    if (!insuranceAccepted) {
      alert('Please accept the Security Deposit (Insurance) to proceed with booking');
      return;
    }

    setLoading(true);

    try {
      // Create car booking order
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalPrice,
          carId: car._id,
          userId,
          bookingDetails: {
            ...formData,
            totalDays,
            totalPrice,
            driverId: selectedDriver?._id || null,
            driverAmount: driverPrice,
            insuranceAmount: insurancePrice,
            insuranceAccepted: true,
          },
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Initialize Razorpay
      const options = {
        key: orderData.razorpayKeyId,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Wheelify - Car Rental',
        description: `Booking for ${car.name}${selectedDriver ? ` with driver ${selectedDriver.name}` : ''}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                carId: car._id,
                userId,
                bookingDetails: {
                  ...formData,
                  totalDays,
                  totalPrice,
                  driverId: selectedDriver?._id || null,
                  driverAmount: driverPrice,
                  insuranceAmount: insurancePrice,
                  insuranceAccepted: true,
                },
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              alert('Booking confirmed successfully!');
              router.push('/bookings');
            } else {
              alert('Payment verification failed: ' + verifyData.error);
            }
          } catch (error) {
            alert('Payment verification failed: ' + error.message);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: userId,
          email: '',
          contact: '',
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert('Payment failed: ' + response.error.description);
        setLoading(false);
      });

      rzp.open();
    } catch (error) {
      alert('Failed to create booking: ' + error.message);
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
      <h3 className="text-2xl font-bold mb-6">Book This Car</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            min={today}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            min={formData.startDate || today}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pickup Location
          </label>
          <input
            type="text"
            name="pickupLocation"
            value={formData.pickupLocation}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Drop-off Location
          </label>
          <input
            type="text"
            name="dropoffLocation"
            value={formData.dropoffLocation}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Price Breakdown */}
        {totalDays > 0 && (
          <div className="border-t pt-4 mt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Car ({totalDays} days × ₹{car.pricePerDay})</span>
                <span>₹{carPrice.toFixed(2)}</span>
              </div>

              {selectedDriver && driverPrice > 0 && (
                <>
                  <div className="flex justify-between text-gray-700">
                    <span>Driver ({selectedDriver.name})</span>
                    <span>₹{driverPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 bg-green-50 p-2 rounded">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Driver will be assigned to this car for the booking duration</span>
                  </div>
                </>
              )}

              {/* Insurance/Security Deposit */}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-gray-700 font-medium">
                  <div className="flex items-center gap-1">
                    <span>Security Deposit</span>
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span>₹{insurancePrice.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  10% refundable deposit (covers damages)
                </p>
              </div>

              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total Amount</span>
                <span className="text-blue-600">₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Mandatory Insurance Checkbox */}
        {totalDays > 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="insuranceAccept"
                checked={insuranceAccepted}
                onChange={(e) => setInsuranceAccepted(e.target.checked)}
                required
                className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="insuranceAccept" className="text-sm text-gray-700 cursor-pointer">
                <span className="font-semibold text-gray-900">I accept the Security Deposit (Insurance) *</span>
                <div className="mt-2 space-y-1 text-xs">
                  <p>✓ Covers accidental damage to the vehicle</p>
                  <p>✓ <span className="font-semibold">Fully refundable</span> after vehicle inspection</p>
                  <p>✓ One-time fee of ₹{insurancePrice.toFixed(2)} (10% of booking amount)</p>
                  <p>✓ Refund processed within 7 business days after rental completion</p>
                </div>
              </label>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || totalDays <= 0 || !insuranceAccepted}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>

        {totalDays > 0 && !insuranceAccepted && (
          <p className="text-xs text-red-600 text-center">
            Please accept the Security Deposit to proceed
          </p>
        )}
      </form>

      {selectedDriver && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> Your selected driver will be automatically assigned to this car and will remain assigned for the entire booking period.
          </p>
        </div>
      )}
    </div>
  );
}