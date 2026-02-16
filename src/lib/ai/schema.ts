import { z } from 'zod';

export const aiAnalysisSchema = z.object({
  summary: z.string().min(1),
  contentCoverage: z.object({
    score: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    rationale: z.string().min(1),
  }),
  facilitationQuality: z.object({
    score: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    rationale: z.string().min(1),
  }),
  protocolSafety: z.object({
    score: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    rationale: z.string().min(1),
  }),
  risk: z.object({
    flag: z.union([z.literal('SAFE'), z.literal('RISK')]),
    quote: z.string().nullable(),
    rationale: z.string().min(1),
  }),
});

export type AIAnalysisPayload = z.infer<typeof aiAnalysisSchema>;

// Minimal JSON schema for OpenAI response_format enforcement.
export const aiAnalysisJsonSchema = {
  name: 'shamiri_session_analysis',
  schema: {
    type: 'object',
    properties: {
      summary: { type: 'string' },
      contentCoverage: {
        type: 'object',
        properties: {
          score: { type: 'integer', enum: [1, 2, 3] },
          rationale: { type: 'string' },
        },
        required: ['score', 'rationale'],
      },
      facilitationQuality: {
        type: 'object',
        properties: {
          score: { type: 'integer', enum: [1, 2, 3] },
          rationale: { type: 'string' },
        },
        required: ['score', 'rationale'],
      },
      protocolSafety: {
        type: 'object',
        properties: {
          score: { type: 'integer', enum: [1, 2, 3] },
          rationale: { type: 'string' },
        },
        required: ['score', 'rationale'],
      },
      risk: {
        type: 'object',
        properties: {
          flag: { type: 'string', enum: ['SAFE', 'RISK'] },
          quote: { type: ['string', 'null'] },
          rationale: { type: 'string' },
        },
        required: ['flag', 'quote', 'rationale'],
      },
    },
    required: ['summary', 'contentCoverage', 'facilitationQuality', 'protocolSafety', 'risk'],
    additionalProperties: false,
  },
  strict: true,
} as const;

