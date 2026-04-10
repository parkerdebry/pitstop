'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

type Step = 'landing' | 'signin' | 'signup' | 'tos' | 'plan';

function TosContent({ onScrolled }: { onScrolled: () => void }) {
  return (
    <div
      style={{ overflowY:'auto', maxHeight:300, fontSize:13, color:'var(--text2)', lineHeight:1.7 }}
      onScroll={e => {
        const el = e.currentTarget;
        if (el.scrollHeight - el.scrollTop < el.clientHeight + 60) onScrolled();
      }}
    >
      <p style={{ fontWeight:600, color:'var(--text)', marginBottom:6 }}>1. Informational Purpose Only</p>
      <p style={{ marginBottom:10 }}>PitStop provides vehicle maintenance tracking, AI-generated suggestions, and service reminders for informational purposes only. Nothing in this app constitutes professional mechanical advice.</p>
      <p style={{ fontWeight:600, color:'var(--text)', marginBottom:6 }}>2. No Liability for Mechanical Failures</p>
      <p style={{ marginBottom:10 }}>PitStop, its owners, employees, and affiliates are not responsible for any mechanical failures, vehicle damage, personal injury, property damage, or financial loss arising from your use of this app — including following any maintenance schedules, AI recommendations, or service reminders.</p>
      <p style={{ fontWeight:600, color:'var(--text)', marginBottom:6 }}>3. AI Mechanic Disclaimer</p>
      <p style={{ marginBottom:10 }}>The AI Mechanic provides general guidance only. AI responses may be inaccurate or not applicable to your specific vehicle. Always consult a licensed mechanic before making repair decisions. PitStop is not liable for any outcomes from AI suggestions.</p>
      <p style={{ fontWeight:600, color:'var(--text)', marginBottom:6 }}>4. Maintenance Schedule Disclaimer</p>
      <p style={{ marginBottom:10 }}>Maintenance intervals are general estimates. Your vehicle's needs may vary. Always consult your owner's manual and a qualified mechanic.</p>
      <p style={{ fontWeight:600, color:'var(--text)', marginBottom:6 }}>5. No Warranty</p>
      <p style={{ marginBottom:10 }}>PitStop is provided "as is" without any warranty. We do not guarantee the app will be error-free or information will be accurate.</p>
      <p style={{ fontWeight:600, color:'var(--text)', marginBottom:6 }}>6. Data & Privacy</p>
      <p style={{ marginBottom:10 }}>Your data is stored in your account. We do not sell your personal data to third parties.</p>
      <p style={{ fontWeight:600, color:'var(--text)', marginBottom:6 }}>7. Governing Law</p>
      <p style={{ marginBottom:10 }}>These terms are governed by US law. Disputes shall be resolved through binding arbitration.</p>
      <p style={{ fontWeight:600, color:'var(--text)', marginBottom:6 }}>8. Changes to Terms</p>
      <p style={{ marginBottom:14 }}>We may update these terms at any time. Continued use of PitStop constitutes acceptance.</p>
      <p style={{ fontSize:11, color:'var(--text3)', fontStyle:'italic' }}>Last updated: April 2025. Consult a lawyer for legally binding terms specific to your business.</p>
    </div>
  );
}

