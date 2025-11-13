// lib/adminAuth.js
import { auth } from '@/auth';

/**
 * Check if the current user is an admin
 * @returns {Promise<boolean>}
 */
export async function isAdmin() {
  const session = await auth();
  
  if (!session || !session.user || !session.user.email) {
    return false;
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (!adminEmail) {
    console.error('ADMIN_EMAIL environment variable is not set');
    return false;
  }

  return session.user.email.toLowerCase() === adminEmail.toLowerCase();
}

/**
 * Get admin session or throw error
 * @returns {Promise<Session>}
 * @throws {Error} if user is not admin
 */
export async function requireAdmin() {
  const session = await auth();
  
  if (!session || !session.user || !session.user.email) {
    throw new Error('Unauthorized: No session found');
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (!adminEmail) {
    throw new Error('Server configuration error: ADMIN_EMAIL not set');
  }

  if (session.user.email.toLowerCase() !== adminEmail.toLowerCase()) {
    throw new Error('Forbidden: Admin access required');
  }

  return session;
}