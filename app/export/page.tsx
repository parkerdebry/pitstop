'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { getTracking } from '@/lib/maintenance';

export default function ExportPage() {
  const vehicles  = useStore(s => s.vehicles);
  const [selected, setSelected] = useState(vehicles[0]?.id ?? 0);
  const v  = vehicles.find(x => x.id === selected) ?? vehicles[0];
  const logs = v ? (v.serviceLog ?? []).slice().sort((a,b) => new Date(b.date).getTime()-new Date(a.date).getTime()) : [];
  const { value, unit } = v ? getTracking(v) : { value:0, unit:'mi' };

  return (
    <>
      <div className="ph">
        <Link href="/settings" className="back-btn">←</Link>
        <span className="pt">Export History</span>
      </div>
      <div className="card-lg" style={{ padding:'1rem 1.25rem' }}>
        <div className="st" style={{ marginBottom:'.75rem' }}>Select vehicle</div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {vehicles.map(ve => (
            <div key={ve.id} onClick={() => setSelected(ve.id)} style={{ display:'flex', alignItems:'center', gap:10, background:'var(--card)', border:`.5px solid ${selected===ve.id?'var(--accent)':'var(--border)'}`, borderRadius:9, padding:'10px 13px', cursor:'pointer' }}>
              <div style={{ width:16, height:16, borderRadius:'50%', border:`1.5px solid ${selected===ve.id?'var(--accent)':'var(--text3)'}`, background:selected===ve.id?'var(--accent)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {selected===ve.id && <div style={{ width:7, height:7, borderRadius:'50%', background:'#fff' }}/>}
              </div>
              <span style={{ fontSize:13, fontWeight:500, flex:1, color:'var(--text)' }}>{ve.emoji} {ve.year} {ve.make} {ve.model}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Include toggles */}
      <div>
        <div className="sh"><span className="st">Include</span></div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {['📋 Service history','💰 Cost breakdown','🔧 Maintenance status'].map(label => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:12, background:'var(--card)', border:'.5px solid var(--border)', borderRadius:10, padding:'10px 13px' }}>
              <span style={{ fontSize:14, flex:1, color:'var(--text)' }}>{label}</span>
              <button className="toggle on" onClick={e => (e.target as HTMLElement).classList.toggle('on')}/>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      {v && (
        <div>
          <div className="sh"><span className="st">Preview</span></div>
          <div style={{ background:'var(--bg4)', border:'.5px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'9px 13px', borderBottom:'.5px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:12, color:'var(--text2)' }}>pitstop-{v.make.toLowerCase()}-{v.model.toLowerCase()}-history.pdf</span>
              <span className="badge badge-ok">Ready</span>
            </div>
            <div style={{ padding:12 }}>
              <div style={{ background:'#fff', borderRadius:8, padding:16, color:'#111', fontSize:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', paddingBottom:10, borderBottom:'2px solid #E8832A', marginBottom:12 }}>
                  <div style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:17, fontWeight:700, color:'#1C1C1E' }}>Pit<span style={{ color:'#E8832A' }}>Stop</span></div>
                  <div style={{ fontSize:9, color:'#888', textAlign:'right' }}>Service History Report<br/>Apr 2025</div>
                </div>
                <div style={{ fontSize:14, fontWeight:700, marginBottom:1, color:'#111' }}>{v.year} {v.make} {v.model} {v.trim}</div>
                <div style={{ fontSize:9, color:'#888', marginBottom:10 }}>{value.toLocaleString()} {unit} · {logs.length} records</div>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'#E8832A', marginBottom:5 }}>Service history</div>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:10, marginBottom:10 }}>
                  <thead><tr>{['Date','Service','Cost'].map(h => <th key={h} style={{ background:'#f5f5f7', textAlign:'left', padding:'4px 7px', fontWeight:600, color:'#555', fontSize:9, textTransform:'uppercase' }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {logs.slice(0,4).map(l => (
                      <tr key={l.id}><td style={{ padding:'4px 7px', borderBottom:'1px solid #f0f0f0', color:'#333' }}>{new Date(l.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td><td style={{ padding:'4px 7px', borderBottom:'1px solid #f0f0f0', color:'#333' }}>{l.service}</td><td style={{ padding:'4px 7px', borderBottom:'1px solid #f0f0f0', color:'#333' }}>{l.cost>0?`$${l.cost}`:'-'}</td></tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ fontSize:8, color:'#aaa', textAlign:'center', paddingTop:7, borderTop:'1px solid #eee' }}>Generated by PitStop · pitstop.app</div>
              </div>
            </div>
          </div>
        </div>
      )}
      <button className="btn-primary" onClick={() => alert('PDF opened — save from print dialog')}>⬇ Download PDF</button>
    </>
  );
}
