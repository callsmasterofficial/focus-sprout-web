import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signToken, corsHeaders, handleOptions } from '@/lib/auth';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const record = db.getUserByEmail(email);
    if (!record) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401, headers: corsHeaders() }
      );
    }

    const valid = await db.verifyPassword(password, record.user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401, headers: corsHeaders() }
      );
    }

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
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Login failed' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

