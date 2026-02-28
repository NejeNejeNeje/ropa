'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import styles from './admin.module.css';

const NAV_ITEMS = [
    { href: '/admin', label: 'Overview', icon: '◈', exact: true },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/listings', label: 'Listings', icon: '🏷️' },
    { href: '/admin/offers', label: 'Offers', icon: '🤝' },
    { href: '/admin/matches', label: 'Matches', icon: '💬' },
    { href: '/admin/swap-circles', label: 'Swap Circles', icon: '⭕' },
    { href: '/admin/drop-zones', label: 'Drop Zones', icon: '📍' },
    { href: '/admin/community', label: 'Community', icon: '✨' },
    { href: '/admin/karma', label: 'Karma Ledger', icon: '⭐' },
];

export default function AdminNav() {
    const pathname = usePathname();

    return (
        <nav className={styles.sidebarNav}>
            {NAV_ITEMS.map((item) => {
                const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                    >
                        <span className={styles.navIcon}>{item.icon}</span>
                        {item.label}
                    </Link>
                );
            })}

            <button
                className={styles.logoutBtn}
                onClick={() => signOut({ callbackUrl: '/' })}
            >
                <span className={styles.navIcon}>🚪</span>
                Log Out
            </button>
        </nav>
    );
}
