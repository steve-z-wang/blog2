import type { Post, ListPostsResponse, Comment } from "../types";

export async function subscribeByEmail(email: string): Promise<void> {
  const request = { email };
  // Basic email validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error(
      "Invalid email format. Please enter a valid email address."
    );
  }

  const response = await fetch("/api/subscriptions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Subscription failed.");
  }
}

export async function fetchPosts(): Promise<Post[]> {
  const response = await fetch("/api/posts");
  if (!response.ok) throw new Error("Failed to fetch posts");
  
  const data: ListPostsResponse = await response.json();
  return data.posts;
}

export async function getPost(slug: string): Promise<Post> {
  const response = await fetch(`/api/posts/${slug}`);
  if (!response.ok) throw new Error("Failed to fetch post");

  const data = await response.json();
  return data; // Backend returns post directly, not wrapped
}

export async function createComment(
  postId: number, 
  authorName: string,
  content: string,
  parentId: number | null = null
): Promise<Comment> {
  const response = await fetch("/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      postId,
      authorName,
      content,
      parentId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to submit comment");
  }

  const data = await response.json();
  return data; // Backend returns comment directly
}
