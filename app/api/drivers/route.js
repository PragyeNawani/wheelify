import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Driver from '@/models/Driver';

// GET - Fetch all drivers
export async function GET(request) {
  try {
    console.log('=== Fetching Drivers ===');
    await connectDB();
    console.log('Database connected');
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const available = searchParams.get('available');
    
    console.log('Query params:', { status, available });
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (available === 'true') {
      query.status = 'active';
      query.assignedCar = null;
    }
    
    console.log('MongoDB query:', JSON.stringify(query));
    
    const drivers = await Driver.find(query)
      .populate('assignedCar', 'make model registrationNumber')
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance
    
    console.log(`Found ${drivers.length} drivers`);
    
    return NextResponse.json({
      success: true,
      count: drivers.length,
      data: drivers
    }, { status: 200 });
    
  } catch (error) {
    console.error('=== Error fetching drivers ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch drivers',
      details: error.message
    }, { status: 500 });
  }
}

// POST - Create a new driver
export async function POST(request) {
  try {
    console.log('=== Creating Driver ===');
    await connectDB();
    
    const body = await request.json();
    console.log('Request body received');
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'contactNumber', 'licenceDetails', 'salary'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `${field} is required`
        }, { status: 400 });
      }
    }
    
    // Check if driver with same email or licence exists
    const existingDriver = await Driver.findOne({
      $or: [
        { email: body.email },
        { 'licenceDetails.licenceNumber': body.licenceDetails.licenceNumber }
      ]
    });
    
    if (existingDriver) {
      return NextResponse.json({
        success: false,
        error: 'Driver with this email or licence number already exists'
      }, { status: 409 });
    }
    
    const driver = await Driver.create(body);
    console.log('Driver created:', driver._id);
    
    return NextResponse.json({
      success: true,
      message: 'Driver created successfully',
      data: driver
    }, { status: 201 });
    
  } catch (error) {
    console.error('=== Error creating driver ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create driver',
      details: error.message
    }, { status: 500 });
  }
}