import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Car from '@/models/Car';
import { auth } from '@/auth';

// GET - Fetch user bookings
export async function GET(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const bookings = await Booking.find({ user: session.user.id })
      .populate('car')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, bookings }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new booking
export async function POST(request) {
  try {
    const session = await auth();

    // DEBUG: Log session to see what's available
    console.log('Session:', JSON.stringify(session, null, 2));
    console.log('User ID:', session?.user?.id);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    // Add this check
    if (!session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'User ID not found in session' },
        { status: 400 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { carId, startDate, endDate, pickupLocation, dropoffLocation, driverLicense, additionalNotes } = body;

    // Check if car exists and is available
    const car = await Car.findById(carId);
    if (!car) {
      return NextResponse.json(
        { success: false, error: 'Car not found' },
        { status: 404 }
      );
    }

    if (!car.available) {
      return NextResponse.json(
        { success: false, error: 'Car is not available' },
        { status: 400 }
      );
    }

    // Calculate total days and price
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = totalDays * car.pricePerDay;

    // Create booking
    const booking = await Booking.create({
      user: session.user.id,
      car: carId,
      startDate,
      endDate,
      totalDays,
      totalPrice,
      pickupLocation,
      dropoffLocation,
      driverLicense,
      additionalNotes,
    });

    const populatedBooking = await Booking.findById(booking._id).populate('car');

    return NextResponse.json({ success: true, booking: populatedBooking }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}