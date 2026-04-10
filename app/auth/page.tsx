'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

// ── Terms of Service Modal ────────────────────────────────────────────
function TosModal({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:500, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div style={{ background:'var(--bg2)', borderRadius:'20px 20px 0 0', width:'100%', maxWidth:520, maxHeight:'90vh', display:'flex', flexDirection:'column', border:'.5px solid var(--border2)' }}>
        <div style={{ padding:'1.25rem 1.25rem 0' }}>
          <div style={{ width:40, height:4, borderRadius:2, background:'var(--border2)', margin:'0 auto 1rem' }}/>
          <div style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:20, fontWeight:700, color:'var(--text)', marginBottom:4 }}>Terms of Service</div>
          <div style={{ fontSize:12, color:'var(--text3)', marginBottom:12 }}>Please read and accept before continuing</div>
        </div>

        <div
          style={{ flex:1, overflowY:'auto', padding:'0 1.25rem', marginBottom:4 }}
          onScroll={e => { const el = e.currentTarget; if (el.scrollHeight - el.scrollTop < el.clientHeight + 50) setScrolled(true); }}
        >
          <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.7, paddingBottom:'1rem' }}>

            <p style={{ fontWeight:600, color:'var(--text)', marginBottom:8 }}>1. Informational Purpose Only</p>
            <p style={{ marginBottom:12 }}>PitStop provides vehicle maintenance tracking, AI-generated suggestions, and service reminders for informational purposes only. Nothing in this app constitutes professional mechanical advice, and PitStop is not a licensed mechanic or automotive service provider.</p>

            <p style={{ fontWeight:600, color:'var(--text)', marginBottom:8 }}>2. No Liability for Mechanical Failures</p>
            <p style={{ marginBottom:12 }}>PitStop, its owners, employees, and affiliates are not responsible for any mechanical failures, vehicle damage, personal injury, property damage, or financial loss arising from your use of this app — including following any maintenance schedules, AI recommendations, or service reminders provided by PitStop.</p>

            <p style={{ fontWeight:600, color:'var(--text)', marginBottom:8 }}>3. AI Mechanic Disclaimer</p>
            <p style={{ marginBottom:12 }}>The AI Mechanic feature provides general guidance based on publicly available information. AI responses may be inaccurate, incomplete, or not applicable to your specific vehicle. Always consult a licensed mechanic before making repair decisions. PitStop is not liable for any outcomes resulting from AI Mechanic suggestions.</p>

            <p style={{ fontWeight:600, color:'var(--text)', marginBottom:8 }}>4. Maintenance Schedule Disclaimer</p>
            <p style={{ marginBottom:12 }}>Maintenance intervals shown in PitStop are general estimates. Your vehicle's actual service needs may vary based on driving conditions, vehicle age, manufacturer specifications, and other factors. Always consult your vehicle's owner's manual and a qualified mechanic.</p>

            <p style={{ fontWeight:600, color:'var(--text)', marginBottom:8 }}>5. No Warranty</p>
            <p style={{ marginBottom:12 }}>PitStop is provided "as is" without any warranty of any kind. We do not guarantee that the app will be error-free, uninterrupted, or that the information provided will be accurate or complete.</p>

            <p style={{ fontWeight:600, color:'var(--text)', marginBottom:8 }}>6. Data & Privacy</p>
            <p style={{ marginBottom:12 }}>Your vehicle data is stored locally on your device and optionally in your account. We do not sell your personal data to third parties. See our Privacy Policy for full details.</p>

            <p style={{ fontWeight:600, color:'var(--text)', marginBottom:8 }}>7. Governing Law</p>
            <p style={{ marginBottom:12 }}>These terms are governed by the laws of the United States. Any disputes shall be resolved through binding arbitration.</p>

            <p style={{ fontWeight:600, color:'var(--text)', marginBottom:8 }}>8. Changes to Terms</p>
            <p style={{ marginBottom:16 }}>We may update these terms at any time. Continued use of PitStop after changes constitutes acceptance of the new terms.</p>

            <p style={{ fontSize:11, color:'var(--text3)', fontStyle:'italic' }}>Last updated: April 2025. These terms were written for informational purposes. Consult a lawyer for legally binding terms specific to your business.</p>
          </div>
        </div>

        <div style={{ padding:'1rem 1.25rem', borderTop:'.5px solid var(--border)', display:'flex', flexDirection:'column', gap:8 }}>
          {!scrolled && (
            <div style={{ fontSize:11, color:'var(--text3)', textAlign:'center', marginBottom:4 }}>Scroll to read the full terms before accepting</div>
          )}
          <button
            onClick={onAccept}
            disabled={!scrolled}
            style={{ width:'100%', fontFamily:'var(--font-barlow-condensed)', fontSize:15, fontWeight:700, letterSpacing:'.5px', textTransform:'uppercase', background: scrolled ? 'var(--accent)' : 'var(--bg4)', color: scrolled ? '#fff' : 'var(--text3)', border:'none', padding:14, borderRadius:12, cursor: scrolled ? 'pointer' : 'not-allowed', transition:'all .2s' }}
          >
            I Accept the Terms of Service
          </button>
          <button
            onClick={onDecline}
            style={{ width:'100%', fontFamily:'var(--font-barlow-condensed)', fontSize:13, fontWeight:600, background:'none', border:'.5px solid var(--border2)', color:'var(--text3)', padding:11, borderRadius:12, cursor:'pointer' }}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Auth Page ─────────────────────────────────────────────────────────
