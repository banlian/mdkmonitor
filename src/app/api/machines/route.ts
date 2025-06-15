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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json(
        { error: "Machine name is required" },
        { status: 400 }
      );
    }

    const qr = await pool.execute(`delete from machine where name = '${name}'`);
    const result = qr[0];
    return NextResponse.json(result);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to delete machine' },
      { status: 500 }
    );
  }

} 