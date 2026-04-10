import { NextRequest, NextResponse } from 'next/server';

// This route is called by Vercel Cron daily at 8am UTC
// vercel.json defines: { "crons": [{ "path": "/api/cron/recalls", "schedule": "0 8 * * *" }] }

interface StoredVehicle {
  userId:    string;
  vehicleId: number;
  year:      string;
  make:      string;
  model:     string;
  knownRecalls: string[]; // NHTSA campaign numbers we've already notified about
}

// In production: store in Supabase. For now: in-memory.
const vehicleStore = new Map<string, StoredVehicle[]>(); // userId -> vehicles
const recallCache  = new Map<string, string[]>();        // `year-make-model` -> campaign numbers

export async function GET(req: NextRequest) {
  // Verify cron secret so only Vercel can call this
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: { userId: string; vehicle: string; newRecalls: number }[] = [];

  for (const [userId, vehicles] of vehicleStore.entries()) {
    for (const v of vehicles) {
      try {
        const key = `${v.year}-${v.make}-${v.model}`.toLowerCase();
        const res  = await fetch(
          `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(v.make)}&model=${encodeURIComponent(v.model)}&modelYear=${v.year}`,
          { next: { revalidate: 0 } }
        );
        const data = await res.json();
        const campaigns: string[] = (data.results ?? [])
          .map((r: { NHTSACampaignNumber?: string }) => r.NHTSACampaignNumber)
          .filter(Boolean);

        const known    = v.knownRecalls ?? [];
        const newOnes  = campaigns.filter(c => !known.includes(c));

        if (newOnes.length > 0) {
          // Update known recalls
          v.knownRecalls = campaigns;

          // Send push notification
          await sendPushNotification(userId, {
            title: `⚠️ New recall on your ${v.year} ${v.make} ${v.model}`,
            body:  `${newOnes.length} new safety recall${newOnes.length > 1 ? 's' : ''} found. Tap to view details.`,
            url:   `/vehicle/${v.vehicleId}/recalls`,
          });

          results.push({ userId, vehicle: `${v.year} ${v.make} ${v.model}`, newRecalls: newOnes.length });
        }

        recallCache.set(key, campaigns);
      } catch (err) {
        console.error(`[cron/recalls] Error checking ${v.year} ${v.make} ${v.model}:`, err);
      }
    }
  }

  console.log('[cron/recalls] Checked', vehicleStore.size, 'users, found', results.length, 'new recalls');
  return NextResponse.json({ checked: vehicleStore.size, newRecalls: results });
}

// Register a vehicle for recall monitoring
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.userId || !body?.vehicle) {
    return NextResponse.json({ error: 'Missing userId or vehicle' }, { status: 400 });
  }

  const { userId, vehicle } = body;
  const existing = vehicleStore.get(userId) ?? [];

  // Update or add
  const idx = existing.findIndex(v => v.vehicleId === vehicle.vehicleId);
  if (idx >= 0) existing[idx] = { ...existing[idx], ...vehicle };
  else existing.push({ ...vehicle, knownRecalls: vehicle.knownRecalls ?? [] });

  vehicleStore.set(userId, existing);
  return NextResponse.json({ success: true });
}

// ── Push notification sender ──────────────────────────────────────────
async function sendPushNotification(
  userId: string,
  payload: { title: string; body: string; url: string }
) {
  if (!process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_PUBLIC_KEY) {
    console.warn('[push] VAPID keys not configured — skipping push notification');
    return;
  }

  try {
    // Dynamic import of web-push
    const webpush = require('web-push');
    webpush.setVapidDetails(
      'mailto:' + (process.env.VAPID_EMAIL ?? 'admin@pitstop.app'),
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    // Get subscriptions for this user
    const res  = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/push/subscribe?userId=${userId}`);
    const data = await res.json();
    const subs = data.subscriptions ?? [];

    for (const sub of subs) {
      try {
        await webpush.sendNotification(sub, JSON.stringify(payload));
      } catch (err) {
        console.warn('[push] Failed to send to subscription:', err);
      }
    }
  } catch (err) {
    console.error('[push] Error sending notification:', err);
  }
}
