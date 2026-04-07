'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useStore, useVehicle } from '@/lib/store';
import { calcHealth, countDue, getTracking, getMaintForVehicle, getMaintStatus } from '@/lib/maintenance';

export default function VehicleDetailPage() {
  const params   = useParams();
  const id       = parseInt(params.id as string);
  const v        = useVehicle(id);
  const router   = useRouter();
  const updateV  = useStore(s => s.updateVehicle);
  const removeV  = useStore(s => s.removeVehicle);
  const fileRef  = useRef<HTMLInputElement>(null);

  if (!v) return (
    <div style={{ textAlign:'center', padding:'3rem 1rem', color:'var(--text3)' }}>
      Vehicle not found. <Link href="/" style={{ color:'var(--accent)' }}>Go home →</Link>
    </div>
  );

  const { value: trackVal, unit: trackUnit, useHours } = getTracking(v);
  const health   = calcHealth(v);
  const due      = countDue(v);
  const logs     = (v.serviceLog ?? []).slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const offset   = (150.8 * (1 - health / 100)).toFixed(1);
  const miniItems = getMaintForVehicle(v).slice(0, 3);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = d => updateV(id, { photo: d.target?.result as string });
    r.readAsDataURL(f);
  }

  function handleRemove() {
    if (confirm(`Remove ${v.year} ${v.make} ${v.model} from your garage?\nThis cannot be undone.`)) {
      removeV(id);
      router.push('/');
    }
  }

  return (
    <>
      {/* Header */}
      <div className="ph">
        <button className="back-btn" onClick={() => router.push('/')}>←</button>
        <span className="pt">{v.year} {v.make} {v.model}</span>
        <button onClick={handleRemove} style={{ marginLeft:'auto', fontSize:12, color:'var(--red)', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-barlow-condensed)', fontWeight:700, letterSpacing:'.5px', textTransform:'uppercase' }}>Remove</button>
      </div>

      {/* Photo */}
      <div className="vd-photo">
        {v.photo
          ? <img src={v.photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0, borderRadius:16 }}/>
          : <span style={{ fontSize:80, opacity:.2 }}>{v.emoji}</span>
        }
        <div className="vd-photo-overlay"/>
        <button className="vd-photo-btn" onClick={() => fileRef.current?.click()}>📷 Photo</button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhoto}/>
      </div>

      {/* Name + health ring */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
        <div>
          <div className="vd-name">{v.year} {v.make} {v.model}</div>
          <div className="vd-sub">{v.trim}</div>
        </div>
        <svg width="60" height="60" viewBox="0 0 60 60" style={{ flexShrink:0 }}>
          <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(128,128,128,0.15)" strokeWidth="6"/>
          <circle cx="30" cy="30" r="24" fill="none" stroke="var(--accent)" strokeWidth="6"
            strokeDasharray="150.8" strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 30 30)"/>
          <text x="30" y="35" textAnchor="middle" fill="var(--text)" fontFamily="Barlow Condensed,sans-serif" fontSize="13" fontWeight="700">{health}%</text>
        </svg>
      </div>

      {/* Stats */}
      <div className="vd-stats">
        <div className="vd-stat">
          <div className="vd-stat-lbl">{useHours ? 'Engine hrs' : 'Mileage'}</div>
          <div className="vd-stat-val">{trackVal.toLocaleString()} {trackUnit}</div>
        </div>
        <div className="vd-stat">
          <div className="vd-stat-lbl">Items due</div>
          <div className="vd-stat-val" style={{ color: due > 0 ? 'var(--red)' : 'var(--green)' }}>{due}</div>
        </div>
        <div className="vd-stat">
          <div className="vd-stat-lbl">Logged</div>
          <div className="vd-stat-val">{logs.length}</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="vd-actions">
        <Link href={`/vehicle/${id}/maintenance`} className="vd-action">
          <div style={{ fontSize:18 }}>⚙</div>
          <div className="vd-action-lbl">Maintenance</div>
          <div className="vd-action-sub">{due > 0 ? `${due} need attention` : 'All up to date'}</div>
          <div className="vd-action-arr">View →</div>
        </Link>
        <Link href={`/vehicle/${id}/mechanic`} className="vd-action">
          <div style={{ fontSize:18 }}>🔩</div>
          <div className="vd-action-lbl">AI Mechanic</div>
          <div className="vd-action-sub">Repairs & parts</div>
          <div className="vd-action-arr">Ask now →</div>
        </Link>
        <Link href={`/vehicle/${id}/history`} className="vd-action">
          <div style={{ fontSize:18 }}>📋</div>
          <div className="vd-action-lbl">Service History</div>
          <div className="vd-action-sub">{logs.length} record{logs.length !== 1 ? 's' : ''}</div>
          <div className="vd-action-arr">View all →</div>
        </Link>
        <Link href={`/vehicle/${id}/recalls`} className="vd-action">
          <div style={{ fontSize:18 }}>⚠️</div>
          <div className="vd-action-lbl">Recalls</div>
          <div className="vd-action-sub">{v.recalls > 0 ? `${v.recalls} open recall` : 'Check NHTSA'}</div>
          <div className="vd-action-arr">Check →</div>
        </Link>
      </div>

      {/* Mini maintenance */}
      <div>
        <div className="sh">
          <span className="st">Maintenance</span>
          <Link href={`/vehicle/${id}/maintenance`} className="sl">See all →</Link>
        </div>
        <div className="mf-list">
          {miniItems.map(item => {
            const { status, text } = getMaintStatus(v, item);
            return (
              <div key={item.key} className={`mf-card ${status}`}>
                <div className={`mf-icon ${status}`}>{item.icon}</div>
                <div style={{ flex:1 }}>
                  <div className="mf-name">{item.name}</div>
                  <div className={`mf-due ${status}`}>{text}</div>
                </div>
                <Link href={`/vehicle/${id}/maintenance?log=${item.key}&name=${encodeURIComponent(item.name)}`} className={`btn-sm ${status === 'overdue' ? 'btn-sm-danger' : ''}`}>Log</Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent services */}
      <div>
        <div className="sh">
          <span className="st">Recent services</span>
          <Link href={`/vehicle/${id}/history`} className="sl">All →</Link>
        </div>
        {logs.length === 0
          ? <div style={{ fontSize:13, color:'var(--text3)', textAlign:'center', padding:'1rem', background:'var(--card)', borderRadius:10, border:'.5px solid var(--border)' }}>No services logged yet. Tap Log on any maintenance item.</div>
          : <div className="h-list">
              {logs.slice(0, 3).map(l => {
                const d = new Date(l.date);
                return (
                  <div key={l.id} className="h-item">
                    <div className="h-date">{d.toLocaleString('en-US',{month:'short'}).toUpperCase()}<br/>{d.getDate()}</div>
                    <div className="h-name">{l.service}{l.shop ? ` · ${l.shop}` : ''}</div>
                    <div className="h-cost">{l.cost > 0 ? `$${l.cost.toLocaleString()}` : '—'}</div>
                  </div>
                );
              })}
            </div>
        }
      </div>
    </>
  );
}
