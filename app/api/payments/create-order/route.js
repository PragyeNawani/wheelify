import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { auth } from '@/auth';

// ✅ Ensure Razorpay is initialized safely (avoid undefined env vars)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function POST(request) {
  try {
    const session = await auth();

    // ✅ Authentication check
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Missing bookingId' },
        { status: 400 }
      );
    }

    // ✅ Fetch booking and populate car data
    const booking = await Booking.findById(bookingId).populate('car');

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // ✅ Verify booking belongs to logged-in user
    if (booking.user.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // ✅ Create Razorpay order (fix template string bug)
    const options = {
      amount: booking.totalPrice * 100, // amount in paise
      currency: 'INR',
      receipt: `booking_${bookingId}`, // <-- fixed string interpolation
      notes: {
        bookingId: bookingId,
        carName: booking.car?.name || 'Unknown Car',
        userId: session.user.id,
      },
    };

    const order = await razorpay.orders.create(options);

    // ✅ Save Razorpay order ID to booking
    booking.razorpayOrderId = order.id;
    await booking.save();

    // ✅ Return order details and public Razorpay key
    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
