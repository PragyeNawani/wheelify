'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentButton({ booking }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Create Razorpay order
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking._id,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        alert('Failed to create payment order');
        setLoading(false);
        return;
      }

      // Initialize Razorpay
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Wheelify',
        description: `Booking for ${booking.car.name}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          // Verify payment
          const verifyResponse = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              bookingId: booking._id,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            alert('Payment successful!');
            router.push('/bookings');
          } else {
            alert('Payment verification failed');
          }
          setLoading(false);
        },
        prefill: {
          name: booking.user?.name || '',
          email: booking.user?.email || '',
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

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      alert('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading || booking.paymentStatus === 'paid'}
      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {loading
        ? 'Processing...'
        : booking.paymentStatus === 'paid'
        ? 'Already Paid'
        : `Pay ₹${booking.totalPrice}`}
    </button>
  );
}