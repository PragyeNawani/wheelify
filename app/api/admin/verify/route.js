// app/api/admin/verify/route.js
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET() {
  try {
    // This will throw an error if the user is not an admin
    const session = await requireAdmin();
    
    return NextResponse.json({
      message: 'Admin verified',
      email: session.user.email,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Unauthorized' },
      { status: error.message.includes('Forbidden') ? 403 : 401 }
    );
  }
}