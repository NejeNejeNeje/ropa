import Link from 'next/link';

export const metadata = { title: 'Terms of Service — ROPA' };

export default function TermsPage() {
    return (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '3rem 1.5rem', color: '#e5e7eb', lineHeight: 1.8 }}>
            <Link href="/" style={{ color: '#c8a86b', fontSize: '0.85rem' }}>← Back to ROPA</Link>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f9fafb', margin: '1.5rem 0 0.5rem' }}>Terms of Service</h1>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '2rem' }}>Last updated: February 2026</p>

            <h2 style={{ fontSize: '1.1rem', color: '#f9fafb', marginTop: '2rem' }}>1. Acceptance of Terms</h2>
            <p>By using ROPA (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>

            <h2 style={{ fontSize: '1.1rem', color: '#f9fafb', marginTop: '2rem' }}>2. Description of Service</h2>
            <p>ROPA is a peer-to-peer platform that connects travelers who want to swap, trade, or sell clothing items. We facilitate connections but are not a party to any transaction between users.</p>

            <h2 style={{ fontSize: '1.1rem', color: '#f9fafb', marginTop: '2rem' }}>3. User Accounts</h2>
            <p>You must provide accurate information when creating an account. You are responsible for maintaining the security of your account and all activities under it. You must be at least 18 years old to use ROPA.</p>

            <h2 style={{ fontSize: '1.1rem', color: '#f9fafb', marginTop: '2rem' }}>4. User Conduct</h2>
            <p>You agree not to: (a) post false or misleading listings, (b) harass other users, (c) use the platform for illegal activities, (d) attempt to circumvent safety features, or (e) create multiple accounts to abuse the system.</p>

            <h2 style={{ fontSize: '1.1rem', color: '#f9fafb', marginTop: '2rem' }}>5. Transactions</h2>
            <p>ROPA facilitates connections between buyers and sellers. All transactions are between users directly. ROPA does not guarantee the quality, safety, or legality of items listed. Users are responsible for verifying items before completing a swap.</p>

            <h2 style={{ fontSize: '1.1rem', color: '#f9fafb', marginTop: '2rem' }}>6. Content</h2>
            <p>You retain ownership of content you post. By posting, you grant ROPA a non-exclusive license to display your content on the platform. We may remove content that violates these terms.</p>

            <h2 style={{ fontSize: '1.1rem', color: '#f9fafb', marginTop: '2rem' }}>7. Limitation of Liability</h2>
            <p>ROPA is provided &quot;as is&quot; without warranty. We are not liable for any damages arising from your use of the platform, including losses from transactions between users.</p>

            <h2 style={{ fontSize: '1.1rem', color: '#f9fafb', marginTop: '2rem' }}>8. Termination</h2>
            <p>We may suspend or terminate accounts that violate these terms. You may delete your account at any time by contacting support.</p>

            <h2 style={{ fontSize: '1.1rem', color: '#f9fafb', marginTop: '2rem' }}>9. Changes</h2>
            <p>We may update these terms. Continued use of the Service after changes constitutes acceptance of the updated terms.</p>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '3rem', paddingTop: '1.5rem', display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
                <Link href="/privacy" style={{ color: '#c8a86b' }}>Privacy Policy</Link>
                <Link href="/" style={{ color: '#9ca3af' }}>Back to ROPA</Link>
            </div>
        </div>
    );
}
