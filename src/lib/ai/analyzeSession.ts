import Groq from 'groq-sdk';
import { prisma } from '../db';
import { Prisma } from '../../generated/prisma/client';
import { aiAnalysisSchema, AIAnalysisPayload } from './schema';
import { shamiriSystemPrompt } from './prompt';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export class AIAnalysisError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = 'AIAnalysisError';
  }
}

export async function analyzeSessionTranscript(sessionId: string): Promise<AIAnalysisPayload> {
  if (!process.env.GROQ_API_KEY) {
    throw new AIAnalysisError('GROQ_API_KEY is not configured');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new AIAnalysisError('Session not found');
  }

  const transcript = session.transcript;

  const completion = await groq.chat.completions.create({
    // Use a current Groq-supported Llama 3 model
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: shamiriSystemPrompt },
      {
        role: 'user',
        content: `Here is the transcript of the session:\n\n${transcript}`,
      },
    ],
    // Groq does not yet support OpenAI's json_schema response_format,
    // so we instruct the model via the prompt to return ONLY valid JSON
    // and then enforce the structure with Zod.
    temperature: 0.1,
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new AIAnalysisError('Empty response from AI model', completion);
  }

  let parsed: unknown;
  try {
    // Some models may wrap JSON in markdown fences like ```json ... ```.
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new AIAnalysisError('Failed to parse AI response as JSON', { err, raw });
  }

  const result = aiAnalysisSchema.safeParse(parsed);
  if (!result.success) {
    throw new AIAnalysisError('AI response failed schema validation', {
      issues: result.error.issues,
      raw,
    });
  }

  const payload = result.data;
  const rawModelResponse = parsed as Prisma.InputJsonValue;

  // Persist analysis to the database.
  await prisma.aIAnalysis.upsert({
    where: { sessionId: session.id },
    update: {
      summary: payload.summary,
      contentCoverageScore: payload.contentCoverage.score,
      contentCoverageRationale: payload.contentCoverage.rationale,
      facilitationScore: payload.facilitationQuality.score,
      facilitationRationale: payload.facilitationQuality.rationale,
      protocolSafetyScore: payload.protocolSafety.score,
      protocolSafetyRationale: payload.protocolSafety.rationale,
      riskFlag: payload.risk.flag,
      riskQuote: payload.risk.quote ?? undefined,
      riskRationale: payload.risk.rationale,
      rawModelResponse,
    },
    create: {
      sessionId: session.id,
      summary: payload.summary,
      contentCoverageScore: payload.contentCoverage.score,
      contentCoverageRationale: payload.contentCoverage.rationale,
      facilitationScore: payload.facilitationQuality.score,
      facilitationRationale: payload.facilitationQuality.rationale,
      protocolSafetyScore: payload.protocolSafety.score,
      protocolSafetyRationale: payload.protocolSafety.rationale,
      riskFlag: payload.risk.flag,
      riskQuote: payload.risk.quote ?? undefined,
      riskRationale: payload.risk.rationale,
      rawModelResponse,
    },
  });

  await prisma.session.update({
    where: { id: session.id },
    data: {
      status: payload.risk.flag === 'RISK' ? 'RISK' : 'PROCESSED',
    },
  });

  return payload;
}

