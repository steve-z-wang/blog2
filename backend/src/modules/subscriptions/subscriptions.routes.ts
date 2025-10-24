import { Router } from 'express';
import { SubscriptionsService } from './subscriptions.service';
import { validate } from '../../shared/middleware/validate';
import { subscribeSchema, unsubscribeSchema } from './subscriptions.validator';

const router = Router();
const subscriptionsService = new SubscriptionsService();

// Subscribe to newsletter
router.post('/', validate(subscribeSchema), async (req, res, next) => {
  try {
    const subscription = await subscriptionsService.subscribe(req.body);
    res.status(201).json(subscription);
  } catch (error) {
    next(error);
  }
});

// Unsubscribe from newsletter
router.delete('/', validate(unsubscribeSchema), async (req, res, next) => {
  try {
    await subscriptionsService.unsubscribe(req.body);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Get all subscriptions (internal route - should be protected in production)
router.get('/internal/subscriptions', async (req, res, next) => {
  try {
    const subscriptions = await subscriptionsService.getAllSubscriptions();
    res.json({ subscriptions });
  } catch (error) {
    next(error);
  }
});

export default router;
