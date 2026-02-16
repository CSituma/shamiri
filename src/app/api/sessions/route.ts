import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// For this assignment we use a single mock supervisor.
async function getCurrentSupervisorId() {
  const supervisor = await prisma.supervisor.findFirst();
  return supervisor?.id ?? null;
}

export async function GET() {
  try {
    const supervisorId = await getCurrentSupervisorId();
    if (!supervisorId) {
      return NextResponse.json({ sessions: [] });
    }

    const sessions = await prisma.session.findMany({
      where: { supervisorId },
      include: {
        fellow: true,
        group: true,
        aiAnalysis: true,
        supervisorReview: true,
      },
      orderBy: { completedAt: 'desc' },
    });

    const payload = sessions.map((s) => ({
      id: s.id,
      fellowName: s.fellow.name,
      groupCode: s.group.code,
      completedAt: s.completedAt,
      status: s.status,
      riskFlag: s.aiAnalysis?.riskFlag ?? 'SAFE',
      hasReview: !!s.supervisorReview,
    }));

    return NextResponse.json({ sessions: payload });
  } catch (error) {
    console.error('Error listing sessions', error);
    return NextResponse.json({ error: 'Failed to list sessions' }, { status: 500 });
  }
}

