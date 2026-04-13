'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

// ── Logo SVG ────────────────────────────────────────────────────────
function LogoMark() {
  return (
    <svg viewBox="0 0 34 34" fill="none" width="20" height="20">
      <polygon points="17,3 28,9 28,22 17,28 6,22 6,9" fill="none" stroke="#E8832A" strokeWidth="1.5" opacity="0.7"/>
      <polygon points="17,7 24,11 24,20 17,24 10,20 10,11" fill="none" stroke="#E8832A" strokeWidth="0.7" opacity="0.25"/>
      <g transform="translate(17,17) rotate(-45)">
        <rect x="-3" y="-8.5" width="6" height="17" rx="1.5" fill="#E8832A"/>
        <rect x="-5" y="-13.5" width="10" height="5" rx="1.5" fill="#E8832A"/>
        <rect x="-2" y="-16" width="4" height="4" rx="0.8" fill="var(--bg)"/>
        <rect x="-5" y="8.5" width="10" height="5" rx="1.5" fill="#E8832A"/>
        <rect x="-2" y="11.5" width="4" height="4" rx="0.8" fill="var(--bg)"/>
      </g>
    </svg>
  );
}

// ── Bottom Nav ───────────────────────────────────────────────────────
function BottomNav() {
  const path = usePathname();
  const language = useStore(s => s.language) ?? 'en';
  const T = (key: string) => t(language, key);
  const isHome     = path === '/';
  const isRecalls  = path.includes('/recalls');
  const isMechanic = path.includes('/mechanic');
  const isHistory  = path.includes('/history');
  const isSettings = path === '/profile';

  // For vehicle-specific pages, link back to current vehicle or first
  const vehicles = useStore(s => s.vehicles);
  const vehicleId = (() => {
    const m = path.match(/\/vehicle\/(\d+)/);
    if (m) return parseInt(m[1]);
    return vehicles[0]?.id ?? 1;
  })();

  return (
    <nav className="bottom-nav">
      <Link href="/" className={`nav-btn${isHome ? ' active' : ''}`}>
        <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>{T('nav.home')}</span>
      </Link>
      <Link href={`/vehicle/${vehicleId}/recalls`} className={`nav-btn${isRecalls ? ' active' : ''}`}>
        <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <span>{T('nav.recalls')}</span>
      </Link>
      <Link href={`/vehicle/${vehicleId}/mechanic`} className={`nav-center${isMechanic ? ' active' : ''}`}>
        <div className="nav-center-inner">
          <svg viewBox="0 0 34 34" fill="none"><g transform="translate(17,17) rotate(-45)"><rect x="-3" y="-8.5" width="6" height="17" rx="1.5" fill="#fff"/><rect x="-5" y="-13.5" width="10" height="5" rx="1.5" fill="#fff"/><rect x="-2" y="-16" width="4" height="4" rx="0.8" fill="rgba(232,131,42,.5)"/><rect x="-5" y="8.5" width="10" height="5" rx="1.5" fill="#fff"/><rect x="-2" y="11.5" width="4" height="4" rx="0.8" fill="rgba(232,131,42,.5)"/></g></svg>
        </div>
        <span>{T('nav.mechanic')}</span>
      </Link>
      <Link href={`/vehicle/${vehicleId}/history`} className={`nav-btn${isHistory ? ' active' : ''}`}>
        <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        <span>{T('nav.history')}</span>
      </Link>
      <Link href="/profile" className={`nav-btn${isSettings ? ' active' : ''}`}>
        <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        <span>{T('nav.settings')}</span>
      </Link>
    </nav>
  );
}

// ── Toast context ────────────────────────────────────────────────────
export function useToast() {
  // Simple global toast via DOM — no context needed
  return (msg: string) => {
    const el = document.getElementById('toast-el');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2500);
  };
}

// ── Shell ─────────────────────────────────────────────────────────────
export default function Shell({ children }: { children: React.ReactNode }) {
  const theme  = useStore(s => s.theme);
  const accent = useStore(s => s.accent);
  const path   = usePathname();

  // Apply theme
  useEffect(() => {
    const app = document.getElementById('app');
    if (!app) return;
    const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme:dark)').matches);
    if (isDark) app.removeAttribute('data-theme');
    else        app.setAttribute('data-theme', 'light');
  }, [theme]);

  // Apply accent color
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accent);
  }, [accent]);

  // Auto theme media query
  useEffect(() => {
    if (theme !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme:dark)');
    const handler = () => {
      const app = document.getElementById('app');
      if (!app) return;
      if (mq.matches) app.removeAttribute('data-theme');
      else            app.setAttribute('data-theme', 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const hasRecalls = useStore(s => s.vehicles.some(v => v.recalls > 0));
  const user       = useStore(s => s.user);
  const setUser    = useStore(s => s.setUser);
  const router     = useRouter();

  // Auth gate — redirect to /auth if not signed in
  useEffect(() => {
    if (!user && path !== '/auth' && !path.startsWith('/auth/')) {
      router.push('/auth');
    }
  }, [user, path, router]);

  async function handleSignOut() {
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase.auth.signOut();
    } catch { /* ignore */ }
    setUser(null);
  }

  // On auth page, render children directly with no chrome
  const isAuthPage = path === '/auth' || path.startsWith('/auth/');
  if (isAuthPage) {
    return (
      <div className="shell" id="app" style={{ justifyContent:'center' }}>
        {children}
        <div className="toast" id="toast-el" aria-live="polite" />
      </div>
    );
  }

  return (
    <div className="shell" id="app">
      {/* Topbar */}
      <header className="topbar">
        <Link href="/" className="logo">
          <div className="logo-mark"><LogoMark /></div>
          <span className="logo-name">Pit<span>Stop</span></span>
        </Link>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Link href="/notifications" className="icon-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="var(--text2)" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            {hasRecalls && <div className="notif-dot"/>}
          </Link>
          {user ? (
            <button onClick={handleSignOut} style={{ width:34, height:34, borderRadius:8, background:'var(--card)', border:'.5px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:'var(--font-barlow-condensed)', color:'var(--accent)' }}>
              {(user.name ?? user.email)[0].toUpperCase()}
            </button>
          ) : (
            <Link href="/auth" style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:12, fontWeight:700, letterSpacing:'.5px', textTransform:'uppercase', color:'var(--accent)', textDecoration:'none', padding:'5px 10px', borderRadius:8, border:'.5px solid rgba(232,131,42,.3)', background:'rgba(232,131,42,.08)' }}>
              Sign in
            </Link>
          )}

        </div>
      </header>

      {/* Page content */}
      <main className="main">
        <div className="page-enter">
          {children}
        </div>
      </main>

      {/* Bottom nav */}
      <BottomNav />

      {/* Global toast */}
      <div className="toast" id="toast-el" aria-live="polite" />
    </div>
  );
}
