import { EmailSubscription } from '@prisma/client';

export type SubscriptionResponse = {
  email: string;
  subscribedAt: Date;
};
