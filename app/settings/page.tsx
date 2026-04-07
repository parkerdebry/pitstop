'use client';

import Link from 'next/link';
import { useStore } from '@/lib/store';

const ACCENTS = ['#E8832A','#3A7FD4','#3BAF6A','#8B5CF6','#D94F4F'];

export default function SettingsPage() {
  const theme     = useStore(s => s.theme);
  const accent    = useStore(s => s.accent);
  const setTheme  = useStore(s => s.setTheme);
  const setAccent = useStore(s => s.setAccent);
  const vehicles  = useStore(s => s.vehicles);
  const connectedCount = vehicles.filter(v => v.smartcarId).length;

  function handleSetTheme(t: 'dark' | 'light' | 'auto') {
    setTheme(t);
    const app = document.getElementById('app');
    if (!app) return;
    if (t === 'dark') app.removeAttribute('data-theme');
    else if (t === 'light') app.setAttribute('data-theme','light');
    else {
      const dark = window.matchMedia('(prefers-color-scheme:dark)').matches;
      if (dark) app.removeAttribute('data-theme'); else app.setAttribute('data-theme','light');
    }
  }

  function handleSetAccent(c: string) {
    setAccent(c);
    document.documentElement.style.setProperty('--accent', c);
  }

  const themes = [
    { key:'dark'  as const, label:'Dark',  desc:'Easy on the eyes in low light',     cls:'tp-dark',  barCls:'' },
    { key:'light' as const, label:'Light', desc:'Clean and bright',                  cls:'tp-light', barCls:'tp-bar-light' },
    { key:'auto'  as const, label:'Auto',  desc:'Matches your device settings',      cls:'tp-auto',  barCls:'' },
  ];

  return (
    <>
      <span className="pt">Settings</span>

      {/* Pro card */}
      <div className="pro-card">
        <div className="pro-card-title">You're on PitStop Pro ✓</div>
        <div style={{ fontSize:13, color:'var(--text2)' }}>Renews Apr 2, 2027 · $39.99/yr</div>
        <div style={{ display:'flex', flexDirection:'column', gap:5, marginTop:4 }}>
          {['Unlimited vehicles & shared garage','PitStop Mechanic — unlimited questions','NHTSA recall monitoring — live alerts','Service history, analytics & PDF export'].map(f =>
            <div key={f} className="pro-feat">{f}</div>
          )}
        </div>
      </div>

      {/* Menu */}
      <div className="s-group">
        <Link href="/vehicle/1/recalls" className="s-row"><div className="s-icon" style={{ background:'rgba(217,79,79,.12)' }}>⚠️</div><div className="s-lbl">Recall monitor</div><span className="s-val" style={{ color:'var(--red)' }}>›</span></Link>
        <Link href="/connect" className="s-row"><div className="s-icon" style={{ background:'rgba(58,127,212,.12)' }}>🔗</div><div className="s-lbl">Connected vehicles</div><span className="s-val" style={{ color: connectedCount > 0 ? 'var(--green)' : 'var(--text3)' }}>{connectedCount > 0 ? `${connectedCount} connected ›` : '›'}</span></Link>
        <Link href="/billing" className="s-row"><div className="s-icon" style={{ background:'rgba(232,131,42,.12)' }}>💳</div><div className="s-lbl">Subscription & billing</div><span className="s-val" style={{ color:'var(--green)' }}>Pro ›</span></Link>
        <Link href="/notifications" className="s-row"><div className="s-icon" style={{ background:'rgba(232,131,42,.12)' }}>🔔</div><div className="s-lbl">Notifications</div><span className="s-val">›</span></Link>
        <Link href="/documents" className="s-row"><div className="s-icon" style={{ background:'rgba(58,127,212,.12)' }}>📁</div><div className="s-lbl">Documents</div><span className="s-val">›</span></Link>
        <Link href="/export" className="s-row"><div className="s-icon" style={{ background:'rgba(59,175,106,.12)' }}>📄</div><div className="s-lbl">Export service history</div><span className="s-val">›</span></Link>
        <div className="s-row"><div className="s-icon" style={{ background:'rgba(139,92,246,.12)' }}>👥</div><div className="s-lbl">Shared garage</div><span className="s-val">›</span></div>
        <div className="s-row"><div className="s-icon" style={{ background:'rgba(0,0,0,.05)' }}>🔒</div><div className="s-lbl">Privacy & data</div><span className="s-val">›</span></div>
      </div>

      {/* Theme picker */}
      <div className="sh"><span className="st">Appearance</span></div>
      <div>
        {themes.map(t => (
          <div key={t.key} className={`theme-card${theme === t.key ? ' selected' : ''}`} onClick={() => handleSetTheme(t.key)}>
            <div className={`theme-preview ${t.cls}`} style={{ position:'relative' }}>
              {t.key === 'auto'
                ? <div style={{ position:'absolute', inset:0, display:'flex' }}>
                    <div style={{ flex:1, padding:'5px 5px 0' }}><div style={{ height:6, background:'rgba(255,255,255,.18)', borderRadius:2 }}/></div>
                    <div style={{ flex:1, padding:'5px 5px 0' }}><div style={{ height:6, background:'rgba(0,0,0,.12)', borderRadius:2 }}/></div>
                  </div>
                : <>
                    <div className={`tp-bar ${t.barCls}`}/>
                    <div className="tp-row">
                      <div className="tp-dot" style={{ background: t.key === 'dark' ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.12)' }}/>
                      <div className="tp-dot" style={{ background:'#E8832A', marginLeft:3 }}/>
                    </div>
                  </>
              }
            </div>
            <div className="theme-info"><div className="theme-name">{t.label}</div><div className="theme-desc">{t.desc}</div></div>
            <div className="theme-radio"><div className="theme-radio-dot"/></div>
          </div>
        ))}
      </div>

      {/* Accent colour */}
      <div>
        <div className="sh" style={{ marginBottom:'.75rem' }}><span className="st">Accent colour</span></div>
        <div className="accent-row">
          {ACCENTS.map(c => (
            <div key={c} className={`accent-swatch${accent === c ? ' active' : ''}`} onClick={() => handleSetAccent(c)}>
              <div className="accent-inner" style={{ background:c }}/>
              <span className="accent-check">✓</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize:11, color:'var(--text3)', marginTop:8 }}>Changes buttons, highlights, and active states.</div>
      </div>

      <div style={{ textAlign:'center', padding:'.5rem 0' }}>
        <div style={{ fontSize:12, color:'var(--text3)' }}>PitStop v1.1.0</div>
        <div style={{ fontSize:11, color:'var(--text3)', opacity:.5, marginTop:2 }}>© 2025 PitStop. All rights reserved.</div>
      </div>
    </>
  );
}
