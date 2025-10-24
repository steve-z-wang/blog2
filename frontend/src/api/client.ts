// Type-safe API client for the blog backend
// Types will be generated from OpenAPI spec

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export class APIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'APIError';
  }
}

async function fetchJSON<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: response.statusText };
    }
    throw new APIError(response.status, response.statusText, errorData);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Posts API
export const postsAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    tag?: string;
    search?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.tag) query.set('tag', params.tag);
    if (params?.search) query.set('search', params.search);

    const queryString = query.toString();
    return fetchJSON<{
      posts: Array<{
        id: number;
        slug: string;
        title: string;
        summary: string | null;
        publishedAt: string;
        tags: string[];
        commentCount: number;
      }>;
      total: number;
    }>(`/posts${queryString ? `?${queryString}` : ''}`);
  },

  getBySlug: (slug: string) =>
    fetchJSON<{
      id: number;
      slug: string;
      title: string;
      summary: string | null;
      content: string;
      publishedAt: string;
      createdAt: string;
      updatedAt: string;
      tags: string[];
    }>(`/posts/${slug}`),

  getTags: () =>
    fetchJSON<{ tags: string[] }>('/posts/tags'),

  create: (data: {
    slug: string;
    title: string;
    summary?: string;
    content: string;
    tags?: string[];
  }) =>
    fetchJSON(`/posts/internal/posts`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (slug: string, data: Partial<{
    slug: string;
    title: string;
    summary: string;
    content: string;
    tags: string[];
  }>) =>
    fetchJSON(`/posts/internal/posts/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (slug: string) =>
    fetchJSON(`/posts/internal/posts/${slug}`, {
      method: 'DELETE',
    }),
};

// Comments API
export const commentsAPI = {
  getByPostSlug: (slug: string) =>
    fetchJSON<{
      comments: Array<{
        id: number;
        postId: number;
        parentId: number | null;
        authorName: string;
        content: string;
        createdAt: string;
        replies: any[];
      }>;
    }>(`/comments/posts/${slug}/comments`),

  create: (data: {
    postId: number;
    parentId?: number;
    authorName: string;
    content: string;
  }) =>
    fetchJSON(`/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Subscriptions API
export const subscriptionsAPI = {
  subscribe: (email: string) =>
    fetchJSON(`/subscriptions`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  unsubscribe: (email: string) =>
    fetchJSON(`/subscriptions`, {
      method: 'DELETE',
      body: JSON.stringify({ email }),
    }),
};

// Export a combined API object
export const api = {
  posts: postsAPI,
  comments: commentsAPI,
  subscriptions: subscriptionsAPI,
};
