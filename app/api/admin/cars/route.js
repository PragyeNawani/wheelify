// app/api/admin/cars/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Car from '@/models/Car';

// GET all cars
export async function GET() {
  try {
    await dbConnect();
    const cars = await Car.find({}).sort({ createdAt: -1 });
    return NextResponse.json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cars' },
      { status: 500 }
    );
  }
}

// POST new car
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const car = await Car.create(body);
    return NextResponse.json(car, { status: 201 });
  } catch (error) {
    console.error('Error creating car:', error);
    return NextResponse.json(
      { error: 'Failed to create car', message: error.message },
      { status: 500 }
    );
  }
}