import { z } from 'zod';

export const createPostSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  title: z.string().min(1).max(200),
  summary: z.string().max(500).optional(),
  content: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

export const updatePostSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/).optional(),
  title: z.string().min(1).max(200).optional(),
  summary: z.string().max(500).optional(),
  content: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
});

export const getPostsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
});

export const postSlugParamSchema = z.object({
  slug: z.string(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type GetPostsQuery = z.infer<typeof getPostsQuerySchema>;
export type PostSlugParam = z.infer<typeof postSlugParamSchema>;
