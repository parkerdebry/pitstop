export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: 'Not configured' }, { status: 400 });
  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature') ?? '';
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const event = stripe.webhooks.constructEvent(rawBody, sig, secret);
    console.log('[webhook]', event.type);
  } catch {
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
  return NextResponse.json({ received: true });
}
