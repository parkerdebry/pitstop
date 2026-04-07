'use client';

import Link from 'next/link';
import { useStore, useVehicles } from '@/lib/store';
import { calcHealth, countDue, getTracking } from '@/lib/maintenance';
import type { Vehicle } from '@/lib/types';

function GarageCard({ v }: { v: Vehicle }) {
  const { value, unit } = getTracking(v);
  const health = calcHealth(v);
  const due    = countDue(v);
  const healthCls = health >= 85 ? 'badge-ok' : health >= 65 ? 'badge-warn' : 'badge-danger';

  return (
    <Link href={`/vehicle/${v.id}`} className="garage-card">
      <div className="garage-card-photo" style={{ position:'relative' }}>
        {v.photo
          ? <img src={v.photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0 }}/>
          : <span style={{ fontSize:44, opacity:.22 }}>{v.emoji}</span>
        }
      </div>
      <div className="garage-card-body">
        <div className="garage-card-name">{v.year} {v.make} {v.model}</div>
        <div className="garage-card-meta">{v.trim ? `${v.trim} · ` : ''}{value.toLocaleString()} {unit}</div>
        <div className="garage-card-foot">
          <div className="garage-card-badges">
            <span className={`badge ${healthCls}`}>{health}% health</span>
            {due > 0 && <span className={`badge ${due > 1 ? 'badge-danger' : 'badge-warn'}`}>{due} due</span>}
            {v.recalls > 0 && <span className="badge badge-danger">{v.recalls} recall</span>}
          </div>
          <span style={{ color:'var(--text3)', fontSize:18 }}>›</span>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const vehicles    = useVehicles();
  const totalRecalls = vehicles.reduce((s, v) => s + (v.recalls ?? 0), 0);

  return (
    <>
      <div>
        <div style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:13, fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', color:'var(--text2)' }}>
          Good morning
        </div>
        <div style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:28, fontWeight:700, color:'var(--text)' }}>
          My Garage
        </div>
      </div>

      {totalRecalls > 0 && (
        <Link href={`/vehicle/${vehicles.find(v => v.recalls > 0)?.id}/recalls`} className="alert alert-red" style={{ textDecoration:'none', cursor:'pointer' }}>
          <div className="dot dot-red"/>
          <div className="alert-txt">
            <strong style={{ color:'var(--red)' }}>Open recall{totalRecalls > 1 ? 's' : ''} found</strong> — tap to view details
          </div>
          <span style={{ fontSize:11, fontWeight:700, fontFamily:'var(--font-barlow-condensed)', letterSpacing:'.5px', textTransform:'uppercase', color:'var(--red)', whiteSpace:'nowrap' }}>View →</span>
        </Link>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {vehicles.map(v => <GarageCard key={v.id} v={v}/>)}
      </div>

      <Link href="/add" className="add-card">
        <span style={{ fontSize:22, color:'var(--text3)' }}>＋</span>
        <span className="add-card-txt">Add a vehicle</span>
      </Link>
    </>
  );
}
