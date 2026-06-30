import { stripe } from '../lib/stripe.js';
import { supabase } from '../lib/supabase.js';

const PRICE_MAP = {
  agency_basic: process.env.STRIPE_PRICE_AGENCY_BASIC,
  agency_pro: process.env.STRIPE_PRICE_AGENCY_PRO,
  hospital: process.env.STRIPE_PRICE_HOSPITAL,
  premium_family: process.env.STRIPE_PRICE_FAMILY,
};

export async function createCheckoutSession(userId, email, planType) {
  const priceId = PRICE_MAP[planType];
  if (!priceId) throw new Error(`Unknown plan: ${planType}`);

  const { data: user } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  let customerId = user?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({ email, metadata: { user_id: userId } });
    customerId = customer.id;
    await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', userId);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.ALLOWED_ORIGINS?.split(',')[0]}/subscription/success`,
    cancel_url: `${process.env.ALLOWED_ORIGINS?.split(',')[0]}/subscription/cancel`,
  });

  return session.url;
}
