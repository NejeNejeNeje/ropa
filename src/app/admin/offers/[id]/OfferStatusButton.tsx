'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../admin.module.css';

const STATUS_OPTIONS = ['pending', 'accepted', 'declined', 'expired', 'countered'];

export default function OfferStatusButton({ offerId, currentStatus }: { offerId: string; currentStatus: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(currentStatus);

    const handleChange = async (newStatus: string) => {
        if (newStatus === selected) return;
        setLoading(true);
        try {
            await fetch(`/api/admin/offers/${offerId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            setSelected(newStatus);
            router.refresh();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Set status:</span>
            {STATUS_OPTIONS.map(s => (
                <button
                    key={s}
                    onClick={() => handleChange(s)}
                    disabled={loading || s === selected}
                    className={s === selected ? `${styles.actionBtn} ${styles.actionBtnSuccess}` : styles.actionBtn}
                >
                    {s === selected ? `✓ ${s}` : s}
                </button>
            ))}
        </div>
    );
}
