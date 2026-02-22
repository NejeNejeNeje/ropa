'use client';

import { useRouter } from 'next/navigation';
import styles from '../admin.module.css';

export default function ListingToggle({ listingId, isActive }: { listingId: string; isActive: boolean }) {
    const router = useRouter();

    async function handleToggle() {
        await fetch(`/api/admin/listings/${listingId}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: !isActive }),
        });
        router.refresh();
    }

    return (
        <button
            onClick={handleToggle}
            className={`${styles.actionBtn} ${isActive ? styles.actionBtnDanger : styles.actionBtnSuccess}`}
        >
            {isActive ? 'Deactivate' : 'Restore'}
        </button>
    );
}
