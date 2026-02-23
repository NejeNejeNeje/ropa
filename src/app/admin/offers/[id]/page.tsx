import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import styles from '../../admin.module.css';
import OfferStatusButton from './OfferStatusButton';

export default async function OfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const offer = await prisma.offer.findUnique({
        where: { id },
        include: {
            buyer: { select: { id: true, name: true, email: true, trustTier: true, karmaPoints: true, currentCity: true } },
            seller: { select: { id: true, name: true, email: true, trustTier: true, karmaPoints: true, currentCity: true } },
            listing: { select: { id: true, title: true, category: true, condition: true, city: true, country: true, price: true, currency: true, images: true } },
            match: { select: { id: true, status: true, agreedPrice: true } },
        },
    });

    if (!offer) notFound();

    const listingImage = (() => {
        try {
            const imgs = JSON.parse(offer.listing.images);
            return imgs[0]?.url ?? null;
        } catch { return null; }
    })();

    const statusColor = {
        accepted: styles.badgeGreen,
        declined: styles.badgeRed,
        expired: styles.badgeGray,
        countered: styles.badgeBlue,
        pending: styles.badgeYellow,
    }[offer.status] ?? styles.badgeGray;

    return (
        <div>
            <Link href="/admin/offers" className={styles.backBtn}>← Back to Offers</Link>

            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Offer — {offer.listing.title}</h1>
                <p className={styles.pageDesc}>
                    {offer.currency} {offer.amount} · <span className={`${styles.badge} ${statusColor}`}>{offer.status}</span>
                    {' '}· Created {new Date(offer.createdAt).toLocaleDateString()}
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Buyer */}
                <div className={styles.detailCard}>
                    <div className={styles.detailCardTitle}>🛒 Buyer</div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailKey}>Name</span>
                        <Link href={`/admin/users/${offer.buyer.id}`} className={styles.actionBtn} style={{ fontSize: '0.72rem' }}>
                            {offer.buyer.name} →
                        </Link>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailKey}>Email</span>
                        <span className={styles.detailVal} style={{ fontSize: '0.75rem' }}>{offer.buyer.email}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailKey}>Trust Tier</span>
                        <span className={`${styles.badge} ${offer.buyer.trustTier === 'gold' ? styles.badgeYellow : offer.buyer.trustTier === 'silver' ? styles.badgeBlue : styles.badgeGray}`}>
                            {offer.buyer.trustTier}
                        </span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailKey}>Karma</span>
                        <span className={styles.detailVal}>{offer.buyer.karmaPoints} pts</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailKey}>City</span>
                        <span className={styles.detailVal}>{offer.buyer.currentCity || '—'}</span>
                    </div>
                </div>

                {/* Offer details */}
                <div className={styles.detailCard}>
                    <div className={styles.detailCardTitle}>📋 Offer Details</div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailKey}>Status</span>
                        <span className={`${styles.badge} ${statusColor}`}>{offer.status}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailKey}>Type</span>
                        <span className={`${styles.badge} ${offer.offerType === 'OVERBID' ? styles.badgeGreen : offer.offerType === 'UNDERBID' ? styles.badgeRed : styles.badgeGray}`}>
                            {offer.offerType}
                        </span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailKey}>Amount</span>
                        <span className={styles.detailVal} style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-primary-light)' }}>
                            {offer.currency} {offer.amount}
                        </span>
                    </div>
                    {offer.counterAmount && (
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Counter</span>
                            <span className={styles.detailVal}>{offer.currency} {offer.counterAmount}</span>
                        </div>
                    )}
                    {offer.distanceKm != null && (
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Distance</span>
                            <span className={styles.detailVal}>{offer.distanceKm.toFixed(0)} km</span>
                        </div>
                    )}
                    {offer.sellerScore != null && (
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Compat. Score</span>
                            <span className={styles.detailVal}>{offer.sellerScore.toFixed(1)}</span>
                        </div>
                    )}
                    <div className={styles.detailRow}>
                        <span className={styles.detailKey}>Expires</span>
                        <span className={styles.detailVal}>{new Date(offer.expiresAt).toLocaleDateString()}</span>
                    </div>
                    {offer.acceptedAt && (
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Accepted</span>
                            <span className={styles.detailVal}>{new Date(offer.acceptedAt).toLocaleDateString()}</span>
                        </div>
                    )}
                    {offer.match && (
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Match Status</span>
                            <span className={`${styles.badge} ${offer.match.status === 'completed' ? styles.badgeGreen : styles.badgeGray}`}>
                                {offer.match.status}
                            </span>
                        </div>
                    )}
                </div>

                {/* Seller */}
                <div className={styles.detailCard}>
                    <div className={styles.detailCardTitle}>🏷️ Seller</div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailKey}>Name</span>
                        <Link href={`/admin/users/${offer.seller.id}`} className={styles.actionBtn} style={{ fontSize: '0.72rem' }}>
                            {offer.seller.name} →
                        </Link>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailKey}>Email</span>
                        <span className={styles.detailVal} style={{ fontSize: '0.75rem' }}>{offer.seller.email}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailKey}>Trust Tier</span>
                        <span className={`${styles.badge} ${offer.seller.trustTier === 'gold' ? styles.badgeYellow : offer.seller.trustTier === 'silver' ? styles.badgeBlue : styles.badgeGray}`}>
                            {offer.seller.trustTier}
                        </span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailKey}>Karma</span>
                        <span className={styles.detailVal}>{offer.seller.karmaPoints} pts</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailKey}>City</span>
                        <span className={styles.detailVal}>{offer.seller.currentCity || '—'}</span>
                    </div>
                </div>
            </div>

            {/* Listing preview */}
            <div className={styles.detailCard} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                {listingImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={listingImage} alt={offer.listing.title} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--color-border)', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1 }}>
                    <div className={styles.detailCardTitle}>🧥 Listing</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>{offer.listing.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        {offer.listing.category} · {offer.listing.condition} · {offer.listing.city}, {offer.listing.country}
                    </div>
                    {offer.listing.price != null && (
                        <div style={{ marginTop: '0.4rem', fontSize: '0.9rem', color: 'var(--color-primary-light)', fontWeight: 700 }}>
                            {offer.listing.currency} {offer.listing.price}
                        </div>
                    )}
                    <div style={{ marginTop: '0.75rem' }}>
                        <Link href={`/admin/listings/${offer.listing.id}`} className={styles.actionBtn}>View Listing →</Link>
                    </div>
                </div>
            </div>

            {/* Admin actions */}
            <div className={styles.dangerZone}>
                <div className={styles.dangerTitle}>Admin Actions</div>
                <OfferStatusButton offerId={offer.id} currentStatus={offer.status} />
            </div>
        </div>
    );
}
