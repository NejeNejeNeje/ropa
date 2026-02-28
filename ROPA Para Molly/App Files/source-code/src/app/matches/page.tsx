'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';
import MeetupSheet from '@/components/MeetupSheet';
import ReviewModal from '@/components/ReviewModal';
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
    agreedPrice?: number | null;
    userAId?: string;
    userBId?: string;
    meetupVenue?: string | null;
    meetupAddress?: string | null;
    meetupCity?: string | null;
    meetupLat?: number | null;
    meetupLng?: number | null;
    meetupDate?: string | null;
    meetupStatus?: string | null;
    meetupProposedBy?: string | null;
    buyerConfirmedAt?: string | null;
    sellerConfirmedAt?: string | null;
    escrowReleasedAt?: string | null;
    disputeReason?: string | null;
    disputeOpenedBy?: string | null;
    userA: Record<string, unknown>;
    userB: Record<string, unknown>;
    listingA: Record<string, unknown>;
    listingB: Record<string, unknown>;
    lastMessage?: string;
    messages?: Record<string, unknown>[];
    offer?: { escrowStatus?: string; amount?: number; currency?: string; ropaHeldAmount?: number } | null;
};

export default function MatchesPage() {
    const { data: session } = useSession();
    const currentUserId = (session?.user as { id?: string } | undefined)?.id ?? '';

    const { data: liveMatches, refetch } = trpc.match.getAll.useQuery(undefined, { retry: false });

    // Review state — triggered after a swap is marked complete
    const [reviewTarget, setReviewTarget] = useState<{ matchId: string; otherUserName: string } | null>(null);

    const confirmMutation = trpc.match.confirmDelivery.useMutation({
        onSuccess: (data, matchId) => {
            refetch();
            if (data.bothConfirmed) {
                // Both confirmed = swap completed, show review modal
                const match = matches.find(m => m.id === matchId);
                const otherName = ((match?.userB as Record<string, unknown>)?.displayName ||
                    (match?.userB as Record<string, unknown>)?.name || 'your swap partner') as string;
                setReviewTarget({ matchId, otherUserName: otherName });
            }
        },
    });

    const disputeMutation = trpc.match.openDispute.useMutation({ onSuccess: () => refetch() });

    const matches = (liveMatches || MATCHES) as unknown as MatchWithMeetup[];

    // Which match has the sheet open
    const [sheetState, setSheetState] = useState<{ matchId: string; prefillCity: string } | null>(null);
    const [disputeState, setDisputeState] = useState<{ matchId: string; reason: string } | null>(null);
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

                                {/* Escrow status banner for paid matches */}
                                {match.offer && match.offer.escrowStatus && match.offer.escrowStatus !== 'none' && (
                                    <div className={`${styles.escrowPill} ${styles[`escrow_${match.offer.escrowStatus}`]}`}>
                                        {match.offer.escrowStatus === 'held' && '🔒'}
                                        {match.offer.escrowStatus === 'released' && '🔓'}
                                        {match.offer.escrowStatus === 'refunded' && '↩️'}
                                        {match.offer.escrowStatus === 'disputed' && '⚠️'}
                                        {' '}{match.offer.amount} {match.offer.currency} — {match.offer.escrowStatus === 'held'
                                            ? 'Held in escrow'
                                            : match.offer.escrowStatus === 'released'
                                                ? 'Released to seller'
                                                : match.offer.escrowStatus === 'refunded'
                                                    ? 'Refunded to buyer'
                                                    : 'Under dispute'}
                                    </div>
                                )}

                                {/* Dual-confirm delivery status */}
                                {isAccepted && (
                                    <div className={styles.confirmRow}>
                                        <span className={match.sellerConfirmedAt ? styles.confirmedBadge : styles.pendingBadge}>
                                            {match.sellerConfirmedAt ? '✅' : '⏳'} Seller
                                        </span>
                                        <span className={match.buyerConfirmedAt ? styles.confirmedBadge : styles.pendingBadge}>
                                            {match.buyerConfirmedAt ? '✅' : '⏳'} Buyer
                                        </span>
                                    </div>
                                )}

                                <div className={styles.matchActions}>
                                    <Link href={`/chat/${match.id}`} className="btn btn-primary" style={{ flex: 1, textAlign: 'center' }}>💬 Chat</Link>

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

                                    {/* Confirm Delivery — replaces old single-click Complete */}
                                    {isAccepted && (
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => confirmMutation.mutate(match.id)}
                                            disabled={confirmMutation.isPending}
                                            style={{
                                                ...((
                                                    (match.userAId === currentUserId && match.sellerConfirmedAt) ||
                                                    (match.userBId === currentUserId && match.buyerConfirmedAt)
                                                ) ? { opacity: 0.5, pointerEvents: 'none' as const } : {})
                                            }}
                                        >
                                            {(
                                                (match.userAId === currentUserId && match.sellerConfirmedAt) ||
                                                (match.userBId === currentUserId && match.buyerConfirmedAt)
                                            ) ? '✅ Confirmed' : '📦 Confirm Delivery'}
                                        </button>
                                    )}
                                </div>

                                {/* Dispute section */}
                                {isAccepted && match.status !== 'disputed' && (
                                    <div className={styles.disputeSection}>
                                        {disputeState?.matchId === match.id ? (
                                            <div className={styles.disputeForm}>
                                                <textarea
                                                    value={disputeState.reason}
                                                    onChange={(e) => setDisputeState({ matchId: match.id, reason: e.target.value })}
                                                    placeholder="Describe the issue (min 5 characters)..."
                                                    className={styles.disputeInput}
                                                    rows={2}
                                                />
                                                <div className={styles.disputeActions}>
                                                    <button
                                                        className={styles.disputeSubmit}
                                                        onClick={() => {
                                                            disputeMutation.mutate({ matchId: match.id, reason: disputeState.reason });
                                                            setDisputeState(null);
                                                        }}
                                                        disabled={disputeState.reason.length < 5 || disputeMutation.isPending}
                                                    >
                                                        ⚠️ Submit Dispute
                                                    </button>
                                                    <button className={styles.disputeCancel} onClick={() => setDisputeState(null)}>Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                className={styles.disputeLink}
                                                onClick={() => setDisputeState({ matchId: match.id, reason: '' })}
                                            >
                                                ⚠️ Report a problem
                                            </button>
                                        )}
                                    </div>
                                )}

                                {match.status === 'disputed' && (
                                    <div className={styles.disputedBanner}>
                                        ⚠️ Dispute opened{match.disputeReason ? `: "${match.disputeReason}"` : ''}
                                        <br /><small>An admin will review and resolve this.</small>
                                    </div>
                                )}
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

            {/* Review modal — appears after completing a swap */}
            {reviewTarget && (
                <ReviewModal
                    matchId={reviewTarget.matchId}
                    otherUserName={reviewTarget.otherUserName}
                    onClose={() => setReviewTarget(null)}
                    onSuccess={() => { refetch(); setReviewTarget(null); }}
                />
            )}
        </div>
    );
}
