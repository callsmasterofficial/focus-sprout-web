import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserIdFromRequest, corsHeaders, handleOptions } from '@/lib/auth';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  const record = db.getUserData(userId);
  return NextResponse.json({ achievements: record.achievements }, { headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  const body = await req.json();
  const record = db.syncUserData(userId, { achievements: body.achievements });
  return NextResponse.json({ achievements: record.achievements }, { headers: corsHeaders() });
}

