import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Car from '@/models/Car';
import { auth } from '@/auth';

export async function POST(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } = await request.json();

    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpaySignature;

    if (isAuthentic) {
      // Update booking
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return NextResponse.json(
          { success: false, error: 'Booking not found' },
          { status: 404 }
        );
      }

      booking.razorpayPaymentId = razorpayPaymentId;
      booking.razorpaySignature = razorpaySignature;
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      await booking.save();

      // Update car availability
      await Car.findByIdAndUpdate(booking.car, { available: false });

      return NextResponse.json(
        {
          success: true,
          message: 'Payment verified successfully',
          booking,
        },
        { status: 200 }
      );
    } else {
      // Update booking payment status to failed
      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: 'failed',
      });

      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}