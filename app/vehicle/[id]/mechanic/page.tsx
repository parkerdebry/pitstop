'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useVehicle } from '@/lib/store';
import { getTracking, VEHICLE_TYPE_LABEL } from '@/lib/maintenance';

interface Message { role: 'user' | 'assistant'; content: string; }

const QUICK_PILLS = [
  'Why is my check engine light on?',
  'Best oil filter for my vehicle?',
  'How do I check tire pressure?',
  'Signs I need new brakes?',
];

export default function MechanicPage() {
  const id      = parseInt(useParams().id as string);
  const v       = useVehicle(id);
  const [msgs, setMsgs]     = useState<Message[]>([
    { role:'assistant', content:"Hey — I'm your PitStop Mechanic. Ask me anything about repairs, mods, or diagnostics for your vehicle." },
  ]);
  const [input,  setInput]  = useState('');
  const [busy,   setBusy]   = useState(false);
  const msgsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [msgs]);

  async function send(text?: string) {
    const txt = (text ?? input).trim();
    if (!txt || busy || !v) return;
    setInput('');
    const userMsg: Message = { role:'user', content: txt };
    const history = [...msgs.filter(m => m.role !== 'assistant' || msgs.indexOf(m) > 0), userMsg];
    setMsgs(prev => [...prev, userMsg]);
    setBusy(true);

    try {
      const { value: trackVal, unit: trackUnit, useHours } = getTracking(v);
      const res = await fetch('/api/mechanic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle: {
            year: v.year, make: v.make, model: v.model, trim: v.trim,
            value: trackVal, unit: trackUnit, useHours,
            type: VEHICLE_TYPE_LABEL[v.emoji] ?? 'vehicle',
          },
          messages: history.map(m => ({ role: m.role, content: m.content })),
          tier: 'pro',
        }),
      });
      const data = await res.json();
      const reply = data.message ?? 'Something went wrong. Please try again.';
      setMsgs(prev => [...prev, { role:'assistant', content: reply }]);
    } catch {
      setMsgs(prev => [...prev, { role:'assistant', content: 'Connection error. Please try again.' }]);
    }
    setBusy(false);
  }

  if (!v) return <div style={{ textAlign:'center', padding:'3rem', color:'var(--text3)' }}>Vehicle not found.</div>;

  const { value: trackVal, unit: trackUnit } = getTracking(v);

  return (
    <>
      <div className="ph">
        <Link href={`/vehicle/${id}`} className="back-btn">←</Link>
        <span className="pt">PitStop Mechanic</span>
      </div>

      {/* Vehicle context card */}
      <div className="card-lg" style={{ padding:'1.25rem', display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ width:46, height:46, borderRadius:12, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg viewBox="0 0 34 34" fill="none" width="24" height="24"><g transform="translate(17,17) rotate(-45)"><rect x="-3" y="-8.5" width="6" height="17" rx="1.5" fill="#fff"/><rect x="-5" y="-13.5" width="10" height="5" rx="1.5" fill="#fff"/><rect x="-2" y="-16" width="4" height="4" rx="0.8" fill="rgba(232,131,42,.6)"/><rect x="-5" y="8.5" width="10" height="5" rx="1.5" fill="#fff"/><rect x="-2" y="11.5" width="4" height="4" rx="0.8" fill="rgba(232,131,42,.6)"/></g></svg>
        </div>
        <div>
          <div style={{ fontFamily:'var(--font-barlow-condensed)', fontSize:17, fontWeight:700, color:'var(--text)' }}>PitStop Mechanic</div>
          <div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>
            AI-powered · {v.year} {v.make} {v.model} · {trackVal.toLocaleString()} {trackUnit}
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="chat-wrap">
        <div className="chat-msgs" ref={msgsRef}>
          {msgs.map((m, i) => (
            <div key={i} className={`msg${m.role === 'user' ? ' user' : ''}`}>
              <div className={`msg-av ${m.role}`}>{m.role === 'user' ? 'Me' : 'PS'}</div>
              <div className={`msg-bubble ${m.role}`}
                dangerouslySetInnerHTML={{ __html: m.content.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>') }}
              />
            </div>
          ))}
          {busy && (
            <div className="msg">
              <div className="msg-av ai">PS</div>
              <div className="msg-bubble ai"><div className="dots"><span/><span/><span/></div></div>
            </div>
          )}
        </div>

        <div className="chat-pills">
          {QUICK_PILLS.map(p => (
            <button key={p} className="chat-pill" onClick={() => send(p)}>{p}</button>
          ))}
        </div>

        <div className="chat-bar">
          <input
            className="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask about your vehicle…"
          />
          <button className="chat-send" onClick={() => send()}>
            <svg viewBox="0 0 24 24" fill="#fff" width="15" height="15"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
    </>
  );
}
