import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Testing driver payment API...');
    
    // Check Razorpay
    let razorpayInstalled = false;
    let razorpayError = null;
    
    try {
      const Razorpay = (await import('razorpay')).default;
      razorpayInstalled = true;
      console.log('Razorpay module loaded successfully');
    } catch (err) {
      razorpayError = err.message;
      console.error('Failed to load Razorpay:', err);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Driver payment API test endpoint',
      checks: {
        razorpayInstalled,
        razorpayError,
        hasRazorpayKeyId: !!process.env.RAZORPAY_KEY_ID,
        hasRazorpaySecret: !!process.env.RAZORPAY_KEY_SECRET,
        razorpayKeyIdPrefix: process.env.RAZORPAY_KEY_ID?.substring(0, 8) || 'NOT SET',
      },
      env: {
        nodeEnv: process.env.NODE_ENV,
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Test POST received:', body);
    
    return NextResponse.json({
      success: true,
      message: 'Test POST successful',
      receivedData: body,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}