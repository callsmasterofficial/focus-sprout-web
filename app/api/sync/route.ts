import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserIdFromRequest, corsHeaders, handleOptions } from '@/lib/auth';
import { SyncPayload, SyncResponse } from '@/types';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    const record = db.getUserData(userId);

    const response: SyncResponse = {
      success: true,
      syncedAt: new Date().toISOString(),
      settings: record.settings,
      tasks: record.tasks,
      sessions: record.sessions,
      distractionRules: record.distractionRules,
      achievements: record.achievements,
      user: {
        id: record.user.id,
        email: record.user.email,
        name: record.user.name,
        sproutName: record.user.sproutName,
      },
    };

    return NextResponse.json(response, { headers: corsHeaders() });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Sync failed' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    const payload: SyncPayload = await req.json();

    const record = db.syncUserData(userId, payload);

    const response: SyncResponse = {
      success: true,
      syncedAt: record.user.lastSyncedAt || new Date().toISOString(),
      settings: record.settings,
      tasks: record.tasks,
      sessions: record.sessions,
      distractionRules: record.distractionRules,
      achievements: record.achievements,
      user: {
        id: record.user.id,
        email: record.user.email,
        name: record.user.name,
        sproutName: record.user.sproutName,
      },
    };

    return NextResponse.json(response, { headers: corsHeaders() });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Sync failed' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

