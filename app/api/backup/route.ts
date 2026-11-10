import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserIdFromRequest, corsHeaders, handleOptions } from '@/lib/auth';

export async function OPTIONS() {
  return handleOptions();
}

// Export backup JSON
export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  const record = db.getUserData(userId);

  const backup = {
    appName: 'FocusSprout',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    user: {
      id: record.user.id,
      email: record.user.email,
      name: record.user.name,
      sproutName: record.user.sproutName,
    },
    data: {
      settings: record.settings,
      tasks: record.tasks,
      sessions: record.sessions,
      distractionRules: record.distractionRules,
      achievements: record.achievements,
    },
  };

  return NextResponse.json(backup, { headers: corsHeaders() });
}

// Import backup JSON
export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    const body = await req.json();

    if (!body.data) {
      return NextResponse.json({ error: 'Invalid backup structure. Missing data field.' }, { status: 400, headers: corsHeaders() });
    }

    const record = db.syncUserData(userId, body.data);
    return NextResponse.json({ success: true, user: record.user, settings: record.settings }, { headers: corsHeaders() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Import failed' }, { status: 500, headers: corsHeaders() });
  }
}

// Seed demo data
export async function PATCH(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  const record = db.seedUserDemoData(userId);
  return NextResponse.json({ success: true, tasksCount: record.tasks.length, sessionsCount: record.sessions.length }, { headers: corsHeaders() });
}

// Reset data
export async function DELETE(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  db.clearUserData(userId);
  return NextResponse.json({ success: true, message: 'Data cleared' }, { headers: corsHeaders() });
}

