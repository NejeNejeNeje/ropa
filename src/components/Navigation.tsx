'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navigation.module.css';

const NAV_ITEMS = [
    { href: '/feed', label: 'Feed', icon: '🔥' },
    { href: '/explore', label: 'Explore', icon: '🌍', alsoMatch: ['/dropzones', '/circles', '/community'] },
    { href: '/listing/new', label: 'Sell', icon: '➕' },
    { href: '/travelswap', label: 'Swap', icon: '🔄' },
    { href: '/matches', label: 'Matches', icon: '💬' },
    { href: '/profile', label: 'Profile', icon: '👤' },
];

export default function Navigation() {
    const pathname = usePathname();

    return (
        <nav className={`${styles.nav} glass-strong`} aria-label="Main navigation">
            {NAV_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href) ||
                    ('alsoMatch' in item && item.alsoMatch?.some((m) => pathname.startsWith(m)));
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        <span className={styles.icon}>{item.icon}</span>
                        <span className={styles.label}>{item.label}</span>
                        {isActive && <span className={styles.indicator} />}
                    </Link>
                );
            })}
        </nav>
    );
}
