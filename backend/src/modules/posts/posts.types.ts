import { Post, Tag, Comment } from '@prisma/client';

export type PostWithTags = Post & {
  tags: {
    tag: Tag;
  }[];
};

export type PostWithDetails = Post & {
  tags: {
    tag: Tag;
  }[];
  _count: {
    comments: number;
  };
};

export type PostListItem = {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  publishedAt: Date;
  tags: string[];
  commentCount: number;
};

export type PostDetail = {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  content: string;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
};
