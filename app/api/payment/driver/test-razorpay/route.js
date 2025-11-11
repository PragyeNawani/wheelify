// app/api/payment/driver/test-razorpay/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test if Razorpay module can be imported
    const Razorpay = (await import('razorpay')).default;
    
    console.log('Razorpay imported successfully');
    console.log('RAZORPAY_KEY_ID exists:', !!process.env.RAZORPAY_KEY_ID);
    console.log('RAZORPAY_KEY_SECRET exists:', !!process.env.RAZORPAY_KEY_SECRET);
    
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({
        success: false,
        error: 'Razorpay credentials not found in environment variables',
        env: {
          RAZORPAY_KEY_ID: !!process.env.RAZORPAY_KEY_ID,
          RAZORPAY_KEY_SECRET: !!process.env.RAZORPAY_KEY_SECRET,
        }
      });
    }
    
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    
    console.log('Razorpay instance created successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Razorpay is configured correctly',
      keyId: process.env.RAZORPAY_KEY_ID?.substring(0, 10) + '...',
    });
  } catch (error) {
    console.error('Error testing Razorpay:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}