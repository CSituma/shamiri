import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(req: NextRequest, ctx: Params) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const { finalStatus, note } = body as {
      finalStatus: 'SAFE' | 'RISK' | 'NEEDS_DISCUSSION';
      note?: string;
    };

    if (!finalStatus) {
      return NextResponse.json({ error: 'finalStatus is required' }, { status: 400 });
    }

    const supervisor = await prisma.supervisor.findFirst();
    if (!supervisor) {
      return NextResponse.json({ error: 'Supervisor not found' }, { status: 404 });
    }

    const session = await prisma.session.findFirst({
      where: {
        id,
        supervisorId: supervisor.id,
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const decision = session.status === 'RISK' && finalStatus === 'RISK' ? 'VALIDATED' : 'OVERRIDDEN';

    const review = await prisma.supervisorReview.upsert({
      where: { sessionId: session.id },
      update: {
        finalStatus,
        decision,
        note,
        supervisorId: supervisor.id,
      },
      create: {
        sessionId: session.id,
        supervisorId: supervisor.id,
        finalStatus,
        decision,
        note,
      },
    });

    await prisma.session.update({
      where: { id: session.id },
      data: {
        status: finalStatus,
      },
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error saving supervisor review', error);
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 });
  }
}

