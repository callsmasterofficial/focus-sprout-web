import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserIdFromRequest, corsHeaders, handleOptions } from '@/lib/auth';
import { Task } from '@/types';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  const record = db.getUserData(userId);
  return NextResponse.json({ tasks: record.tasks }, { headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  const record = db.getUserData(userId);
  const body = await req.json();

  const newTask: Task = {
    id: body.id || `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: (body.title || 'New Task').trim(),
    description: body.description?.trim(),
    category: body.category || 'Work',
    priority: body.priority || 'medium',
    estimatedPomodoros: Math.max(1, body.estimatedPomodoros || 1),
    completedPomodoros: body.completedPomodoros || 0,
    completed: Boolean(body.completed),
    dueDate: body.dueDate,
    createdAt: body.createdAt || new Date().toISOString(),
    completedAt: body.completed ? new Date().toISOString() : undefined,
  };

  record.tasks = [newTask, ...record.tasks];
  db.syncUserData(userId, { tasks: record.tasks });

  return NextResponse.json({ task: newTask, tasks: record.tasks }, { status: 201, headers: corsHeaders() });
}

export async function PUT(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  const record = db.getUserData(userId);
  const body = await req.json();

  if (!body.id) {
    return NextResponse.json({ error: 'Task ID is required' }, { status: 400, headers: corsHeaders() });
  }

  record.tasks = record.tasks.map((task) => {
    if (task.id === body.id) {
      return { ...task, ...body, updatedAt: new Date().toISOString() };
    }
    return task;
  });

  db.syncUserData(userId, { tasks: record.tasks });
  return NextResponse.json({ tasks: record.tasks }, { headers: corsHeaders() });
}

export async function DELETE(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  const record = db.getUserData(userId);
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Task ID is required' }, { status: 400, headers: corsHeaders() });
  }

  record.tasks = record.tasks.filter((t) => t.id !== id);
  db.syncUserData(userId, { tasks: record.tasks });
  return NextResponse.json({ success: true, tasks: record.tasks }, { headers: corsHeaders() });
}

