'use client';
import Link from 'next/link';

const DOCS = [
  { bg:'rgba(58,127,212,.12)',  icon:'🛡', name:'State Farm Insurance Card', meta:'Expires Apr 25, 2025 · 2019 Camry', badge:'Expiring', badgeCls:'badge-warn', expiring:true },
  { bg:'rgba(232,131,42,.12)', icon:'📄', name:'CA Registration 2025',       meta:'Expires Dec 31, 2025 · 2019 Camry', badge:'OK',       badgeCls:'badge-ok'   },
  { bg:'rgba(139,92,246,.12)', icon:'⭐', name:'Toyota Extended Warranty',   meta:'Expires Mar 1, 2027 · 100k mi',    badge:'OK',       badgeCls:'badge-ok'   },
  { bg:'rgba(59,175,106,.12)', icon:'🧾', name:'Oil Change Receipt — Mar 14',meta:'Jiffy Lube · $68.00',              badge:'PDF',      badgeCls:''            },
  { bg:'rgba(59,175,106,.12)', icon:'🧾', name:'Brake Pad Receipt',          meta:'Midas · $240.00',                  badge:'PDF',      badgeCls:''            },
  { bg:'rgba(58,127,212,.12)', icon:'🛡', name:'Progressive Insurance Card', meta:'Expires Jan 1, 2026 · Sportster',  badge:'OK',       badgeCls:'badge-ok'   },
];

export default function DocumentsPage() {
  return (
    <>
      <div className="ph">
        <Link href="/settings" className="back-btn">←</Link>
        <span className="pt">Documents</span>
        <button className="sl" style={{ marginLeft:'auto' }} onClick={() => alert('Upload feature coming soon')}>+ Upload</button>
      </div>
      <div className="card-lg" style={{ padding:'1rem 1.25rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.5rem' }}>
          <span style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>Storage used</span>
          <span style={{ fontSize:12, color:'var(--text3)' }}>142 MB of 5 GB</span>
        </div>
        <div style={{ height:5, background:'var(--card)', borderRadius:3, overflow:'hidden' }}>
          <div style={{ width:'3%', height:'100%', background:'linear-gradient(90deg,var(--accent),var(--accent2))', borderRadius:3 }}/>
        </div>
      </div>
      <div className="alert alert-amber">
        <div className="dot dot-amber"/>
        <div className="alert-txt"><strong style={{ color:'var(--amber)' }}>Insurance expires in 23 days</strong> — 2019 Toyota Camry</div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
        {DOCS.map(d => (
          <div key={d.name} className={`doc-card${d.expiring ? ' expiring' : ''}`} onClick={() => alert('Opening document…')}>
            <div className="doc-thumb" style={{ background:d.bg }}>{d.icon}</div>
            <div style={{ flex:1 }}>
              <div className="doc-name">{d.name}</div>
              <div className="doc-meta">{d.meta}</div>
            </div>
            <span className={`badge ${d.badgeCls}`} style={!d.badgeCls ? { background:'var(--card)', color:'var(--text3)' } : undefined}>{d.badge}</span>
          </div>
        ))}
      </div>
    </>
  );
}
