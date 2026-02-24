'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from '../admin.module.css';

export default function DeletePostButton({ postId }: { postId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Delete this post? This cannot be undone.')) return;
        setLoading(true);
        try {
            await fetch(`/api/admin/community/${postId}`, { method: 'DELETE' });
            router.refresh();
        } catch {
            alert('Failed to delete post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
            style={{ fontSize: '0.72rem' }}
        >
            {loading ? '...' : '🗑️'}
        </button>
    );
}
