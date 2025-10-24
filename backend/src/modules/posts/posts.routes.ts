import { Router } from 'express';
import { PostsService } from './posts.service';
import { validate, validateQuery, validateParams } from '../../shared/middleware/validate';
import {
  createPostSchema,
  updatePostSchema,
  getPostsQuerySchema,
  postSlugParamSchema,
} from './posts.validator';

const router = Router();
const postsService = new PostsService();

// Public routes
router.get('/', validateQuery(getPostsQuerySchema), async (req, res, next) => {
  try {
    const result = await postsService.getPosts(req.query as any);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/tags', async (req, res, next) => {
  try {
    const tags = await postsService.getAllTags();
    res.json({ tags });
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', validateParams(postSlugParamSchema), async (req, res, next) => {
  try {
    const post = await postsService.getPostBySlug(req.params.slug);
    res.json(post);
  } catch (error) {
    next(error);
  }
});

// Internal routes (should be protected in production)
router.post('/internal/posts', validate(createPostSchema), async (req, res, next) => {
  try {
    const post = await postsService.createPost(req.body);
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
});

router.put(
  '/internal/posts/:slug',
  validateParams(postSlugParamSchema),
  validate(updatePostSchema),
  async (req, res, next) => {
    try {
      const post = await postsService.updatePost(req.params.slug, req.body);
      res.json(post);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/internal/posts/:slug', validateParams(postSlugParamSchema), async (req, res, next) => {
  try {
    await postsService.deletePost(req.params.slug);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
