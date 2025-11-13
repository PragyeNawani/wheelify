import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { auth } from '@/auth';
import Booking from '@/models/Booking';

// POST - Refund insurance after inspection
export async function POST(request, { params }) {
  try {
    await connectDB();
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const bookingId = params.id;
    const body = await request.json();
    const { 
      damageReported = false, 
      damageDescription = '', 
      damageAmount = 0 
    } = body;

    // Find the booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'Booking must be completed before insurance refund' },
        { status: 400 }
      );
    }

    // Check if insurance was already refunded
    if (booking.insuranceRefunded) {
      return NextResponse.json(
        { success: false, error: 'Insurance already refunded' },
        { status: 400 }
      );
    }

    // Calculate refund amount
    let refundAmount = booking.insuranceAmount;
    
    if (damageReported && damageAmount > 0) {
      // Deduct damage amount from insurance
      refundAmount = Math.max(0, booking.insuranceAmount - damageAmount);
    }

    // Update booking with refund details
    booking.insuranceRefunded = true;
    booking.insuranceRefundDate = new Date();
    booking.insuranceRefundAmount = refundAmount;
    booking.damageReported = damageReported;
    booking.damageDescription = damageDescription;
    booking.damageAmount = damageAmount;

    await booking.save();

    console.log('Insurance refund processed:', {
      bookingId,
      originalAmount: booking.insuranceAmount,
      damageAmount,
      refundAmount,
    });

    // Here you would integrate with Razorpay refund API
    // Example:
    // const razorpay = new Razorpay({
    //   key_id: process.env.RAZORPAY_KEY_ID,
    //   key_secret: process.env.RAZORPAY_KEY_SECRET,
    // });
    // 
    // const refund = await razorpay.payments.refund(booking.razorpayPaymentId, {
    //   amount: refundAmount * 100, // Amount in paise
    //   notes: {
    //     reason: 'Insurance deposit refund',
    //     bookingId: bookingId,
    //   }
    // });

    return NextResponse.json({
      success: true,
      message: 'Insurance refund processed successfully',
      refund: {
        originalAmount: booking.insuranceAmount,
        damageAmount: damageAmount,
        refundAmount: refundAmount,
        refundDate: booking.insuranceRefundDate,
      },
    });

  } catch (error) {
    console.error('Error processing insurance refund:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process insurance refund',
        details: error.message 
      },
      { status: 500 }
    );
  }
}