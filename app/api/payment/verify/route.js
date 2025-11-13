import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import { auth } from '@/auth';
import Booking from '@/models/Booking';
import DriverBooking from '@/models/DriverBooking';
import Car from '@/models/Car';
import Driver from '@/models/Driver';
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    console.log('=== Car Payment Verification Started ===');
    
    await connectDB();
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      carId,
      userId,
      bookingDetails,
    } = await request.json();

    console.log('Verification request:', { razorpay_order_id, razorpay_payment_id, carId });

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

    const startDate = new Date(bookingDetails.startDate);
    const endDate = new Date(bookingDetails.endDate);

    // Sequential operations (no transaction needed for local dev)
    let carBooking = null;
    let driverBooking = null;
    let rollbackNeeded = false;

    try {
      // Step 1: Create car booking with insurance details
      console.log('Creating car booking with insurance...');
      carBooking = await Booking.create({
        user: userId,
        car: carId,
        startDate,
        endDate,
        totalDays: bookingDetails.totalDays,
        totalPrice: bookingDetails.totalPrice,
        pickupLocation: bookingDetails.pickupLocation,
        dropoffLocation: bookingDetails.dropoffLocation,
        // Insurance fields
        insuranceAmount: bookingDetails.insuranceAmount || 0,
        insuranceAccepted: bookingDetails.insuranceAccepted || false,
        insuranceRefunded: false,
        insuranceRefundDate: null,
        insuranceRefundAmount: 0,
        damageReported: false,
        damageDescription: '',
        damageAmount: 0,
        // Payment fields
        status: 'confirmed',
        paymentStatus: 'paid',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      });

      console.log('Car booking created:', carBooking._id);
      console.log('Insurance amount:', bookingDetails.insuranceAmount);

      // Step 2: Update car availability
      console.log('Updating car availability...');
      await Car.findByIdAndUpdate(carId, { available: false });
      console.log('Car availability updated');

      // Step 3: If driver is selected, create driver booking and assign car
      if (bookingDetails.driverId && mongoose.Types.ObjectId.isValid(bookingDetails.driverId)) {
        console.log('Creating driver booking for driver:', bookingDetails.driverId);
        rollbackNeeded = true; // Enable rollback from this point

        // Get driver details
        const driver = await Driver.findById(bookingDetails.driverId);
        
        if (!driver) {
          throw new Error('Driver not found');
        }

        console.log('Driver found:', driver.name);

        // Calculate driver dates (same as car booking)
        const driverStartDate = new Date(startDate);
        const driverEndDate = new Date(endDate);

        // Create driver booking
        driverBooking = await DriverBooking.create({
          driverId: bookingDetails.driverId,
          userId: userId,
          carBookingId: carBooking._id,
          customerName: bookingDetails.customerName || session.user.name || 'Customer',
          customerEmail: bookingDetails.customerEmail || session.user.email || '',
          customerPhone: bookingDetails.customerPhone || 'N/A',
          startDate: driverStartDate,
          endDate: driverEndDate,
          duration: `${bookingDetails.totalDays} days`,
          carId: carId, // Assign the car to driver
          specialRequirements: bookingDetails.driverSpecialRequirements || 'Assigned with car booking',
          totalAmount: bookingDetails.driverAmount || 0,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          paymentStatus: 'completed',
          bookingStatus: 'confirmed',
        });

        console.log('Driver booking created:', driverBooking._id);

        // Update driver status and assign car
        await Driver.findByIdAndUpdate(bookingDetails.driverId, {
          status: 'inactive',
          assignedCar: carId,
        });

        console.log('Driver updated with car assignment');
      }

      console.log('All operations completed successfully');

      return NextResponse.json({
        success: true,
        message: 'Booking confirmed successfully',
        booking: {
          _id: carBooking._id,
          status: carBooking.status,
          paymentStatus: carBooking.paymentStatus,
          insuranceAmount: carBooking.insuranceAmount,
          insuranceAccepted: carBooking.insuranceAccepted,
        },
        driverBooking: driverBooking ? {
          _id: driverBooking._id,
          bookingStatus: driverBooking.bookingStatus,
        } : null,
      });

    } catch (operationError) {
      console.error('Error during booking operations:', operationError.message);
      
      // Rollback logic (manual cleanup)
      if (rollbackNeeded && carBooking) {
        console.log('Attempting rollback...');
        
        try {
          // Delete car booking
          if (carBooking._id) {
            await Booking.findByIdAndDelete(carBooking._id);
            console.log('Car booking rolled back');
          }

          // Restore car availability
          await Car.findByIdAndUpdate(carId, { available: true });
          console.log('Car availability restored');

          // Delete driver booking if it was created
          if (driverBooking && driverBooking._id) {
            await DriverBooking.findByIdAndDelete(driverBooking._id);
            console.log('Driver booking rolled back');
          }

          // Restore driver status if it was updated
          if (bookingDetails.driverId) {
            await Driver.findByIdAndUpdate(bookingDetails.driverId, {
              status: 'active',
              assignedCar: null,
            });
            console.log('Driver status restored');
          }

          console.log('Rollback completed');
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError.message);
          // Log for manual intervention
          console.error('MANUAL INTERVENTION NEEDED:', {
            carBookingId: carBooking?._id,
            driverBookingId: driverBooking?._id,
            carId,
            driverId: bookingDetails.driverId,
          });
        }
      }

      throw operationError; // Re-throw to outer catch
    }

  } catch (error) {
    console.error('=== Error verifying payment ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to verify payment',
        details: error.message,
      },
      { status: 500 }
    );
  }
}