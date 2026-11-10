import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserIdFromRequest, corsHeaders, handleOptions } from '@/lib/auth';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  const record = db.getUserData(userId);
  return NextResponse.json({ settings: record.settings }, { headers: corsHeaders() });
}

export async function PUT(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  const body = await req.json();
  const record = db.syncUserData(userId, { settings: body });
  return NextResponse.json({ settings: record.settings }, { headers: corsHeaders() });
}

