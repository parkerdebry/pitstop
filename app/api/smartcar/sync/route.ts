import { NextRequest, NextResponse } from 'next/server';
import { tokenStore } from '../callback/route';

export async function POST(req: NextRequest) {
  if (!process.env.SMARTCAR_CLIENT_ID) {
    return NextResponse.json({ error: 'SmartCar not configured.' }, { status: 503 });
  }

  const { smartcarId } = await req.json().catch(() => ({})) as { smartcarId?: string };
  if (!smartcarId) return NextResponse.json({ error: 'Missing smartcarId' }, { status: 400 });

  const stored = tokenStore.get(smartcarId);
  if (!stored) return NextResponse.json({ error: 'Vehicle not connected. Re-authenticate via SmartCar.' }, { status: 404 });

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const smartcar = require('smartcar');
    let accessToken = stored.accessToken;

    // Refresh if expired
    if (new Date() > new Date(stored.expiresAt)) {
      const client = new smartcar.AuthClient({
        clientId:     process.env.SMARTCAR_CLIENT_ID,
        clientSecret: process.env.SMARTCAR_CLIENT_SECRET,
        redirectUri:  process.env.SMARTCAR_REDIRECT_URI,
        mode:         'live',
      });
      const refreshed = await client.exchangeRefreshToken(stored.refreshToken);
      accessToken = refreshed.accessToken;
      tokenStore.set(smartcarId, { accessToken, refreshToken: refreshed.refreshToken, expiresAt: refreshed.expiration });
    }

    const vehicle = new smartcar.Vehicle(smartcarId, accessToken);
    const [odometer, fuel, battery, engineOil, tires] = await Promise.allSettled([
      vehicle.odometer(), vehicle.fuel(), vehicle.battery(), vehicle.engineOil(), vehicle.tirePressure(),
    ]);

    return NextResponse.json({
      smartcarId,
      syncedAt:      new Date().toISOString(),
      mileage:       odometer.status === 'fulfilled' ? Math.round((odometer.value as { distance: number }).distance * 0.621371) : null,
      fuelPercent:   fuel.status     === 'fulfilled' && (fuel.value as { percentRemaining: number }).percentRemaining != null ? Math.round((fuel.value as { percentRemaining: number }).percentRemaining * 100) : null,
      batteryPercent:battery.status  === 'fulfilled' && (battery.value as { percentRemaining: number }).percentRemaining != null ? Math.round((battery.value as { percentRemaining: number }).percentRemaining * 100) : null,
      engineOilLife: engineOil.status === 'fulfilled' && (engineOil.value as { lifeRemaining: number }).lifeRemaining != null ? Math.round((engineOil.value as { lifeRemaining: number }).lifeRemaining * 100) : null,
      tirePressure:  tires.status === 'fulfilled' ? tires.value : null,
    });
  } catch (err: unknown) {
    console.error('[smartcar sync]', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
