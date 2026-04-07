export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured.' }, { status: 503 });
  }
  const body = await req.json().catch(() => ({})) as { userEmail?: string };
  const { userEmail } = body;
  if (!userEmail) return NextResponse.json({ error: 'Missing userEmail' }, { status: 400 });
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    if (!customers.data.length) return NextResponse.json({ error: 'No billing account found.' }, { status: 404 });
    const session = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    });
    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: 'Stripe not available. Run: npm install stripe' }, { status: 503 });
  }
}
