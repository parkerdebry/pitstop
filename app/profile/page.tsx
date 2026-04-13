'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { LANGUAGES, t } from '@/lib/i18n';
import type { Language } from '@/lib/i18n';

const ACCENTS = ['#E8832A','#3A7FD4','#3BAF6A','#8B5CF6','#D94F4F'];

export default function ProfilePage() {
  const router    = useRouter();
  const theme     = useStore(s => s.theme);
  const accent    = useStore(s => s.accent);
  const language  = useStore(s => s.language) ?? 'en';
  const setTheme  = useStore(s => s.setTheme);
  const setAccent = useStore(s => s.setAccent);
  const setLang   = useStore(s => s.setLanguage);
  const user      = useStore(s => s.user);
  const setUser   = useStore(s => s.setUser);
  const vehicles  = useStore(s => s.vehicles);
  const { status: notifStatus, loading: notifLoading, requestPermission } = usePushNotifications();

  const connectedCount = vehicles.filter(v => v.smartcarId).length;
  const T = (key: string) => t(language, key);

  function handleSetTheme(th: 'dark' | 'light' | 'auto') {
    setTheme(th);
    const app = document.getElementById('app');
    if (!app) return;
    if (th === 'dark') app.removeAttribute('data-theme');
    else if (th === 'light') app.setAttribute('data-theme','light');
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

  const notifLabel = notifStatus === 'granted' ? `✅ ${T('notif.enabled')}`
    : notifStatus === 'denied'  ? `🚫 ${T('notif.blocked')}`
    : notifStatus === 'unsupported' ? T('notif.unsupported')
    : T('notif.tap_enable');

  const themes = [
    { key:'dark'  as const, label: T('appear.dark'),  desc: T('appear.dark_desc') },
    { key:'light' as const, label: T('appear.light'), desc: T('appear.light_desc') },
    { key:'auto'  as const, label: T('appear.auto'),  desc: T('appear.auto_desc') },
  ];

  const currentLang = LANGUAGES.find(l => l.code === language) ?? LANGUAGES[0];

  return (
    <>
      <span className="pt">{T('profile.title')}</span>

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
          <button onClick={handleSignOut} className="btn-sm btn-sm-danger">{T('profile.sign_out')}</button>
        </div>
      ) : (
        <div className="card-lg" style={{ padding:'1.25rem', display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--bg4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>👤</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:500, color:'var(--text)' }}>{T('profile.not_signed_in')}</div>
            <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>{T('profile.sign_in_sync')}</div>
          </div>
          <Link href="/auth" style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:12, fontWeight:700, letterSpacing:'.5px', textTransform:'uppercase', color:'var(--accent)', textDecoration:'none', padding:'6px 12px', borderRadius:8, border:'.5px solid rgba(232,131,42,.3)', background:'rgba(232,131,42,.08)', whiteSpace:'nowrap' }}>
            {T('profile.sign_in')}
          </Link>
        </div>
      )}

      {/* Pro card */}
      <div className="pro-card">
        <div className="pro-card-title">{T('profile.pro_title')} ✓</div>
        <div style={{ fontSize:13, color:'var(--text2)' }}>{T('profile.renews')} Apr 2, 2027 · $39.99/yr</div>
        <div style={{ display:'flex', flexDirection:'column', gap:5, marginTop:4 }}>
          {['Unlimited vehicles & shared garage','PitStop Mechanic — unlimited questions','NHTSA recall monitoring — live alerts','Service history, analytics & PDF export'].map(f =>
            <div key={f} className="pro-feat">{f}</div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="sh"><span className="st">{T('notif.title')}</span></div>
      <div className="s-group">
        <div className="s-row" onClick={notifStatus === 'default' ? requestPermission : undefined} style={{ cursor: notifStatus === 'default' ? 'pointer' : 'default' }}>
          <div className="s-icon" style={{ background:'rgba(232,131,42,.12)' }}>🔔</div>
          <div style={{ flex:1 }}>
            <div className="s-lbl">{T('notif.recall_alerts')}</div>
            <div style={{ fontSize:11, color:'var(--text3)', marginTop:1 }}>{notifLoading ? T('notif.enabling') : notifLabel}</div>
          </div>
          {notifStatus === 'default' && <span style={{ fontSize:12, color:'var(--accent)', fontWeight:600 }}>{T('notif.enable')}</span>}
        </div>
        <div className="s-row">
          <div className="s-icon" style={{ background:'rgba(232,131,42,.12)' }}>⏰</div>
          <div className="s-lbl" style={{ flex:1 }}>{T('notif.maint_reminders')}</div>
          <span className="s-val">500 {T('notif.mi_before')} →</span>
        </div>
        <div className="s-row">
          <div className="s-icon" style={{ background:'rgba(58,127,212,.12)' }}>📄</div>
          <div className="s-lbl" style={{ flex:1 }}>{T('notif.doc_expiry')}</div>
          <span className="s-val">30 {T('notif.days_before')} →</span>
        </div>
      </div>

      {/* Garage */}
      <div className="sh"><span className="st">{T('garage.title')}</span></div>
      <div className="s-group">
        <Link href="/connect" className="s-row">
          <div className="s-icon" style={{ background:'rgba(58,127,212,.12)' }}>🔗</div>
          <div className="s-lbl">{T('garage.connected')}</div>
          <span className="s-val" style={{ color: connectedCount > 0 ? 'var(--green)' : 'var(--text3)' }}>{connectedCount > 0 ? `${connectedCount} ${T('garage.connected_count')} ›` : '›'}</span>
        </Link>
        <Link href="/billing" className="s-row">
          <div className="s-icon" style={{ background:'rgba(232,131,42,.12)' }}>💳</div>
          <div className="s-lbl">{T('garage.billing')}</div>
          <span className="s-val" style={{ color:'var(--green)' }}>Pro ›</span>
        </Link>
        <Link href="/notifications" className="s-row">
          <div className="s-icon" style={{ background:'rgba(232,131,42,.12)' }}>📬</div>
          <div className="s-lbl">{T('garage.notif_history')}</div>
          <span className="s-val">›</span>
        </Link>
        <Link href="/documents" className="s-row">
          <div className="s-icon" style={{ background:'rgba(58,127,212,.12)' }}>📁</div>
          <div className="s-lbl">{T('garage.documents')}</div>
          <span className="s-val">›</span>
        </Link>
        <Link href="/export" className="s-row">
          <div className="s-icon" style={{ background:'rgba(59,175,106,.12)' }}>📄</div>
          <div className="s-lbl">{T('garage.export')}</div>
          <span className="s-val">›</span>
        </Link>
      </div>

      {/* Language */}
      <div className="sh"><span className="st">{T('lang.title')}</span></div>
      <div className="s-group">
        {LANGUAGES.map(lang => (
          <div
            key={lang.code}
            className="s-row"
            onClick={() => setLang(lang.code)}
            style={{ cursor:'pointer' }}
          >
            <div className="s-icon" style={{ background:'rgba(58,127,212,.08)', fontSize:18 }}>{lang.flag}</div>
            <div className="s-lbl">{lang.label}</div>
            {language === lang.code && (
              <span style={{ fontSize:16, color:'var(--accent)' }}>✓</span>
            )}
          </div>
        ))}
      </div>

      {/* Appearance */}
      <div className="sh"><span className="st">{T('appear.title')}</span></div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {themes.map(th => (
          <div key={th.key} className={`theme-card${theme === th.key ? ' selected' : ''}`} onClick={() => handleSetTheme(th.key)}>
            <div style={{ width:52, height:38, borderRadius:8, overflow:'hidden', flexShrink:0, border:'.5px solid var(--border2)', background: th.key === 'dark' ? '#1C1C1E' : th.key === 'light' ? '#F2F2F7' : 'linear-gradient(135deg,#1C1C1E 50%,#F2F2F7 50%)' }}/>
            <div className="theme-info"><div className="theme-name">{th.label}</div><div className="theme-desc">{th.desc}</div></div>
            <div className="theme-radio"><div className="theme-radio-dot"/></div>
          </div>
        ))}
      </div>

      <div>
        <div className="sh" style={{ marginBottom:'.75rem' }}><span className="st">{T('appear.accent')}</span></div>
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
      <div className="sh"><span className="st">{T('account.title')}</span></div>
      <div className="s-group">
        <div className="s-row"><div className="s-icon" style={{ background:'rgba(0,0,0,.05)' }}>🔒</div><div className="s-lbl">{T('account.privacy')}</div><span className="s-val">›</span></div>
        <Link href="/auth" className="s-row"><div className="s-icon" style={{ background:'rgba(0,0,0,.05)' }}>📜</div><div className="s-lbl">{T('account.tos')}</div><span className="s-val">›</span></Link>
        {user && <div className="s-row" onClick={handleSignOut} style={{ cursor:'pointer' }}><div className="s-icon" style={{ background:'rgba(217,79,79,.1)' }}>🚪</div><div className="s-lbl" style={{ color:'var(--red)' }}>{T('account.sign_out')}</div></div>}
      </div>

      <div style={{ textAlign:'center', padding:'.5rem 0' }}>
        <div style={{ fontSize:12, color:'var(--text3)' }}>{T('misc.version')}</div>
        <div style={{ fontSize:11, color:'var(--text3)', opacity:.5, marginTop:2 }}>{T('misc.copyright')}</div>
      </div>
    </>
  );
}
