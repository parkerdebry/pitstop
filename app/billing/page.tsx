'use client';

import Link from 'next/link';

async function openPortal() {
  try {
    const res  = await fetch('/api/billing/portal', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userEmail:'user@example.com' }) });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else alert('Billing portal: add STRIPE_SECRET_KEY to .env.local to activate.');
  } catch {
    alert('Billing not configured. Add Stripe keys to .env.local.');
  }
}

async function startCheckout(plan: 'annual' | 'monthly') {
  try {
    const res  = await fetch('/api/billing/checkout', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userEmail:'user@example.com', plan }) });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else alert('Checkout: add STRIPE_SECRET_KEY to .env.local to activate.');
  } catch {
    alert('Billing not configured. Add Stripe keys to .env.local.');
  }
}

export default function BillingPage() {
  return (
    <>
      <div className="ph">
        <Link href="/settings" className="back-btn">←</Link>
        <span className="pt">Subscription & Billing</span>
      </div>

      {/* Current plan */}
      <div className="card-lg" style={{ padding:'1.25rem', display:'flex', flexDirection:'column', gap:'.875rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:20, fontWeight:700, color:'var(--text)' }}>PitStop Pro</div>
            <div style={{ fontSize:13, color:'var(--green)', marginTop:2, fontWeight:500 }}>● Active</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:22, fontWeight:700, color:'var(--text)' }}>$39.99</div>
            <div style={{ fontSize:11, color:'var(--text3)' }}>per year</div>
          </div>
        </div>
        <div style={{ height:'.5px', background:'var(--border)' }}/>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div><div style={{ fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.5px', fontFamily:'var(--font-barlow-condensed)', fontWeight:600, marginBottom:3 }}>Renewal date</div><div style={{ fontSize:14, fontWeight:500, color:'var(--text)' }}>Apr 2, 2027</div></div>
          <div><div style={{ fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.5px', fontFamily:'var(--font-barlow-condensed)', fontWeight:600, marginBottom:3 }}>Payment</div><div style={{ fontSize:14, fontWeight:500, color:'var(--text)' }}>Visa ···· 4242</div></div>
        </div>
        <button className="btn-primary" onClick={openPortal}>Manage subscription</button>
        <div style={{ fontSize:11, color:'var(--text3)', textAlign:'center' }}>Securely managed by Stripe · Cancel anytime</div>
      </div>

      {/* Plan comparison */}
      <div className="sh"><span className="st">Plans</span></div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {/* Free */}
        <div style={{ background:'var(--card)', border:'.5px solid var(--border)', borderRadius:14, padding:'1rem 1.25rem' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.75rem' }}>
            <div><div style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:17, fontWeight:700, color:'var(--text)' }}>Free</div><div style={{ fontSize:13, color:'var(--text3)' }}>Always free</div></div>
            <div style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:20, fontWeight:700, color:'var(--text)' }}>$0</div>
          </div>
          {[['✓','1 vehicle'],['✓','Basic maintenance tracking'],['✓','Service history log'],['✕','AI Mechanic (5 questions/month)'],['✕','SmartCar connection'],['✕','Recall monitoring']].map(([icon,text]) => (
            <div key={text} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color: icon === '✓' ? 'var(--text2)' : 'var(--text3)', marginBottom:4 }}>
              <span style={{ color: icon === '✓' ? 'var(--green)' : 'var(--text3)', fontWeight:700 }}>{icon}</span>{text}
            </div>
          ))}
        </div>

        {/* Pro Annual — current */}
        <div style={{ background:'rgba(232,131,42,.06)', border:'.5px solid var(--accent)', borderRadius:14, padding:'1rem 1.25rem', position:'relative' }}>
          <div style={{ position:'absolute', top:-10, right:16, background:'var(--accent)', color:'#fff', fontFamily:'var(--font-barlow-condensed)', fontSize:11, fontWeight:700, letterSpacing:'.5px', textTransform:'uppercase', padding:'3px 10px', borderRadius:20 }}>Current plan</div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.75rem' }}>
            <div><div style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:17, fontWeight:700, color:'var(--text)' }}>Pro — Annual</div><div style={{ fontSize:13, color:'var(--green)' }}>Save 33% vs monthly</div></div>
            <div style={{ textAlign:'right' }}><div style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:20, fontWeight:700, color:'var(--text)' }}>$39.99<span style={{ fontSize:13, color:'var(--text3)', fontWeight:400 }}>/yr</span></div><div style={{ fontSize:11, color:'var(--text3)' }}>$3.33/mo</div></div>
          </div>
          {['Unlimited vehicles','AI Mechanic — unlimited','SmartCar connection','NHTSA recall monitoring','Docs, analytics & PDF export','Shared garage'].map(f => (
            <div key={f} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--text2)', marginBottom:4 }}>
              <span style={{ color:'var(--green)', fontWeight:700 }}>✓</span>{f}
            </div>
          ))}
        </div>

        {/* Pro Monthly */}
        <div style={{ background:'var(--card)', border:'.5px solid var(--border)', borderRadius:14, padding:'1rem 1.25rem' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.75rem' }}>
            <div><div style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:17, fontWeight:700, color:'var(--text)' }}>Pro — Monthly</div><div style={{ fontSize:13, color:'var(--text3)' }}>Flexible, cancel anytime</div></div>
            <div style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:20, fontWeight:700, color:'var(--text)' }}>$4.99<span style={{ fontSize:13, color:'var(--text3)', fontWeight:400 }}>/mo</span></div>
          </div>
          <button className="btn-ghost" style={{ marginTop:0 }} onClick={() => startCheckout('monthly')}>Switch to monthly</button>
        </div>
      </div>

      {/* Payment method */}
      <div className="sh"><span className="st">Payment method</span></div>
      <div className="s-group">
        <div className="s-row"><div className="s-icon" style={{ background:'rgba(58,127,212,.12)' }}>💳</div><div style={{ flex:1 }}><div className="s-lbl">Visa ···· 4242</div><div style={{ fontSize:11, color:'var(--text3)' }}>Expires 08/27</div></div><span className="badge badge-ok" style={{ fontSize:9 }}>Default</span></div>
        <div className="s-row" onClick={openPortal}><div className="s-icon" style={{ background:'rgba(0,0,0,.05)' }}>➕</div><div className="s-lbl">Add payment method</div><span className="s-val">›</span></div>
      </div>

      {/* Billing history */}
      <div className="sh"><span className="st">Billing history</span></div>
      <div className="s-group">
        {[['Apr 2, 2025','PitStop Pro — Annual','$39.99'],['Apr 2, 2024','PitStop Pro — Annual','$39.99']].map(([date,plan,amt]) => (
          <div key={date} className="s-row"><div className="s-icon" style={{ background:'rgba(59,175,106,.12)' }}>✅</div><div style={{ flex:1 }}><div className="s-lbl">{plan}</div><div style={{ fontSize:11, color:'var(--text3)' }}>{date}</div></div><span style={{ fontSize:13, fontWeight:600, fontFamily:'var(--font-barlow-condensed)', color:'var(--text)' }}>{amt}</span></div>
        ))}
      </div>

      {/* Cancel */}
      <div style={{ background:'rgba(217,79,79,.06)', border:'.5px solid rgba(217,79,79,.2)', borderRadius:12, padding:'1rem 1.25rem' }}>
        <div style={{ fontSize:13, fontWeight:500, color:'var(--red)', marginBottom:4 }}>Cancel subscription</div>
        <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.55, marginBottom:10 }}>You'll keep Pro access until Apr 2, 2027. After that your account moves to the free plan.</div>
        <button className="btn-sm btn-sm-danger" onClick={openPortal}>Cancel subscription</button>
      </div>
    </>
  );
}
