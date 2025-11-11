import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import { auth } from '@/auth';
import DriverBooking from '@/models/DriverBooking';
import Driver from '@/models/Driver';
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    console.log('=== Driver Payment Verification Started ===');
    
    await connectDB();
    console.log('Database connected');

    const session = await auth();
    console.log('Session:', session ? 'Authenticated' : 'Guest');

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      driverId,
      hireDetails
    } = await request.json();

    console.log('Verification request:', { razorpay_order_id, razorpay_payment_id, driverId });

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;
    console.log('Signature valid:', isAuthentic);

    if (!isAuthentic) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Calculate end date based on duration
    const startDate = new Date(hireDetails.startDate);
    const endDate = new Date(startDate);
    
    const { duration, durationType } = hireDetails;
    if (durationType === 'days') {
      endDate.setDate(endDate.getDate() + parseInt(duration));
    } else if (durationType === 'weeks') {
      endDate.setDate(endDate.getDate() + (parseInt(duration) * 7));
    } else if (durationType === 'months') {
      endDate.setMonth(endDate.getMonth() + parseInt(duration));
    }

    console.log('Date range:', { startDate, endDate, duration: `${duration} ${durationType}` });

    // Calculate total amount
    const driver = await Driver.findById(driverId);
    if (!driver) {
      console.error('Driver not found:', driverId);
      return NextResponse.json(
        { success: false, error: 'Driver not found' },
        { status: 404 }
      );
    }

    console.log('Driver found:', driver.name);

    const { amount, paymentFrequency } = driver.salary;
    let multiplier = 1;
    
    if (durationType === 'weeks') {
      multiplier = 7;
    } else if (durationType === 'months') {
      multiplier = 30;
    }
    
    const totalDays = duration * multiplier;
    
    let totalAmount = 0;
    if (paymentFrequency === 'daily') {
      totalAmount = amount * totalDays;
    } else if (paymentFrequency === 'weekly') {
      totalAmount = amount * (totalDays / 7);
    } else {
      totalAmount = amount * (totalDays / 30);
    }

    console.log('Total amount calculated:', totalAmount);

    // Validate and sanitize carId
    let validCarId = null;
    if (hireDetails.carId && 
        hireDetails.carId.trim() !== '' && 
        mongoose.Types.ObjectId.isValid(hireDetails.carId)) {
      validCarId = hireDetails.carId;
      console.log('Valid carId provided:', validCarId);
    } else {
      console.log('No valid carId provided, setting to null');
    }

    // Create driver booking
    const driverBooking = await DriverBooking.create({
      driverId: driverId,
      userId: session?.user?.id || null,
      customerName: hireDetails.customerName,
      customerEmail: hireDetails.customerEmail,
      customerPhone: hireDetails.customerPhone,
      startDate: startDate,
      endDate: endDate,
      duration: `${duration} ${durationType}`,
      carId: validCarId, // Use the validated carId or null
      specialRequirements: hireDetails.specialRequirements || '',
      totalAmount: totalAmount,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentStatus: 'completed',
      bookingStatus: 'confirmed',
    });

    console.log('Driver booking created:', driverBooking._id);

    // Update driver status
    await Driver.findByIdAndUpdate(driverId, {
      status: 'inactive',
    });

    console.log('Driver status updated to inactive');

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      booking: {
        _id: driverBooking._id,
        paymentStatus: driverBooking.paymentStatus,
        bookingStatus: driverBooking.bookingStatus,
      },
    });
  } catch (error) {
    console.error('=== Error verifying driver payment ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to verify payment',
        details: error.message 
      },
      { status: 500 }
    );
  }
}