import { cookies } from 'next/headers';
import { verifyToken } from './auth';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'patient';
}

/**
 * Retrieves and validates the authenticated user from the session cookie.
 * Returns the user payload if valid, or null if unauthenticated/expired.
 */
export function getSessionUser(): SessionUser | null {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('medcore_session')?.value;
    if (!token) return null;
    
    return verifyToken(token) as SessionUser | null;
  } catch (error) {
    return null;
  }
}
