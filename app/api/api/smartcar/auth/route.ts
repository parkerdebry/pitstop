export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

export async function GET() {
  if (!process.env.SMARTCAR_CLIENT_ID) {
    return NextResponse.json({ error: 'SmartCar not configured.' }, { status: 503 });
  }
  try {
    const smartcar = require('smartcar');
    const client = new smartcar.AuthClient({
      clientId: process.env.SMARTCAR_CLIENT_ID,
      clientSecret: process.env.SMARTCAR_CLIENT_SECRET,
      redirectUri: process.env.SMARTCAR_REDIRECT_URI,
      mode: process.env.NODE_ENV === 'production' ? 'live' : 'simulated',
    });
    const authUrl = client.getAuthUrl(['read_vehicle_info','read_odometer','read_fuel','read_battery','read_vin']);
    return NextResponse.json({ url: authUrl });
  } catch (err) {
    return NextResponse.json({ error: 'SmartCar auth failed' }, { status: 500 });
  }
}
