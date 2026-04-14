'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import styles from './offers.module.css';
import { trpc } from '@/lib/trpc-client';

const STATUS_ICON: Record<string, string> = {
    pending: '⏳',
    accepted: '✅',
    declined: '❌',
    expired: '⌛',
    countered: '💬',
};

// Live countdown hook — re-renders every second while the offer is pending
function useTimeLeft(expiresAt: string | Date | null | undefined): string {
    const getLabel = () => {
        if (!expiresAt) return '';
        const diff = new Date(expiresAt).getTime() - Date.now();
        if (diff <= 0) return 'Expired';
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        if (hours > 0) return `${hours}h ${minutes}m left`;
        if (minutes > 0) return `${minutes}m ${seconds}s left`;
        return `${seconds}s left`;
    };
    const [label, setLabel] = useState(getLabel);
    useEffect(() => {
        if (!expiresAt) return;
        const id = setInterval(() => setLabel(getLabel()), 1000);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expiresAt]);
    return label;
}

function scoreBadge(score: number | null): { label: string; color: string } {
    if (!score) return { label: '\u2014', color: 'var(--color-text-muted)' };
    if (score >= 0.7) return { label: '\uD83D\uDFE2 Great match', color: 'var(--color-success)' };
    if (score >= 0.4) return { label: '\uD83D\uDFE1 Good match', color: 'var(--color-warning)' };
    return { label: '\uD83D\uDD34 Low match', color: 'var(--color-error)' };
}


// ─── Shared Sub-Components ──────────────────────────────────────

interface EscrowBannerProps {
    ropaHeld: number;
    currency: string;
    askingPrice: number | null;
    totalAmount: number;
    status: string;
    role: 'seller' | 'buyer';
}

function EscrowBanner({ ropaHeld, currency, askingPrice, totalAmount, status, role }: EscrowBannerProps) {
    const isReleased = status === 'accepted';
    const isExpiredOrDeclined = status === 'expired' || status === 'declined';

    return (
        <div className={styles.escrowBanner} data-released={isReleased} data-lapsed={isExpiredOrDeclined}>
            <div className={styles.escrowIcon}>{isReleased ? '🔓' : isExpiredOrDeclined ? '↩️' : '🔒'}</div>
            <div className={styles.escrowBody}>
                <span className={styles.escrowTitle}>
                    {isReleased
                        ? 'ROPA premium released to seller'
                        : isExpiredOrDeclined
                            ? 'ROPA premium returned to buyer'
                            : 'ROPA holds premium in escrow'}
                </span>
                <div className={styles.escrowBreakdown}>
                    <span>Item price</span>
                    <span>{(askingPrice ?? 0).toFixed(2)} {currency}</span>
                </div>
                <div className={styles.escrowBreakdown}>
                    <span className={styles.escrowPremiumLabel}>🔥 Overbid premium</span>
                    <span className={styles.escrowPremiumValue}>+{ropaHeld.toFixed(2)} {currency}</span>
                </div>
                <div className={`${styles.escrowBreakdown} ${styles.escrowTotal}`}>
                    <span>Total</span>
                    <span>{totalAmount.toFixed(2)} {currency}</span>
                </div>
                {!isReleased && !isExpiredOrDeclined && (
                    <p className={styles.escrowNote}>
                        {role === 'buyer'
                            ? `Your ${ropaHeld.toFixed(2)} ${currency} premium is held safely until the seller accepts.`
                            : `Accepting releases the full ${totalAmount.toFixed(2)} ${currency} to you.`}
                    </p>
                )}
            </div>
        </div>
    );
}

interface OfferTimerRowProps {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    offer: any;
    isActive: boolean;
}

function OfferTimerRow({ offer, isActive }: OfferTimerRowProps) {
    const timeLabel = useTimeLeft(isActive ? offer.expiresAt : null);
    const isUrgent = isActive && new Date(offer.expiresAt).getTime() - Date.now() < 3600000; // < 1 hour

    return (
        <div className={styles.metaRow}>
            {offer.distanceKm != null && (
                <span>📍 {Math.round(offer.distanceKm)}km away</span>
            )}
            {isActive && timeLabel && (
                <span className={`${styles.timer} ${isUrgent ? styles.timerUrgent : ''}`}>
                    ⏰ {timeLabel}
                </span>
            )}
            <span>{STATUS_ICON[offer.status]} {offer.status}</span>
        </div>
    );
}

