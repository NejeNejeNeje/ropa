'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../admin.module.css';

export default function CircleStatusButton({ circleId, isFull, isPast }: { circleId: string; isFull: boolean; isPast: boolean }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const toggle = async (field: 'isFull' | 'isPast', value: boolean) => {
        setLoading(true);
        try {
            await fetch(`/api/admin/swap-circles/${circleId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: value }),
            });
            router.refresh();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
                onClick={() => toggle('isFull', !isFull)}
                disabled={loading}
                className={`${styles.actionBtn} ${isFull ? styles.actionBtnDanger : ''}`}
            >
                {isFull ? 'Mark as Open' : 'Mark as Full'}
            </button>
            <button
                onClick={() => toggle('isPast', !isPast)}
                disabled={loading}
                className={`${styles.actionBtn} ${isPast ? styles.actionBtnSuccess : ''}`}
            >
                {isPast ? 'Mark as Active' : 'Mark as Past'}
            </button>
        </div>
    );
}
