import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Simple in-memory rate limiter (use Redis/Upstash for production multi-instance)
const usage = new Map<string, { count: number; resetAt: number }>();
const FREE_LIMIT = 5;
const PRO_LIMIT  = 500;

function rateLimit(ip: string, tier: string) {
  const limit = tier === 'pro' ? PRO_LIMIT : FREE_LIMIT;
  const now   = Date.now();
  const key   = `${ip}:${tier}`;
  const rec   = usage.get(key);
  if (!rec || now > rec.resetAt) {
    usage.set(key, { count: 1, resetAt: now + 86_400_000 });
    return { allowed: true, remaining: limit - 1 };
  }
  if (rec.count >= limit) return { allowed: false, remaining: 0 };
  rec.count++;
  return { allowed: true, remaining: limit - rec.count };
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI Mechanic not configured. Add ANTHROPIC_API_KEY to .env.local.' }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.messages?.length) {
    return NextResponse.json({ error: 'Missing messages' }, { status: 400 });
  }

  const { vehicle, messages, tier = 'free' } = body;
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
  const { allowed, remaining } = rateLimit(ip, tier);

  if (!allowed) {
    return NextResponse.json({
      error: tier === 'free'
        ? `Free plan limit reached (${FREE_LIMIT}/day). Upgrade to Pro for unlimited questions.`
        : 'Rate limit reached. Please wait before sending more messages.',
    }, { status: 429 });
  }

  // Build system prompt from vehicle context
  const {
    year = '', make = '', model = '', trim = '',
    value = 0, unit = 'mi', useHours = false, type = 'vehicle',
  } = vehicle ?? {};

  const system = `You are PitStop Mechanic — an expert automotive AI.

VEHICLE: ${year} ${make} ${model}${trim ? ' ' + trim : ''} (${type})
${useHours ? `Engine hours: ${Number(value).toLocaleString()} hr` : `Mileage: ${Number(value).toLocaleString()} mi`}
${useHours ? 'This vehicle is tracked in engine hours, not miles.' : ''}

YOUR ROLE:
• Answer questions about this specific vehicle
• Be concise — 100–150 words max
• Always include: Difficulty (Easy/Medium/Hard), time estimate, and 1–2 part recommendations with brand names and price ranges
• For dirt bikes: reference engine hours, chain wear, piston/top-end intervals
• For boats: reference impeller, zincs, gear oil, engine hours
• If it's a safety issue, lead with that clearly
• Use **bold** for key terms

Never make up part numbers or prices you're unsure about. When in doubt, recommend a professional inspection.`;

  const validMessages = messages
    .filter((m: { role: string; content: string }) => m.role && typeof m.content === 'string')
    .map((m: { role: string; content: string }) => ({
      role:    m.role === 'user' ? 'user' as const : 'assistant' as const,
      content: m.content.slice(0, 2000),
    }));

  try {
    const client   = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 600,
      system,
      messages:   validMessages,
    });

    const reply = (response.content ?? [])
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('');

    return NextResponse.json({ message: reply, remaining, usage: { inputTokens: response.usage?.input_tokens, outputTokens: response.usage?.output_tokens } });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status === 429) return NextResponse.json({ error: 'Anthropic rate limit. Try again shortly.' }, { status: 429 });
    if (e.status === 401) return NextResponse.json({ error: 'Invalid Anthropic API key.' }, { status: 500 });
    console.error('[mechanic]', e.message);
    return NextResponse.json({ error: 'AI Mechanic unavailable. Please try again.' }, { status: 500 });
  }
}
