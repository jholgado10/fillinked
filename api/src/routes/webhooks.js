import { Router } from 'express';
import { stripe } from '../lib/stripe.js';
import { supabase } from '../lib/supabase.js';
import { logger } from '../lib/logger.js';
import { pushNotificationQueue } from '../jobs/pushNotification.js';

const router = Router();

// POST /webhooks/stripe
router.post('/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.warn({ err }, 'Stripe webhook signature verification failed');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);
      const userId = stripeSubscription.metadata.user_id;
      const planType = stripeSubscription.metadata.plan_type;

      const { error } = await supabase.from('subscriptions').insert({
        user_id: userId,
        plan_type: planType,
        stripe_subscription_id: stripeSubscription.id,
        stripe_customer_id: session.customer,
        status: stripeSubscription.status,
        current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
      });
      if (error) logger.error({ error }, 'Failed to persist new subscription');
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const { data: subscription } = await supabase
        .from('subscriptions')
        .update({ status: 'past_due' })
        .eq('stripe_subscription_id', invoice.subscription)
        .select('user_id')
        .single();

      if (subscription) {
        await pushNotificationQueue.add('push', {
          userId: subscription.user_id,
          type: 'billing',
          title: 'Payment failed',
          body: 'Your subscription payment failed. Please update your billing details.',
          deepLink: 'fillinked://subscription',
        });
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const stripeSubscription = event.data.object;
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', stripeSubscription.id);
      break;
    }
    default:
      logger.info({ type: event.type }, 'Unhandled Stripe event');
  }

  res.json({ received: true });
});

export default router;
