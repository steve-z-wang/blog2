import { z } from 'zod';

export const createCommentSchema = z.object({
  postId: z.number().int().positive(),
  parentId: z.number().int().positive().optional(),
  authorName: z.string().min(1).max(100),
  content: z.string().min(1).max(2000),
});

export const getCommentsParamSchema = z.object({
  slug: z.string(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type GetCommentsParam = z.infer<typeof getCommentsParamSchema>;
