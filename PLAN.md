# Blog V2 Architecture Plan

## Overview

This document outlines the plan to rebuild the blog platform with a more scalable, production-grade architecture using PostgreSQL, Prisma, and modern development practices. **Local development first, cloud deployment later.**

---

## Current State (blog-v1)

### Technology Stack
- **Backend**: Node.js + Express + SQLite + Knex.js
- **Frontend**: React 19 + Vite + Tailwind CSS
- **Database**: SQLite (file-based)
- **Deployment**: Docker + Docker Compose (simple VPS)
- **Type Sharing**: Zod schemas in `packages/common`

### Limitations
- SQLite doesn't scale well for high-traffic scenarios
- Manual type coordination between backend and frontend
- Simple deployment without proper infrastructure
- No automated CI/CD pipeline
- Tightly coupled monolithic backend

---

## Goals & Motivation

### Primary Goals
1. **Content-Heavy Blog**: Build for frequent writing with lots of posts
2. **Scalable Database**: PostgreSQL for better performance and features
3. **Type Safety**: Automatic type generation from backend to frontend
4. **Modular Design**: Clean separation of concerns (posts, comments, subscriptions)
5. **Local-First Development**: Get everything working locally before cloud deployment
6. **Production Infrastructure**: AWS setup for later (Phase 2)

### Why This Matters
- **PostgreSQL**: Full-text search, better query performance, proper indexing
- **Prisma**: Excellent DX, type-safe queries, migration system, Prisma Studio
- **Code Generation**: Single source of truth for API contracts
- **Modular Architecture**: Easier to maintain and extend

---

## New Architecture (blog2)

### Technology Stack

#### Backend
- **Framework**: Express.js (familiar, proven, vast ecosystem)
- **Database**: PostgreSQL (Local Docker → AWS RDS later)
- **ORM**: Prisma (type-safe, excellent migrations)
- **Validation**: Zod (runtime validation)
- **API Documentation**: OpenAPI/Swagger
- **Logging**: Winston
- **Security**: Helmet, CORS, rate limiting

#### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **API Types**: Auto-generated from OpenAPI spec
- **API Client**: Type-safe fetch wrapper (generated)

#### Infrastructure (Phase 1: Local)
- **Database**: PostgreSQL via Docker Compose
- **Backend**: Node.js + Express (localhost:5000)
- **Frontend**: Vite dev server (localhost:5173)

#### Infrastructure (Phase 2: AWS - Later)
- **Database**: AWS RDS (PostgreSQL)
- **Backend Hosting**: AWS ECS (Docker containers) + ECR
- **Load Balancer**: Application Load Balancer (ALB)
- **Frontend Hosting**: S3 + CloudFront (CDN)
- **DNS**: Route 53
- **HTTPS**: AWS Certificate Manager (ACM)
- **IaC**: Terraform

#### DevOps (Phase 2 - Later)
- **CI/CD**: GitHub Actions
- **Containerization**: Docker

---

## Project Structure

```
blog2/                                (NEW repo/folder - fresh start)
├── .gitignore
├── README.md
├── PLAN.md                           (this file)
├── docker-compose.yml                (PostgreSQL for local dev)
│
├── backend/                          (NEW - Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma             (Database schema)
│   │   ├── migrations/               (Version-controlled migrations)
│   │   └── seed.ts                   (Seed data)
│   ├── src/
│   │   ├── modules/                  (Feature modules)
│   │   │   ├── posts/
│   │   │   │   ├── posts.routes.ts
│   │   │   │   ├── posts.service.ts
│   │   │   │   ├── posts.types.ts
│   │   │   │   └── posts.validator.ts
│   │   │   ├── comments/
│   │   │   │   ├── comments.routes.ts
│   │   │   │   ├── comments.service.ts
│   │   │   │   ├── comments.types.ts
│   │   │   │   └── comments.validator.ts
│   │   │   └── subscriptions/
│   │   │       ├── subscriptions.routes.ts
│   │   │       ├── subscriptions.service.ts
│   │   │       ├── subscriptions.types.ts
│   │   │       └── subscriptions.validator.ts
│   │   ├── shared/                   (Shared utilities)
│   │   │   ├── prisma.ts            (Prisma client singleton)
│   │   │   ├── logger.ts            (Winston logger)
│   │   │   ├── errors.ts            (Custom error classes)
│   │   │   └── middleware/
│   │   │       ├── error-handler.ts
│   │   │       ├── request-logger.ts
│   │   │       └── validate.ts
│   │   ├── config/
│   │   │   └── env.ts               (Environment variables)
│   │   └── index.ts                 (Express app entry)
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── openapi.yaml                 (Generated API spec)
│
└── frontend/                         (Copied from blog-v1)
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── api/
    │   │   └── generated/           (Auto-generated from backend)
    │   │       ├── types.ts         (TypeScript types)
    │   │       └── client.ts        (Type-safe API client)
    │   ├── hooks/
    │   ├── styles/
    │   └── main.tsx
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.json
```

---

## Modular Architecture Design

