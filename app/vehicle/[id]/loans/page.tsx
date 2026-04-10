'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStore, useVehicle } from '@/lib/store';
import type { VehicleLoan } from '@/lib/types';

function LoanModal({ vehicleId, initial, onClose }: { vehicleId: number; initial?: VehicleLoan; onClose: () => void }) {
  const addLoan    = useStore(s => s.addLoan);
  const updateLoan = useStore(s => s.updateLoan);

  const [lender,   setLender]   = useState(initial?.lender ?? '');
  const [remaining,setRemaining]= useState(String(initial?.remainingBalance ?? ''));
  const [monthly,  setMonthly]  = useState(String(initial?.monthlyPayment ?? ''));
  const [payDay,   setPayDay]   = useState(String(initial?.paymentDay ?? '1'));

  function save() {
    if (!lender || !remaining || !monthly || !payDay) { alert('Please fill in all fields'); return; }
    const loan: VehicleLoan = {
      id:               initial?.id ?? `loan_${Date.now()}`,
      lender,
      originalAmount:   initial?.originalAmount ?? parseFloat(remaining),
      remainingBalance: parseFloat(remaining),
      monthlyPayment:   parseFloat(monthly),
      paymentDay:       parseInt(payDay),
      startDate:        initial?.startDate ?? new Date().toISOString().split('T')[0],
      lastUpdated:      initial?.lastUpdated ?? new Date().toISOString().split('T')[0],
    };
    if (initial) updateLoan(vehicleId, initial.id, loan);
    else         addLoan(vehicleId, loan);
    onClose();
  }

  return (
    <div className="modal-bg open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle"/>
        <div className="modal-title">{initial ? 'Edit loan' : 'Add vehicle loan'}</div>

        <div className="form-group" style={{ marginBottom:'.875rem' }}>
          <label className="form-label">Lender / Bank</label>
          <input className="form-input" placeholder="e.g. Chase Auto, Credit Union" value={lender} onChange={e => setLender(e.target.value)}/>
        </div>

        <div className="form-row2" style={{ marginBottom:'.875rem' }}>
          <div className="form-group">
            <label className="form-label">Remaining balance ($)</label>
            <input className="form-input" type="number" inputMode="decimal" placeholder="e.g. 18500" value={remaining} onChange={e => setRemaining(e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Monthly payment ($)</label>
            <input className="form-input" type="number" inputMode="decimal" placeholder="e.g. 385" value={monthly} onChange={e => setMonthly(e.target.value)}/>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom:'1.25rem' }}>
          <label className="form-label">Payment day of month</label>
          <select className="form-select" value={payDay} onChange={e => setPayDay(e.target.value)}>
            {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
              <option key={d} value={d}>{d}{d === 1 ? 'st' : d === 2 ? 'nd' : d === 3 ? 'rd' : 'th'} of each month</option>
            ))}
          </select>
          <div style={{ fontSize:11, color:'var(--text3)', marginTop:5 }}>PitStop automatically subtracts your payment on this day each month</div>
        </div>

        <button className="btn-primary" onClick={save} style={{ marginBottom:8 }}>Save loan</button>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

