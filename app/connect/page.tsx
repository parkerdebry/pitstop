'use client';

import Link from 'next/link';
import { useStore } from '@/lib/store';

const BRANDS = [
  { name:'Ford',       color:'#003478', emoji:'🔵', connected:false },
  { name:'Chevrolet',  color:'#C8A900', emoji:'🟡', connected:false },
  { name:'BMW',        color:'#1C69D4', emoji:'⚪', connected:false },
  { name:'Kia',        color:'#05141F', emoji:'🚙', connected:true  },
  { name:'Hyundai',    color:'#002C5F', emoji:'🔵', connected:false },
  { name:'Volvo',      color:'#003057', emoji:'⚫', connected:false },
  { name:'Audi',       color:'#BB0A30', emoji:'⚫', connected:false },
  { name:'Mercedes',   color:'#333',    emoji:'⚫', connected:false },
  { name:'Tesla',      color:'#E82127', emoji:'⚡', connected:false },
  { name:'Honda',      color:'#CC0000', emoji:'🔴', connected:false },
  { name:'Subaru',     color:'#005EB8', emoji:'⭐', connected:false },
  { name:'Jeep',       color:'#2E6B3E', emoji:'🟩', connected:false },
  { name:'Ram',        color:'#1B1C1D', emoji:'🐏', connected:false },
  { name:'Cadillac',   color:'#2A2A2A', emoji:'⚫', connected:false },
  { name:'Buick',      color:'#26417A', emoji:'🔵', connected:false },
  { name:'GMC',        color:'#CC0000', emoji:'🔴', connected:false },
  { name:'Lincoln',    color:'#1A1A1A', emoji:'⚫', connected:false },
  { name:'Acura',      color:'#CC0000', emoji:'🔴', connected:false },
];

async function startSmartCarOAuth() {
  try {
    const res  = await fetch('/api/smartcar/auth');
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else alert('SmartCar: add SMARTCAR_CLIENT_ID to your .env.local to activate.');
  } catch {
    alert('SmartCar not configured. Add API keys to .env.local.');
  }
}

export default function ConnectPage() {
  const vehicles = useStore(s => s.vehicles);
  const updateV  = useStore(s => s.updateVehicle);
  const connected = vehicles.filter(v => v.smartcarId);

  function disconnect(id: number) {
    const v = vehicles.find(x => x.id === id);
    if (!v) return;
    if (confirm(`Disconnect ${v.year} ${v.make} ${v.model} from SmartCar?\nMileage will no longer sync automatically.`)) {
      updateV(id, { smartcarId: null });
    }
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
        ? <div style={{ textAlign:'center', padding:'1.25rem', color:'var(--text3)', fontSize:13, background:'var(--card)', border:'.5px solid var(--border)', borderRadius:12 }}>No vehicles connected yet.<br/>Tap the button below to get started.</div>
        : <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {connected.map(v => (
              <div key={v.id} style={{ background:'var(--card)', border:'.5px solid rgba(59,175,106,.3)', borderRadius:12, padding:'1rem', display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:22 }}>{v.emoji}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>{v.year} {v.make} {v.model}</div>
                  <div style={{ fontSize:11, color:'var(--green)', marginTop:2 }}>● Live · Synced just now</div>
                </div>
                <button className="btn-sm btn-sm-danger" onClick={() => disconnect(v.id)}>Disconnect</button>
              </div>
            ))}
          </div>
      }

      {/* Brand grid */}
      <div className="sh"><span className="st">Supported brands</span></div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
        {BRANDS.map(b => (
          <div key={b.name} onClick={startSmartCarOAuth} style={{ background:'var(--card)', border:`.5px solid ${b.connected ? 'rgba(59,175,106,.35)' : 'var(--border)'}`, borderRadius:10, padding:'.75rem', display:'flex', flexDirection:'column', alignItems:'center', gap:5, cursor:'pointer' }}>
            <div style={{ width:36, height:36, borderRadius:8, background:`${b.color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{b.emoji}</div>
            <div style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:11, fontWeight:700, letterSpacing:'.3px', textTransform:'uppercase', color:'var(--text2)' }}>{b.name}</div>
            <div style={{ fontSize:10, fontWeight:600, fontFamily:'var(--font-barlow-condensed)', color: b.connected ? 'var(--green)' : 'var(--accent)' }}>{b.connected ? '● Live' : 'Connect'}</div>
          </div>
        ))}
      </div>

      {/* Connect CTA */}
      <div className="card-lg" style={{ padding:'1.25rem', display:'flex', flexDirection:'column', gap:'.875rem' }}>
        <div style={{ fontSize:14, fontWeight:500, color:'var(--text)' }}>Connect a new vehicle</div>
        <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.55 }}>You'll be redirected to your manufacturer's login. Your credentials are never shared with PitStop.</div>
        <button className="btn-blue" onClick={startSmartCarOAuth}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          Connect via SmartCar
        </button>
        <div style={{ fontSize:11, color:'var(--text3)', textAlign:'center' }}>🔒 OAuth secured · Your login stays with your manufacturer · Disconnect anytime</div>
      </div>

      {/* OBD2 alt */}
      <div style={{ background:'var(--card)', border:'.5px solid var(--border)', borderRadius:14, padding:'1rem 1.25rem' }}>
        <div style={{ fontSize:13, fontWeight:500, color:'var(--text)', marginBottom:5 }}>🔌 Don't see your brand?</div>
        <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.6 }}>SmartCar doesn't support Toyota, Nissan, or motorcycles. For those, an OBD2 Bluetooth dongle (plugs under the dashboard) works with any 1996+ vehicle. OBD2 support coming soon.</div>
        <button className="btn-sm" onClick={() => alert('We\'ll notify you when OBD2 is ready!')} style={{ marginTop:10 }}>Notify me when OBD2 is ready</button>
      </div>
    </>
  );
}
