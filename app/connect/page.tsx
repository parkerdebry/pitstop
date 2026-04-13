'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/lib/store';

// ── Brand list ──────────────────────────────────────────────────────
const BRANDS = [
  { name:'Ford',       color:'#003478', emoji:'🔵' },
  { name:'Chevrolet',  color:'#C8A900', emoji:'🟡' },
  { name:'BMW',        color:'#1C69D4', emoji:'⚪' },
  { name:'Kia',        color:'#05141F', emoji:'🚙' },
  { name:'Hyundai',    color:'#002C5F', emoji:'🔵' },
  { name:'Volvo',      color:'#003057', emoji:'⚫' },
  { name:'Audi',       color:'#BB0A30', emoji:'⚫' },
  { name:'Mercedes',   color:'#333',    emoji:'⚫' },
  { name:'Tesla',      color:'#E82127', emoji:'⚡' },
  { name:'Honda',      color:'#CC0000', emoji:'🔴' },
  { name:'Subaru',     color:'#005EB8', emoji:'⭐' },
  { name:'Jeep',       color:'#2E6B3E', emoji:'🟩' },
  { name:'Ram',        color:'#1B1C1D', emoji:'🐏' },
  { name:'Cadillac',   color:'#2A2A2A', emoji:'⚫' },
  { name:'Buick',      color:'#26417A', emoji:'🔵' },
  { name:'GMC',        color:'#CC0000', emoji:'🔴' },
  { name:'Lincoln',    color:'#1A1A1A', emoji:'⚫' },
  { name:'Acura',      color:'#CC0000', emoji:'🔴' },
  { name:'Toyota',     color:'#EB0A1E', emoji:'🔴' },
  { name:'Nissan',     color:'#C3002F', emoji:'🔴' },
  { name:'Mazda',      color:'#910A2B', emoji:'🔴' },
];

// ── Demo flow types ─────────────────────────────────────────────────
type DemoStep = 'select' | 'connecting' | 'found' | 'done';
interface DemoVehicle {
  id: number;
  label: string;
  mileage: number;
  fuelPercent: number | null;
  batteryPercent: number | null;
}

// ── Sync state ──────────────────────────────────────────────────────
interface SyncData {
  vehicleId: number;
  mileage: number | null;
  fuelPercent: number | null;
  batteryPercent: number | null;
  syncedAt: string;
}

export default function ConnectPageWrapper() {
  return (
    <Suspense>
      <ConnectPage />
    </Suspense>
  );
}

