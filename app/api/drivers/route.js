// app/api/drivers/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';  // Changed from { connectDB }
import Driver from '@/models/Driver';

// GET - Fetch all drivers
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const available = searchParams.get('available');
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (available === 'true') {
      query.status = 'active';
      query.assignedCar = null;
    }
    
    const drivers = await Driver.find(query)
      .populate('assignedCar', 'make model registrationNumber')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      count: drivers.length,
      data: drivers
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching drivers:', error);
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
    await connectDB();
    
    const body = await request.json();
    
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
    
    return NextResponse.json({
      success: true,
      message: 'Driver created successfully',
      data: driver
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating driver:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create driver'
    }, { status: 500 });
  }
}