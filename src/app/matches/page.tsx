'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';
import MeetupSheet from '@/components/MeetupSheet';
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

// Meetup status pill helper
function MeetupPill({ status }: { status?: string | null }) {
    if (!status || status === 'cancelled') return null;
    if (status === 'confirmed') {
        return <span className={styles.meetupPillConfirmed}>📍 Meetup Confirmed</span>;
    }
    return <span className={styles.meetupPillPending}>🟡 Meetup Pending</span>;
}

type MatchWithMeetup = {
    id: string;
    status: string;
    meetupVenue?: string | null;
    meetupAddress?: string | null;
    meetupCity?: string | null;
    meetupLat?: number | null;
    meetupLng?: number | null;
    meetupDate?: string | null;
    meetupStatus?: string | null;
    meetupProposedBy?: string | null;
    userB: Record<string, unknown>;
    listingA: Record<string, unknown>;
    listingB: Record<string, unknown>;
    lastMessage?: string;
    messages?: Record<string, unknown>[];
};

export default function MatchesPage() {
    const { data: session } = useSession();
    const currentUserId = (session?.user as { id?: string } | undefined)?.id ?? '';

    const { data: liveMatches, refetch } = trpc.match.getAll.useQuery(undefined, { retry: false });
    const completeMutation = trpc.match.complete.useMutation({ onSuccess: () => refetch() });

    const matches = (liveMatches || MATCHES) as unknown as MatchWithMeetup[];

    // Which match has the sheet open
    const [sheetState, setSheetState] = useState<{ matchId: string; prefillCity: string } | null>(null);
    const activeMatch = matches.find(m => m.id === sheetState?.matchId);

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
                        const other = match.userB;
                        const otherName = (other.displayName || other.name || '') as string;
                        const otherAvatar = (other.avatarUrl || other.image || '') as string;
                        const otherCity = (other.currentCity || '') as string;
                        const otherCountry = (other.country || '') as string;
                        const listA = match.listingA;
                        const listB = match.listingB;
                        const imagesA = typeof listA.images === 'string' ? JSON.parse(listA.images as string) : (listA.images || []);
                        const imagesB = typeof listB.images === 'string' ? JSON.parse(listB.images as string) : (listB.images || []);
                        const lastMsg = match.lastMessage || (match.messages?.[0]?.body as string) || '';

                        const prefillCity = (listA.city || listB.city || '') as string;
                        const isAccepted = match.status === 'accepted';

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

                                {/* Meetup status pill */}
                                {isAccepted && match.meetupStatus && (
                                    <div className={styles.meetupRow}>
                                        <MeetupPill status={match.meetupStatus} />
                                    </div>
                                )}

                                <div className={styles.matchActions}>
                                    <button className="btn btn-primary" style={{ flex: 1 }}>💬 Chat</button>

                                    {/* Meetup button — only for accepted matches */}
                                    {isAccepted && (
                                        <button
                                            className={`btn ${match.meetupStatus === 'confirmed' ? 'btn-secondary' : 'btn-secondary'}`}
                                            onClick={() => setSheetState({ matchId: match.id, prefillCity })}
                                            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                                        >
                                            📍 {match.meetupStatus === 'confirmed' ? 'View Meetup'
                                                : match.meetupStatus === 'proposed' ? 'Meetup Pending'
                                                    : 'Set Meetup'}
                                        </button>
                                    )}

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

            {/* Meetup bottom sheet */}
            {sheetState && activeMatch && (
                <MeetupSheet
                    matchId={sheetState.matchId}
                    currentUserId={currentUserId}
                    proposedBy={activeMatch.meetupProposedBy}
                    meetupVenue={activeMatch.meetupVenue}
                    meetupAddress={activeMatch.meetupAddress}
                    meetupCity={activeMatch.meetupCity}
                    meetupLat={activeMatch.meetupLat}
                    meetupLng={activeMatch.meetupLng}
                    meetupDate={activeMatch.meetupDate}
                    meetupStatus={activeMatch.meetupStatus as 'proposed' | 'confirmed' | 'cancelled' | null}
                    prefillCity={sheetState.prefillCity}
                    onClose={() => setSheetState(null)}
                    onUpdated={() => { refetch(); setSheetState(null); }}
                />
            )}
        </div>
    );
}
