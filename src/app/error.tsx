'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    // Log to console for debugging (and Sentry if configured)
    console.error('[ROPA Error]', error);

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#0a0a0a', color: '#f9fafb', padding: '2rem', textAlign: 'center',
        }}>
            <div style={{ maxWidth: 400 }}>
                <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>😵</p>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Something went wrong</h2>
                <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                    An unexpected error occurred. Please try again.
                </p>
                <button
                    onClick={reset}
                    style={{
                        padding: '0.75rem 2rem', borderRadius: '12px', border: 'none',
                        background: '#c8a86b', color: '#000', fontWeight: 700, cursor: 'pointer',
                        fontSize: '0.9rem',
                    }}
                >
                    Try Again
                </button>
                {error.digest && (
                    <p style={{ color: '#6b7280', fontSize: '0.7rem', marginTop: '1.5rem' }}>
                        Error ID: {error.digest}
                    </p>
                )}
            </div>
        </div>
    );
}
