import Link from 'next/link';

export const metadata = { title: 'Privacy Policy — ROPA' };

export default function PrivacyPage() {
    return (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '3rem 1.5rem', color: '#e5e7eb', lineHeight: 1.8 }}>
            <Link href="/" style={{ color: '#c8a86b', fontSize: '0.85rem' }}>← Back to ROPA</Link>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f9fafb', margin: '1.5rem 0 0.5rem' }}>Privacy Policy</h1>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '2rem' }}>Last updated: February 2026</p>

            <h2 style={{ fontSize: '1.1rem', color: '#f9fafb', marginTop: '2rem' }}>1. Information We Collect</h2>
            <p><strong>Account data:</strong> Name, email address, and password (hashed, never stored in plain text).</p>
            <p><strong>Profile data:</strong> City, country, preferred sizes, style preferences, and optional bio.</p>
            <p><strong>Listing data:</strong> Photos, descriptions, and pricing of items you list.</p>
            <p><strong>Usage data:</strong> Swipes, offers, matches, and messages exchanged through the platform.</p>

            <h2 style={{ fontSize: '1.1rem', color: '#f9fafb', marginTop: '2rem' }}>2. How We Use Your Data</h2>
            <p>We use your data to: (a) operate your account, (b) match you with relevant listings and users, (c) facilitate offers and swaps, (d) send notifications about your activity, and (e) improve the platform.</p>

            <h2 style={{ fontSize: '1.1rem', color: '#f9fafb', marginTop: '2rem' }}>3. Data Sharing</h2>
            <p>We do not sell your personal data. Your profile information (name, city, ratings) is visible to other users. Email addresses are never shared with other users.</p>

            <h2 style={{ fontSize: '1.1rem', color: '#f9fafb', marginTop: '2rem' }}>4. Cookies & Sessions</h2>
            <p>We use session cookies to keep you signed in. We do not use third-party tracking cookies.</p>

            <h2 style={{ fontSize: '1.1rem', color: '#f9fafb', marginTop: '2rem' }}>5. Data Security</h2>
            <p>Passwords are hashed using bcrypt. All data is transmitted over HTTPS. We follow industry-standard practices to protect your information.</p>

            <h2 style={{ fontSize: '1.1rem', color: '#f9fafb', marginTop: '2rem' }}>6. Your Rights</h2>
            <p>You may: (a) access, update, or delete your profile data at any time, (b) request a copy of your data, (c) request account deletion by contacting support. Upon deletion, your data will be removed within 30 days.</p>

            <h2 style={{ fontSize: '1.1rem', color: '#f9fafb', marginTop: '2rem' }}>7. Third-Party Services</h2>
            <p>We may use third-party services for: authentication (Google OAuth, if enabled), image hosting (Vercel Blob), payment processing (Stripe, if enabled). These services have their own privacy policies.</p>

            <h2 style={{ fontSize: '1.1rem', color: '#f9fafb', marginTop: '2rem' }}>8. Children</h2>
            <p>ROPA is not intended for users under 18. We do not knowingly collect data from minors.</p>

            <h2 style={{ fontSize: '1.1rem', color: '#f9fafb', marginTop: '2rem' }}>9. Changes</h2>
            <p>We may update this policy. We will notify users of significant changes via the platform.</p>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '3rem', paddingTop: '1.5rem', display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
                <Link href="/terms" style={{ color: '#c8a86b' }}>Terms of Service</Link>
                <Link href="/" style={{ color: '#9ca3af' }}>Back to ROPA</Link>
            </div>
        </div>
    );
}