interface BuyerTimerProps {
    expiresAt: string | Date;
}

function BuyerTimer({ expiresAt }: BuyerTimerProps) {
    const timeLabel = useTimeLeft(expiresAt);
    const isUrgent = new Date(expiresAt).getTime() - Date.now() < 3600000;
    return (
        <span className={`${styles.timer} ${isUrgent ? styles.timerUrgent : ''}`}>
            ⏰ {timeLabel}
        </span>
    );
}

// ─── Seller View ────────────────────────────────────────────────

interface SellerViewProps {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    offers: any[] | undefined;
    refetch: () => void;
}

function SellerView({ offers, refetch }: SellerViewProps) {
    const [tab, setTab] = useState<'active' | 'offers'>('active');
    const [counteringId, setCounteringId] = useState<string | null>(null);
    const [counterAmount, setCounterAmount] = useState(0);

    const acceptMutation = trpc.offer.accept.useMutation({ onSuccess: () => refetch() });
    const declineMutation = trpc.offer.decline.useMutation({ onSuccess: () => refetch() });
    const counterMutation = trpc.offer.counter.useMutation({ onSuccess: () => { refetch(); setCounteringId(null); } });

    const all = offers || [];
    const active = all.filter((o) => o.status === 'pending');
    const displayed = tab === 'active' ? active : all;

    return (
        <>
            <div className={styles.tabs}>
                <button className={`${styles.tab} ${tab === 'active' ? styles.tabActive : ''}`} onClick={() => setTab('active')}>
                    ⏳ Active ({active.length})
                </button>
                <button className={`${styles.tab} ${tab === 'offers' ? styles.tabActive : ''}`} onClick={() => setTab('offers')}>
                    💰 Offers ({all.length})
                </button>
            </div>

            {displayed.length === 0 ? (
                <div className={styles.empty}>
                    <span className={styles.emptyIcon}>{tab === 'active' ? '📭' : '🏷️'}</span>
                    <h3>{tab === 'active' ? 'No pending offers' : 'No offers received yet'}</h3>
                    <p>{tab === 'active' ? 'When buyers make offers on your items, they appear here.' : 'All offers made on your listings will show here.'}</p>
                    {tab === 'active' && (
                        <Link href="/profile" className="btn btn-primary" style={{ marginTop: '16px' }}>Boost your listings to get more offers!</Link>
                    )}
                </div>
            ) : (
                <div className={styles.offerList}>
                    {displayed.map((offer) => {
                        const images = typeof offer.listing.images === 'string' ? JSON.parse(offer.listing.images) : [];
                        const thumbUrl = images[0]?.url || '';
                        const badge = scoreBadge(offer.sellerScore);
                        const isActive = offer.status === 'pending';

                        return (
                            <div key={offer.id} className={styles.offerCard}>
                                <div className={styles.offerTop}>
                                    <div className={styles.offerThumb} style={{ backgroundImage: thumbUrl ? `url(${thumbUrl})` : 'none' }} />
                                    <div className={styles.offerInfo}>
                                        <h3>{offer.listing.title}</h3>
                                        <span className={styles.askingLabel}>
                                            Asking: {offer.listing.price} {offer.listing.currency}
                                        </span>
                                    </div>
                                    <div className={styles.offerAmount}>
                                        <span className={styles.amountValue}>{offer.amount} {offer.currency}</span>
                                        <span className={`${styles.offerType} ${styles[`type${offer.offerType}`]}`}>
                                            {offer.offerType === 'OVERBID' ? '🔥' : offer.offerType === 'MATCH' ? '🤝' : '📉'} {offer.offerType}
                                        </span>
                                    </div>
                                </div>

                                {/* Overbid escrow banner — only for OVERBID offers */}
                                {offer.offerType === 'OVERBID' && offer.ropaHeldAmount != null && (
                                    <EscrowBanner
                                        ropaHeld={offer.ropaHeldAmount}
                                        currency={offer.currency}
                                        askingPrice={offer.listing.price}
                                        totalAmount={offer.amount}
                                        status={offer.status}
                                        role="seller"
                                    />
                                )}

                                <div className={styles.buyerRow}>
                                    {offer.buyer.image && (
                                        <Image src={offer.buyer.image} alt={offer.buyer.name} width={28} height={28} className={styles.buyerAvatar} />
                                    )}
                                    <div className={styles.buyerInfo}>
                                        <strong>{offer.buyer.name}</strong>
                                        <span>{offer.buyer.currentCity}{offer.buyer.country ? `, ${offer.buyer.country}` : ''}</span>
                                    </div>
                                    <span className={styles.matchBadge} style={{ color: badge.color }}>{badge.label}</span>
                                </div>

                                <OfferTimerRow offer={offer} isActive={isActive} />

                                {isActive && (
                                    <div className={styles.offerActions}>
                                        <button className={styles.acceptBtn} onClick={() => acceptMutation.mutate(offer.id)} disabled={acceptMutation.isPending}>
                                            ✅ Accept
                                        </button>
                                        <button className={styles.counterBtn} onClick={() => { setCounteringId(offer.id); setCounterAmount(offer.listing.price || 0); }}>
                                            💬 Counter
                                        </button>
                                        <button className={styles.declineBtn} onClick={() => declineMutation.mutate(offer.id)} disabled={declineMutation.isPending}>
                                            ❌
                                        </button>
                                    </div>
                                )}

                                {counteringId === offer.id && (
                                    <div className={styles.counterForm}>
                                        <input
                                            type="number"
                                            value={counterAmount}
                                            onChange={(e) => setCounterAmount(Number(e.target.value))}
                                            className={styles.counterInput}
                                            placeholder="Your counter price"
                                        />
                                        <button
                                            className={styles.counterSubmit}
                                            onClick={() => counterMutation.mutate({ offerId: offer.id, counterAmount })}
                                            disabled={counterMutation.isPending}
                                        >
                                            Send Counter
                                        </button>
                                    </div>
                                )}

                                {offer.status === 'countered' && offer.counterAmount && (
                                    <div className={styles.counterBadge}>
                                        💬 You countered with {offer.counterAmount} {offer.currency}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}

// ─── Buyer View ────────────────────────────────────────────────

interface BuyerViewProps {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    offers: any[] | undefined;
    refetch: () => void;
}

function BuyerView({ offers, refetch }: BuyerViewProps) {
    const [tab, setTab] = useState<'current' | 'accepted'>('current');

    const acceptCounterMutation = trpc.offer.acceptCounter.useMutation({ onSuccess: () => refetch() });
    const declineCounterMutation = trpc.offer.declineCounter.useMutation({ onSuccess: () => refetch() });

    const all = offers || [];
    const current = all.filter((o) => o.status === 'pending' || o.status === 'countered');
    const accepted = all.filter((o) => o.status === 'accepted');
    const displayed = tab === 'current' ? current : accepted;

    return (
        <>
            <div className={styles.tabs}>
                <button className={`${styles.tab} ${tab === 'current' ? styles.tabActive : ''}`} onClick={() => setTab('current')}>
                    ⏳ Current offers ({current.length})
                </button>
                <button className={`${styles.tab} ${tab === 'accepted' ? styles.tabActive : ''}`} onClick={() => setTab('accepted')}>
                    ✅ Accepted ({accepted.length})
                </button>
            </div>

            {displayed.length === 0 ? (
                <div className={styles.empty}>
                    <span className={styles.emptyIcon}>{tab === 'current' ? '📭' : '✅'}</span>
                    <h3>{tab === 'current' ? 'No current offers' : 'No accepted offers yet'}</h3>
                    <p>{tab === 'current' ? 'Offers waiting on the seller to agree a price will appear here.' : 'Once a seller agrees a price, your confirmed purchases show here.'}</p>
                    {tab === 'current' && (
                        <Link href="/explore" className="btn btn-primary" style={{ marginTop: '16px' }}>Explore dropzones and send offers!</Link>
                    )}
                </div>
            ) : (
                <div className={styles.offerList}>
                    {displayed.map((offer) => {
                        const images = typeof offer.listing.images === 'string' ? JSON.parse(offer.listing.images) : [];
                        const thumbUrl = images[0]?.url || '';
                        const isCountered = offer.status === 'countered';

                        return (
                            <div key={offer.id} className={`${styles.offerCard} ${isCountered && tab === 'current' ? styles.offerCardHighlight : ''}`}>
                                <div className={styles.offerTop}>
                                    <div className={styles.offerThumb} style={{ backgroundImage: thumbUrl ? `url(${thumbUrl})` : 'none' }} />
                                    <div className={styles.offerInfo}>
                                        <h3>{offer.listing.title}</h3>
                                        <span className={styles.askingLabel}>
                                            You offered: {offer.amount} {offer.currency}
                                        </span>
                                    </div>
                                    <div className={styles.offerStatus}>
                                        <span>{STATUS_ICON[offer.status]} {offer.status}</span>
                                    </div>
                                </div>

                                {/* Overbid escrow banner — buyer's perspective */}
                                {offer.offerType === 'OVERBID' && offer.ropaHeldAmount != null && (
                                    <EscrowBanner
                                        ropaHeld={offer.ropaHeldAmount}
                                        currency={offer.currency}
                                        askingPrice={offer.listing?.price}
                                        totalAmount={offer.amount}
                                        status={offer.status}
                                        role="buyer"
                                    />
                                )}

                                <div className={styles.buyerRow}>
                                    {offer.seller.image && (
                                        <Image src={offer.seller.image} alt={offer.seller.name} width={28} height={28} className={styles.buyerAvatar} />
                                    )}
                                    <div className={styles.buyerInfo}>
                                        <strong>{offer.seller.name}</strong>
                                        <span>Seller • {offer.seller.currentCity}</span>
                                    </div>
                                    {offer.status === 'pending' && (
                                        <BuyerTimer expiresAt={offer.expiresAt} />
                                    )}
                                </div>

                                {isCountered && offer.counterAmount && (
                                    <div className={styles.counterResponse}>
                                        <div className={styles.counterInfo}>
                                            <span className={styles.counterLabel}>Seller's counter:</span>
                                            <span className={styles.counterPrice}>{offer.counterAmount} {offer.currency}</span>
                                            <span className={styles.counterDiff}>
                                                {offer.counterAmount > offer.amount
                                                    ? `+${(offer.counterAmount - offer.amount).toFixed(0)} more than your offer`
                                                    : `${(offer.amount - offer.counterAmount).toFixed(0)} less than your offer`
                                                }
                                            </span>
                                        </div>
                                        <div className={styles.counterActions}>
                                            <button
                                                className={styles.acceptBtn}
                                                onClick={() => acceptCounterMutation.mutate(offer.id)}
                                                disabled={acceptCounterMutation.isPending}
                                            >
                                                ✅ Accept {offer.counterAmount} {offer.currency}
                                            </button>
                                            <button
                                                className={styles.declineBtn}
                                                onClick={() => declineCounterMutation.mutate(offer.id)}
                                                disabled={declineCounterMutation.isPending}
                                            >
                                                ❌ Decline
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {offer.status === 'accepted' && (
                                    <div className={styles.acceptedBadge}>
                                        ✅ Deal confirmed! Check your matches.
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}

// ─── Main Page ────────────────────────────────────────────────

export default function OffersPage() {
    const [role, setRole] = useState<'selling' | 'buying'>('selling');

    const sellerQuery = trpc.offer.getForSeller.useQuery(undefined, { retry: false, enabled: role === 'selling' });
    const buyerQuery = trpc.offer.getForBuyer.useQuery(undefined, { retry: false, enabled: role === 'buying' });

    const sellerPending = (sellerQuery.data || []).filter((o) => o.status === 'pending').length;
    const buyerCurrent = (buyerQuery.data || []).filter((o) => o.status === 'pending' || o.status === 'countered').length;

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1>💰 Offers</h1>
                <span className={styles.count}>
                    {role === 'selling' ? `${sellerPending} pending` : `${buyerCurrent} active`}
                </span>
            </header>

            <main className={styles.main}>
                <div className={styles.roleTabs}>
                    <button className={`${styles.roleTab} ${role === 'selling' ? styles.roleTabActive : ''}`} onClick={() => setRole('selling')}>
                        🏷️ Selling
                        {sellerPending > 0 && <span className={styles.badge}>{sellerPending}</span>}
                    </button>
                    <button className={`${styles.roleTab} ${role === 'buying' ? styles.roleTabActive : ''}`} onClick={() => setRole('buying')}>
                        🛍️ Buying
                        {buyerCurrent > 0 && <span className={styles.badge}>{buyerCurrent}</span>}
                    </button>
                </div>

                {role === 'selling' ? (
                    <SellerView offers={sellerQuery.data} refetch={sellerQuery.refetch} />
                ) : (
                    <BuyerView offers={buyerQuery.data} refetch={buyerQuery.refetch} />
                )}
            </main>

            <Navigation />
        </div>
    );
}
