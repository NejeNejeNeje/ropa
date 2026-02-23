import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/lib/auth';
import styles from './admin.module.css';

const NAV_ITEMS = [
    { href: '/admin', label: 'Overview', icon: '◈' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/listings', label: 'Listings', icon: '🏷️' },
    { href: '/admin/offers', label: 'Offers', icon: '🤝' },
    { href: '/admin/swap-circles', label: 'Swap Circles', icon: '⭕' },
    { href: '/admin/drop-zones', label: 'Drop Zones', icon: '📍' },
    { href: '/admin/karma', label: 'Karma Ledger', icon: '⭐' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    // Auth guard — server-side, unfakeable
    if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
        redirect('/');
    }

    return (
        <div className={styles.shell}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <Image src="/ropa-logo.png" alt="ROPA" width={32} height={32} style={{ borderRadius: '50%' }} />
                    <div>
                        <span className={styles.sidebarTitle}>ROPA Admin</span>
                        <span className={styles.adminBadge}>ADMIN</span>
                    </div>
                </div>

                <nav className={styles.sidebarNav}>
                    {NAV_ITEMS.map((item) => (
                        <Link key={item.href} href={item.href} className={styles.navItem}>
                            <span className={styles.navIcon}>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <Link href="/" className={styles.backLink}>
                        ← Back to Site
                    </Link>
                </div>
            </aside>

            {/* Main content */}
            <main className={styles.main}>{children}</main>
        </div>
    );
}
