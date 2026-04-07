'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useStore, useVehicle } from '@/lib/store';
import { getMaintForVehicle, getMaintStatus, getTracking } from '@/lib/maintenance';
import type { MaintenanceItem } from '@/lib/types';

function LogModal({
  item, vehicleId, currentVal, onClose,
}: {
  item: MaintenanceItem;
  vehicleId: number;
  currentVal: number;
  onClose: () => void;
}) {
  const logService = useStore(s => s.logService);
  const [date,    setDate]    = useState(new Date().toISOString().split('T')[0]);
  const [odometer,setOdometer]= useState(String(currentVal));
  const [cost,    setCost]    = useState('');
  const [shop,    setShop]    = useState('');
  const [notes,   setNotes]   = useState('');

  function save() {
    if (!date) { alert('Please select a date'); return; }
    logService(vehicleId, {
      service:    item.name,
      date,
      mileage:    parseInt(odometer) || currentVal,
      cost:       parseFloat(cost) || 0,
      shop:       shop.trim(),
      notes:      notes.trim(),
      serviceKey: item.key,
    } as Parameters<typeof logService>[1] & { serviceKey: string });
    onClose();
    // Show toast
    const el = document.getElementById('toast-el');
    if (el) {
      el.textContent = `✅ ${item.name} logged`;
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 2500);
    }
  }

  return (
    <div className="modal-bg open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle"/>
        <div className="modal-title">Log: {item.name}</div>

        <div className="form-group" style={{ marginBottom:'.875rem' }}>
          <label className="form-label">Service</label>
          <input className="form-input" value={item.name} readOnly style={{ background:'var(--bg3)', color:'var(--text2)' }}/>
        </div>
        <div className="form-group" style={{ marginBottom:'.875rem' }}>
          <label className="form-label">Date performed</label>
          <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)}/>
        </div>
        <div className="form-row2" style={{ marginBottom:'.875rem' }}>
          <div className="form-group">
            <label className="form-label" id="log-mi-label">Mileage / Hours</label>
            <input className="form-input" type="number" inputMode="numeric" pattern="[0-9]*" value={odometer} onChange={e => setOdometer(e.target.value)} placeholder={String(currentVal)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Cost ($)</label>
            <input className="form-input" type="number" inputMode="decimal" value={cost} onChange={e => setCost(e.target.value)} placeholder="0.00"/>
          </div>
        </div>
        <div className="form-group" style={{ marginBottom:'.875rem' }}>
          <label className="form-label">Provider / Shop</label>
          <input className="form-input" value={shop} onChange={e => setShop(e.target.value)} placeholder="e.g. Jiffy Lube, DIY"/>
        </div>
        <div className="form-group" style={{ marginBottom:'1.25rem' }}>
          <label className="form-label">Notes</label>
          <input className="form-input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional details…"/>
        </div>
        <button className="btn-primary" onClick={save} style={{ marginBottom:8 }}>Save service record</button>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default function MaintenancePage() {
  const params      = useParams();
  const searchParams = useSearchParams();
  const id          = parseInt(params.id as string);
  const v           = useVehicle(id);
  const [logItem, setLogItem] = useState<MaintenanceItem | null>(null);

  // Auto-open log modal if ?log=key&name=name is in URL
  useEffect(() => {
    const key  = searchParams.get('log');
    const name = searchParams.get('name');
    if (key && name && v) {
      const items = getMaintForVehicle(v);
      const found = items.find(i => i.key === key);
      if (found) setLogItem(found);
    }
  }, [searchParams, v]);

  if (!v) return <div style={{ textAlign:'center', padding:'3rem', color:'var(--text3)' }}>Vehicle not found.</div>;

  const items = getMaintForVehicle(v);
  const { value: trackVal, unit } = getTracking(v);

  return (
    <>
      <div className="ph">
        <Link href={`/vehicle/${id}`} className="back-btn">←</Link>
        <span className="pt">Maintenance</span>
      </div>
      <div style={{ fontSize:12, color:'var(--text2)' }}>
        {v.year} {v.make} {v.model} · {trackVal.toLocaleString()} {unit}
      </div>
      <div className="mf-list">
        {items.map(item => {
          const { status, text } = getMaintStatus(v, item);
          const lastMi   = v.lastServiceMi[item.key] ?? 0;
          const lastDate = v.lastServiceDate[item.key];
          const lastStr  = lastDate
            ? new Date(lastDate).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
            : 'Never';

          return (
            <div key={item.key} className={`mf-card ${status}`}>
              <div className={`mf-icon ${status}`}>{item.icon}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div className="mf-name">{item.name}</div>
                <div className={`mf-due ${status}`}>{text} · every {item.mi.toLocaleString()} {unit}</div>
                <div className="mf-last">Last: {lastStr}{lastMi > 0 ? ` at ${lastMi.toLocaleString()} ${unit}` : ''}</div>
              </div>
              <button
                className={`btn-sm ${status === 'overdue' ? 'btn-sm-danger' : ''}`}
                onClick={() => setLogItem(item)}
              >
                Log
              </button>
            </div>
          );
        })}
      </div>

      {logItem && (
        <LogModal
          item={logItem}
          vehicleId={id}
          currentVal={trackVal}
          onClose={() => setLogItem(null)}
        />
      )}
    </>
  );
}
