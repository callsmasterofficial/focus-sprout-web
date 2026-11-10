import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signToken, corsHeaders, handleOptions } from '@/lib/auth';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, sproutName, initialPayload } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409, headers: corsHeaders() }
      );
    }

    const record = await db.createUser({
      email,
      password,
      name,
      sproutName,
      initialPayload,
    });

    const token = signToken({
      userId: record.user.id,
      email: record.user.email,
      name: record.user.name,
    });

    return NextResponse.json(
      {
        success: true,
        token,
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
      },
      { status: 201, headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to register account' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

