import { z } from 'zod';

export const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const unsubscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type UnsubscribeInput = z.infer<typeof unsubscribeSchema>;
