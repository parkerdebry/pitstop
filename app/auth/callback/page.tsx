'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export default function AuthCallback() {
  const router  = useRouter();
  const setUser = useStore(s => s.setUser);

  useEffect(() => {
    async function handleCallback() {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const u = data.session.user;
        setUser({
          id: u.id,
          email: u.email!,
          name: u.user_metadata?.name ?? u.user_metadata?.full_name ?? null,
          avatarUrl: u.user_metadata?.avatar_url ?? null,
          tosAccepted: true,
          tosAcceptedAt: new Date().toISOString(),
          createdAt: u.created_at,
        });
      }
      router.push('/');
    }
    handleCallback();
  }, [router, setUser]);

  return (
    <div style={{ minHeight:'100dvh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12 }}>
      <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid var(--border2)', borderTopColor:'var(--accent)', animation:'spin 1s linear infinite' }}/>
      <div style={{ fontSize:13, color:'var(--text2)' }}>Signing you in…</div>
    </div>
  );
}
