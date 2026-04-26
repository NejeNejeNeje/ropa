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

    const [reviewTarget, setReviewTarget] = useState<{ matchId: string; otherUserName: string } | null>(null);
    const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
    const [sheetState, setSheetState] = useState<{ matchId: string; prefillCity: string } | null>(null);
    const [disputeState, setDisputeState] = useState<{ matchId: string; reason: string } | null>(null);

    const confirmMutation = trpc.match.confirmDelivery.useMutation({
        onSuccess: (data, matchId) => {
            refetch();
            if (data.bothConfirmed) {
                const match = matches.find(m => m.id === matchId);
                const otherName = ((match?.userB as Record<string, unknown>)?.displayName ||
                    (match?.userB as Record<string, unknown>)?.name || 'your swap partner') as string;
                setReviewTarget({ matchId, otherUserName: otherName });
            }
        },
    });

    const disputeMutation = trpc.match.openDispute.useMutation({ onSuccess: () => refetch() });

    const matches = (liveMatches || MATCHES) as unknown as MatchWithMeetup[];
    const activeMatch = matches.find(m => m.id === activeMatchId);

    const safeImages = (val: unknown): { url: string }[] => {
        if (typeof val === 'string') { try { return JSON.parse(val); } catch { return []; } }
        return (val as { url: string }[]) || [];
    };

    return (
        <div className={styles.page}>
            <header className={`${styles.header} glass-strong`}>
                <h1 className={styles.title}>❤️ Favorites</h1>
                <span className={styles.count}>{matches.length} matches</span>
            </header>

            <main className={styles.gridArea}>
                {matches.length === 0 ? (
                    <div className={styles.empty}>
                        <span className={styles.emptyIcon}>💫</span>
                        <h3>No favorites yet</h3>
                        <p>Start swiping to find your first match!</p>
                        <Link href="/feed" className="btn btn-primary">Go to Feed</Link>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {matches.map((match) => {
                            const listB = match.listingB;
                            const imagesB = safeImages(listB.images);
                            const thumbUrl = imagesB[0]?.url || '';
                            const isAccepted = match.status === 'accepted';

                            return (
                                <div key={match.id} className={styles.gridCard}>
                                    {/* Image */}
                                    <div className={styles.gridCardImage}>
                                        {thumbUrl
                                            ? <img src={thumbUrl} alt={listB.title as string} draggable={false} />
                                            : <div className={styles.gridCardImagePlaceholder}>👗</div>
                                        }
                                        {/* Status badge overlay */}
                                        <span className={`${styles.statusBadge} ${styles[`status_${match.status}`]}`}>
                                            {STATUS_ICON[match.status]}
                                        </span>
                                        {/* Meetup badge */}
                                        {isAccepted && match.meetupStatus === 'confirmed' && (
                                            <span className={styles.meetupBadge}>📍</span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className={styles.gridCardInfo}>
                                        <span className={styles.gridCardTitle}>{listB.title as string}</span>
                                        <span className={styles.gridCardMeta}>
                                            {listB.size as string}{listB.brand ? ` · ${listB.brand}` : ''}
                                        </span>
                                    </div>

                                    {/* Offer button */}
                                    <div className={styles.gridCardActions}>
                                        <button
                                            className={styles.offerBtn}
                                            onClick={() => setActiveMatchId(match.id)}
                                        >
                                            OFFER
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <Navigation />

            {/* ── Match Action Panel (bottom sheet) ── */}
            {activeMatch && (
                <>
                    <div className={styles.panelOverlay} onClick={() => setActiveMatchId(null)} />
                    <div className={styles.panel}>
                        {/* Panel header */}
                        <div className={styles.panelHandle} />
                        <div className={styles.panelHeader}>
                            {(() => {
                                const other = activeMatch.userB;
                                const otherAvatar = (other.avatarUrl || other.image || '') as string;
                                const otherName = (other.displayName || other.name || '') as string;
                                const otherCity = (other.currentCity || '') as string;
                                const otherCountry = (other.country || '') as string;
                                return (
                                    <div className={styles.matchTop}>
                                        {otherAvatar && <img src={otherAvatar} alt={otherName} className={styles.avatar} />}
                                        <div className={styles.matchInfo}>
                                            <div className={styles.nameRow}>
                                                <h3 className={styles.name}>{otherName}</h3>
                                                <span className={styles.status}>
                                                    {STATUS_ICON[activeMatch.status]} {activeMatch.status}
                                                </span>
                                            </div>
                                            <div className={styles.location}>
                                                📍 {otherCity}{otherCountry ? `, ${otherCountry}` : ''}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Swap items preview */}
                        <div className={styles.matchItems}>
                            {(() => {
                                const listA = activeMatch.listingA;
                                const listB = activeMatch.listingB;
                                const imgsA = safeImages(listA.images);
                                const imgsB = safeImages(listB.images);
                                return (
                                    <>
                                        <div className={styles.matchItem}>
                                            <img src={imgsB[0]?.url} alt={listB.title as string} className={styles.itemThumb} />
                                            <div className={styles.itemInfo}>
                                                <span className={styles.itemTitle}>{listB.title as string}</span>
                                                <span className={styles.itemMeta}>{listB.size as string} · {listB.brand as string}</span>
                                            </div>
                                        </div>
                                        <span className={styles.swapIcon}>⇄</span>
                                        <div className={styles.matchItem}>
                                            <img src={imgsA[0]?.url} alt={listA.title as string} className={styles.itemThumb} />
                                            <div className={styles.itemInfo}>
                                                <span className={styles.itemTitle}>{listA.title as string}</span>
                                                <span className={styles.itemMeta}>{listA.size as string} · {listA.brand as string}</span>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        {/* Meetup pill */}
                        {activeMatch.status === 'accepted' && activeMatch.meetupStatus && (
                            <div className={styles.meetupRow}>
                                <MeetupPill status={activeMatch.meetupStatus} />
                            </div>
                        )}

                        {/* Escrow banner */}
                        {activeMatch.offer?.escrowStatus && activeMatch.offer.escrowStatus !== 'none' && (
                            <div className={`${styles.escrowPill} ${styles[`escrow_${activeMatch.offer.escrowStatus}`]}`}>
                                {activeMatch.offer.escrowStatus === 'held' && '🔒'}
                                {activeMatch.offer.escrowStatus === 'released' && '🔓'}
                                {activeMatch.offer.escrowStatus === 'refunded' && '↩️'}
                                {activeMatch.offer.escrowStatus === 'disputed' && '⚠️'}
                                {' '}{activeMatch.offer.amount} {activeMatch.offer.currency} —{' '}
                                {activeMatch.offer.escrowStatus === 'held' ? 'Held in escrow'
                                    : activeMatch.offer.escrowStatus === 'released' ? 'Released to seller'
                                        : activeMatch.offer.escrowStatus === 'refunded' ? 'Refunded to buyer'
                                            : 'Under dispute'}
                            </div>
                        )}

                        {/* Dual-confirm row */}
                        {activeMatch.status === 'accepted' && (
                            <div className={styles.confirmRow}>
                                <span className={activeMatch.sellerConfirmedAt ? styles.confirmedBadge : styles.pendingBadge}>
                                    {activeMatch.sellerConfirmedAt ? '✅' : '⏳'} Seller
                                </span>
                                <span className={activeMatch.buyerConfirmedAt ? styles.confirmedBadge : styles.pendingBadge}>
                                    {activeMatch.buyerConfirmedAt ? '✅' : '⏳'} Buyer
                                </span>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className={styles.matchActions}>
                            <Link
                                href={`/chat/${activeMatch.id}`}
                                className="btn btn-primary"
                                style={{ flex: 1, textAlign: 'center' }}
                                onClick={() => setActiveMatchId(null)}
                            >
                                💬 Chat
                            </Link>

                            {activeMatch.status === 'accepted' && (
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        const prefillCity = (activeMatch.listingA.city || activeMatch.listingB.city || '') as string;
                                        setActiveMatchId(null);
                                        setSheetState({ matchId: activeMatch.id, prefillCity });
                                    }}
                                >
                                    📍 {activeMatch.meetupStatus === 'confirmed' ? 'View Meetup'
                                        : activeMatch.meetupStatus === 'proposed' ? 'Meetup Pending'
                                            : 'Set Meetup'}
                                </button>
                            )}

                            {activeMatch.status === 'accepted' && (
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => confirmMutation.mutate(activeMatch.id)}
                                    disabled={confirmMutation.isPending}
                                    style={{
                                        ...((
                                            (activeMatch.userAId === currentUserId && activeMatch.sellerConfirmedAt) ||
                                            (activeMatch.userBId === currentUserId && activeMatch.buyerConfirmedAt)
                                        ) ? { opacity: 0.5, pointerEvents: 'none' as const } : {})
                                    }}
                                >
                                    {(
                                        (activeMatch.userAId === currentUserId && activeMatch.sellerConfirmedAt) ||
                                        (activeMatch.userBId === currentUserId && activeMatch.buyerConfirmedAt)
                                    ) ? '✅ Confirmed' : '📦 Confirm Delivery'}
                                </button>
                            )}
                        </div>

                        {/* Dispute */}
                        {activeMatch.status === 'accepted' && (
                            <div className={styles.disputeSection}>
                                {disputeState?.matchId === activeMatch.id ? (
                                    <div className={styles.disputeForm}>
                                        <textarea
                                            value={disputeState.reason}
                                            onChange={(e) => setDisputeState({ matchId: activeMatch.id, reason: e.target.value })}
                                            placeholder="Describe the issue (min 5 characters)..."
                                            className={styles.disputeInput}
                                            rows={2}
                                        />
                                        <div className={styles.disputeActions}>
                                            <button
                                                className={styles.disputeSubmit}
                                                onClick={() => {
                                                    disputeMutation.mutate({ matchId: activeMatch.id, reason: disputeState.reason });
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
                                        onClick={() => setDisputeState({ matchId: activeMatch.id, reason: '' })}
                                    >
                                        ⚠️ Report a problem
                                    </button>
                                )}
                            </div>
                        )}

                        {activeMatch.status === 'disputed' && (
                            <div className={styles.disputedBanner}>
                                ⚠️ Dispute opened{activeMatch.disputeReason ? `: "${activeMatch.disputeReason}"` : ''}
                                <br /><small>An admin will review and resolve this.</small>
                            </div>
                        )}

                        <button className={styles.panelClose} onClick={() => setActiveMatchId(null)}>✕ Close</button>
                    </div>
                </>
            )}

            {/* Meetup bottom sheet */}
            {sheetState && (() => {
                const sheetMatch = matches.find(m => m.id === sheetState.matchId);
                if (!sheetMatch) return null;
                return (
                    <MeetupSheet
                        matchId={sheetState.matchId}
                        currentUserId={currentUserId}
                        proposedBy={sheetMatch.meetupProposedBy}
                        meetupVenue={sheetMatch.meetupVenue}
                        meetupAddress={sheetMatch.meetupAddress}
                        meetupCity={sheetMatch.meetupCity}
                        meetupLat={sheetMatch.meetupLat}
                        meetupLng={sheetMatch.meetupLng}
                        meetupDate={sheetMatch.meetupDate}
                        meetupStatus={sheetMatch.meetupStatus as 'proposed' | 'confirmed' | 'cancelled' | null}
                        prefillCity={sheetState.prefillCity}
                        onClose={() => setSheetState(null)}
                        onUpdated={() => { refetch(); setSheetState(null); }}
                    />
                );
            })()}

            {/* Review modal */}
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
