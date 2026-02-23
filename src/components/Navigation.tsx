'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc-client';
import styles from './Navigation.module.css';

const NAV_ITEMS = [
    { href: '/feed', label: 'Feed', icon: '🔥' },
    { href: '/explore', label: 'Explore', icon: '🌍', alsoMatch: ['/dropzones', '/circles', '/community'] },
    { href: '/listing/new', label: 'Sell', icon: '➕' },
    { href: '/travelswap', label: 'Swap', icon: '🔄' },
    { href: '/matches', label: 'Matches', icon: '💬', showUnread: true },
    { href: '/profile', label: 'Profile', icon: '👤' },
];

export default function Navigation() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isAuthed = !!session?.user;

    // CHAT-3: Unread message count for badge dot — only when authenticated
    const { data: unreadCount = 0 } = trpc.match.getUnreadCount.useQuery(undefined, {
        enabled: isAuthed,
        retry: false,
        refetchInterval: 10000, // refresh every 10s in background
    });

    return (
        <nav className={`${styles.nav} glass-strong`} aria-label="Main navigation">
            {NAV_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href) ||
                    ('alsoMatch' in item && item.alsoMatch?.some((m) => pathname.startsWith(m)));
                const hasUnread = item.showUnread && unreadCount > 0;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        <span className={styles.iconWrap}>
                            <span className={styles.icon}>{item.icon}</span>
                            {hasUnread && (
                                <span className={styles.unreadBadge} aria-label={`${unreadCount} unread`}>
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </span>
                        <span className={styles.label}>{item.label}</span>
                        {isActive && <span className={styles.indicator} />}
                    </Link>
                );
            })}
        </nav>
    );
}
