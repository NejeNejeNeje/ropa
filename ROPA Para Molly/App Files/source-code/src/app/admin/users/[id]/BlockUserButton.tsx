'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../admin.module.css';

export default function BlockUserButton({
    userId,
    blocked,
    userName,
}: {
    userId: string;
    blocked: boolean;
    userName: string;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleToggle() {
        if (!confirm(`Are you sure you want to ${blocked ? 'unblock' : 'block'} ${userName}?`)) return;
        setLoading(true);
        await fetch(`/api/admin/users/${userId}/block`, { method: 'POST' });
        setLoading(false);
        router.refresh();
    }

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`${styles.actionBtn} ${blocked ? styles.actionBtnSuccess : styles.actionBtnDanger}`}
            style={{ width: '100%', padding: '8px', justifyContent: 'center', display: 'flex' }}
        >
            {loading ? 'Processing...' : blocked ? '✓ Unblock User' : '⛔ Block User'}
        </button>
    );
}
