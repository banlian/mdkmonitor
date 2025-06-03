import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM machine');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch machines' },
      { status: 500 }
    );
  }
} 