'use client';

import Navigation from '@/components/Navigation';
import { MATCHES } from '@/data/mockData';
import { trpc } from '@/lib/trpc-client';
import styles from './matches.module.css';
import Link from 'next/link';

const STATUS_ICON: Record<string, string> = {
    pending: '⏳',
    accepted: '✅',
    completed: '🎉',
    expired: '⌛',
    disputed: '⚠️',
};

export default function MatchesPage() {
    const { data: liveMatches } = trpc.match.getAll.useQuery(undefined, { retry: false });
    const completeMutation = trpc.match.complete.useMutation();

    const matches = liveMatches || MATCHES;

    return (
        <div className={styles.page}>
            <header className={`${styles.header} glass-strong`}>
                <h1 className={styles.title}>💬 Matches</h1>
                <span className={styles.count}>{matches.length} matches</span>
            </header>

            <main className={styles.list}>
                {matches.length === 0 ? (
                    <div className={styles.empty}>
                        <span className={styles.emptyIcon}>💫</span>
                        <h3>No matches yet</h3>
                        <p>Start swiping to find your first match!</p>
                        <Link href="/feed" className="btn btn-primary">Go to Feed</Link>
                    </div>
                ) : (
                    matches.map((match) => {
                        const other = match.userB as Record<string, unknown>;
                        const otherName = (other.displayName || other.name || '') as string;
                        const otherAvatar = (other.avatarUrl || other.image || '') as string;
                        const otherCity = (other.currentCity || '') as string;
                        const otherCountry = (other.country || '') as string;
                        const listA = match.listingA as Record<string, unknown>;
                        const listB = match.listingB as Record<string, unknown>;
                        const imagesA = typeof listA.images === 'string' ? JSON.parse(listA.images as string) : (listA.images || []);
                        const imagesB = typeof listB.images === 'string' ? JSON.parse(listB.images as string) : (listB.images || []);

                        const lastMsg = (match as Record<string, unknown>).lastMessage as string
                            || ((match as Record<string, unknown>).messages as Record<string, unknown>[] | undefined)?.[0]?.body as string || '';
                        return (
                            <div key={match.id} className={`${styles.matchCard} card card-hover`}>
                                <div className={styles.matchTop}>
                                    <img src={otherAvatar} alt={otherName} className={styles.avatar} />
                                    <div className={styles.matchInfo}>
                                        <div className={styles.nameRow}>
                                            <h3 className={styles.name}>{otherName}</h3>
                                            <span className={styles.status}>
                                                {STATUS_ICON[match.status]} {match.status}
                                            </span>
                                        </div>
                                        <div className={styles.location}>📍 {otherCity}{otherCountry ? `, ${otherCountry}` : ''}</div>
                                        {lastMsg && <p className={styles.lastMessage}>{lastMsg}</p>}
                                    </div>
                                </div>

                                <div className={styles.matchItems}>
                                    <div className={styles.matchItem}>
                                        <img src={(imagesB as { url: string }[])[0]?.url} alt={listB.title as string} className={styles.itemThumb} />
                                        <div className={styles.itemInfo}>
                                            <span className={styles.itemTitle}>{listB.title as string}</span>
                                            <span className={styles.itemMeta}>{listB.size as string} · {listB.brand as string}</span>
                                        </div>
                                    </div>
                                    <span className={styles.swapIcon}>⇄</span>
                                    <div className={styles.matchItem}>
                                        <img src={(imagesA as { url: string }[])[0]?.url} alt={listA.title as string} className={styles.itemThumb} />
                                        <div className={styles.itemInfo}>
                                            <span className={styles.itemTitle}>{listA.title as string}</span>
                                            <span className={styles.itemMeta}>{listA.size as string} · {listA.brand as string}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.matchActions}>
                                    <button className="btn btn-primary" style={{ flex: 1 }}>💬 Chat</button>
                                    {match.status === 'accepted' && (
                                        <button className="btn btn-secondary" onClick={() => completeMutation.mutate(match.id)}>✅ Complete</button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </main>

            <Navigation />
        </div>
    );
}
