'use client';
// ─── Notifications ────────────────────────────────────────────────────
import Link from 'next/link';
import { useState } from 'react';

export default function NotificationsPage() {
  const [toggles, setToggles] = useState([true, true, true, false]);
  const toggle = (i: number) => setToggles(prev => prev.map((v,idx) => idx === i ? !v : v));

  return (
    <>
      <div className="ph">
        <Link href="/settings" className="back-btn">←</Link>
        <span className="pt">Notifications</span>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
        {[['rgba(217,79,79,.13)','🔴','Tire rotation overdue','2019 Camry — 1,100 mi past due','new'],
          ['rgba(212,135,10,.13)','⚠️','Oil change due soon','Due in 580 mi on 2019 Camry','2d'],
          ['rgba(59,175,106,.12)','✅','Service logged','Oil change confirmed — Mar 14','5d'],
          ['rgba(58,127,212,.12)','📡','SmartCar synced','Odometer updated to 34,812 mi','1h'],
        ].map(([bg, icon, title, sub, badge]) => (
          <div key={title as string} className="notif-item">
            <div className="notif-icon" style={{ background: bg as string }}>{icon}</div>
            <div style={{ flex:1 }}>
              <div className="notif-title">{title}</div>
              <div className="notif-sub">{sub}</div>
            </div>
            {badge === 'new' ? <div className="notif-new"/> : <span style={{ fontSize:11, color:'var(--text3)' }}>{badge}</span>}
          </div>
        ))}
      </div>
      <div className="sh" style={{ marginTop:4 }}><span className="st">Alert settings</span></div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {['📧 Email reminders','📱 Push notifications','⏰ Remind 500 mi before due','🔁 Weekly health digest'].map((label, i) => (
          <div key={label} style={{ display:'flex', alignItems:'center', gap:12, background:'var(--card)', border:'.5px solid var(--border)', borderRadius:10, padding:'11px 14px' }}>
            <span style={{ flex:1, fontSize:14, color:'var(--text)' }}>{label}</span>
            <button className={`toggle${toggles[i] ? ' on' : ''}`} onClick={() => toggle(i)}/>
          </div>
        ))}
      </div>
    </>
  );
}
