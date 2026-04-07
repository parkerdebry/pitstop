import { NextRequest, NextResponse } from 'next/server';

// In production: replace with your database (Supabase, PlanetScale, etc.)
// Token store is module-level — persists across requests in the same serverless instance
export const tokenStore = new Map<string, { accessToken: string; refreshToken: string; expiresAt: Date }>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get('code');
  const error = searchParams.get('error');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  if (error) return NextResponse.redirect(`${appUrl}?smartcar_error=${error}`);
  if (!code) return NextResponse.redirect(`${appUrl}?smartcar_error=missing_code`);

  if (!process.env.SMARTCAR_CLIENT_ID) {
    return NextResponse.redirect(`${appUrl}?smartcar_error=not_configured`);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const smartcar = require('smartcar');
    const client   = new smartcar.AuthClient({
      clientId:     process.env.SMARTCAR_CLIENT_ID,
      clientSecret: process.env.SMARTCAR_CLIENT_SECRET,
      redirectUri:  process.env.SMARTCAR_REDIRECT_URI,
      mode:         process.env.NODE_ENV === 'production' ? 'live' : 'simulated',
    });

    const tokens = await client.exchangeCode(code);
    const { vehicles: vehicleIds } = await smartcar.getVehicles(tokens.accessToken);

    const vehicleData = [];
    for (const smartcarId of vehicleIds) {
      const vehicle = new smartcar.Vehicle(smartcarId, tokens.accessToken);
      tokenStore.set(smartcarId, { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, expiresAt: tokens.expiration });

      const [info, vin, odometer, fuel, battery] = await Promise.allSettled([
        vehicle.attributes(), vehicle.vin(), vehicle.odometer(), vehicle.fuel(), vehicle.battery(),
      ]);

      vehicleData.push({
        smartcarId,
        make:           (info as PromiseFulfilledResult<{ make: string }>).value?.make,
        model:          (info as PromiseFulfilledResult<{ model: string }>).value?.model,
        year:           (info as PromiseFulfilledResult<{ year: number }>).value?.year,
        vin:            (vin  as PromiseFulfilledResult<{ vin: string }>).value?.vin,
        mileage:        odometer.status === 'fulfilled' ? Math.round((odometer.value as { distance: number }).distance * 0.621371) : null,
        fuelPercent:    fuel.status    === 'fulfilled' && (fuel.value as { percentRemaining: number }).percentRemaining != null ? Math.round((fuel.value as { percentRemaining: number }).percentRemaining * 100) : null,
        batteryPercent: battery.status === 'fulfilled' && (battery.value as { percentRemaining: number }).percentRemaining != null ? Math.round((battery.value as { percentRemaining: number }).percentRemaining * 100) : null,
        connected: true,
      });
    }

    const encoded = encodeURIComponent(JSON.stringify(vehicleData));
    return NextResponse.redirect(`${appUrl}?smartcar_connected=true&vehicles=${encoded}`);
  } catch (err) {
    console.error('[smartcar callback]', err);
    return NextResponse.redirect(`${appUrl}?smartcar_error=token_exchange_failed`);
  }
}
