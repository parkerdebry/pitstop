export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const connectUrl = `${appUrl}/connect`;

  if (!code) return NextResponse.redirect(`${connectUrl}?smartcar_error=missing_code`);
  if (!process.env.SMARTCAR_CLIENT_ID) return NextResponse.redirect(`${connectUrl}?smartcar_error=not_configured`);

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const smartcar = require('smartcar');
    const client = new smartcar.AuthClient({
      clientId: process.env.SMARTCAR_CLIENT_ID,
      clientSecret: process.env.SMARTCAR_CLIENT_SECRET,
      redirectUri: process.env.SMARTCAR_REDIRECT_URI,
      mode: process.env.NODE_ENV === 'production' ? 'live' : 'simulated',
    });
    const tokens = await client.exchangeCode(code);
    const { vehicles: ids } = await smartcar.getVehicles(tokens.accessToken);

    // Fetch vehicle info for each connected vehicle
    const vehicleDetails = await Promise.all(
      ids.map(async (id: string) => {
        try {
          const vehicle = new smartcar.Vehicle(id, tokens.accessToken);
          const [info, odo] = await Promise.allSettled([vehicle.attributes(), vehicle.odometer()]);
          return {
            smartcarId: id,
            make: info.status === 'fulfilled' ? (info.value as { make: string }).make : null,
            model: info.status === 'fulfilled' ? (info.value as { model: string }).model : null,
            year: info.status === 'fulfilled' ? String((info.value as { year: number }).year) : null,
            mileage: odo.status === 'fulfilled' ? Math.round((odo.value as { distance: number }).distance * 0.621371) : null,
          };
        } catch {
          return { smartcarId: id, make: null, model: null, year: null, mileage: null };
        }
      })
    );

    const payload = encodeURIComponent(JSON.stringify(vehicleDetails));
    const tokenParam = encodeURIComponent(tokens.accessToken);
    return NextResponse.redirect(`${connectUrl}?smartcar_connected=true&vehicles=${payload}&token=${tokenParam}`);
  } catch {
    return NextResponse.redirect(`${connectUrl}?smartcar_error=failed`);
  }
}
