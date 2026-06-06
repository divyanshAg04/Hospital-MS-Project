import { NextResponse } from 'next/server';

/**
 * POST /api/system/reseed
 * This endpoint is disabled to protect database integrity.
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Database reseeding has been disabled by the system administrator.' },
    { status: 403 }
  );
}

