'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';

export type NotifStatus = 'unsupported' | 'default' | 'granted' | 'denied';

export function usePushNotifications() {
  const [status,  setStatus]  = useState<NotifStatus>('default');
  const [loading, setLoading] = useState(false);
  const user = useStore(s => s.user);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) { setStatus('unsupported'); return; }
    setStatus(Notification.permission as NotifStatus);
  }, []);

  async function requestPermission(): Promise<boolean> {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return false;
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setStatus(permission as NotifStatus);

      if (permission === 'granted') {
        await subscribeUser();
        return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function subscribeUser() {
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return;

    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly:     true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
    });

    const userId = user?.id ?? 'anonymous';
    await fetch('/api/push/subscribe', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ userId, subscription }),
    });

    // Register vehicles for recall monitoring
    const vehicles = useStore.getState().vehicles;
    for (const v of vehicles) {
      await fetch('/api/cron/recalls', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          userId,
          vehicle: {
            userId,
            vehicleId: v.id,
            year:  v.year,
            make:  v.make,
            model: v.model,
            knownRecalls: [],
          },
        }),
      });
    }
  }

  return { status, loading, requestPermission };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding  = '='.repeat((4 - base64String.length % 4) % 4);
  const base64   = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData  = window.atob(base64);
  const output   = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) output[i] = rawData.charCodeAt(i);
  return output;
}
