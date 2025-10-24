import { prisma } from '../../shared/prisma';
import { NotFoundError, BadRequestError } from '../../shared/errors';
import { CreateCommentInput } from './comments.validator';
import { CommentResponse } from './comments.types';

export class CommentsService {
  async getCommentsByPostSlug(postSlug: string): Promise<CommentResponse[]> {
    // First, find the post
    const post = await prisma.post.findUnique({
      where: { slug: postSlug },
    });

    if (!post) {
      throw new NotFoundError(`Post with slug "${postSlug}" not found`);
    }

    // Get all comments for the post
    const comments = await prisma.comment.findMany({
      where: { postId: post.id },
      orderBy: { createdAt: 'asc' },
    });

    // Build nested comment tree
    return this.buildCommentTree(comments);
  }

  async createComment(data: CreateCommentInput): Promise<CommentResponse> {
    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: data.postId },
    });

    if (!post) {
      throw new NotFoundError(`Post with id ${data.postId} not found`);
    }

    // If parentId is provided, verify parent comment exists
    if (data.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: data.parentId },
      });

      if (!parentComment) {
        throw new NotFoundError(`Parent comment with id ${data.parentId} not found`);
      }

      if (parentComment.postId !== data.postId) {
        throw new BadRequestError('Parent comment must belong to the same post');
      }
    }

    const comment = await prisma.comment.create({
      data: {
        postId: data.postId,
        parentId: data.parentId,
        authorName: data.authorName,
        content: data.content,
      },
    });

    return {
      id: comment.id,
      postId: comment.postId,
      parentId: comment.parentId,
      authorName: comment.authorName,
      content: comment.content,
      createdAt: comment.createdAt,
      replies: [],
    };
  }

  private buildCommentTree(comments: any[]): CommentResponse[] {
    const commentMap = new Map<number, CommentResponse>();
    const rootComments: CommentResponse[] = [];

    // First pass: create all comment objects
    comments.forEach(comment => {
      commentMap.set(comment.id, {
        id: comment.id,
        postId: comment.postId,
        parentId: comment.parentId,
        authorName: comment.authorName,
        content: comment.content,
        createdAt: comment.createdAt,
        replies: [],
      });
    });

    // Second pass: build the tree structure
    comments.forEach(comment => {
      const commentObj = commentMap.get(comment.id)!;
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(commentObj);
        }
      } else {
        rootComments.push(commentObj);
      }
    });

    return rootComments;
  }
}
