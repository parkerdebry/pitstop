'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { getTrimsForVehicle, GENERIC_TRIMS } from '@/lib/trims';
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

export default function AddVehiclePage() {
  const router   = useRouter();
  const addV     = useStore(s => s.addVehicle);
  const nextId   = useStore(s => s.nextId);

  const [emoji,        setEmoji]        = useState<VehicleEmoji>('🚗');
  const [year,         setYear]         = useState('');
  const [make,         setMake]         = useState('');
  const [model,        setModel]        = useState('');
  const [trackingUnit, setTrackingUnit] = useState<TrackingUnit>('miles');
  const [currentVal,   setCurrentVal]   = useState('');
  const [weekly,       setWeekly]       = useState('');
  const [vin,          setVin]          = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [trims,        setTrims]        = useState<string[]>([]);
  const [trim,         setTrim]         = useState('');
  const [trimManual,   setTrimManual]   = useState(false);

  const isHours       = trackingUnit === 'hours';
  const alwaysHours   = ALWAYS_HOURS.includes(emoji);
  const canChooseUnit = CAN_CHOOSE_UNIT.includes(emoji);
  const showToggle    = canChooseUnit;

  function onTypeChange(e: string) {
    const em = e as VehicleEmoji;
    setEmoji(em);
    const unit = defaultTrackingUnit(em);
    setTrackingUnit(unit);
    setTrims([]);
    setTrim('');
    setTrimManual(false);
  }

  function onBlurVehicleField() {
    if (!make || !model) return;
    const list = getTrimsForVehicle(make, model);
    setTrims(list);
    setTrim('');
    setTrimManual(false);
  }

  function submit() {
    if (!year || !make || !model) {
      alert('Please fill in year, make, and model.');
      return;
    }
    const raw = parseInt(currentVal) || 0;
    addV({
      emoji, year, make, model, trim,
      mileage:      isHours ? 0 : raw,
      engineHours:  isHours ? raw : 0,
      weeklyMiles:  parseInt(weekly) || 0,
      trackingUnit,
      licensePlate: licensePlate.toUpperCase(),
      licensePlate: licensePlate.toUpperCase(),
      vin:          vin.toUpperCase(),
      photo:        null,
      recalls:      0,
      documents:    [],
      loans:        [],
      lastServiceMi:   {},
      lastServiceDate: {},
      serviceLog:      [],
    });
    router.push('/');
  }

  return (
    <>
      <div className="ph">
        <Link href="/" className="back-btn">←</Link>
        <span className="pt">Add a vehicle</span>
      </div>

      <div className="card-lg" style={{ padding:'1.25rem', display:'flex', flexDirection:'column', gap:'.875rem' }}>
        {/* Type */}
        <div className="form-group">
          <label className="form-label">Vehicle type</label>
          <select className="form-select" value={emoji} onChange={e => onTypeChange(e.target.value)}>
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
            <div style={{ fontSize:11, color:'var(--text3)', marginTop:5 }}>Street bikes use miles. Dirt bikes and most boats use engine hours.</div>
          </div>
        )}

        {/* Year + current odometer */}
        <div className="form-row2">
          <div className="form-group">
            <label className="form-label">Year</label>
            <input className="form-input" type="number" inputMode="numeric" pattern="[0-9]*" placeholder="e.g. 2022" value={year} onChange={e => setYear(e.target.value)} min="1900" max="2030"/>
          </div>
          <div className="form-group">
            <label className="form-label">{isHours ? 'Engine hours' : 'Current mileage'}</label>
            <input className="form-input" type="number" inputMode="numeric" pattern="[0-9]*" placeholder={isHours ? 'e.g. 420' : 'e.g. 24000'} value={currentVal} onChange={e => setCurrentVal(e.target.value)}/>
          </div>
        </div>

        {/* Weekly usage */}
        <div className="form-group">
          <label className="form-label">Avg {isHours ? 'hours' : 'miles'} per week <span style={{ opacity:.5, textTransform:'none', letterSpacing:0, fontSize:10 }}>(for service reminders)</span></label>
          <input className="form-input" type="number" inputMode="numeric" pattern="[0-9]*" placeholder={isHours ? 'e.g. 8' : 'e.g. 250'} value={weekly} onChange={e => setWeekly(e.target.value)}/>
          <div style={{ fontSize:11, color:'var(--text3)', marginTop:5 }}>Used to estimate when services will be due.</div>
        </div>

        {/* Make + Model */}
        <div className="form-row2">
          <div className="form-group">
            <label className="form-label">Make</label>
            <input className="form-input" placeholder="e.g. Toyota" value={make} onChange={e => setMake(e.target.value)} onBlur={onBlurVehicleField}/>
          </div>
          <div className="form-group">
            <label className="form-label">Model</label>
            <input className="form-input" placeholder="e.g. Camry" value={model} onChange={e => setModel(e.target.value)} onBlur={onBlurVehicleField}/>
          </div>
        </div>

        {/* Trim */}
        <div className="form-group">
          <label className="form-label">Trim / Engine <span style={{ opacity:.5, textTransform:'none', letterSpacing:0, fontSize:10 }}>(optional)</span></label>
          {trims.length > 0 && !trimManual
            ? <select className="form-select" value={trim} onChange={e => {
                if (e.target.value === '__manual__') { setTrimManual(true); setTrim(''); }
                else setTrim(e.target.value);
              }}>
                <option value="">Select trim (optional)</option>
                {trims.map(t => <option key={t} value={t}>{t}</option>)}
                <option value="__manual__">Other / type manually…</option>
              </select>
            : <input className="form-input" placeholder={trims.length === 0 ? 'Fill in make & model first' : 'e.g. SE · 2.5L I4'} value={trim} onChange={e => setTrim(e.target.value)}/>
          }
          {trims.length > 0 && <div style={{ fontSize:11, color:'var(--text3)', marginTop:5 }}>{trims.length} trims found for {make} {model}</div>}
        </div>

        {/* VIN + License Plate */}
        <div className="form-row2">
          <div className="form-group">
            <label className="form-label">License plate <span style={{ opacity:.5, textTransform:'none', letterSpacing:0, fontSize:10 }}>(optional)</span></label>
            <input className="form-input" placeholder="e.g. 8ABC123" value={licensePlate} onChange={e => setLicensePlate(e.target.value.toUpperCase())} style={{ textTransform:'uppercase', letterSpacing:1 }}/>
          </div>
          <div className="form-group">
            <label className="form-label">State <span style={{ opacity:.5, textTransform:'none', letterSpacing:0, fontSize:10 }}>(optional)</span></label>
            <input className="form-input" placeholder="e.g. CA" maxLength={2} style={{ textTransform:'uppercase', letterSpacing:2 }}/>
          </div>
        </div>

        {/* License plate + VIN */}
        <div className="form-row2">
          <div className="form-group">
            <label className="form-label">License plate <span style={{ opacity:.5, textTransform:'none', letterSpacing:0, fontSize:10 }}>(optional)</span></label>
            <input className="form-input" placeholder="e.g. ABC1234" value={licensePlate} onChange={e => setLicensePlate(e.target.value.toUpperCase())} style={{ textTransform:'uppercase', letterSpacing:1 }}/>
          </div>
          <div className="form-group">
            <label className="form-label">VIN <span style={{ opacity:.5, textTransform:'none', letterSpacing:0, fontSize:10 }}>(optional)</span></label>
            <input className="vin-input" style={{ borderRadius:9, padding:'11px 12px', width:'100%' }} placeholder="17-char VIN" maxLength={17} value={vin} onChange={e => setVin(e.target.value.toUpperCase())}/>
          </div>
        </div>
      </div>

      <button className="btn-primary" onClick={submit}>Add to garage</button>

      {/* SmartCar option */}
      <div style={{ display:'flex', alignItems:'center', gap:10, margin:'4px 0' }}>
        <div style={{ flex:1, height:'.5px', background:'var(--border)' }}/>
        <span style={{ fontSize:12, color:'var(--text3)' }}>or connect automatically</span>
        <div style={{ flex:1, height:'.5px', background:'var(--border)' }}/>
      </div>
      <div className="card-lg" style={{ padding:'1.25rem', display:'flex', flexDirection:'column', gap:'.875rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:'rgba(58,127,212,.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:500, color:'var(--text)' }}>Connect via SmartCar</div>
            <div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>Auto-sync mileage, fuel & engine codes</div>
          </div>
        </div>
        <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.6 }}>Link your manufacturer app — no hardware needed. Works with Ford, GM, Honda, BMW, Kia, Hyundai, Volvo and 25+ brands.</div>
        <Link href="/connect" className="btn-blue" style={{ textDecoration:'none', justifyContent:'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          Connect a vehicle app
        </Link>
        <div style={{ fontSize:11, color:'var(--text3)', textAlign:'center' }}>Free for Pro users · Supports 30+ brands</div>
      </div>

      <button className="btn-ghost" onClick={() => router.push('/')}>Cancel</button>
    </>
  );
}
