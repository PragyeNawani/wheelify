// app/api/admin/drivers/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Driver from '@/models/Driver';

// GET - Get all drivers
export async function GET() {
  try {
    await dbConnect();
    
    const drivers = await Driver.find({})
      .populate('assignedCar', 'name brand model')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drivers', message: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new driver
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Check if email already exists
    const existingDriver = await Driver.findOne({ email: body.email });
    if (existingDriver) {
      return NextResponse.json(
        { error: 'Email already registered', message: 'A driver with this email already exists' },
        { status: 400 }
      );
    }

    // Check if licence number already exists
    const existingLicence = await Driver.findOne({ 
      'licenceDetails.licenceNumber': body.licenceDetails?.licenceNumber 
    });
    if (existingLicence) {
      return NextResponse.json(
        { error: 'Licence number already registered', message: 'A driver with this licence number already exists' },
        { status: 400 }
      );
    }
    
    const driver = await Driver.create(body);
    
    return NextResponse.json(driver, { status: 201 });
  } catch (error) {
    console.error('Error creating driver:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: 'Validation failed', message: messages.join(', ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create driver', message: error.message },
      { status: 500 }
    );
  }
}