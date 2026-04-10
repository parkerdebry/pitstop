import { NextRequest, NextResponse } from 'next/server';

// In production: store subscriptions in Supabase
// For now: in-memory store (resets on redeploy)
const subscriptions = new Map<string, PushSubscriptionJSON[]>();

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.subscription || !body?.userId) {
    return NextResponse.json({ error: 'Missing subscription or userId' }, { status: 400 });
  }

  const { userId, subscription } = body;
  const existing = subscriptions.get(userId) ?? [];

  // Avoid duplicates
  const endpoint = subscription.endpoint;
  if (!existing.find((s: PushSubscriptionJSON) => s.endpoint === endpoint)) {
    existing.push(subscription);
    subscriptions.set(userId, existing);
  }

  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ subscriptions: [] });
  return NextResponse.json({ subscriptions: subscriptions.get(userId) ?? [] });
}

// Export for use by cron route
export { subscriptions };
