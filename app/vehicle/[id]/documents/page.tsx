'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStore, useVehicle } from '@/lib/store';
import type { VehicleDocument } from '@/lib/types';

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

function ExpiryBadge({ days }: { days: number | null }) {
  if (days === null) return null;
  if (days < 0)  return <span className="badge badge-danger">{Math.abs(days)}d expired</span>;
  if (days <= 30) return <span className="badge badge-warn">Expires in {days}d</span>;
  return <span className="badge badge-ok">Valid</span>;
}

function DocCard({ doc, vehicleId, onEdit }: { doc: VehicleDocument; vehicleId: number; onEdit: (d: VehicleDocument) => void }) {
  const removeDoc = useStore(s => s.removeDocument);
  const days      = daysUntil(doc.expiresAt);
  const icon      = doc.type === 'insurance' ? '🛡' : doc.type === 'registration' ? '📋' : '📄';

  return (
    <div style={{ background:'var(--bg3)', border:`.5px solid ${days !== null && days <= 30 ? 'rgba(212,135,10,.35)' : 'var(--border)'}`, borderRadius:14, overflow:'hidden' }}>
      {doc.photo && (
        <img src={doc.photo} alt="" style={{ width:'100%', height:140, objectFit:'cover', display:'block' }}/>
      )}
      {!doc.photo && (
        <div style={{ height:80, background:'linear-gradient(160deg,var(--hero-a),var(--hero-b))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>{icon}</div>
      )}
      <div style={{ padding:'0.875rem 1rem' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8, marginBottom:6 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:'var(--text)' }}>{doc.label}</div>
            <div style={{ fontSize:11, color:'var(--text3)', marginTop:2, textTransform:'capitalize' }}>{doc.type}</div>
          </div>
          <ExpiryBadge days={days}/>
        </div>
        {doc.expiresAt && (
          <div style={{ fontSize:12, color:'var(--text2)', marginBottom:8 }}>
            Expires: {new Date(doc.expiresAt).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })}
          </div>
        )}
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn-sm" onClick={() => onEdit(doc)} style={{ flex:1 }}>Edit</button>
          <button className="btn-sm btn-sm-danger" onClick={() => { if (confirm('Delete this document?')) removeDoc(vehicleId, doc.id); }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function DocModal({ vehicleId, initial, onClose }: { vehicleId: number; initial?: VehicleDocument; onClose: () => void }) {
  const addDoc    = useStore(s => s.addDocument);
  const updateDoc = useStore(s => s.updateDocument);
  const fileRef   = useRef<HTMLInputElement>(null);

  const [type,      setType]      = useState<VehicleDocument['type']>(initial?.type ?? 'insurance');
  const [label,     setLabel]     = useState(initial?.label ?? '');
  const [expiresAt, setExpiresAt] = useState(initial?.expiresAt ?? '');
  const [photo,     setPhoto]     = useState<string | null>(initial?.photo ?? null);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = d => setPhoto(d.target?.result as string);
    r.readAsDataURL(f);
  }

  function save() {
    if (!label) { alert('Please enter a label'); return; }
    const doc: VehicleDocument = {
      id:         initial?.id ?? `doc_${Date.now()}`,
      type,
      label,
      photo,
      expiresAt:  expiresAt || null,
      remindDays: 30,
      uploadedAt: initial?.uploadedAt ?? new Date().toISOString(),
    };
    if (initial) updateDoc(vehicleId, initial.id, doc);
    else         addDoc(vehicleId, doc);
    onClose();
  }

  return (
    <div className="modal-bg open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle"/>
        <div className="modal-title">{initial ? 'Edit document' : 'Add document'}</div>

        <div className="form-group" style={{ marginBottom:'.875rem' }}>
          <label className="form-label">Type</label>
          <select className="form-select" value={type} onChange={e => setType(e.target.value as VehicleDocument['type'])}>
            <option value="insurance">Insurance Card</option>
            <option value="registration">Registration</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom:'.875rem' }}>
          <label className="form-label">Label</label>
          <input className="form-input" placeholder="e.g. State Farm Insurance Card" value={label} onChange={e => setLabel(e.target.value)}/>
        </div>

        <div className="form-group" style={{ marginBottom:'.875rem' }}>
          <label className="form-label">Expiration date <span style={{ opacity:.5, fontSize:10, textTransform:'none', letterSpacing:0 }}>(optional)</span></label>
          <input className="form-input" type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}/>
          {expiresAt && <div style={{ fontSize:11, color:'var(--text3)', marginTop:4 }}>You'll be reminded 30 days before expiry</div>}
        </div>

        <div className="form-group" style={{ marginBottom:'1.25rem' }}>
          <label className="form-label">Photo <span style={{ opacity:.5, fontSize:10, textTransform:'none', letterSpacing:0 }}>(optional)</span></label>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhoto}/>
          {photo ? (
            <div style={{ position:'relative' }}>
              <img src={photo} alt="" style={{ width:'100%', borderRadius:9, maxHeight:160, objectFit:'cover' }}/>
              <button onClick={() => setPhoto(null)} style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,.6)', border:'none', color:'#fff', borderRadius:6, padding:'4px 8px', fontSize:11, cursor:'pointer' }}>Remove</button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()} style={{ width:'100%', background:'var(--bg4)', border:'.5px dashed var(--border2)', borderRadius:9, padding:16, display:'flex', flexDirection:'column', alignItems:'center', gap:6, cursor:'pointer' }}>
              <span style={{ fontSize:24 }}>📷</span>
              <span style={{ fontSize:13, color:'var(--text3)' }}>Tap to add photo</span>
            </button>
          )}
        </div>

        <button className="btn-primary" onClick={save} style={{ marginBottom:8 }}>Save document</button>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default function VehicleDocumentsPage() {
  const id      = parseInt(useParams().id as string);
  const v       = useVehicle(id);
  const [showModal, setShowModal] = useState(false);
  const [editDoc,   setEditDoc]   = useState<VehicleDocument | undefined>();

  if (!v) return <div style={{ textAlign:'center', padding:'3rem', color:'var(--text3)' }}>Vehicle not found.</div>;

  const docs       = v.documents ?? [];
  const insurance  = docs.filter(d => d.type === 'insurance');
  const reg        = docs.filter(d => d.type === 'registration');
  const other      = docs.filter(d => d.type === 'other');

  // Expiring soon alerts
  const expiringSoon = docs.filter(d => {
    const days = daysUntil(d.expiresAt);
    return days !== null && days <= 30;
  });

  function openAdd() { setEditDoc(undefined); setShowModal(true); }
  function openEdit(d: VehicleDocument) { setEditDoc(d); setShowModal(true); }

  return (
    <>
      <div className="ph">
        <Link href={`/vehicle/${id}`} className="back-btn">←</Link>
        <span className="pt">Documents</span>
        <button className="sl" style={{ marginLeft:'auto' }} onClick={openAdd}>+ Add</button>
      </div>

      {expiringSoon.length > 0 && (
        <div className="alert alert-amber">
          <div className="dot dot-amber"/>
          <div className="alert-txt">
            <strong style={{ color:'var(--amber)' }}>{expiringSoon.length} document{expiringSoon.length > 1 ? 's' : ''} expiring soon</strong>
            {expiringSoon.map(d => ` · ${d.label}`).join('')}
          </div>
        </div>
      )}

      {docs.length === 0 ? (
        <div style={{ textAlign:'center', padding:'2.5rem 1rem', background:'var(--card)', border:'.5px solid var(--border)', borderRadius:14 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📄</div>
          <div style={{ fontSize:15, fontWeight:500, color:'var(--text)', marginBottom:6 }}>No documents yet</div>
          <div style={{ fontSize:13, color:'var(--text3)', marginBottom:16 }}>Add your insurance card and registration so everything is in one place</div>
          <button className="btn-primary" style={{ maxWidth:220, margin:'0 auto' }} onClick={openAdd}>Add first document</button>
        </div>
      ) : (
        <>
          {insurance.length > 0 && (
            <div>
              <div className="sh"><span className="st">Insurance</span></div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {insurance.map(d => <DocCard key={d.id} doc={d} vehicleId={id} onEdit={openEdit}/>)}
              </div>
            </div>
          )}
          {reg.length > 0 && (
            <div>
              <div className="sh"><span className="st">Registration</span></div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {reg.map(d => <DocCard key={d.id} doc={d} vehicleId={id} onEdit={openEdit}/>)}
              </div>
            </div>
          )}
          {other.length > 0 && (
            <div>
              <div className="sh"><span className="st">Other</span></div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {other.map(d => <DocCard key={d.id} doc={d} vehicleId={id} onEdit={openEdit}/>)}
              </div>
            </div>
          )}
          <button className="btn-ghost" onClick={openAdd}>+ Add another document</button>
        </>
      )}

      {showModal && (
        <DocModal
          vehicleId={id}
          initial={editDoc}
          onClose={() => { setShowModal(false); setEditDoc(undefined); }}
        />
      )}
    </>
  );
}
