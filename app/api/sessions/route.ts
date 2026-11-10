import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserIdFromRequest, corsHeaders, handleOptions } from '@/lib/auth';
import { Session } from '@/types';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  const record = db.getUserData(userId);
  return NextResponse.json({ sessions: record.sessions }, { headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  const record = db.getUserData(userId);
  const body = await req.json();

  const newSession: Session = {
    id: body.id || `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    mode: body.mode || 'focus',
    taskId: body.taskId,
    taskTitle: body.taskTitle,
    category: body.category || 'General',
    plannedDurationSec: body.plannedDurationSec || 1500,
    actualDurationSec: body.actualDurationSec || 1500,
    startedAt: body.startedAt || new Date().toISOString(),
    completedAt: body.completedAt || new Date().toISOString(),
    completed: Boolean(body.completed),
    notes: body.notes,
    distractionShieldActive: Boolean(body.distractionShieldActive),
  };

  record.sessions = [newSession, ...record.sessions];

  // If focus session and task linked, also increment task's completedPomodoros!
  if (newSession.mode === 'focus' && newSession.taskId) {
    record.tasks = record.tasks.map((task) => {
      if (task.id === newSession.taskId) {
        const nextCount = task.completedPomodoros + 1;
        const isDone = nextCount >= task.estimatedPomodoros;
        return {
          ...task,
          completedPomodoros: nextCount,
          completed: isDone ? true : task.completed,
          completedAt: isDone && !task.completed ? new Date().toISOString() : task.completedAt,
        };
      }
      return task;
    });
  }

  db.syncUserData(userId, {
    sessions: record.sessions,
    tasks: record.tasks,
  });

  return NextResponse.json({ session: newSession, sessions: record.sessions }, { status: 201, headers: corsHeaders() });
}

export async function DELETE(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  const record = db.getUserData(userId);
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400, headers: corsHeaders() });
  }

  record.sessions = record.sessions.filter((s) => s.id !== id);
  db.syncUserData(userId, { sessions: record.sessions });
  return NextResponse.json({ success: true, sessions: record.sessions }, { headers: corsHeaders() });
}

