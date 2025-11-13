// app/api/admin/driver-bookings/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import DriverBooking from '@/models/DriverBooking';
import { requireAdmin } from '@/lib/adminAuth';
// GET - Get all driver bookings
export async function GET(request) {
  try {
    await requireAdmin();
    await dbConnect();
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const bookingStatus = searchParams.get('bookingStatus');
    const paymentStatus = searchParams.get('paymentStatus');
    const driverId = searchParams.get('driverId');
    
    // Build filter query
    let filter = {};
    if (bookingStatus) filter.bookingStatus = bookingStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (driverId) filter.driverId = driverId;
    
    const driverBookings = await DriverBooking.find(filter)
      .populate('driverId', 'name email contactNumber licenceDetails')
      .populate('carId', 'name brand model category')
      .populate('userId', 'name email phone')
      .populate('carBookingId')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(driverBookings);
  } catch (error) {
    console.error('Error fetching driver bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch driver bookings', message: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new driver booking (admin can create bookings)
export async function POST(request) {
  try {
    await requireAdmin();
    await dbConnect();
    const body = await request.json();
    
    const driverBooking = await DriverBooking.create(body);
    
    // Populate the created booking
    await driverBooking.populate('driverId', 'name email contactNumber');
    await driverBooking.populate('carId', 'name brand model');
    await driverBooking.populate('userId', 'name email');
    
    return NextResponse.json(driverBooking, { status: 201 });
  } catch (error) {
    console.error('Error creating driver booking:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: 'Validation failed', message: messages.join(', ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create driver booking', message: error.message },
      { status: 500 }
    );
  }
}