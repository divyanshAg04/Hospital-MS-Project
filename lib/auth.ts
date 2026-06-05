import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'medcore-super-secure-key-9876543210';

/**
 * Hashes a plain-text password using scrypt with a cryptographically secure salt.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a plain-text password against a stored hashed password.
 */
export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    const candidateHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return hash === candidateHash;
  } catch (error) {
    return false;
  }
}

/**
 * Encodes a JSON payload and signs it using HMAC-SHA256.
 */
export function signToken(payload: any): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  
  // Add an expiration timestamp to the payload (default: 7 days)
  const extendedPayload = {
    ...payload,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days from now
  };
  
  const body = Buffer.from(JSON.stringify(extendedPayload)).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
    
  return `${header}.${body}.${signature}`;
}

/**
 * Verifies a JWT-like token signature and returns the parsed payload if valid.
 */
export function verifyToken(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [header, body, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
      
    if (signature !== expectedSignature) return null;
    
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    
    // Check if token has expired
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}
