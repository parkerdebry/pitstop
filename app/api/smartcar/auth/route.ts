import { NextResponse } from 'next/server';

export async function GET() {
  if (!process.env.SMARTCAR_CLIENT_ID) {
    return NextResponse.json(
      { error: 'SmartCar not configured. Add SMARTCAR_CLIENT_ID to your environment variables.' },
      { status: 503 }
    );
  }

  try {
    const smartcar = await import('smartcar').catch(() => null);
    if (!smartcar) {
      return NextResponse.json({ error: 'SmartCar SDK not installed. Run: npm install smartcar' }, { status: 503 });
    }

    const client = new smartcar.AuthClient({
      clientId:     process.env.SMARTCAR_CLIENT_ID,
      clientSecret: process.env.SMARTCAR_CLIENT_SECRET,
      redirectUri:  process.env.SMARTCAR_REDIRECT_URI,
      mode:         process.env.NODE_ENV === 'production' ? 'live' : 'simulated',
    });

    const authUrl = client.getAuthUrl([
      'read_vehicle_info', 'read_odometer', 'read_fuel',
      'read_battery', 'read_charge', 'read_engine_oil',
      'read_tires', 'read_vin',
    ]);

    return NextResponse.json({ url: authUrl });
  } catch (err) {
    console.error('[smartcar auth]', err);
    return NextResponse.json({ error: 'SmartCar auth failed' }, { status: 500 });
  }
}
