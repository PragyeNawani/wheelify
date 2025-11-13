// app/api/admin/stats/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Car from '@/models/Car';
import Driver from '@/models/Driver';
import Booking from '@/models/Booking';
import DriverBooking from '@/models/DriverBooking';
import { requireAdmin } from '@/lib/adminAuth';
export async function GET(request) {
  try {
    await requireAdmin();
    await connectDB();

    // Get counts
    const totalCars = await Car.countDocuments();
    const totalDrivers = await Driver.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalDriverBookings = await DriverBooking.countDocuments();

    // Calculate total revenue from both car and driver bookings
    const carRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const driverRevenue = await DriverBooking.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const totalRevenue = 
      (carRevenue[0]?.total || 0) + 
      (driverRevenue[0]?.total || 0);

    return NextResponse.json({
      totalCars,
      totalDrivers,
      totalBookings: totalBookings + totalDriverBookings,
      totalRevenue,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}