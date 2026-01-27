import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const checks: Record<string, { status: string; latencyMs?: number }> = {};
  let overallStatus: 'healthy' | 'unhealthy' = 'healthy';

  // Database check
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'up', latencyMs: Date.now() - dbStart };
  } catch {
    checks.database = { status: 'down' };
    overallStatus = 'unhealthy';
  }

  const response = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checks,
  };

  return NextResponse.json(response, {
    status: overallStatus === 'healthy' ? 200 : 503,
  });
}

export const dynamic = 'force-dynamic';
