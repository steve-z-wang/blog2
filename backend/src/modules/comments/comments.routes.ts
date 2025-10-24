import { Router } from 'express';
import { CommentsService } from './comments.service';
import { validate, validateParams } from '../../shared/middleware/validate';
import { createCommentSchema, getCommentsParamSchema } from './comments.validator';

const router = Router();
const commentsService = new CommentsService();

// Get comments for a post
router.get('/posts/:slug/comments', validateParams(getCommentsParamSchema), async (req, res, next) => {
  try {
    const comments = await commentsService.getCommentsByPostSlug(req.params.slug);
    res.json({ comments });
  } catch (error) {
    next(error);
  }
});

// Create a new comment
router.post('/', validate(createCommentSchema), async (req, res, next) => {
  try {
    const comment = await commentsService.createComment(req.body);
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
});

export default router;
