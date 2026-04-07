export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  if (!process.env.SMARTCAR_CLIENT_ID) {
    return NextResponse.json({ error: 'SmartCar not configured.' }, { status: 503 });
  }
  const { smartcarId, accessToken } = await req.json().catch(() => ({})) as { smartcarId?: string; accessToken?: string };
  if (!smartcarId || !accessToken) return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const smartcar = require('smartcar');
    const vehicle = new smartcar.Vehicle(smartcarId, accessToken);
    const [odometer, fuel, battery] = await Promise.allSettled([vehicle.odometer(), vehicle.fuel(), vehicle.battery()]);
    return NextResponse.json({
      smartcarId,
      syncedAt: new Date().toISOString(),
      mileage: odometer.status === 'fulfilled' ? Math.round((odometer.value as {distance:number}).distance * 0.621371) : null,
      fuelPercent: fuel.status === 'fulfilled' ? Math.round((fuel.value as {percentRemaining:number}).percentRemaining * 100) : null,
      batteryPercent: battery.status === 'fulfilled' ? Math.round((battery.value as {percentRemaining:number}).percentRemaining * 100) : null,
    });
  } catch {
    return NextResponse.json({ error: 'SmartCar not available. Run: npm install smartcar' }, { status: 503 });
  }
}
