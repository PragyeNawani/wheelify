// app/api/admin/cars/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Car from '@/models/Car';

// PUT - Update car
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const body = await request.json();
    
    const car = await Car.findByIdAndUpdate(
      id,
      body,
      {
        new: true,
        runValidators: true,
      }
    );
    
    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(car);
  } catch (error) {
    console.error('Error updating car:', error);
    return NextResponse.json(
      { error: 'Failed to update car', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete car
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    
    const car = await Car.findByIdAndDelete(id);
    
    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Car deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting car:', error);
    return NextResponse.json(
      { error: 'Failed to delete car', message: error.message },
      { status: 500 }
    );
  }
}