import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import dbConnect from '@/lib/mongodb';
import { auth } from '@/auth';

export async function POST(request) {
  try {
    console.log('=== Driver Payment Order Creation Started ===');
    
    // Check environment variables
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Missing Razorpay credentials');
      return NextResponse.json(
        { success: false, error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    // Dynamic import to avoid build issues
    const Razorpay = (await import('razorpay')).default;
    console.log('Razorpay imported');

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log('Razorpay instance created');

    const body = await request.json();
    console.log('Body received:', JSON.stringify(body, null, 2));

    const { amount, driverId, hireDetails } = body;

    if (!amount || !driverId || !hireDetails) {
      console.error('Missing required fields');
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate amount
    const amountInPaise = Math.round(amount * 100);
    console.log('Amount in paise:', amountInPaise);

    if (amountInPaise <= 0) {
      console.error('Invalid amount:', amount);
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Create a shorter receipt ID (max 40 characters)
    // Format: DRV_<last8CharsOfDriverId>_<timestamp>
    const driverIdShort = driverId.slice(-8); // Last 8 characters of driver ID
    const timestamp = Date.now().toString().slice(-10); // Last 10 digits of timestamp
    const receipt = `DRV_${driverIdShort}_${timestamp}`;
    
    console.log('Generated receipt:', receipt, 'Length:', receipt.length);

    // Create Razorpay order
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt, // Now guaranteed to be under 40 chars
    };

    console.log('Creating order with options:', options);

    const order = await razorpay.orders.create(options);
    console.log('Order created successfully:', order.id);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('=== ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.error) {
      console.error('Razorpay error:', JSON.stringify(error.error, null, 2));
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create payment order',
        details: error.message
      },
      { status: 500 }
    );
  }
}