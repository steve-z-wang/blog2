import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create tags
  const reactTag = await prisma.tag.upsert({
    where: { name: 'React' },
    update: {},
    create: { name: 'React' },
  });

  const typescriptTag = await prisma.tag.upsert({
    where: { name: 'TypeScript' },
    update: {},
    create: { name: 'TypeScript' },
  });

  const webdevTag = await prisma.tag.upsert({
    where: { name: 'Web Development' },
    update: {},
    create: { name: 'Web Development' },
  });

  console.log('Tags created:', { reactTag, typescriptTag, webdevTag });

  // Create sample posts
  const post1 = await prisma.post.upsert({
    where: { slug: 'welcome-to-my-blog' },
    update: {},
    create: {
      slug: 'welcome-to-my-blog',
      title: 'Welcome to My Blog',
      summary: 'Introduction to this blog and what to expect',
      content: `# Welcome to My Blog

This is my personal blog where I share my thoughts on web development, technology, and programming.

## What to Expect

- Technical articles about React, TypeScript, and modern web development
- Personal projects and experiments
- Lessons learned from building software

Stay tuned for more content!`,
      tags: {
        create: [
          { tag: { connect: { id: reactTag.id } } },
          { tag: { connect: { id: webdevTag.id } } },
        ],
      },
    },
  });

  const post2 = await prisma.post.upsert({
    where: { slug: 'getting-started-with-typescript' },
    update: {},
    create: {
      slug: 'getting-started-with-typescript',
      title: 'Getting Started with TypeScript',
      summary: 'A beginner-friendly guide to TypeScript',
      content: `# Getting Started with TypeScript

TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.

## Why TypeScript?

1. **Type Safety**: Catch errors at compile time
2. **Better IDE Support**: Autocomplete and refactoring
3. **Improved Maintainability**: Self-documenting code

## Installation

\`\`\`bash
npm install -g typescript
\`\`\`

Let's dive in!`,
      tags: {
        create: [
          { tag: { connect: { id: typescriptTag.id } } },
          { tag: { connect: { id: webdevTag.id } } },
        ],
      },
    },
  });

  console.log('Posts created:', { post1, post2 });

  // Create sample comments
  const comment1 = await prisma.comment.create({
    data: {
      postId: post1.id,
      authorName: 'John Doe',
      content: 'Great introduction! Looking forward to more posts.',
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      postId: post1.id,
      parentId: comment1.id,
      authorName: 'Blog Author',
      content: 'Thanks John! More content coming soon.',
    },
  });

  console.log('Comments created:', { comment1, comment2 });

  // Create sample email subscription
  const subscription = await prisma.emailSubscription.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: { email: 'test@example.com' },
  });

  console.log('Email subscription created:', subscription);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
