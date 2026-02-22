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
                document.cookie = `x-ropa-role=${role}; path=/; max-age=2592000; SameSite=Lax`;
                router.push(role === 'admin' ? '/admin' : '/feed');
                router.refresh();
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
            document.cookie = `x-ropa-role=${role}; path=/; max-age=2592000; SameSite=Lax`;
            router.push(role === 'admin' ? '/admin' : '/feed');
            router.refresh();
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

                <p className={styles.toggle}>
                    {isRegister ? 'Already have an account?' : "Don't have an account?"}
                    <button onClick={() => { setIsRegister(!isRegister); setError(''); }}>
                        {isRegister ? 'Sign in' : 'Register'}
                    </button>
                </p>

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
            </div>
        </div>
    );
}
