import { prisma } from '../../shared/prisma';
import { NotFoundError, ConflictError } from '../../shared/errors';
import { CreatePostInput, UpdatePostInput, GetPostsQuery } from './posts.validator';
import { PostListItem, PostDetail } from './posts.types';

export class PostsService {
  async getPosts(query: GetPostsQuery): Promise<{ posts: PostListItem[]; total: number }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.tag) {
      where.tags = {
        some: {
          tag: {
            name: query.tag,
          },
        },
      };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: { comments: true },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    return {
      posts: posts.map(post => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        summary: post.summary,
        publishedAt: post.publishedAt,
        tags: post.tags.map(t => t.tag.name),
        commentCount: post._count.comments,
      })),
      total,
    };
  }

  async getPostBySlug(slug: string): Promise<PostDetail> {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundError(`Post with slug "${slug}" not found`);
    }

    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      summary: post.summary,
      content: post.content,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      tags: post.tags.map(t => t.tag.name),
    };
  }

  async createPost(data: CreatePostInput): Promise<PostDetail> {
    // Check if slug already exists
    const existing = await prisma.post.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new ConflictError(`Post with slug "${data.slug}" already exists`);
    }

    // Create or connect tags
    const tagConnections = await Promise.all(
      (data.tags || []).map(async (tagName) => {
        let tag = await prisma.tag.findUnique({ where: { name: tagName } });
        if (!tag) {
          tag = await prisma.tag.create({ data: { name: tagName } });
        }
        return { tag: { connect: { id: tag.id } } };
      })
    );

    const post = await prisma.post.create({
      data: {
        slug: data.slug,
        title: data.title,
        summary: data.summary,
        content: data.content,
        tags: {
          create: tagConnections,
        },
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      summary: post.summary,
      content: post.content,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      tags: post.tags.map(t => t.tag.name),
    };
  }

  async updatePost(slug: string, data: UpdatePostInput): Promise<PostDetail> {
    const existing = await prisma.post.findUnique({
      where: { slug },
    });

    if (!existing) {
      throw new NotFoundError(`Post with slug "${slug}" not found`);
    }

    // If slug is being changed, check for conflicts
    if (data.slug && data.slug !== slug) {
      const conflict = await prisma.post.findUnique({
        where: { slug: data.slug },
      });
      if (conflict) {
        throw new ConflictError(`Post with slug "${data.slug}" already exists`);
      }
    }

    // Handle tags if provided
    let tagConnections;
    if (data.tags) {
      tagConnections = await Promise.all(
        data.tags.map(async (tagName) => {
          let tag = await prisma.tag.findUnique({ where: { name: tagName } });
          if (!tag) {
            tag = await prisma.tag.create({ data: { name: tagName } });
          }
          return { tag: { connect: { id: tag.id } } };
        })
      );
    }

    const post = await prisma.post.update({
      where: { slug },
      data: {
        ...(data.slug && { slug: data.slug }),
        ...(data.title && { title: data.title }),
        ...(data.summary !== undefined && { summary: data.summary }),
        ...(data.content && { content: data.content }),
        ...(tagConnections && {
          tags: {
            deleteMany: {},
            create: tagConnections,
          },
        }),
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      summary: post.summary,
      content: post.content,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      tags: post.tags.map(t => t.tag.name),
    };
  }

  async deletePost(slug: string): Promise<void> {
    const post = await prisma.post.findUnique({
      where: { slug },
    });

    if (!post) {
      throw new NotFoundError(`Post with slug "${slug}" not found`);
    }

    await prisma.post.delete({
      where: { slug },
    });
  }

  async getAllTags(): Promise<string[]> {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });

    return tags.map(t => t.name);
  }
}