function LoanCard({ loan, vehicleId, onEdit }: { loan: VehicleLoan; vehicleId: number; onEdit: (l: VehicleLoan) => void }) {
  const removeLoan = useStore(s => s.removeLoan);
  const pctPaid    = loan.originalAmount > 0
    ? Math.round(((loan.originalAmount - loan.remainingBalance) / loan.originalAmount) * 100)
    : 0;
  const monthsLeft = loan.monthlyPayment > 0 ? Math.ceil(loan.remainingBalance / loan.monthlyPayment) : 0;
  const ordinal    = (n: number) => n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`;

  return (
    <div style={{ background:'var(--bg3)', border:'.5px solid var(--border2)', borderRadius:14, overflow:'hidden' }}>
      {/* Header */}
      <div style={{ padding:'1rem 1rem 0.75rem', borderBottom:'.5px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
          <div style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:18, fontWeight:700, color:'var(--text)' }}>{loan.lender}</div>
          <div style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:22, fontWeight:700, color:'var(--text)' }}>
            ${loan.remainingBalance.toLocaleString('en-US', { minimumFractionDigits:0, maximumFractionDigits:0 })}
          </div>
        </div>
        <div style={{ fontSize:12, color:'var(--text3)' }}>Remaining balance</div>
      </div>

      {/* Progress bar */}
      <div style={{ padding:'0.875rem 1rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
          <span style={{ fontSize:11, color:'var(--text3)', fontFamily:'var(--font-barlow-condensed)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.5px' }}>Paid off</span>
          <span style={{ fontSize:11, color:'var(--accent)', fontWeight:700, fontFamily:'var(--font-barlow-condensed)' }}>{pctPaid}%</span>
        </div>
        <div style={{ height:6, background:'var(--bg4)', borderRadius:3, overflow:'hidden' }}>
          <div style={{ width:`${pctPaid}%`, height:'100%', background:'linear-gradient(90deg,var(--accent),var(--accent2))', borderRadius:3, transition:'width .5s' }}/>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:1, background:'var(--border)', borderTop:'.5px solid var(--border)' }}>
        {[
          ['Monthly', `$${loan.monthlyPayment.toLocaleString()}`],
          ['Due', ordinal(loan.paymentDay)],
          ['Est. payoff', monthsLeft > 0 ? `${monthsLeft} mo` : 'Paid off!'],
        ].map(([lbl, val]) => (
          <div key={lbl} style={{ background:'var(--bg3)', padding:'10px 12px', textAlign:'center' }}>
            <div style={{ fontSize:10, color:'var(--text3)', fontFamily:'var(--font-barlow-condensed)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:3 }}>{lbl}</div>
            <div style={{ fontSize:15, fontWeight:600, fontFamily:'var(--font-barlow-condensed)', color:'var(--text)' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ padding:'0.75rem 1rem', display:'flex', gap:8 }}>
        <button className="btn-sm" onClick={() => onEdit(loan)} style={{ flex:1 }}>Edit</button>
        <button className="btn-sm btn-sm-danger" onClick={() => { if (confirm('Remove this loan?')) removeLoan(vehicleId, loan.id); }}>Remove</button>
      </div>
    </div>
  );
}

export default function VehicleLoansPage() {
  const id   = parseInt(useParams().id as string);
  const v    = useVehicle(id);
  const [showModal, setShowModal] = useState(false);
  const [editLoan,  setEditLoan]  = useState<VehicleLoan | undefined>();

  if (!v) return <div style={{ textAlign:'center', padding:'3rem', color:'var(--text3)' }}>Vehicle not found.</div>;

  const loans = v.loans ?? [];

  function openEdit(l: VehicleLoan) { setEditLoan(l); setShowModal(true); }

  return (
    <>
      <div className="ph">
        <Link href={`/vehicle/${id}`} className="back-btn">←</Link>
        <span className="pt">Vehicle Loan</span>
        {loans.length === 0 && <button className="sl" style={{ marginLeft:'auto' }} onClick={() => { setEditLoan(undefined); setShowModal(true); }}>+ Add</button>}
      </div>

      {loans.length === 0 ? (
        <div style={{ textAlign:'center', padding:'2.5rem 1rem', background:'var(--card)', border:'.5px solid var(--border)', borderRadius:14 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🏦</div>
          <div style={{ fontSize:15, fontWeight:500, color:'var(--text)', marginBottom:6 }}>No loan tracked</div>
          <div style={{ fontSize:13, color:'var(--text3)', marginBottom:16 }}>Add your auto loan to track remaining balance — it updates automatically each month on your payment day</div>
          <button className="btn-primary" style={{ maxWidth:220, margin:'0 auto' }} onClick={() => { setEditLoan(undefined); setShowModal(true); }}>Add loan</button>
        </div>
      ) : (
        <>
          {loans.map(l => <LoanCard key={l.id} loan={l} vehicleId={id} onEdit={openEdit}/>)}
          {loans.length < 2 && (
            <button className="btn-ghost" onClick={() => { setEditLoan(undefined); setShowModal(true); }}>+ Add another loan</button>
          )}
        </>
      )}

      <div style={{ background:'var(--card)', border:'.5px solid var(--border)', borderRadius:12, padding:'0.875rem 1rem', fontSize:12, color:'var(--text3)', lineHeight:1.55 }}>
        💡 PitStop automatically deducts your monthly payment from the remaining balance on your payment day. Your actual payoff may differ based on interest — always check with your lender for the exact payoff amount.
      </div>

      {showModal && (
        <LoanModal
          vehicleId={id}
          initial={editLoan}
          onClose={() => { setShowModal(false); setEditLoan(undefined); }}
        />
      )}
    </>
  );
}
