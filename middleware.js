// middleware.js
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Debug logging (remove in production)
  console.log('=== MIDDLEWARE DEBUG ===');
  console.log('Path:', pathname);
  console.log('Is Logged In:', isLoggedIn);
  console.log('User Email:', req.auth?.user?.email);
  console.log('Admin Email from ENV:', process.env.ADMIN_EMAIL);

  // Admin routes protection
  if (pathname.startsWith('/admin')) {
    console.log('Admin route detected');
    
    if (!isLoggedIn) {
      console.log('Not logged in, redirecting to signin');
      return NextResponse.redirect(new URL('/auth/signin?callbackUrl=' + encodeURIComponent(pathname), req.url));
    }

    // Check if user is admin
    const adminEmail = process.env.ADMIN_EMAIL;
    const userEmail = req.auth?.user?.email;

    console.log('Checking admin access:');
    console.log('  User Email:', userEmail);
    console.log('  Admin Email:', adminEmail);
    console.log('  User Email (lowercase):', userEmail?.toLowerCase());
    console.log('  Admin Email (lowercase):', adminEmail?.toLowerCase());

    if (!adminEmail) {
      console.error('ADMIN_EMAIL environment variable is not set');
      return NextResponse.redirect(new URL('/auth/error?error=Configuration', req.url));
    }

    if (userEmail?.toLowerCase() !== adminEmail.toLowerCase()) {
      console.log('Not admin - redirecting to unauthorized');
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    console.log('Admin access granted!');
  }

  // Protected user routes
  if (pathname.startsWith('/bookings') || 
      pathname.startsWith('/payment') || 
      pathname.startsWith('/dashboard')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/auth/signin?callbackUrl=' + encodeURIComponent(pathname), req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/bookings/:path*', 
    '/payment/:path*', 
    '/dashboard/:path*',
    '/admin/:path*'
  ],
}