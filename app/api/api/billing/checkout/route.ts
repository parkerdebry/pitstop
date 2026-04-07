export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured.' }, { status: 503 });
  }
  const body = await req.json().catch(() => ({})) as { userEmail?: string; plan?: string };
  const { userEmail, plan = 'annual' } = body;
  if (!userEmail) return NextResponse.json({ error: 'Missing userEmail' }, { status: 400 });

  const priceId = plan === 'monthly' ? process.env.STRIPE_PRICE_MONTHLY : process.env.STRIPE_PRICE_ANNUAL;
  if (!priceId) return NextResponse.json({ error: `STRIPE_PRICE_${plan.toUpperCase()} not set` }, { status: 500 });

  try {
    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}?billing_success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
      metadata: { userEmail, plan },
    });
    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
