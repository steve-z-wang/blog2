import { prisma } from '../../shared/prisma';
import { ConflictError, NotFoundError } from '../../shared/errors';
import { SubscribeInput, UnsubscribeInput } from './subscriptions.validator';
import { SubscriptionResponse } from './subscriptions.types';

export class SubscriptionsService {
  async subscribe(data: SubscribeInput): Promise<SubscriptionResponse> {
    // Check if already subscribed
    const existing = await prisma.emailSubscription.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictError('Email is already subscribed');
    }

    const subscription = await prisma.emailSubscription.create({
      data: {
        email: data.email,
      },
    });

    return {
      email: subscription.email,
      subscribedAt: subscription.subscribedAt,
    };
  }

  async unsubscribe(data: UnsubscribeInput): Promise<void> {
    const existing = await prisma.emailSubscription.findUnique({
      where: { email: data.email },
    });

    if (!existing) {
      throw new NotFoundError('Email subscription not found');
    }

    await prisma.emailSubscription.delete({
      where: { email: data.email },
    });
  }

  async getAllSubscriptions(): Promise<SubscriptionResponse[]> {
    const subscriptions = await prisma.emailSubscription.findMany({
      orderBy: { subscribedAt: 'desc' },
    });

    return subscriptions.map(sub => ({
      email: sub.email,
      subscribedAt: sub.subscribedAt,
    }));
  }
}
