// app/api/admin/bookings/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Booking from '@/models/Booking';

// GET - Get all car bookings
export async function GET(request) {
  try {
    await dbConnect();
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    
    // Build filter query
    let filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    
    const bookings = await Booking.find(filter)
      .populate('user', 'name email phone')
      .populate('car', 'name brand model category pricePerDay')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings', message: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new booking (admin can create bookings)
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const booking = await Booking.create(body);
    
    // Populate the created booking
    await booking.populate('user', 'name email phone');
    await booking.populate('car', 'name brand model');
    
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: 'Validation failed', message: messages.join(', ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create booking', message: error.message },
      { status: 500 }
    );
  }
}