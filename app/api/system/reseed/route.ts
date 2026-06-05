import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getSessionUser } from '@/lib/api-auth';
const seed = require('../../../../lib/db/seed'); // CommonJS relative import

/**
 * POST /api/system/reseed
 * Secure endpoint that drops all collections and re‑populates the database.
 * Only accessible by an authenticated admin user.
 */
export async function POST() {
  // ── authentication ──
  const user = getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Ensure DB connection
    await connectToDatabase();

    // Drop every collection in the current DB
    const mongoose = await import('mongoose');
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const collections = await db.collections();
    await Promise.all(collections.map((col) => col.drop()));

    // Re‑seed the database using existing seed script
    await seed();

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Reseed error:', e);
    return NextResponse.json({ error: e.message || 'Reseed failed' }, { status: 500 });
  }
}
