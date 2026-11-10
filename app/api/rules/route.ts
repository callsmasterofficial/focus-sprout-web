import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserIdFromRequest, corsHeaders, handleOptions } from '@/lib/auth';
import { DistractionRule } from '@/types';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  const record = db.getUserData(userId);
  return NextResponse.json({ rules: record.distractionRules }, { headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  const record = db.getUserData(userId);
  const body = await req.json();

  const newRule: DistractionRule = {
    id: body.id || `rule_${Date.now()}`,
    name: (body.name || 'Custom Shield').trim(),
    category: body.category || 'custom',
    icon: body.icon || 'Shield',
    enabled: body.enabled !== false,
    website: body.website?.trim(),
  };

  record.distractionRules = [newRule, ...record.distractionRules];
  db.syncUserData(userId, { distractionRules: record.distractionRules });

  return NextResponse.json({ rule: newRule, rules: record.distractionRules }, { status: 201, headers: corsHeaders() });
}

export async function PUT(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  const record = db.getUserData(userId);
  const body = await req.json();

  if (!body.id) {
    return NextResponse.json({ error: 'Rule ID is required' }, { status: 400, headers: corsHeaders() });
  }

  record.distractionRules = record.distractionRules.map((rule) => {
    if (rule.id === body.id) {
      return { ...rule, ...body };
    }
    return rule;
  });

  db.syncUserData(userId, { distractionRules: record.distractionRules });
  return NextResponse.json({ rules: record.distractionRules }, { headers: corsHeaders() });
}

export async function DELETE(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  const record = db.getUserData(userId);
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Rule ID is required' }, { status: 400, headers: corsHeaders() });
  }

  record.distractionRules = record.distractionRules.filter((r) => r.id !== id);
  db.syncUserData(userId, { distractionRules: record.distractionRules });
  return NextResponse.json({ success: true, rules: record.distractionRules }, { headers: corsHeaders() });
}