function PlanCard({ selected, onSelect, badge, title, price, period, sub, features, highlight }: {
  selected: boolean; onSelect: () => void; badge?: string;
  title: string; price: string; period: string; sub: string;
  features: string[]; highlight?: boolean;
}) {
  return (
    <div onClick={onSelect} style={{ background: selected ? 'rgba(232,131,42,.08)' : 'var(--bg3)', border:`1.5px solid ${selected ? 'var(--accent)' : highlight ? 'rgba(232,131,42,.25)' : 'var(--border2)'}`, borderRadius:16, padding:'1.25rem', cursor:'pointer', transition:'all .15s', position:'relative' }}>
      {badge && <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:'var(--accent)', color:'#fff', fontFamily:'var(--font-barlow-condensed)', fontSize:11, fontWeight:700, letterSpacing:'.5px', textTransform:'uppercase', padding:'3px 12px', borderRadius:20, whiteSpace:'nowrap' }}>{badge}</div>}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
        <div>
          <div style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:18, fontWeight:700, color:'var(--text)' }}>{title}</div>
          <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>{sub}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:24, fontWeight:700, color: selected ? 'var(--accent)' : 'var(--text)' }}>{price}</div>
          <div style={{ fontSize:11, color:'var(--text3)' }}>{period}</div>
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
        {features.map(f => (
          <div key={f} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color: f.startsWith('✕') ? 'var(--text3)' : 'var(--text2)' }}>
            <span style={{ color: f.startsWith('✕') ? 'var(--text3)' : 'var(--green)', fontWeight:700, flexShrink:0, fontSize:11 }}>{f.startsWith('✕') ? '✕' : '✓'}</span>
            {f.replace(/^[✕✓]\s*/, '')}
          </div>
        ))}
      </div>
      <div style={{ marginTop:10, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
        <div style={{ width:18, height:18, borderRadius:'50%', border:`2px solid ${selected ? 'var(--accent)' : 'var(--text3)'}`, background: selected ? 'var(--accent)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
          {selected && <div style={{ width:7, height:7, borderRadius:'50%', background:'#fff' }}/>}
        </div>
        <span style={{ fontSize:12, fontWeight:500, color: selected ? 'var(--accent)' : 'var(--text2)' }}>{selected ? '✓ Selected' : 'Select plan'}</span>
      </div>
    </div>
  );
}

export default function AuthPage() {
  const router    = useRouter();
  const acceptTos = useStore(s => s.acceptTos);
  const setPlan   = useStore(s => s.setPlan);
  const setUser   = useStore(s => s.setUser);

  const [step,         setStep]         = useState<Step>('landing');
  const [name,         setName]         = useState('');
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [tosScrolled,  setTosScrolled]  = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro_monthly' | 'pro_annual'>('pro_annual');
  const [pendingAction,setPendingAction]= useState<'signup' | 'google'>('signup');

  async function handleSignIn() {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      setUser({ id: data.user.id, email: data.user.email!, name: data.user.user_metadata?.name ?? null, avatarUrl: null, tosAccepted: true, tosAcceptedAt: null, createdAt: data.user.created_at });
      router.push('/');
    } catch (err: unknown) { setError((err as Error).message ?? 'Sign in failed'); }
    setLoading(false);
  }

  function handleSignUpNext() {
    if (!name || !email || !password) { setError('Please fill in all fields'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setPendingAction('signup'); setError(''); setTosScrolled(false); setStep('tos');
  }

  async function completeTos() {
    acceptTos();
    if (pendingAction === 'google') {
      const { supabase } = await import('@/lib/supabase');
      await supabase.auth.signInWithOAuth({ provider:'google', options:{ redirectTo:`${window.location.origin}/auth/callback` } });
      return;
    }
    setStep('plan');
  }

  async function completePlan() {
    setPlan(selectedPlan);
    setLoading(true); setError('');
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error: err } = await supabase.auth.signUp({ email, password, options:{ data:{ name, plan: selectedPlan } } });
      if (err) throw err;
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email!, name, avatarUrl: null, tosAccepted: true, tosAcceptedAt: new Date().toISOString(), createdAt: data.user.created_at });
        router.push('/');
      }
    } catch (err: unknown) { setError((err as Error).message ?? 'Sign up failed'); setStep('signup'); }
    setLoading(false);
  }

  const logoMark = (
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1.75rem', justifyContent:'center' }}>
      <div style={{ width:44, height:44, borderRadius:12, background:'var(--bg3)', border:'.5px solid rgba(232,131,42,.35)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🔧</div>
      <span style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:28, fontWeight:700, color:'var(--text)' }}>Pit<span style={{ color:'var(--accent)' }}>Stop</span></span>
    </div>
  );

  const errBox = error ? <div style={{ background:'rgba(217,79,79,.1)', border:'.5px solid rgba(217,79,79,.3)', borderRadius:9, padding:'10px 13px', fontSize:13, color:'var(--red)' }}>{error}</div> : null;

  return (
    <div style={{ minHeight:'100dvh', background:'var(--bg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'1.5rem', overflowY:'auto' }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        {logoMark}

        {step === 'landing' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ textAlign:'center', marginBottom:8 }}>
              <div style={{ fontSize:22, fontWeight:700, fontFamily:'var(--font-barlow-condensed)', color:'var(--text)' }}>Your personal garage assistant</div>
              <div style={{ fontSize:13, color:'var(--text2)', marginTop:6, lineHeight:1.5 }}>Track maintenance, catch recalls, and get AI-powered repair advice</div>
            </div>
            <button onClick={() => setStep('signup')} style={{ width:'100%', fontFamily:'var(--font-barlow-condensed)', fontSize:15, fontWeight:700, letterSpacing:'.5px', textTransform:'uppercase', background:'var(--accent)', color:'#fff', border:'none', padding:14, borderRadius:12, cursor:'pointer' }}>Create account</button>
            <button onClick={() => { setStep('signin'); setError(''); }} style={{ width:'100%', fontFamily:'var(--font-barlow-condensed)', fontSize:15, fontWeight:700, letterSpacing:'.5px', textTransform:'uppercase', background:'none', border:'.5px solid var(--border2)', color:'var(--text)', padding:14, borderRadius:12, cursor:'pointer' }}>Sign in</button>
            <div style={{ display:'flex', alignItems:'center', gap:10, margin:'4px 0' }}>
              <div style={{ flex:1, height:'.5px', background:'var(--border)' }}/><span style={{ fontSize:12, color:'var(--text3)' }}>or</span><div style={{ flex:1, height:'.5px', background:'var(--border)' }}/>
            </div>
            <button onClick={() => { setPendingAction('google'); setTosScrolled(false); setStep('tos'); }} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:10, background:'var(--bg3)', border:'.5px solid var(--border2)', color:'var(--text)', fontSize:14, fontWeight:500, padding:13, borderRadius:12, cursor:'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>
          </div>
        )}

        {step === 'signin' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ textAlign:'center', marginBottom:4 }}><div style={{ fontSize:20, fontWeight:700, fontFamily:'var(--font-barlow-condensed)', color:'var(--text)' }}>Welcome back</div></div>
            {errBox}
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" inputMode="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSignIn()}/></div>
            <button onClick={handleSignIn} disabled={loading} style={{ width:'100%', fontFamily:'var(--font-barlow-condensed)', fontSize:15, fontWeight:700, letterSpacing:'.5px', textTransform:'uppercase', background:'var(--accent)', color:'#fff', border:'none', padding:14, borderRadius:12, cursor:'pointer', opacity: loading ? .7 : 1 }}>{loading ? 'Signing in…' : 'Sign in'}</button>
            <button onClick={() => { setStep('landing'); setError(''); }} style={{ textAlign:'center', fontSize:13, color:'var(--text3)', background:'none', border:'none', cursor:'pointer' }}>← Back</button>
          </div>
        )}

        {step === 'signup' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ textAlign:'center', marginBottom:4 }}>
              <div style={{ fontSize:20, fontWeight:700, fontFamily:'var(--font-barlow-condensed)', color:'var(--text)' }}>Create your account</div>
              <div style={{ fontSize:12, color:'var(--text3)', marginTop:3 }}>Step 1 of 3</div>
            </div>
            {errBox}
            <div className="form-group"><label className="form-label">Your name</label><input className="form-input" placeholder="e.g. Parker" value={name} onChange={e => setName(e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" inputMode="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" placeholder="At least 8 characters" value={password} onChange={e => setPassword(e.target.value)}/></div>
            <button onClick={handleSignUpNext} style={{ width:'100%', fontFamily:'var(--font-barlow-condensed)', fontSize:15, fontWeight:700, letterSpacing:'.5px', textTransform:'uppercase', background:'var(--accent)', color:'#fff', border:'none', padding:14, borderRadius:12, cursor:'pointer' }}>Continue →</button>
            <button onClick={() => { setStep('landing'); setError(''); }} style={{ textAlign:'center', fontSize:13, color:'var(--text3)', background:'none', border:'none', cursor:'pointer' }}>← Back</button>
          </div>
        )}

        {step === 'tos' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ textAlign:'center', marginBottom:4 }}>
              <div style={{ fontSize:20, fontWeight:700, fontFamily:'var(--font-barlow-condensed)', color:'var(--text)' }}>Terms of Service</div>
              <div style={{ fontSize:12, color:'var(--text3)', marginTop:3 }}>{pendingAction === 'signup' ? 'Step 2 of 3 — ' : ''}Please read to continue</div>
            </div>
            <div style={{ background:'var(--bg3)', border:'.5px solid var(--border2)', borderRadius:12, padding:'1rem' }}>
              <TosContent onScrolled={() => setTosScrolled(true)}/>
            </div>
            {!tosScrolled && <div style={{ fontSize:11, color:'var(--text3)', textAlign:'center' }}>↓ Scroll to the bottom to accept</div>}
            <button onClick={completeTos} disabled={!tosScrolled} style={{ width:'100%', fontFamily:'var(--font-barlow-condensed)', fontSize:15, fontWeight:700, letterSpacing:'.5px', textTransform:'uppercase', background: tosScrolled ? 'var(--accent)' : 'var(--bg4)', color: tosScrolled ? '#fff' : 'var(--text3)', border:'none', padding:14, borderRadius:12, cursor: tosScrolled ? 'pointer' : 'not-allowed', transition:'all .2s' }}>I Accept — Continue →</button>
            <button onClick={() => { setStep(pendingAction === 'signup' ? 'signup' : 'landing'); setTosScrolled(false); }} style={{ textAlign:'center', fontSize:13, color:'var(--text3)', background:'none', border:'none', cursor:'pointer' }}>← Back</button>
          </div>
        )}

        {step === 'plan' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ textAlign:'center', marginBottom:4 }}>
              <div style={{ fontSize:20, fontWeight:700, fontFamily:'var(--font-barlow-condensed)', color:'var(--text)' }}>Choose your plan</div>
              <div style={{ fontSize:12, color:'var(--text3)', marginTop:3 }}>Step 3 of 3 — Upgrade anytime</div>
            </div>
            <PlanCard selected={selectedPlan === 'pro_annual'} onSelect={() => setSelectedPlan('pro_annual')} badge="Most popular · Best value" title="Pro — Annual" price="$49.99" period="per year · $4.17/mo" sub="Save 17% vs monthly" highlight features={['Unlimited vehicles','AI Mechanic — unlimited questions','NHTSA recall monitoring & alerts','SmartCar vehicle connection','Docs, analytics & PDF export','Loan tracker']}/>
            <PlanCard selected={selectedPlan === 'pro_monthly'} onSelect={() => setSelectedPlan('pro_monthly')} title="Pro — Monthly" price="$4.99" period="per month" sub="Flexible, cancel anytime" features={['Unlimited vehicles','AI Mechanic — unlimited questions','NHTSA recall monitoring & alerts','SmartCar vehicle connection','Docs, analytics & PDF export','Loan tracker']}/>
            <PlanCard selected={selectedPlan === 'free'} onSelect={() => setSelectedPlan('free')} title="Free" price="$0" period="forever" sub="Get started at no cost" features={['1 vehicle','Basic maintenance tracking','Service history log','✕ AI Mechanic (5/month)','✕ SmartCar connection','✕ Recall monitoring']}/>
            {errBox}
            <button onClick={completePlan} disabled={loading} style={{ width:'100%', fontFamily:'var(--font-barlow-condensed)', fontSize:15, fontWeight:700, letterSpacing:'.5px', textTransform:'uppercase', background:'var(--accent)', color:'#fff', border:'none', padding:14, borderRadius:12, cursor:'pointer', opacity: loading ? .7 : 1 }}>
              {loading ? 'Creating account…' : selectedPlan === 'free' ? 'Start for free →' : `Start ${selectedPlan === 'pro_annual' ? 'Pro Annual' : 'Pro Monthly'} →`}
            </button>
            <div style={{ fontSize:11, color:'var(--text3)', textAlign:'center' }}>
              {selectedPlan !== 'free' ? 'Payment required once billing is activated · Cancel anytime' : 'Upgrade to Pro anytime from your profile'}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
