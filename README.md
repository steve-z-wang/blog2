# Blog V2

Modern blog platform built with Express, Prisma, PostgreSQL, and React.

## Architecture

- **Backend**: Express.js + Prisma + PostgreSQL
- **Frontend**: React 19 + Vite + Tailwind CSS
- **Database**: PostgreSQL (local via Docker)
- **Type Safety**: Auto-generated types from OpenAPI spec

## Project Structure

```
blog2/
├── backend/          # Express API server
├── frontend/         # React frontend
├── docker-compose.yml
└── PLAN.md          # Architecture documentation
```

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- npm or yarn

### 1. Start PostgreSQL

```bash
docker-compose up -d
```

### 2. Set up Backend

```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env

# Run database migrations
npm run prisma:migrate:dev

# Seed the database with sample data
npm run prisma:seed

# Start the backend server
npm run dev
```

Backend will run on http://localhost:5000

### 3. Set up Frontend

```bash
cd frontend
npm install

# Start the frontend dev server
npm run dev
```

Frontend will run on http://localhost:5173

## Available Scripts

### Backend

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:migrate:dev` - Run database migrations
- `npm run prisma:seed` - Seed database with sample data
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run generate:openapi` - Generate OpenAPI specification

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run generate:types` - Generate TypeScript types from OpenAPI spec

## API Endpoints

### Posts
- `GET /api/posts` - Get all posts (with pagination, search, filtering)
- `GET /api/posts/:slug` - Get post by slug
- `GET /api/posts/tags` - Get all tags
- `POST /api/posts/internal/posts` - Create new post (internal)
- `PUT /api/posts/internal/posts/:slug` - Update post (internal)
- `DELETE /api/posts/internal/posts/:slug` - Delete post (internal)

### Comments
- `GET /api/comments/posts/:slug/comments` - Get comments for a post
- `POST /api/comments` - Create a comment

### Subscriptions
- `POST /api/subscriptions` - Subscribe to newsletter
- `DELETE /api/subscriptions` - Unsubscribe from newsletter

## Database Schema

### Models

- **Post**: Blog posts with slug, title, content, and timestamps
- **Tag**: Tags for categorizing posts
- **TagPost**: Many-to-many relationship between posts and tags
- **Comment**: Nested comments with threading support
- **EmailSubscription**: Newsletter subscriptions

## Development Workflow

1. Make backend changes
2. Generate OpenAPI spec: `cd backend && npm run generate:openapi`
3. Generate frontend types: `cd frontend && npm run generate:types`
4. Frontend now has type-safe API calls!

## Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://blog_user:blog_password@localhost:5432/blog_db?schema=public"
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## Prisma Studio

To explore and manage your database visually:

```bash
cd backend
npm run prisma:studio
```

This opens a web interface at http://localhost:5555

## Next Steps

See [PLAN.md](./PLAN.md) for:
- Full architecture documentation
- AWS deployment strategy (Phase 2)
- CI/CD pipeline setup
- Migration from blog-v1
