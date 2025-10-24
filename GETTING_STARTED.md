# Getting Started with Blog V2

## What We've Built

A complete blog platform with:

✅ **Backend (Express + Prisma + PostgreSQL)**
- Modular architecture with Posts, Comments, and Subscriptions modules
- Type-safe database queries with Prisma
- Zod validation for all endpoints
- OpenAPI specification generation
- Winston logging and error handling

✅ **Frontend (React 19 + Vite + Tailwind)**
- Copied from blog-v1 with all existing components
- Type-safe API client ready to use
- OpenAPI type generation configured

✅ **Infrastructure**
- Docker Compose for local PostgreSQL
- Environment configuration
- Database schema and seed data

## Directory Structure

```
blog2/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   ├── seed.ts              # Sample data
│   │   └── migrations/          # Database migrations
│   ├── src/
│   │   ├── modules/             # Feature modules
│   │   │   ├── posts/          # Post CRUD, tags
│   │   │   ├── comments/       # Nested comments
│   │   │   └── subscriptions/  # Email subscriptions
│   │   ├── shared/             # Utilities, middleware
│   │   ├── config/             # Environment config
│   │   └── index.ts            # Express app entry
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                    # Local environment
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts       # Type-safe API client
│   │   │   └── generated/      # Auto-generated types
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   └── ...
│   └── package.json
│
├── docker-compose.yml          # PostgreSQL container
├── PLAN.md                     # Full architecture docs
├── README.md                   # Main documentation
└── GETTING_STARTED.md          # This file
```

## Quick Start (Step by Step)

### 1. Start the Database

```bash
# From blog2/ directory
docker-compose up -d

# Verify it's running
docker ps
```

You should see a container named `blog_postgres` running.

### 2. Set Up the Backend

```bash
cd backend

# Install dependencies
npm install

# The .env file is already created with local settings
# DATABASE_URL=postgresql://blog_user:blog_password@localhost:5432/blog_db

# Generate Prisma client
npm run prisma:generate

# Run migrations to create tables
npm run prisma:migrate:dev

# Seed the database with sample data
npm run prisma:seed

# Start the backend server
npm run dev
```

The backend will start on **http://localhost:5000**

Test it: Open http://localhost:5000/health in your browser

### 3. Set Up the Frontend

```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on **http://localhost:5173**

### 4. Generate Types (Optional - for later)

When you make backend changes and want to regenerate types:

```bash
# In backend directory
npm run generate:openapi

# In frontend directory
npm run generate:types
```

## Testing the API

### Using curl

```bash
# Get all posts
curl http://localhost:5000/api/posts

# Get a specific post
curl http://localhost:5000/api/posts/welcome-to-my-blog

# Get all tags
curl http://localhost:5000/api/posts/tags

# Get comments for a post
curl http://localhost:5000/api/comments/posts/welcome-to-my-blog/comments

# Create a comment
curl -X POST http://localhost:5000/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "postId": 1,
    "authorName": "Test User",
    "content": "Great post!"
  }'

# Subscribe to newsletter
curl -X POST http://localhost:5000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### Using Prisma Studio

To visually explore and edit your database:

```bash
cd backend
npm run prisma:studio
```

Opens at **http://localhost:5555**

## API Endpoints Reference

### Posts
- `GET /api/posts` - List all posts (supports pagination, search, filtering)
- `GET /api/posts/:slug` - Get single post
- `GET /api/posts/tags` - Get all tags
- `POST /api/posts/internal/posts` - Create post
- `PUT /api/posts/internal/posts/:slug` - Update post
- `DELETE /api/posts/internal/posts/:slug` - Delete post

### Comments
- `GET /api/comments/posts/:slug/comments` - Get post comments
- `POST /api/comments` - Create comment

### Subscriptions
- `POST /api/subscriptions` - Subscribe
- `DELETE /api/subscriptions` - Unsubscribe

## Using the API Client in Frontend

```typescript
import { api } from './api/client';

// Get all posts
const { posts, total } = await api.posts.getAll({ page: 1, limit: 10 });

// Get a specific post
const post = await api.posts.getBySlug('welcome-to-my-blog');

// Get comments
const { comments } = await api.comments.getByPostSlug('welcome-to-my-blog');

// Create a comment
await api.comments.create({
  postId: 1,
  authorName: 'John Doe',
  content: 'Great article!',
});

// Subscribe
await api.subscriptions.subscribe('user@example.com');
```

## Troubleshooting

### PostgreSQL won't start
```bash
# Stop and remove existing container
docker-compose down -v

# Start fresh
docker-compose up -d
```

### Backend won't start
```bash
# Check if PostgreSQL is running
docker ps

# Verify .env file exists and has correct DATABASE_URL
cat backend/.env

# Try regenerating Prisma client
cd backend
npm run prisma:generate
```

### Prisma migrations fail
```bash
# Reset database (CAUTION: destroys all data)
cd backend
npx prisma migrate reset

# Or just push schema changes
npx prisma db push
```

### Port already in use
```bash
# Find what's using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

## Next Steps

1. ✅ Everything is set up and running locally
2. Explore the existing frontend from blog-v1
3. Test all API endpoints
4. Start building new features
5. When ready for deployment, see PLAN.md for AWS setup

## Database Schema Overview

- **posts** - Blog posts with slug, title, content, timestamps
- **tags** - Tag names for categorization
- **tag_posts** - Many-to-many: posts ↔ tags
- **comments** - Nested comments with parent/child relationships
- **email_subscriptions** - Newsletter subscriptions

## Sample Data

After running `npm run prisma:seed`, you'll have:
- 2 sample blog posts
- 3 tags (React, TypeScript, Web Development)
- 2 comments (one reply)
- 1 email subscription

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://blog_user:blog_password@localhost:5432/blog_db?schema=public"
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend (optional .env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload
2. **Database GUI**: Use Prisma Studio for visual database management
3. **Logs**: Backend logs all requests with Winston
4. **Type Safety**: Run type generation after backend changes
5. **Testing**: Use curl or Postman to test API endpoints

## Support

- See **README.md** for full documentation
- See **PLAN.md** for architecture details
- Check **backend/src/modules/** for module implementation examples

---

**Happy Coding!** 🚀
