import { NextRequest, NextResponse } from 'next/server';
import { analyzeSessionTranscript, AIAnalysisError } from '@/lib/ai/analyzeSession';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_req: NextRequest, ctx: Params) {
  try {
    const { id } = await ctx.params;
    const analysis = await analyzeSessionTranscript(id);
    return NextResponse.json({ analysis });
  } catch (error) {
    if (error instanceof AIAnalysisError) {
      console.error('AI analysis error', error);
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 },
      );
    }

    console.error('Unexpected error during AI analysis', error);
    return NextResponse.json({ error: 'Failed to analyze session' }, { status: 500 });
  }
}

