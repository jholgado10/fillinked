import { Router } from 'express';
import { stripe } from '../lib/stripe.js';
import { logger } from '../lib/logger.js';

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
    case 'checkout.session.completed':
      // TODO: insert subscriptions row, update user permissions
      break;
    case 'invoice.payment_failed':
      // TODO: update subscription status to past_due, notify user
      break;
    case 'customer.subscription.deleted':
      // TODO: update subscription status to canceled, downgrade access
      break;
    default:
      logger.info({ type: event.type }, 'Unhandled Stripe event');
  }

  res.json({ received: true });
});

export default router;
