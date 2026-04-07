import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET not configured' }, { status: 400 });
  }

  const rawBody = await req.text();
  const sig     = req.headers.get('stripe-signature') ?? '';

  try {
    const Stripe = (await import('stripe').catch(() => null))?.default;
    if (!Stripe) return NextResponse.json({ error: 'Stripe not installed' }, { status: 503 });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const event  = stripe.webhooks.constructEvent(rawBody, sig, secret);

    console.log('[webhook]', event.type);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        // Handle in production by updating your database
        console.log('[webhook] handled:', event.type);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error('[webhook] error:', err);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }

  return NextResponse.json({ received: true });
}
