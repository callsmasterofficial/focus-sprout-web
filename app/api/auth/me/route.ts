import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserIdFromRequest, corsHeaders, handleOptions } from '@/lib/auth';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    const record = db.getUserData(userId);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: record.user.id,
          email: record.user.email,
          name: record.user.name,
          sproutName: record.user.sproutName,
          lastSyncedAt: record.user.lastSyncedAt,
        },
      },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch user' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

