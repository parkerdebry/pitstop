'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useVehicle } from '@/lib/store';

interface RecallResult {
  NHTSACampaignNumber?: string;
  Component?: string;
  Summary?: string;
  RemedyAvailableYN?: string;
}

export default function RecallsPage() {
  const id  = parseInt(useParams().id as string);
  const v   = useVehicle(id);
  const [vin,     setVin]     = useState(v?.vin ?? '');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RecallResult[] | null>(null);
  const [error,   setError]   = useState('');
  const camFileRef = { current: null as HTMLInputElement | null };

  async function checkRecalls() {
    if (!v) return;
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const res  = await fetch(`https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(v.make)}&model=${encodeURIComponent(v.model)}&modelYear=${v.year}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setError('Could not reach NHTSA. Check your connection and try again.');
    }
    setLoading(false);
  }

  if (!v) return <div style={{ textAlign:'center', padding:'3rem', color:'var(--text3)' }}>Vehicle not found.</div>;

  return (
    <>
      <div className="ph">
        <Link href={`/vehicle/${id}`} className="back-btn">←</Link>
        <span className="pt">Recall Monitor</span>
        <span className="badge badge-ok" style={{ marginLeft:'auto', fontSize:9 }}>NHTSA Live</span>
      </div>

      {/* Search card */}
      <div className="card-lg" style={{ padding:'1.25rem', display:'flex', flexDirection:'column', gap:'.875rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:46, height:46, borderRadius:12, background:'rgba(217,79,79,.13)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>🔍</div>
          <div>
            <div style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:17, fontWeight:700, color:'var(--text)' }}>{v.year} {v.make} {v.model}</div>
            <div style={{ fontSize:12, color:'var(--text2)' }}>Check NHTSA safety recalls</div>
          </div>
        </div>
        <div className="vin-row">
          <input className="vin-input" value={vin} onChange={e => setVin(e.target.value.toUpperCase())} placeholder="Enter VIN to search" maxLength={17}/>
          <button className="vin-btn" onClick={() => { /* camera stub */ alert('Open camera — type VIN shown'); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            Scan
          </button>
          <button className="vin-btn vin-btn-primary" onClick={checkRecalls}>Check NHTSA</button>
        </div>
        <div style={{ fontSize:11, color:'var(--text3)' }}>Free NHTSA database · Updated daily · No account needed</div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, padding:'2rem 1rem' }}>
          <div className="recall-spinner"/>
          <div style={{ fontSize:13, color:'var(--text2)' }}>Checking NHTSA database…</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-amber">
          <div className="dot dot-amber"/>
          <div className="alert-txt">{error} <a href="https://www.nhtsa.gov/vehicle-safety/recalls" target="_blank" rel="noreferrer" style={{ color:'var(--accent)' }}>Search manually ↗</a></div>
        </div>
      )}

      {/* Results */}
      {results !== null && !loading && (
        results.length === 0
          ? <div className="recall-banner clear">
              <span style={{ fontSize:28 }}>✅</span>
              <div>
                <div style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:18, fontWeight:700, color:'var(--green)' }}>No open recalls</div>
                <div style={{ fontSize:12, color:'var(--text2)' }}>No safety recalls found for your {v.year} {v.make} {v.model}.</div>
              </div>
            </div>
          : <>
              <div className="recall-banner open">
                <span style={{ fontSize:28 }}>⚠️</span>
                <div>
                  <div style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:18, fontWeight:700, color:'var(--red)' }}>{results.length} recall{results.length !== 1 ? 's' : ''} found</div>
                  <div style={{ fontSize:12, color:'var(--text2)' }}>Contact your dealership for free repairs.</div>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {results.slice(0, 6).map((r, i) => {
                  const hasRemedy = r.RemedyAvailableYN === 'Yes' || r.RemedyAvailableYN === 'Y';
                  const summary   = (r.Summary ?? '').replace(/<[^>]*>/g, '').trim();
                  return (
                    <div key={i} className="recall-card">
                      <div className="recall-card-top">
                        <div className={`recall-bar ${hasRemedy ? 'remedy' : 'open'}`}/>
                        <div style={{ flex:1, minWidth:0 }}>
                          {r.NHTSACampaignNumber && <div className="recall-campaign">NHTSA {r.NHTSACampaignNumber}</div>}
                          <div className="recall-component">{r.Component ?? 'Safety issue'}</div>
                        </div>
                        <span className={`badge ${hasRemedy ? 'badge-warn' : 'badge-danger'}`}>{hasRemedy ? 'Remedy' : 'Open'}</span>
                      </div>
                      {summary && <div className="recall-summary">{summary.slice(0, 220)}{summary.length > 220 ? '…' : ''}</div>}
                      <div className="recall-foot">
                        <span className="recall-status" style={{ color: hasRemedy ? 'var(--amber)' : 'var(--red)' }}>{hasRemedy ? 'Remedy available' : 'Remedy pending'}</span>
                        <button className="recall-link" onClick={() => window.open('https://www.nhtsa.gov/vehicle-safety/recalls','_blank')}>NHTSA ↗</button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ background:'var(--card)', border:'.5px solid var(--border)', borderRadius:12, padding:'1rem', display:'flex', alignItems:'flex-start', gap:10 }}>
                <span style={{ fontSize:18, flexShrink:0 }}>🏪</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--text)', marginBottom:3 }}>Schedule your free repair</div>
                  <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.55 }}>Recall repairs are always free at your dealership. Call your nearest {v.make} dealer and reference the campaign numbers above.</div>
                </div>
              </div>
            </>
      )}
    </>
  );
}
