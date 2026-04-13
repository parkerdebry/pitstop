'use client';

import Link from 'next/link';
import { useStore, useVehicles } from '@/lib/store';
import { calcHealth, countDue, getTracking } from '@/lib/maintenance';
import { t } from '@/lib/i18n';
import type { Vehicle } from '@/lib/types';

function GarageCard({ v }: { v: Vehicle }) {
  const language = useStore(s => s.language) ?? 'en';
  const T = (key: string) => t(language, key);
  const { value, unit } = getTracking(v);
  const health = calcHealth(v);
  const due    = countDue(v);
  const healthCls = health >= 85 ? 'badge-ok' : health >= 65 ? 'badge-warn' : 'badge-danger';
  const displayName = v.nickname || `${v.year} ${v.make} ${v.model}`;

  return (
    <Link href={`/vehicle/${v.id}`} className="garage-card">
      <div className="garage-card-photo" style={{ position:'relative' }}>
        {v.photo
          ? <img src={v.photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0 }}/>
          : <span style={{ fontSize:52, filter:'none' }}>{v.emoji}</span>
        }
      </div>
      <div className="garage-card-body">
        <div className="garage-card-name">{displayName}</div>
        <div className="garage-card-meta">{v.nickname ? `${v.year} ${v.make} ${v.model} · ` : ''}{v.trim ? `${v.trim} · ` : ''}{value.toLocaleString()} {unit}</div>
        <div className="garage-card-foot">
          <div className="garage-card-badges">
            <span className={`badge ${healthCls}`}>{health}% {T('home.health')}</span>
            {due > 0 && <span className={`badge ${due > 1 ? 'badge-danger' : 'badge-warn'}`}>{due} {T('home.due')}</span>}
            {v.recalls > 0 && <span className="badge badge-danger">{v.recalls} {T('home.recall')}</span>}
          </div>
          <span style={{ color:'var(--text3)', fontSize:18 }}>›</span>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const vehicles     = useVehicles();
  const language     = useStore(s => s.language) ?? 'en';
  const T = (key: string) => t(language, key);
  const totalRecalls = vehicles.reduce((s, v) => s + (v.recalls ?? 0), 0);

  return (
    <>
      <div>
        <div style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:13, fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', color:'var(--text2)' }}>
          {T('home.greeting')}
        </div>
        <div style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:28, fontWeight:700, color:'var(--text)' }}>
          {T('home.garage')}
        </div>
      </div>

      {totalRecalls > 0 && (
        <Link href={`/vehicle/${vehicles.find(v => v.recalls > 0)?.id}/recalls`} className="alert alert-red" style={{ textDecoration:'none', cursor:'pointer' }}>
          <div className="dot dot-red"/>
          <div className="alert-txt">
            <strong style={{ color:'var(--red)' }}>{totalRecalls > 1 ? T('home.recalls_found') : T('home.recall_found')}</strong> — {T('home.tap_to_view')}
          </div>
          <span style={{ fontSize:11, fontWeight:700, fontFamily:'var(--font-barlow-condensed)', letterSpacing:'.5px', textTransform:'uppercase', color:'var(--red)', whiteSpace:'nowrap' }}>{T('home.view')} →</span>
        </Link>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {vehicles.map(v => <GarageCard key={v.id} v={v}/>)}
      </div>

      <Link href="/add" className="add-card">
        <span style={{ fontSize:22, color:'var(--text3)' }}>＋</span>
        <span className="add-card-txt">{T('home.add_vehicle')}</span>
      </Link>
    </>
  );
}
