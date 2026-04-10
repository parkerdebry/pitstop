'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useStore, useVehicle } from '@/lib/store';
import { getTrimsForVehicle } from '@/lib/trims';
import { ALWAYS_HOURS, CAN_CHOOSE_UNIT, defaultTrackingUnit } from '@/lib/maintenance';
import type { VehicleEmoji, TrackingUnit } from '@/lib/types';

const VEHICLE_TYPES: { emoji: VehicleEmoji; label: string }[] = [
  { emoji:'🚗', label:'Car' },
  { emoji:'🚙', label:'SUV / Truck' },
  { emoji:'🏍', label:'Motorcycle (Street)' },
  { emoji:'🏁', label:'Dirt Bike / Enduro' },
  { emoji:'🚐', label:'Van' },
  { emoji:'⛵', label:'Boat' },
  { emoji:'🚜', label:'ATV / Offroad' },
];

export default function EditVehiclePage() {
  const params      = useParams();
  const router      = useRouter();
  const id          = parseInt(params.id as string);
  const v           = useVehicle(id);
  const updateV     = useStore(s => s.updateVehicle);

  const [emoji,        setEmoji]        = useState<VehicleEmoji>('🚗');
  const [year,         setYear]         = useState('');
  const [make,         setMake]         = useState('');
  const [model,        setModel]        = useState('');
  const [trim,         setTrim]         = useState('');
  const [trackingUnit, setTrackingUnit] = useState<TrackingUnit>('miles');
  const [currentVal,   setCurrentVal]   = useState('');
  const [weekly,       setWeekly]       = useState('');
  const [vin,          setVin]          = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [trims,        setTrims]        = useState<string[]>([]);

  useEffect(() => {
    if (!v) return;
    setEmoji(v.emoji);
    setYear(v.year);
    setMake(v.make);
    setModel(v.model);
    setTrim(v.trim);
    setTrackingUnit(v.trackingUnit);
    setCurrentVal(String(v.trackingUnit === 'hours' ? v.engineHours : v.mileage));
    setWeekly(String(v.weeklyMiles));
    setVin(v.vin);
    setLicensePlate(v.licensePlate ?? '');
    if (v.make && v.model) setTrims(getTrimsForVehicle(v.make, v.model));
  }, [v]);

  if (!v) return <div style={{ textAlign:'center', padding:'3rem', color:'var(--text3)' }}>Vehicle not found.</div>;

  const isHours       = trackingUnit === 'hours';
  const alwaysHours   = ALWAYS_HOURS.includes(emoji);
  const canChooseUnit = CAN_CHOOSE_UNIT.includes(emoji);
  const showToggle    = canChooseUnit;

  function onTypeChange(em: VehicleEmoji) {
    setEmoji(em);
    if (ALWAYS_HOURS.includes(em)) setTrackingUnit('hours');
    else if (!CAN_CHOOSE_UNIT.includes(em)) setTrackingUnit('miles');
  }

  function save() {
    if (!year || !make || !model) { alert('Please fill in year, make, and model'); return; }
    const raw = parseInt(currentVal) || 0;
    updateV(id, {
      emoji, year, make, model, trim,
      mileage:      isHours ? v.mileage : raw,
      engineHours:  isHours ? raw : v.engineHours,
      weeklyMiles:  parseInt(weekly) || 0,
      trackingUnit,
      vin:          vin.toUpperCase(),
      licensePlate: licensePlate.toUpperCase(),
    });
    // Show toast
    const el = document.getElementById('toast-el');
    if (el) { el.textContent = '✅ Vehicle updated'; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2500); }
    router.push(`/vehicle/${id}`);
  }

  return (
    <>
      <div className="ph">
        <Link href={`/vehicle/${id}`} className="back-btn">←</Link>
        <span className="pt">Edit Vehicle</span>
      </div>

      <div className="card-lg" style={{ padding:'1.25rem', display:'flex', flexDirection:'column', gap:'.875rem' }}>
        {/* Type */}
        <div className="form-group">
          <label className="form-label">Vehicle type</label>
          <select className="form-select" value={emoji} onChange={e => onTypeChange(e.target.value as VehicleEmoji)}>
            {VEHICLE_TYPES.map(t => <option key={t.emoji} value={t.emoji}>{t.label}</option>)}
          </select>
        </div>

        {/* Tracking unit toggle */}
        {showToggle && (
          <div className="form-group">
            <label className="form-label">Track by</label>
            <div style={{ display:'flex', gap:8 }}>
              {(['miles','hours'] as TrackingUnit[]).map(u => (
                <button key={u} type="button" onClick={() => setTrackingUnit(u)}
                  style={{ flex:1, fontFamily:'var(--font-barlow-condensed)', fontSize:13, fontWeight:700, letterSpacing:'.5px', textTransform:'uppercase', padding:10, borderRadius:9, cursor:'pointer', border:'.5px solid', transition:'all .15s',
                    background: trackingUnit === u ? 'var(--accent)' : 'none',
                    color:      trackingUnit === u ? '#fff' : 'var(--text2)',
                    borderColor:trackingUnit === u ? 'var(--accent)' : 'var(--border2)',
                  }}>
                  {u === 'miles' ? 'Miles' : 'Engine Hours'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Year + odometer */}
        <div className="form-row2">
          <div className="form-group">
            <label className="form-label">Year</label>
            <input className="form-input" type="number" inputMode="numeric" value={year} onChange={e => setYear(e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">{isHours ? 'Engine hours' : 'Mileage'}</label>
            <input className="form-input" type="number" inputMode="numeric" value={currentVal} onChange={e => setCurrentVal(e.target.value)}/>
          </div>
        </div>

        {/* Weekly usage */}
        <div className="form-group">
          <label className="form-label">Avg {isHours ? 'hours' : 'miles'} per week</label>
          <input className="form-input" type="number" inputMode="numeric" value={weekly} onChange={e => setWeekly(e.target.value)}/>
        </div>

        {/* Make + Model */}
        <div className="form-row2">
          <div className="form-group">
            <label className="form-label">Make</label>
            <input className="form-input" value={make} onChange={e => { setMake(e.target.value); setTrims(getTrimsForVehicle(e.target.value, model)); }}/>
          </div>
          <div className="form-group">
            <label className="form-label">Model</label>
            <input className="form-input" value={model} onChange={e => { setModel(e.target.value); setTrims(getTrimsForVehicle(make, e.target.value)); }}/>
          </div>
        </div>

        {/* Trim */}
        <div className="form-group">
          <label className="form-label">Trim <span style={{ opacity:.5, fontSize:10, textTransform:'none', letterSpacing:0 }}>(optional)</span></label>
          {trims.length > 0
            ? <select className="form-select" value={trim} onChange={e => setTrim(e.target.value)}>
                <option value="">Select trim</option>
                {trims.map(t => <option key={t} value={t}>{t}</option>)}
                <option value="__manual__">Other…</option>
              </select>
            : <input className="form-input" value={trim} onChange={e => setTrim(e.target.value)} placeholder="e.g. SE · 2.5L I4"/>
          }
        </div>

        {/* License plate + VIN */}
        <div className="form-row2">
          <div className="form-group">
            <label className="form-label">License plate</label>
            <input className="form-input" value={licensePlate} onChange={e => setLicensePlate(e.target.value.toUpperCase())} placeholder="e.g. 8ABC123" style={{ textTransform:'uppercase', letterSpacing:1 }}/>
          </div>
          <div className="form-group">
            <label className="form-label">VIN</label>
            <input className="form-input" value={vin} onChange={e => setVin(e.target.value.toUpperCase())} placeholder="17-character VIN" maxLength={17} style={{ textTransform:'uppercase', fontSize:13, letterSpacing:.5 }}/>
          </div>
        </div>
      </div>

      <button className="btn-primary" onClick={save}>Save changes</button>
      <button className="btn-ghost" onClick={() => router.push(`/vehicle/${id}`)}>Cancel</button>
    </>
  );
}
