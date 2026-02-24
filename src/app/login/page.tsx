'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './login.module.css';

const TEST_ACCOUNTS = [
    { email: 'test1@ropa.trade', password: 'test1234', name: 'Test User 1', role: 'user', avatar: '🧪', city: 'New York' },
    { email: 'test2@ropa.trade', password: 'test1234', name: 'Test User 2', role: 'user', avatar: '🧪', city: 'London' },
    { email: 'test3@ropa.trade', password: 'test1234', name: 'Test User 3', role: 'user', avatar: '🧪', city: 'Berlin' },
    { email: 'admin@ropa.trade', password: 'admin1234', name: 'ROPA Admin', role: 'admin', avatar: '🛡️', city: 'San Francisco' },
    { email: 'you@ropa.trade', password: 'ropa2026', name: 'Demo (You)', role: 'user', avatar: '🎒', city: 'Paris' },
];

export default function LoginPage() {
    const router = useRouter();
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loggingInAs, setLoggingInAs] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegister) {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, name }),
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Registration failed');
                }
            }

            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password');
            } else {
                // Wait for session cookie to propagate then fetch role
                await new Promise(r => setTimeout(r, 500));
                const session = await fetch('/api/auth/session').then(r => r.json());
                const role = session?.user?.role || 'user';
                // Use full page redirect — ensures server layouts see fresh session cookie
                window.location.href = role === 'admin' ? '/admin' : '/feed';
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickLogin = async (account: typeof TEST_ACCOUNTS[0]) => {
        setLoggingInAs(account.email);
        setError('');
        const result = await signIn('credentials', {
            email: account.email,
            password: account.password,
            redirect: false,
        });
        if (result?.error) {
            setError(`Failed to log in as ${account.name}`);
            setLoggingInAs(null);
        } else {
            // Use known account role directly — no session fetch delay needed
            const role = account.role || 'user';
            // Full page redirect — ensures server layouts see fresh session cookie
            window.location.href = role === 'admin' ? '/admin' : '/feed';
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <Image src="/ropa-logo.png" alt="ROPA" width={80} height={80} className={styles.logoImg} style={{ borderRadius: '50%', margin: '0 auto 4px', display: 'block' }} />
                <h1 className={styles.title}>ROPA</h1>
                <p className={styles.subtitle}>Trade clothes while traveling</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {isRegister && (
                        <input
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={styles.input}
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.input}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                        required
                        minLength={6}
                    />

                    {error && <p className={styles.error}>{error}</p>}

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? '...' : isRegister ? 'Create Account' : 'Sign In'}
                    </button>
                </form>

                {/* B2: Google Sign-In — visible when NEXT_PUBLIC_GOOGLE_AUTH_ENABLED is set */}
                {process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1rem 0' }}>
                            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>or</span>
                            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                        </div>
                        <button
                            type="button"
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '12px',
                                background: '#fff', color: '#111', fontWeight: 700, fontSize: '0.9rem',
                                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: '0.5rem',
                            }}
                            onClick={() => signIn('google', { callbackUrl: '/feed' })}
                        >
                            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.04 24.04 0 0 0 0 21.56l7.98-6.19z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /></svg>
                            Continue with Google
                        </button>
                    </>
                )}

                <p className={styles.toggle}>
                    {isRegister ? 'Already have an account?' : "Don't have an account?"}
                    <button onClick={() => { setIsRegister(!isRegister); setError(''); }}>
                        {isRegister ? 'Sign in' : 'Register'}
                    </button>
                </p>

                {!isRegister && (
                    <p style={{ textAlign: 'center', marginTop: '0.25rem' }}>
                        <a href="/forgot-password" style={{ color: '#9ca3af', fontSize: '0.8rem', textDecoration: 'none' }}>
                            Forgot password?
                        </a>
                    </p>
                )}

                {/* ─── Test Accounts Panel ─── */}
                <div className={styles.testSection}>
                    <div className={styles.testHeader}>
                        <div className={styles.testDivider} />
                        <span className={styles.testLabel}>⚡ Quick Login — Test Accounts</span>
                        <div className={styles.testDivider} />
                    </div>

                    <div className={styles.testGrid}>
                        {TEST_ACCOUNTS.map((account) => (
                            <button
                                key={account.email}
                                className={`${styles.testCard} ${account.role === 'admin' ? styles.testCardAdmin : ''}`}
                                onClick={() => handleQuickLogin(account)}
                                disabled={!!loggingInAs}
                            >
                                <div className={styles.testCardTop}>
                                    <span className={styles.testAvatar}>{account.avatar}</span>
                                    <div className={styles.testInfo}>
                                        <span className={styles.testName}>{account.name}</span>
                                        {account.role === 'admin' && (
                                            <span className={styles.adminBadge}>ADMIN</span>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.testCredentials}>
                                    <span className={styles.testEmail}>{account.email}</span>
                                    <span className={styles.testPassword}>pw: {account.password}</span>
                                </div>
                                <span className={styles.testCity}>📍 {account.city}</span>
                                {loggingInAs === account.email && (
                                    <div className={styles.testLoading}>Signing in...</div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.75rem' }}>
                    <a href="/terms" style={{ color: '#6b7280', textDecoration: 'none' }}>Terms of Service</a>
                    <a href="/privacy" style={{ color: '#6b7280', textDecoration: 'none' }}>Privacy Policy</a>
                </div>
            </div>
        </div>
    );
}
