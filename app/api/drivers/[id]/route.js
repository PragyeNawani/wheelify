  import { NextResponse } from 'next/server';
  import connectDB from '@/lib/mongodb';
  import Driver from '@/models/Driver';
  import mongoose from 'mongoose';

  // GET - Fetch single driver
  export async function GET(request, { params }) {
    try {
      await connectDB();
      
      const { id } = params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid driver ID'
        }, { status: 400 });
      }
      
      const driver = await Driver.findById(id)
        .populate('assignedCar', 'make model registrationNumber year');
      
      if (!driver) {
        return NextResponse.json({
          success: false,
          error: 'Driver not found'
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        data: driver
      }, { status: 200 });
      
    } catch (error) {
      console.error('Error fetching driver:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch driver'
      }, { status: 500 });
    }
  }

  // PUT - Update driver
  export async function PUT(request, { params }) {
    try {
      await connectDB();
      
      const { id } = params;
      const body = await request.json();
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid driver ID'
        }, { status: 400 });
      }
      
      const driver = await Driver.findByIdAndUpdate(
        id,
        body,
        {
          new: true,
          runValidators: true
        }
      ).populate('assignedCar');
      
      if (!driver) {
        return NextResponse.json({
          success: false,
          error: 'Driver not found'
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Driver updated successfully',
        data: driver
      }, { status: 200 });
      
    } catch (error) {
      console.error('Error updating driver:', error);
      
      if (error.name === 'ValidationError') {
        return NextResponse.json({
          success: false,
          error: error.message
        }, { status: 400 });
      }
      
      return NextResponse.json({
        success: false,
        error: 'Failed to update driver'
      }, { status: 500 });
    }
  }

  // DELETE - Delete driver
  export async function DELETE(request, { params }) {
    try {
      await connectDB();
      
      const { id } = params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid driver ID'
        }, { status: 400 });
      }
      
      const driver = await Driver.findByIdAndDelete(id);
      
      if (!driver) {
        return NextResponse.json({
          success: false,
          error: 'Driver not found'
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Driver deleted successfully'
      }, { status: 200 });
      
    } catch (error) {
      console.error('Error deleting driver:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to delete driver'
      }, { status: 500 });
    }
  }