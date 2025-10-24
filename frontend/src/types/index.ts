// Type definitions for the blog frontend
// These match the backend API responses

export interface Comment {
  id: number;
  postId: number;
  parentId: number | null;
  authorName: string;
  content: string;
  createdAt: string;
  replies: Comment[];
  children?: Comment[]; // alias for compatibility
}

export interface Post {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  content?: string;
  publishedAt: string;
  createdAt?: string;
  updatedAt?: string;
  tags: string[];
  comments?: Comment[];
  commentCount?: number;
}

// API Request/Response types
export interface ListPostsResponse {
  posts: Post[];
  total: number;
}

export interface GetPostResponse extends Post {}

export interface CreateCommentRequest {
  postId: number;
  parentId?: number | null;
  authorName: string;
  content: string;
}

export interface CreateCommentResponse extends Comment {}

export interface SubscribeRequest {
  email: string;
}

export interface SubscribeResponse {
  email: string;
  subscribedAt: string;
}
