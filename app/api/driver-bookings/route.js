import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DriverBooking from '@/models/DriverBooking';
import { auth } from '@/auth';

// GET - Fetch user driver bookings
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

    const driverBookings = await DriverBooking.find({ 
      userId: session.user.id 
    })
      .populate('driverId')
      .populate('carId')
      .sort({ createdAt: -1 });

    return NextResponse.json({ 
      success: true, 
      driverBookings 
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching driver bookings:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}