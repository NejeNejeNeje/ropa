'use client';

import { useEffect, useState } from 'react';

export function usePushNotifications() {
    const [supported, setSupported] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setSupported(true);
            // Register service worker
            navigator.serviceWorker.register('/sw.js').catch(console.error);
            // Check existing subscription
            navigator.serviceWorker.ready.then((reg) =>
                reg.pushManager.getSubscription().then((sub) => setSubscribed(!!sub))
            );
        }
    }, []);

    const subscribe = async () => {
        setLoading(true);
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
                ),
            });
            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(sub),
            });
            setSubscribed(true);
        } catch (err) {
            console.error('Push subscribe error:', err);
        } finally {
            setLoading(false);
        }
    };

    const unsubscribe = async () => {
        setLoading(true);
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
                await sub.unsubscribe();
                await fetch('/api/push/subscribe', { method: 'DELETE' });
            }
            setSubscribed(false);
        } finally {
            setLoading(false);
        }
    };

    return { supported, subscribed, loading, subscribe, unsubscribe };
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const buffer = new ArrayBuffer(rawData.length);
    const outputArray = new Uint8Array(buffer);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return buffer;
}
