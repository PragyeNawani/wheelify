import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { auth } from '@/auth';

export async function GET(request, { params }) {
  try {
    // Connect to database FIRST
    await dbConnect();

    // Import models AFTER connection
    const Booking = (await import('@/models/Booking')).default;
    
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const bookingId = params.id;

    // Populate car details with the booking
    const booking = await Booking.findById(bookingId).populate('car');

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if booking belongs to the user
    if (booking.user.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: {
        _id: booking._id,
        car: {
          _id: booking.car._id,
          name: booking.car.name,
          brand: booking.car.brand,
          model: booking.car.model,
          images: booking.car.images,
          pricePerDay: booking.car.pricePerDay,
        },
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalDays: booking.totalDays,
        totalPrice: booking.totalPrice,
        pickupLocation: booking.pickupLocation,
        dropoffLocation: booking.dropoffLocation,
        paymentStatus: booking.paymentStatus,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}