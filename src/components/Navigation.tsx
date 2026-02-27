'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Flame, Compass, PlusCircle, Tag, MessageCircle, User, type LucideIcon } from 'lucide-react';
import { trpc } from '@/lib/trpc-client';
import styles from './Navigation.module.css';

const NAV_ITEMS: {
    href: string;
    label: string;
    Icon: LucideIcon;
    alsoMatch?: string[];
    showUnread?: boolean;
}[] = [
        { href: '/feed', label: 'Feed', Icon: Flame },
        { href: '/explore', label: 'Explore', Icon: Compass, alsoMatch: ['/dropzones', '/circles', '/community', '/travelswap'] },
        { href: '/listing/new', label: 'Sell', Icon: PlusCircle },
        { href: '/offers', label: 'Offers', Icon: Tag },
        { href: '/matches', label: 'Matches', Icon: MessageCircle, showUnread: true },
        { href: '/profile', label: 'Profile', Icon: User },
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
                    (item.alsoMatch?.some((m) => pathname.startsWith(m)));
                const hasUnread = item.showUnread && unreadCount > 0;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        <div className={styles.navItemInner}>
                            <span className={styles.iconWrap}>
                                <item.Icon
                                    size={24}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={styles.icon}
                                />
                                {hasUnread && (
                                    <span className={styles.unreadBadge} aria-label={`${unreadCount} unread`}>
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </span>
                            <span className={styles.label}>{item.label}</span>
                            {isActive && <span className={styles.indicator} />}
                        </div>
                    </Link>
                );
            })}
        </nav>
    );
}
