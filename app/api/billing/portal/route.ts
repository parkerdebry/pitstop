import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Stripe not configured. Add STRIPE_SECRET_KEY to your environment variables.' },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({})) as { userEmail?: string };
  const { userEmail } = body;
  if (!userEmail) return NextResponse.json({ error: 'Missing userEmail' }, { status: 400 });

  try {
    const Stripe = (await import('stripe').catch(() => null))?.default;
    if (!Stripe) return NextResponse.json({ error: 'Stripe SDK not installed. Run: npm install stripe' }, { status: 503 });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // List customers by email to find their ID
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    if (!customers.data.length) {
      return NextResponse.json({ error: 'No billing account found for this email.' }, { status: 404 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer:   customers.data[0].id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error('[billing portal]', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
