export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const make = req.nextUrl.searchParams.get('make') ?? undefined;

  if (!process.env.SMARTCAR_CLIENT_ID) {
    return NextResponse.json({ configured: false }, { status: 200 });
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const smartcar = require('smartcar');
    const client = new smartcar.AuthClient({
      clientId: process.env.SMARTCAR_CLIENT_ID,
      clientSecret: process.env.SMARTCAR_CLIENT_SECRET,
      redirectUri: process.env.SMARTCAR_REDIRECT_URI,
      mode: process.env.NODE_ENV === 'production' ? 'live' : 'simulated',
    });
    const opts: Record<string, unknown> = {
      scope: ['read_vehicle_info','read_odometer','read_fuel','read_battery','read_vin'],
    };
    if (make) opts.makeBypass = make;
    const authUrl = client.getAuthUrl(opts.scope as string[], { forcePrompt: true, ...(make ? { makeBypass: make } : {}) });
    return NextResponse.json({ configured: true, url: authUrl });
  } catch {
    return NextResponse.json({ configured: false }, { status: 200 });
  }
}