export default function AuthPage() {
  const router    = useRouter();
  const acceptTos = useStore(s => s.acceptTos);
  const setUser   = useStore(s => s.setUser);

  const [mode,    setMode]    = useState<'landing' | 'signin' | 'signup'>('landing');
  const [email,   setEmail]   = useState('');
  const [password,setPassword]= useState('');
  const [name,    setName]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [showTos, setShowTos] = useState(false);
  const [pendingSignup, setPendingSignup] = useState(false);

  async function handleSignUp() {
    if (!email || !password || !name) { setError('Please fill in all fields'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    // Show TOS before creating account
    setPendingSignup(true);
    setShowTos(true);
  }

  async function handleSignIn() {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setError('');
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      setUser({ id: data.user.id, email: data.user.email!, name: data.user.user_metadata?.name ?? null, avatarUrl: null, tosAccepted: true, tosAcceptedAt: null, createdAt: data.user.created_at });
      router.push('/');
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Sign in failed');
    }
    setLoading(false);
  }

  async function completSignUp() {
    setShowTos(false);
    acceptTos();
    setLoading(true);
    setError('');
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error: err } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
      if (err) throw err;
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email!, name, avatarUrl: null, tosAccepted: true, tosAcceptedAt: new Date().toISOString(), createdAt: data.user.created_at });
        router.push('/');
      }
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Sign up failed');
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setShowTos(true);
    setPendingSignup(false); // will handle TOS accept then OAuth
  }

  async function completeGoogle() {
    setShowTos(false);
    acceptTos();
    const { supabase } = await import('@/lib/supabase');
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function handleApple() {
    setShowTos(true);
    setPendingSignup(false);
  }

  async function completeApple() {
    setShowTos(false);
    acceptTos();
    const { supabase } = await import('@/lib/supabase');
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  function onTosAccept() {
    if (pendingSignup) {
      completSignUp();
    } else {
      // Google or Apple
      completeGoogle();
    }
  }

  return (
    <>
      {showTos && <TosModal onAccept={onTosAccept} onDecline={() => { setShowTos(false); setPendingSignup(false); }} />}

      <div style={{ minHeight:'100dvh', background:'var(--bg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}>

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'2rem' }}>
          <div style={{ width:44, height:44, borderRadius:12, background:'var(--bg3)', border:'.5px solid rgba(232,131,42,.35)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🔧</div>
          <span style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:28, fontWeight:700, color:'var(--text)' }}>Pit<span style={{ color:'var(--accent)' }}>Stop</span></span>
        </div>

        {mode === 'landing' && (
          <div style={{ width:'100%', maxWidth:360, display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ textAlign:'center', marginBottom:8 }}>
              <div style={{ fontSize:22, fontWeight:700, fontFamily:'var(--font-barlow-condensed)', color:'var(--text)' }}>Your personal garage</div>
              <div style={{ fontSize:14, color:'var(--text2)', marginTop:4 }}>Track maintenance, catch recalls, ask the AI Mechanic</div>
            </div>

            <button onClick={() => setMode('signup')} style={{ width:'100%', fontFamily:'var(--font-barlow-condensed)', fontSize:15, fontWeight:700, letterSpacing:'.5px', textTransform:'uppercase', background:'var(--accent)', color:'#fff', border:'none', padding:14, borderRadius:12, cursor:'pointer' }}>
              Create account
            </button>

            <button onClick={() => setMode('signin')} style={{ width:'100%', fontFamily:'var(--font-barlow-condensed)', fontSize:15, fontWeight:700, letterSpacing:'.5px', textTransform:'uppercase', background:'none', border:'.5px solid var(--border2)', color:'var(--text)', padding:14, borderRadius:12, cursor:'pointer' }}>
              Sign in
            </button>

            <div style={{ display:'flex', alignItems:'center', gap:10, margin:'4px 0' }}>
              <div style={{ flex:1, height:'.5px', background:'var(--border)' }}/>
              <span style={{ fontSize:12, color:'var(--text3)' }}>or continue with</span>
              <div style={{ flex:1, height:'.5px', background:'var(--border)' }}/>
            </div>

            <button onClick={handleGoogle} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:10, background:'var(--bg3)', border:'.5px solid var(--border2)', color:'var(--text)', fontSize:14, fontWeight:500, padding:13, borderRadius:12, cursor:'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>

            <button onClick={handleApple} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:10, background:'var(--bg3)', border:'.5px solid var(--border2)', color:'var(--text)', fontSize:14, fontWeight:500, padding:13, borderRadius:12, cursor:'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              Continue with Apple
            </button>

            <button onClick={() => router.push('/')} style={{ textAlign:'center', fontSize:12, color:'var(--text3)', background:'none', border:'none', cursor:'pointer', marginTop:4 }}>
              Continue without account →
            </button>
          </div>
        )}

        {(mode === 'signin' || mode === 'signup') && (
          <div style={{ width:'100%', maxWidth:360, display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ textAlign:'center', marginBottom:4 }}>
              <div style={{ fontSize:20, fontWeight:700, fontFamily:'var(--font-barlow-condensed)', color:'var(--text)' }}>{mode === 'signin' ? 'Welcome back' : 'Create account'}</div>
            </div>

            {error && <div style={{ background:'rgba(217,79,79,.1)', border:'.5px solid rgba(217,79,79,.3)', borderRadius:9, padding:'10px 13px', fontSize:13, color:'var(--red)' }}>{error}</div>}

            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label">Your name</label>
                <input className="form-input" placeholder="e.g. Parker" value={name} onChange={e => setName(e.target.value)}/>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" inputMode="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}/>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'} value={password} onChange={e => setPassword(e.target.value)}/>
            </div>

            <button
              onClick={mode === 'signup' ? handleSignUp : handleSignIn}
              disabled={loading}
              style={{ width:'100%', fontFamily:'var(--font-barlow-condensed)', fontSize:15, fontWeight:700, letterSpacing:'.5px', textTransform:'uppercase', background:'var(--accent)', color:'#fff', border:'none', padding:14, borderRadius:12, cursor:'pointer', opacity: loading ? .7 : 1 }}
            >
              {loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>

            <button onClick={() => { setMode('landing'); setError(''); }} style={{ textAlign:'center', fontSize:13, color:'var(--text3)', background:'none', border:'none', cursor:'pointer' }}>
              ← Back
            </button>
          </div>
        )}
      </div>
    </>
  );
}
