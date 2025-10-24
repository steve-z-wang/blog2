import { Comment } from '@prisma/client';

export type CommentWithReplies = Comment & {
  replies: Comment[];
};

export type CommentResponse = {
  id: number;
  postId: number;
  parentId: number | null;
  authorName: string;
  content: string;
  createdAt: Date;
  replies: CommentResponse[];
};
