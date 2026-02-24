'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '../login/login.module.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/reset-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to send reset link');
            }
            setSent(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <h1 className={styles.title} style={{ fontSize: '1.5rem' }}>🔑 Reset Password</h1>

                {sent ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</p>
                        <h3 style={{ color: '#f9fafb', marginBottom: '0.5rem' }}>Check your email</h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.6 }}>
                            If an account with that email exists, we&apos;ve sent a password reset link.
                            Check your inbox (and spam folder).
                        </p>
                        <Link href="/login" style={{ color: '#c8a86b', marginTop: '1.5rem', display: 'inline-block' }}>
                            ← Back to login
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className={styles.subtitle}>Enter your email and we&apos;ll send a reset link.</p>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.input}
                                required
                            />
                            {error && <p className={styles.error}>{error}</p>}
                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                        <p className={styles.toggle}>
                            Remember your password?{' '}
                            <Link href="/login" style={{ color: '#c8a86b' }}>Sign in</Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
