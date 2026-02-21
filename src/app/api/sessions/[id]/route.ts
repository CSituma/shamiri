import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

async function getCurrentSupervisorId() {
  const supervisor = await prisma.supervisor.findFirst();
  return supervisor?.id ?? null;
}

export async function GET(_req: NextRequest, ctx: Params) {
  try {
    const { id } = await ctx.params;
    const supervisorId = await getCurrentSupervisorId();
    if (!supervisorId) {
      return NextResponse.json({ error: 'Supervisor not found' }, { status: 404 });
    }

    const session = await prisma.session.findFirst({
      where: {
        id,
        supervisorId,
      },
      include: {
        fellow: true,
        group: true,
        aiAnalysis: true,
        supervisorReview: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: session.id,
      fellowName: session.fellow.name,
      groupCode: session.group.code,
      completedAt: session.completedAt,
      status: session.status,
      transcript: session.transcript,
      aiAnalysis: session.aiAnalysis,
      supervisorReview: session.supervisorReview,
    });
  } catch (error) {
    console.error('Error fetching session detail', error);
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}

