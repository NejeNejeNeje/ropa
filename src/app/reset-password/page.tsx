'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../login/login.module.css';

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirm) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/auth/reset-confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Reset failed');
            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className={styles.page}>
                <div className={styles.container}>
                    <h1 className={styles.title} style={{ fontSize: '1.5rem' }}>❌ Invalid Link</h1>
                    <p className={styles.subtitle}>This reset link is invalid or has expired.</p>
                    <Link href="/forgot-password" className={styles.submitBtn} style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '1rem' }}>
                        Request a new link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <h1 className={styles.title} style={{ fontSize: '1.5rem' }}>🔐 New Password</h1>

                {success ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</p>
                        <h3 style={{ color: '#f9fafb', marginBottom: '0.5rem' }}>Password updated!</h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>You can now sign in with your new password.</p>
                        <Link href="/login" className={styles.submitBtn} style={{ display: 'inline-block', textDecoration: 'none', marginTop: '1.5rem' }}>
                            Go to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <input
                            type="password"
                            placeholder="New password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            required
                            minLength={6}
                        />
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            className={styles.input}
                            required
                        />
                        {error && <p className={styles.error}>{error}</p>}
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
