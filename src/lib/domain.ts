import { z } from 'zod';

export const experienceSchema = z.object({
  id: z.string(), title: z.string().trim().min(1).max(120), context: z.string().max(4000),
  role: z.string().max(2000), constraints: z.string().max(2000), decision: z.string().max(4000), result: z.string().max(2000),
});
export type Experience = z.infer<typeof experienceSchema>;
export const contextSchema = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('technology'), questionId: z.string(), version: z.number().int().positive(), title: z.string(), question: z.string() }),
  z.object({ mode: z.literal('experience'), title: z.string(), question: z.string(), experience: experienceSchema }),
]);
export type Context = z.infer<typeof contextSchema>;
export const observationSchema = z.object({
  kind: z.enum(['strength', 'gap', 'check']), answer: z.union([z.literal(1), z.literal(2)]),
  quote: z.string().min(1), observation: z.string().min(1), action: z.string().min(1), sourceIds: z.array(z.string()),
});
export const feedbackSchema = z.object({ communication: z.array(observationSchema).max(3), technical: z.array(observationSchema).max(3) });
export type Feedback = z.infer<typeof feedbackSchema>;
export const stageSchema = z.enum(['answering', 'ready-follow-up', 'answering-follow-up', 'ready-feedback', 'complete']);
export const sessionSchema = z.object({
  id: z.string(), createdAt: z.string(), context: contextSchema, demo: z.boolean(), stage: stageSchema,
  answer1: z.string().max(12000), answer2: z.string().max(12000), followUp: z.string().nullable(), feedback: feedbackSchema.nullable(),
});
export type Session = z.infer<typeof sessionSchema>;
export type Operation = 'follow-up' | 'feedback';
