'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useVehicle } from '@/lib/store';

export default function HistoryPage() {
  const id   = parseInt(useParams().id as string);
  const v    = useVehicle(id);
  const logs = v ? (v.serviceLog ?? []).slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
  const total = logs.reduce((s,l) => s + (l.cost || 0), 0);
  const avg   = logs.length ? Math.round(total / logs.length) : 0;

  if (!v) return <div style={{ textAlign:'center', padding:'3rem', color:'var(--text3)' }}>Vehicle not found.</div>;

  return (
    <>
      <div className="ph">
        <Link href={`/vehicle/${id}`} className="back-btn">←</Link>
        <span className="pt">Service History</span>
        <Link href="/export" className="btn-sm" style={{ marginLeft:'auto', textDecoration:'none' }}>📄 Export</Link>
      </div>

      <div className="stat-grid">
        <div className="stat-card"><div className="stat-lbl">Total spent</div><div className="stat-val">${total.toLocaleString()}</div></div>
        <div className="stat-card"><div className="stat-lbl">Services</div><div className="stat-val">{logs.length}</div></div>
        <div className="stat-card"><div className="stat-lbl">Avg cost</div><div className="stat-val">${avg}</div></div>
      </div>

      {logs.length === 0
        ? <div style={{ textAlign:'center', padding:'2rem', color:'var(--text3)', fontSize:13, background:'var(--card)', borderRadius:12, border:'.5px solid var(--border)' }}>
            No services logged yet.<br/>Tap Log on any maintenance item to get started.
          </div>
        : <div className="h-list">
            {logs.map(l => {
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
    </>
  );
}
