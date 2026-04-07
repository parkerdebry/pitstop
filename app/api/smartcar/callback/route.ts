export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  if (!code) return NextResponse.redirect(`${appUrl}?smartcar_error=missing_code`);
  if (!process.env.SMARTCAR_CLIENT_ID) return NextResponse.redirect(`${appUrl}?smartcar_error=not_configured`);
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const smartcar = require('smartcar');
    const client = new smartcar.AuthClient({
      clientId: process.env.SMARTCAR_CLIENT_ID,
      clientSecret: process.env.SMARTCAR_CLIENT_SECRET,
      redirectUri: process.env.SMARTCAR_REDIRECT_URI,
      mode: 'live',
    });
    const tokens = await client.exchangeCode(code);
    const { vehicles: ids } = await smartcar.getVehicles(tokens.accessToken);
    const data = ids.map((id: string) => ({ smartcarId: id, connected: true }));
    return NextResponse.redirect(`${appUrl}?smartcar_connected=true&vehicles=${encodeURIComponent(JSON.stringify(data))}`);
  } catch {
    return NextResponse.redirect(`${appUrl}?smartcar_error=failed`);
  }
}
