import * as fs from 'fs';
import * as path from 'path';

// Simple OpenAPI specification generator
// In a production app, you'd use zod-to-openapi or similar libraries

const openAPISpec = {
  openapi: '3.0.0',
  info: {
    title: 'Blog API',
    version: '1.0.0',
    description: 'API for the blog application',
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Local development server',
    },
  ],
  paths: {
    '/posts': {
      get: {
        summary: 'Get all posts',
        tags: ['Posts'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10 },
          },
          {
            name: 'tag',
            in: 'query',
            schema: { type: 'string' },
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'List of posts',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    posts: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/PostListItem' },
                    },
                    total: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/posts/tags': {
      get: {
        summary: 'Get all tags',
        tags: ['Posts'],
        responses: {
          '200': {
            description: 'List of tags',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    tags: {
                      type: 'array',
                      items: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/posts/{slug}': {
      get: {
        summary: 'Get post by slug',
        tags: ['Posts'],
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Post details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PostDetail' },
              },
            },
          },
          '404': {
            description: 'Post not found',
          },
        },
      },
    },
    '/posts/internal/posts': {
      post: {
        summary: 'Create a new post',
        tags: ['Posts'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePost' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Post created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PostDetail' },
              },
            },
          },
        },
      },
    },
    '/posts/internal/posts/{slug}': {
      put: {
        summary: 'Update a post',
        tags: ['Posts'],
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdatePost' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Post updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PostDetail' },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete a post',
        tags: ['Posts'],
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '204': {
            description: 'Post deleted',
          },
        },
      },
    },
    '/comments/posts/{slug}/comments': {
      get: {
        summary: 'Get comments for a post',
        tags: ['Comments'],
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'List of comments',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    comments: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Comment' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/comments': {
      post: {
        summary: 'Create a comment',
        tags: ['Comments'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateComment' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Comment created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Comment' },
              },
            },
          },
        },
      },
    },
    '/subscriptions': {
      post: {
        summary: 'Subscribe to newsletter',
        tags: ['Subscriptions'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Subscribe' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Subscribed successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Subscription' },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Unsubscribe from newsletter',
        tags: ['Subscriptions'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Unsubscribe' },
            },
          },
        },
        responses: {
          '204': {
            description: 'Unsubscribed successfully',
          },
        },
      },
    },
  },
  components: {
    schemas: {
      PostListItem: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          slug: { type: 'string' },
          title: { type: 'string' },
          summary: { type: 'string', nullable: true },
          publishedAt: { type: 'string', format: 'date-time' },
          tags: { type: 'array', items: { type: 'string' } },
          commentCount: { type: 'integer' },
        },
      },
      PostDetail: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          slug: { type: 'string' },
          title: { type: 'string' },
          summary: { type: 'string', nullable: true },
          content: { type: 'string' },
          publishedAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          tags: { type: 'array', items: { type: 'string' } },
        },
      },
      CreatePost: {
        type: 'object',
        required: ['slug', 'title', 'content'],
        properties: {
          slug: { type: 'string' },
          title: { type: 'string' },
          summary: { type: 'string' },
          content: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
        },
      },
      UpdatePost: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
          title: { type: 'string' },
          summary: { type: 'string' },
          content: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
        },
      },
      Comment: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          postId: { type: 'integer' },
          parentId: { type: 'integer', nullable: true },
          authorName: { type: 'string' },
          content: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          replies: {
            type: 'array',
            items: { $ref: '#/components/schemas/Comment' },
          },
        },
      },
      CreateComment: {
        type: 'object',
        required: ['postId', 'authorName', 'content'],
        properties: {
          postId: { type: 'integer' },
          parentId: { type: 'integer' },
          authorName: { type: 'string' },
          content: { type: 'string' },
        },
      },
      Subscription: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          subscribedAt: { type: 'string', format: 'date-time' },
        },
      },
      Subscribe: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
        },
      },
      Unsubscribe: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
        },
      },
    },
  },
};

const outputPath = path.join(__dirname, '../../openapi.yaml');
const yamlContent = `# OpenAPI 3.0 Specification for Blog API
# Generated automatically - do not edit manually

${JSON.stringify(openAPISpec, null, 2)
  .replace(/"/g, '')
  .replace(/,\n/g, '\n')}
`;

// Write JSON version (easier to work with)
const jsonOutputPath = path.join(__dirname, '../../openapi.json');
fs.writeFileSync(jsonOutputPath, JSON.stringify(openAPISpec, null, 2));

console.log('OpenAPI specification generated successfully!');
console.log('Output:', jsonOutputPath);
