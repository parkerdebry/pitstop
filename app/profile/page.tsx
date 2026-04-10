'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const ACCENTS = ['#E8832A','#3A7FD4','#3BAF6A','#8B5CF6','#D94F4F'];

export default function ProfilePage() {
  const router    = useRouter();
  const theme     = useStore(s => s.theme);
  const accent    = useStore(s => s.accent);
  const setTheme  = useStore(s => s.setTheme);
  const setAccent = useStore(s => s.setAccent);
  const user      = useStore(s => s.user);
  const setUser   = useStore(s => s.setUser);
  const vehicles  = useStore(s => s.vehicles);
  const { status: notifStatus, loading: notifLoading, requestPermission } = usePushNotifications();

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

  async function handleSignOut() {
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase.auth.signOut();
    } catch { /* ignore */ }
    setUser(null);
  }

  const notifLabel = notifStatus === 'granted' ? '✅ Enabled'
    : notifStatus === 'denied'  ? '🚫 Blocked in browser settings'
    : notifStatus === 'unsupported' ? 'Not supported on this browser'
    : 'Tap to enable';

  const themes = [
    { key:'dark'  as const, label:'Dark',  desc:'Easy on the eyes in low light' },
    { key:'light' as const, label:'Light', desc:'Clean and bright'               },
    { key:'auto'  as const, label:'Auto',  desc:'Matches your device settings'  },
  ];

  return (
    <>
      <span className="pt">Profile</span>

      {/* User card */}
      {user ? (
        <div className="card-lg" style={{ padding:'1.25rem', display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-barlow-condensed)', fontSize:22, fontWeight:700, color:'#fff', flexShrink:0 }}>
            {(user.name ?? user.email)[0].toUpperCase()}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:16, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name ?? 'PitStop User'}</div>
            <div style={{ fontSize:12, color:'var(--text3)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.email}</div>
          </div>
          <button onClick={handleSignOut} className="btn-sm btn-sm-danger">Sign out</button>
        </div>
      ) : (
        <div className="card-lg" style={{ padding:'1.25rem', display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--bg4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>👤</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:500, color:'var(--text)' }}>Not signed in</div>
            <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>Sign in to sync across devices</div>
          </div>
          <Link href="/auth" style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:12, fontWeight:700, letterSpacing:'.5px', textTransform:'uppercase', color:'var(--accent)', textDecoration:'none', padding:'6px 12px', borderRadius:8, border:'.5px solid rgba(232,131,42,.3)', background:'rgba(232,131,42,.08)', whiteSpace:'nowrap' }}>
            Sign in
          </Link>
        </div>
      )}

      {/* Pro card */}
      <div className="pro-card">
        <div className="pro-card-title">PitStop Pro ✓</div>
        <div style={{ fontSize:13, color:'var(--text2)' }}>Renews Apr 2, 2027 · $39.99/yr</div>
        <div style={{ display:'flex', flexDirection:'column', gap:5, marginTop:4 }}>
          {['Unlimited vehicles & shared garage','PitStop Mechanic — unlimited questions','NHTSA recall monitoring — live alerts','Service history, analytics & PDF export'].map(f =>
            <div key={f} className="pro-feat">{f}</div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="sh"><span className="st">Notifications</span></div>
      <div className="s-group">
        <div className="s-row" onClick={notifStatus === 'default' ? requestPermission : undefined} style={{ cursor: notifStatus === 'default' ? 'pointer' : 'default' }}>
          <div className="s-icon" style={{ background:'rgba(232,131,42,.12)' }}>🔔</div>
          <div style={{ flex:1 }}>
            <div className="s-lbl">Recall alerts</div>
            <div style={{ fontSize:11, color:'var(--text3)', marginTop:1 }}>{notifLoading ? 'Enabling…' : notifLabel}</div>
          </div>
          {notifStatus === 'default' && <span style={{ fontSize:12, color:'var(--accent)', fontWeight:600 }}>Enable</span>}
        </div>
        <div className="s-row">
          <div className="s-icon" style={{ background:'rgba(232,131,42,.12)' }}>⏰</div>
          <div className="s-lbl" style={{ flex:1 }}>Maintenance reminders</div>
          <span className="s-val">500 mi before →</span>
        </div>
        <div className="s-row">
          <div className="s-icon" style={{ background:'rgba(58,127,212,.12)' }}>📄</div>
          <div className="s-lbl" style={{ flex:1 }}>Document expiry reminders</div>
          <span className="s-val">30 days before →</span>
        </div>
      </div>

      {/* Garage */}
      <div className="sh"><span className="st">Garage</span></div>
      <div className="s-group">
        <Link href="/connect" className="s-row">
          <div className="s-icon" style={{ background:'rgba(58,127,212,.12)' }}>🔗</div>
          <div className="s-lbl">Connected vehicles</div>
          <span className="s-val" style={{ color: connectedCount > 0 ? 'var(--green)' : 'var(--text3)' }}>{connectedCount > 0 ? `${connectedCount} connected ›` : '›'}</span>
        </Link>
        <Link href="/billing" className="s-row">
          <div className="s-icon" style={{ background:'rgba(232,131,42,.12)' }}>💳</div>
          <div className="s-lbl">Subscription & billing</div>
          <span className="s-val" style={{ color:'var(--green)' }}>Pro ›</span>
        </Link>
        <Link href="/notifications" className="s-row">
          <div className="s-icon" style={{ background:'rgba(232,131,42,.12)' }}>📬</div>
          <div className="s-lbl">Notification history</div>
          <span className="s-val">›</span>
        </Link>
        <Link href="/documents" className="s-row">
          <div className="s-icon" style={{ background:'rgba(58,127,212,.12)' }}>📁</div>
          <div className="s-lbl">All documents</div>
          <span className="s-val">›</span>
        </Link>
        <Link href="/export" className="s-row">
          <div className="s-icon" style={{ background:'rgba(59,175,106,.12)' }}>📄</div>
          <div className="s-lbl">Export service history</div>
          <span className="s-val">›</span>
        </Link>
      </div>

      {/* Appearance */}
      <div className="sh"><span className="st">Appearance</span></div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {themes.map(t => (
          <div key={t.key} className={`theme-card${theme === t.key ? ' selected' : ''}`} onClick={() => handleSetTheme(t.key)}>
            <div style={{ width:52, height:38, borderRadius:8, overflow:'hidden', flexShrink:0, border:'.5px solid var(--border2)', background: t.key === 'dark' ? '#1C1C1E' : t.key === 'light' ? '#F2F2F7' : 'linear-gradient(135deg,#1C1C1E 50%,#F2F2F7 50%)' }}/>
            <div className="theme-info"><div className="theme-name">{t.label}</div><div className="theme-desc">{t.desc}</div></div>
            <div className="theme-radio"><div className="theme-radio-dot"/></div>
          </div>
        ))}
      </div>

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
      </div>

      {/* Account */}
      <div className="sh"><span className="st">Account</span></div>
      <div className="s-group">
        <div className="s-row"><div className="s-icon" style={{ background:'rgba(0,0,0,.05)' }}>🔒</div><div className="s-lbl">Privacy & data</div><span className="s-val">›</span></div>
        <Link href="/auth" className="s-row"><div className="s-icon" style={{ background:'rgba(0,0,0,.05)' }}>📜</div><div className="s-lbl">Terms of service</div><span className="s-val">›</span></Link>
        {user && <div className="s-row" onClick={handleSignOut} style={{ cursor:'pointer' }}><div className="s-icon" style={{ background:'rgba(217,79,79,.1)' }}>🚪</div><div className="s-lbl" style={{ color:'var(--red)' }}>Sign out</div></div>}
      </div>

      <div style={{ textAlign:'center', padding:'.5rem 0' }}>
        <div style={{ fontSize:12, color:'var(--text3)' }}>PitStop v1.1.0</div>
        <div style={{ fontSize:11, color:'var(--text3)', opacity:.5, marginTop:2 }}>© 2025 PitStop. All rights reserved.</div>
      </div>
    </>
  );
}