function ConnectPage() {
  const vehicles = useStore(s => s.vehicles);
  const updateV  = useStore(s => s.updateVehicle);
  const connected = vehicles.filter(v => v.smartcarId);
  const searchParams = useSearchParams();

  // SmartCar configuration status
  const [smartcarConfigured, setSmartcarConfigured] = useState<boolean | null>(null);

  // Demo flow state
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoBrand, setDemoBrand] = useState('');
  const [demoStep, setDemoStep] = useState<DemoStep>('select');
  const [demoVehicles, setDemoVehicles] = useState<DemoVehicle[]>([]);
  const [selectedDemoVehicle, setSelectedDemoVehicle] = useState<number | null>(null);

  // Sync state for connected vehicles
  const [syncData, setSyncData] = useState<Record<number, SyncData>>({});
  const [syncing, setSyncing] = useState<number | null>(null);

  // Toast
  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  // Check if SmartCar is configured on mount
  useEffect(() => {
    fetch('/api/smartcar/auth')
      .then(r => r.json())
      .then(d => setSmartcarConfigured(d.configured === true))
      .catch(() => setSmartcarConfigured(false));
  }, []);

  // Handle real SmartCar callback params
  const handleCallback = useCallback(() => {
    const isConnected = searchParams.get('smartcar_connected');
    const error = searchParams.get('smartcar_error');
    const vehiclesParam = searchParams.get('vehicles');

    if (error) {
      showToast(`Connection failed: ${error}`);
      // Clean URL
      window.history.replaceState({}, '', '/connect');
      return;
    }

    if (isConnected && vehiclesParam) {
      try {
        const scVehicles = JSON.parse(decodeURIComponent(vehiclesParam)) as Array<{
          smartcarId: string;
          make: string | null;
          model: string | null;
          year: string | null;
          mileage: number | null;
        }>;

        // Try to auto-match SmartCar vehicles to garage vehicles
        for (const scv of scVehicles) {
          const match = vehicles.find(v => {
            if (v.smartcarId) return false; // already connected
            const makeMatch = scv.make && v.make.toLowerCase().includes(scv.make.toLowerCase());
            const yearMatch = scv.year && v.year === scv.year;
            return makeMatch || yearMatch;
          });

          if (match) {
            updateV(match.id, {
              smartcarId: scv.smartcarId,
              ...(scv.mileage ? { mileage: scv.mileage } : {}),
            });
          }
        }

        showToast(`Connected ${scVehicles.length} vehicle${scVehicles.length > 1 ? 's' : ''}!`);
      } catch {
        showToast('Connected! Check your vehicles.');
      }
      // Clean URL
      window.history.replaceState({}, '', '/connect');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    handleCallback();
  }, [handleCallback]);

  // ── Real SmartCar OAuth ─────────────────────────────────────────────
  async function startRealOAuth(make?: string) {
    try {
      const url = make ? `/api/smartcar/auth?make=${encodeURIComponent(make)}` : '/api/smartcar/auth';
      const res = await fetch(url);
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        showToast('SmartCar not configured — using demo mode');
        openDemoFlow(make);
      }
    } catch {
      showToast('Connection error — using demo mode');
      openDemoFlow(make);
    }
  }

  // ── Demo flow ───────────────────────────────────────────────────────
  function openDemoFlow(make?: string) {
    const brand = make ?? '';
    setDemoBrand(brand);
    setDemoStep('select');
    setSelectedDemoVehicle(null);

    // Find matching vehicles in the user's garage
    const matching = vehicles
      .filter(v => !v.smartcarId) // not already connected
      .filter(v => !brand || v.make.toLowerCase().includes(brand.toLowerCase()) || true) // show all, but prefer matching
      .map(v => ({
        id: v.id,
        label: `${v.year} ${v.make} ${v.model}`,
        mileage: v.mileage + Math.floor(Math.random() * 50), // slightly ahead
        fuelPercent: Math.floor(Math.random() * 50) + 40,
        batteryPercent: v.make.toLowerCase() === 'tesla' ? Math.floor(Math.random() * 30) + 60 : null,
      }));

    setDemoVehicles(matching);
    if (matching.length === 1) setSelectedDemoVehicle(matching[0].id);
    setDemoOpen(true);
  }

  function handleBrandClick(brandName: string) {
    if (smartcarConfigured) {
      startRealOAuth(brandName);
    } else {
      openDemoFlow(brandName);
    }
  }

  function handleConnectAll() {
    if (smartcarConfigured) {
      startRealOAuth();
    } else {
      openDemoFlow();
    }
  }

  async function runDemoConnect() {
    if (!selectedDemoVehicle) return;
    setDemoStep('connecting');

    // Simulate connection delay
    await new Promise(r => setTimeout(r, 1500));
    setDemoStep('found');

    // Simulate data fetch delay
    await new Promise(r => setTimeout(r, 1000));

    const dv = demoVehicles.find(v => v.id === selectedDemoVehicle);
    if (dv) {
      const scId = `sc_demo_${Date.now()}_${dv.id}`;
      updateV(dv.id, {
        smartcarId: scId,
        mileage: dv.mileage,
      });

      setSyncData(prev => ({
        ...prev,
        [dv.id]: {
          vehicleId: dv.id,
          mileage: dv.mileage,
          fuelPercent: dv.fuelPercent,
          batteryPercent: dv.batteryPercent,
          syncedAt: new Date().toISOString(),
        },
      }));
    }

    setDemoStep('done');
  }

  function closeDemoFlow() {
    setDemoOpen(false);
    setDemoStep('select');
    setDemoBrand('');
    setSelectedDemoVehicle(null);
  }

  // ── Sync connected vehicle ──────────────────────────────────────────
  async function syncVehicle(vehicleId: number) {
    const v = vehicles.find(x => x.id === vehicleId);
    if (!v || !v.smartcarId) return;

    setSyncing(vehicleId);

    // For demo-connected vehicles, simulate sync
    if (v.smartcarId.startsWith('sc_demo_')) {
      await new Promise(r => setTimeout(r, 1200));
      const newMileage = v.mileage + Math.floor(Math.random() * 15);
      updateV(vehicleId, { mileage: newMileage });
      setSyncData(prev => ({
        ...prev,
        [vehicleId]: {
          vehicleId,
          mileage: newMileage,
          fuelPercent: Math.floor(Math.random() * 50) + 40,
          batteryPercent: v.make.toLowerCase() === 'tesla' ? Math.floor(Math.random() * 30) + 60 : null,
          syncedAt: new Date().toISOString(),
        },
      }));
      setSyncing(null);
      showToast('Synced!');
      return;
    }

    // Real SmartCar sync
    try {
      const res = await fetch('/api/smartcar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smartcarId: v.smartcarId }),
      });
      const data = await res.json();
      if (data.mileage) updateV(vehicleId, { mileage: data.mileage });
      setSyncData(prev => ({
        ...prev,
        [vehicleId]: {
          vehicleId,
          mileage: data.mileage,
          fuelPercent: data.fuelPercent,
          batteryPercent: data.batteryPercent,
          syncedAt: data.syncedAt,
        },
      }));
      showToast('Synced!');
    } catch {
      showToast('Sync failed');
    }
    setSyncing(null);
  }

  // ── Disconnect ──────────────────────────────────────────────────────
  function disconnect(id: number) {
    const v = vehicles.find(x => x.id === id);
    if (!v) return;
    if (confirm(`Disconnect ${v.year} ${v.make} ${v.model}?\nMileage will no longer sync automatically.`)) {
      updateV(id, { smartcarId: null });
      setSyncData(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      showToast('Vehicle disconnected');
    }
  }

  // ── Time ago helper ─────────────────────────────────────────────────
  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60_000) return 'just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return `${Math.floor(diff / 86_400_000)}d ago`;
  }

  return (
    <>
      <div className="ph">
        <Link href="/settings" className="back-btn">←</Link>
        <span className="pt">Connect Vehicle</span>
      </div>

      {/* Features */}
      <div className="card-lg" style={{ padding:'1.25rem', display:'flex', flexDirection:'column', gap:'.875rem' }}>
        <div style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:17, fontWeight:700, color:'var(--text)' }}>Automatic sync via SmartCar</div>
        <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6 }}>Link your manufacturer app and PitStop updates itself — no manual entry, no hardware required.</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {[['🛣','Live odometer','Mileage syncs automatically'],['⛽','Fuel level','Know when running low'],['🔴','Engine codes','Check engine light decoded'],['🔋','Battery & EV range','State of charge & range']].map(([icon,title,sub]) => (
            <div key={title as string} style={{ background:'var(--card)', border:'.5px solid var(--border)', borderRadius:10, padding:'10px 12px' }}>
              <div style={{ fontSize:18, marginBottom:5 }}>{icon}</div>
              <div style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>{title}</div>
              <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{sub}</div>
            </div>
          ))}
        </div>
        <div style={{ background:'rgba(58,127,212,.08)', border:'.5px solid rgba(58,127,212,.2)', borderRadius:9, padding:'10px 12px', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:'var(--blue)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:900, color:'#fff', fontFamily:'var(--font-barlow-condensed)', flexShrink:0 }}>SC</div>
          <div style={{ fontSize:12, color:'var(--text2)', flex:1 }}>Powered by <strong style={{ color:'var(--text)' }}>SmartCar API</strong> — trusted by leading automotive apps</div>
        </div>
      </div>

      {/* Connected vehicles */}
      <div className="sh"><span className="st">Connected vehicles</span></div>
      {connected.length === 0
        ? <div style={{ textAlign:'center', padding:'1.25rem', color:'var(--text3)', fontSize:13, background:'var(--card)', border:'.5px solid var(--border)', borderRadius:12 }}>No vehicles connected yet.<br/>Tap a brand below or use the connect button to get started.</div>
        : <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {connected.map(v => {
              const sd = syncData[v.id];
              const isSyncing = syncing === v.id;
              return (
                <div key={v.id} style={{ background:'var(--card)', border:'.5px solid rgba(59,175,106,.3)', borderRadius:12, padding:'1rem', display:'flex', flexDirection:'column', gap:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <span style={{ fontSize:22 }}>{v.emoji}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>{v.year} {v.make} {v.model}</div>
                      <div style={{ fontSize:11, color:'var(--green)', marginTop:2 }}>● Live{sd ? ` · Synced ${timeAgo(sd.syncedAt)}` : ''}</div>
                    </div>
                    <button className="btn-sm btn-sm-danger" onClick={() => disconnect(v.id)}>Disconnect</button>
                  </div>

                  {/* Sync data display */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:6 }}>
                    <div style={{ background:'var(--bg)', borderRadius:8, padding:'8px 10px', textAlign:'center' }}>
                      <div style={{ fontSize:10, color:'var(--text3)', fontFamily:'var(--font-barlow-condensed)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.5px' }}>Odometer</div>
                      <div style={{ fontSize:15, fontWeight:600, color:'var(--text)', marginTop:2 }}>{(sd?.mileage ?? v.mileage).toLocaleString()}</div>
                      <div style={{ fontSize:10, color:'var(--text3)' }}>mi</div>
                    </div>
                    {(sd?.fuelPercent != null) && (
                      <div style={{ background:'var(--bg)', borderRadius:8, padding:'8px 10px', textAlign:'center' }}>
                        <div style={{ fontSize:10, color:'var(--text3)', fontFamily:'var(--font-barlow-condensed)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.5px' }}>Fuel</div>
                        <div style={{ fontSize:15, fontWeight:600, color: sd.fuelPercent < 20 ? 'var(--red)' : 'var(--text)', marginTop:2 }}>{sd.fuelPercent}%</div>
                        <div style={{ width:'100%', height:3, borderRadius:2, background:'var(--border)', marginTop:4 }}>
                          <div style={{ width:`${sd.fuelPercent}%`, height:'100%', borderRadius:2, background: sd.fuelPercent < 20 ? 'var(--red)' : 'var(--green)' }} />
                        </div>
                      </div>
                    )}
                    {(sd?.batteryPercent != null) && (
                      <div style={{ background:'var(--bg)', borderRadius:8, padding:'8px 10px', textAlign:'center' }}>
                        <div style={{ fontSize:10, color:'var(--text3)', fontFamily:'var(--font-barlow-condensed)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.5px' }}>Battery</div>
                        <div style={{ fontSize:15, fontWeight:600, color:'var(--text)', marginTop:2 }}>{sd.batteryPercent}%</div>
                        <div style={{ width:'100%', height:3, borderRadius:2, background:'var(--border)', marginTop:4 }}>
                          <div style={{ width:`${sd.batteryPercent}%`, height:'100%', borderRadius:2, background:'var(--blue)' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    className="btn-sm"
                    onClick={() => syncVehicle(v.id)}
                    disabled={isSyncing}
                    style={{ alignSelf:'flex-start', opacity: isSyncing ? .6 : 1 }}
                  >
                    {isSyncing ? '↻ Syncing…' : '↻ Sync now'}
                  </button>
                </div>
              );
            })}
          </div>
      }

      {/* Brand grid */}
      <div className="sh"><span className="st">Supported brands</span></div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
        {BRANDS.map(b => {
          const isConnected = vehicles.some(v => v.smartcarId && v.make.toLowerCase() === b.name.toLowerCase());
          return (
            <div key={b.name} onClick={() => !isConnected && handleBrandClick(b.name)} style={{ background:'var(--card)', border:`.5px solid ${isConnected ? 'rgba(59,175,106,.35)' : 'var(--border)'}`, borderRadius:10, padding:'.75rem', display:'flex', flexDirection:'column', alignItems:'center', gap:5, cursor: isConnected ? 'default' : 'pointer', opacity: isConnected ? .8 : 1 }}>
              <div style={{ width:36, height:36, borderRadius:8, background:`${b.color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{b.emoji}</div>
              <div style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:11, fontWeight:700, letterSpacing:'.3px', textTransform:'uppercase', color:'var(--text2)' }}>{b.name}</div>
              <div style={{ fontSize:10, fontWeight:600, fontFamily:'var(--font-barlow-condensed)', color: isConnected ? 'var(--green)' : 'var(--accent)' }}>{isConnected ? '● Live' : 'Connect'}</div>
            </div>
          );
        })}
      </div>

      {/* Connect CTA */}
      <div className="card-lg" style={{ padding:'1.25rem', display:'flex', flexDirection:'column', gap:'.875rem' }}>
        <div style={{ fontSize:14, fontWeight:500, color:'var(--text)' }}>Connect a new vehicle</div>
        <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.55 }}>
          {smartcarConfigured
            ? "You'll be redirected to your manufacturer's login. Your credentials are never shared with PitStop."
            : "Connect your garage vehicles to enable automatic mileage tracking, fuel monitoring, and more."
          }
        </div>
        <button className="btn-blue" onClick={handleConnectAll}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          {smartcarConfigured ? 'Connect via SmartCar' : 'Connect a vehicle'}
        </button>
        <div style={{ fontSize:11, color:'var(--text3)', textAlign:'center' }}>
          {smartcarConfigured
            ? '🔒 OAuth secured · Your login stays with your manufacturer · Disconnect anytime'
            : '🔒 Your data stays on your device · Disconnect anytime'
          }
        </div>
      </div>

      {/* OBD2 alt */}
      <div style={{ background:'var(--card)', border:'.5px solid var(--border)', borderRadius:14, padding:'1rem 1.25rem' }}>
        <div style={{ fontSize:13, fontWeight:500, color:'var(--text)', marginBottom:5 }}>🔌 Don't see your brand?</div>
        <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.6 }}>For unsupported brands, an OBD2 Bluetooth dongle (plugs under the dashboard) works with any 1996+ vehicle. OBD2 support coming soon.</div>
        <button className="btn-sm" onClick={() => showToast("We'll notify you when OBD2 is ready!")} style={{ marginTop:10 }}>Notify me when OBD2 is ready</button>
      </div>

      {/* ── Demo connection modal ───────────────────────────────────── */}
      {demoOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          {/* Backdrop */}
          <div onClick={demoStep === 'connecting' ? undefined : closeDemoFlow} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.7)', backdropFilter:'blur(4px)' }} />

          {/* Modal */}
          <div style={{ position:'relative', width:'100%', maxWidth:380, background:'var(--card)', border:'.5px solid var(--border)', borderRadius:16, padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>

            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:17, fontWeight:700, color:'var(--text)' }}>
                {demoStep === 'done' ? 'Connected!' : demoBrand ? `Connect ${demoBrand}` : 'Connect Vehicle'}
              </div>
              {demoStep !== 'connecting' && (
                <button onClick={closeDemoFlow} style={{ background:'none', border:'none', color:'var(--text3)', fontSize:20, cursor:'pointer', padding:4 }}>×</button>
              )}
            </div>

            {/* Step: Select vehicle */}
            {demoStep === 'select' && (
              <>
                <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.5 }}>
                  Select a vehicle from your garage to connect{demoBrand ? ` to ${demoBrand}` : ''}:
                </div>

                {demoVehicles.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'1.5rem', color:'var(--text3)', fontSize:13 }}>
                    No unconnected vehicles in your garage.<br/>
                    <Link href="/add" style={{ color:'var(--accent)', textDecoration:'none', fontWeight:500 }}>Add a vehicle first →</Link>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {demoVehicles.map(dv => (
                      <div
                        key={dv.id}
                        onClick={() => setSelectedDemoVehicle(dv.id)}
                        style={{
                          background: selectedDemoVehicle === dv.id ? 'rgba(58,127,212,.1)' : 'var(--bg)',
                          border: `.5px solid ${selectedDemoVehicle === dv.id ? 'rgba(58,127,212,.4)' : 'var(--border)'}`,
                          borderRadius:10,
                          padding:'12px 14px',
                          cursor:'pointer',
                          display:'flex',
                          alignItems:'center',
                          gap:10,
                          transition:'all .15s',
                        }}
                      >
                        <div style={{
                          width:20, height:20, borderRadius:10,
                          border: `2px solid ${selectedDemoVehicle === dv.id ? 'var(--blue)' : 'var(--border)'}`,
                          display:'flex', alignItems:'center', justifyContent:'center',
                        }}>
                          {selectedDemoVehicle === dv.id && <div style={{ width:10, height:10, borderRadius:5, background:'var(--blue)' }} />}
                        </div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>{dv.label}</div>
                          <div style={{ fontSize:11, color:'var(--text3)', marginTop:1 }}>{dv.mileage.toLocaleString()} mi</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {demoVehicles.length > 0 && (
                  <button
                    className="btn-blue"
                    onClick={runDemoConnect}
                    disabled={!selectedDemoVehicle}
                    style={{ opacity: selectedDemoVehicle ? 1 : .4, marginTop:4 }}
                  >
                    Connect selected vehicle
                  </button>
                )}
              </>
            )}

            {/* Step: Connecting animation */}
            {demoStep === 'connecting' && (
              <div style={{ textAlign:'center', padding:'2rem 0' }}>
                <div style={{ fontSize:36, marginBottom:12, animation:'spin 1.5s linear infinite' }}>⚙️</div>
                <div style={{ fontSize:14, fontWeight:500, color:'var(--text)' }}>Connecting to {demoBrand || 'vehicle'}…</div>
                <div style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>Authenticating with manufacturer</div>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {/* Step: Found vehicle data */}
            {demoStep === 'found' && (
              <div style={{ textAlign:'center', padding:'1.5rem 0' }}>
                <div style={{ fontSize:36, marginBottom:12 }}>🔍</div>
                <div style={{ fontSize:14, fontWeight:500, color:'var(--text)' }}>Vehicle found!</div>
                <div style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>Fetching live data…</div>
              </div>
            )}

            {/* Step: Done */}
            {demoStep === 'done' && (() => {
              const dv = demoVehicles.find(v => v.id === selectedDemoVehicle);
              return (
                <>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:36, marginBottom:8 }}>✅</div>
                    <div style={{ fontSize:14, fontWeight:500, color:'var(--text)' }}>{dv?.label}</div>
                    <div style={{ fontSize:12, color:'var(--green)', marginTop:4 }}>Successfully connected</div>
                  </div>

                  {dv && (
                    <div style={{ display:'grid', gridTemplateColumns: dv.batteryPercent ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap:8, marginTop:4 }}>
                      <div style={{ background:'var(--bg)', borderRadius:8, padding:'10px', textAlign:'center' }}>
                        <div style={{ fontSize:10, color:'var(--text3)', fontFamily:'var(--font-barlow-condensed)', fontWeight:600, textTransform:'uppercase' }}>Odometer</div>
                        <div style={{ fontSize:16, fontWeight:600, color:'var(--text)', marginTop:4 }}>{dv.mileage.toLocaleString()}</div>
                        <div style={{ fontSize:10, color:'var(--text3)' }}>mi</div>
                      </div>
                      {dv.fuelPercent != null && (
                        <div style={{ background:'var(--bg)', borderRadius:8, padding:'10px', textAlign:'center' }}>
                          <div style={{ fontSize:10, color:'var(--text3)', fontFamily:'var(--font-barlow-condensed)', fontWeight:600, textTransform:'uppercase' }}>Fuel</div>
                          <div style={{ fontSize:16, fontWeight:600, color:'var(--text)', marginTop:4 }}>{dv.fuelPercent}%</div>
                          <div style={{ width:'100%', height:3, borderRadius:2, background:'var(--border)', marginTop:4 }}>
                            <div style={{ width:`${dv.fuelPercent}%`, height:'100%', borderRadius:2, background:'var(--green)' }} />
                          </div>
                        </div>
                      )}
                      {dv.batteryPercent != null && (
                        <div style={{ background:'var(--bg)', borderRadius:8, padding:'10px', textAlign:'center' }}>
                          <div style={{ fontSize:10, color:'var(--text3)', fontFamily:'var(--font-barlow-condensed)', fontWeight:600, textTransform:'uppercase' }}>Battery</div>
                          <div style={{ fontSize:16, fontWeight:600, color:'var(--text)', marginTop:4 }}>{dv.batteryPercent}%</div>
                          <div style={{ width:'100%', height:3, borderRadius:2, background:'var(--border)', marginTop:4 }}>
                            <div style={{ width:`${dv.batteryPercent}%`, height:'100%', borderRadius:2, background:'var(--blue)' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <button className="btn-blue" onClick={closeDemoFlow} style={{ marginTop:4 }}>
                    Done
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Custom toast */}
      {toast && (
        <div style={{
          position:'fixed', bottom:100, left:'50%', transform:'translateX(-50%)',
          background:'var(--card)', border:'.5px solid var(--border)',
          borderRadius:10, padding:'10px 20px', fontSize:13, fontWeight:500,
          color:'var(--text)', zIndex:1000, boxShadow:'0 4px 20px rgba(0,0,0,.3)',
          animation:'fadeInUp .2s ease-out',
        }}>
          {toast}
          <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateX(-50%) translateY(10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
        </div>
      )}
    </>
  );
}
