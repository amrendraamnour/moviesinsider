// Import the necessary types from Next.js
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];

  const origin = req.headers.get('origin');

  if (allowedOrigins.includes(origin || '')) {
    return NextResponse.next().headers.set('Access-Control-Allow-Origin', origin || '*');
  }

  return NextResponse.next();
}