### Module Structure
Each module follows a consistent pattern:

```typescript
modules/
└── {module-name}/
    ├── {module}.routes.ts      // Express routes
    ├── {module}.service.ts     // Business logic
    ├── {module}.types.ts       // TypeScript types
    └── {module}.validator.ts   // Zod schemas
```

### Modules

#### 1. Posts Module
- **Routes**: GET /posts, GET /posts/:slug, POST /internal/posts, PUT /internal/posts/:slug, DELETE /internal/posts/:slug
- **Responsibilities**: Post CRUD, tag management, markdown rendering
- **Database Tables**: posts, tags, tag_posts

#### 2. Comments Module
- **Routes**: GET /posts/:slug/comments, POST /comments
- **Responsibilities**: Nested comments, comment threading
- **Database Tables**: comments

#### 3. Subscriptions Module
- **Routes**: POST /subscribe, DELETE /unsubscribe
- **Responsibilities**: Email subscription management
- **Database Tables**: email_subscriptions

---

## Code Generation Pipeline

### Flow
```
Backend (Express + Zod schemas)
    ↓
Generate OpenAPI Specification
    ↓
openapi-typescript-codegen
    ↓
Frontend (TypeScript types + API client)
```

### Implementation

#### Backend: Generate OpenAPI Spec
```typescript
// backend/src/index.ts
import { generateOpenAPISpec } from './openapi-generator';

// Generate spec on build
generateOpenAPISpec('./openapi.yaml');
```

#### Frontend: Generate Types
```bash
# frontend/package.json scripts
"generate:types": "openapi-typescript ../backend/openapi.yaml -o ./src/api/generated/types.ts"
```

#### Usage in Frontend
```typescript
// frontend/src/api/generated/client.ts
import type { paths } from './types';

// Type-safe API calls
const posts = await api.get('/posts'); // Fully typed!
```

---

## Database Schema (Prisma)

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Post {
  id          Int       @id @default(autoincrement())
  slug        String    @unique
  title       String
  summary     String?
  content     String
  publishedAt DateTime  @default(now()) @map("published_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  comments    Comment[]
  tags        TagPost[]

  @@map("posts")
}

model Tag {
  id      Int       @id @default(autoincrement())
  name    String    @unique @map("tag_name")

  posts   TagPost[]

  @@map("tags")
}

model TagPost {
  tagId   Int  @map("tag_id")
  postId  Int  @map("post_id")

  tag     Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)
  post    Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@id([tagId, postId])
  @@map("tag_posts")
}

model Comment {
  id         Int       @id @default(autoincrement())
  postId     Int       @map("post_id")
  parentId   Int?      @map("parent_id")
  authorName String    @map("author_name")
  content    String
  createdAt  DateTime  @default(now()) @map("created_at")

  post       Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  parent     Comment?  @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies    Comment[] @relation("CommentReplies")

  @@map("comments")
}

model EmailSubscription {
  email        String   @id
  subscribedAt DateTime @default(now()) @map("subscribed_at")

  @@map("email_subscriptions")
}
```

---

## Development Workflow

### Local Development (Phase 1 - Current Focus)

#### 1. Start PostgreSQL
```bash
cd blog2
docker-compose up -d  # Starts PostgreSQL locally
```

#### 2. Start Backend
```bash
cd backend
npm install
npm run prisma:migrate:dev  # Run migrations
npm run prisma:seed         # Seed database
npm run dev                 # Start Express on :5000
```

#### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev  # Start Vite on :5173
```

#### 4. Generate Types (when backend changes)
```bash
cd backend
npm run generate:openapi

cd ../frontend
npm run generate:types
```

---

## Implementation Plan

### Phase 1: Local Development (CURRENT FOCUS)
- [x] Create blog2/ directory structure
- [ ] Copy frontend from blog-v1
- [ ] Create docker-compose.yml for PostgreSQL
- [ ] Set up backend/ with Express + Prisma
- [ ] Implement Prisma schema
- [ ] Implement posts module
- [ ] Implement comments module
- [ ] Implement subscriptions module
- [ ] Set up OpenAPI generation
- [ ] Update frontend to use generated types
- [ ] Test full stack locally

### Phase 2: AWS Infrastructure (LATER)
- [ ] Create AWS account / configure credentials
- [ ] Set up Terraform for infrastructure
- [ ] Provision RDS PostgreSQL
- [ ] Set up ECS for backend
- [ ] Set up S3 + CloudFront for frontend
- [ ] Configure Route 53 + SSL certificates
- [ ] Set up CI/CD with GitHub Actions
- [ ] Migrate data from SQLite to PostgreSQL
- [ ] Deploy and go live

---

## Next Steps

1. ✅ Update PLAN.md for local-first approach
2. Copy frontend from blog-v1 to blog2/frontend
3. Create docker-compose.yml for PostgreSQL
4. Build backend/ with all modules
5. Test everything locally
6. Worry about AWS later

---

**Last Updated**: 2025-10-24
**Status**: Phase 1 - Local Development
**Current Focus**: Building core functionality locally before cloud deployment
