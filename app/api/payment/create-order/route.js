import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import dbConnect from '@/lib/mongodb';
import { auth } from '@/auth';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    await dbConnect();

    // Import Booking model after connection
    const Booking = (await import('@/models/Booking')).default;

    // Use auth() instead of getServerSession() for NextAuth v5
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { bookingId } = await request.json();

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.user.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (booking.paymentStatus === 'paid') {
      return NextResponse.json(
        { success: false, error: 'Booking already paid' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const options = {
      amount: booking.totalPrice * 100, // amount in paise
      currency: 'INR',
      receipt: `booking_${booking._id}`,
      notes: {
        bookingId: booking._id.toString(),
        userId: session.user.id,
      },
    };

    const order = await razorpay.orders.create(options);

    // Save order ID to booking
    booking.razorpayOrderId = order.id;
    await booking.save();

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}