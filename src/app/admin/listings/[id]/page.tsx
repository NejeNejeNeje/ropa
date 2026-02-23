import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import styles from '../../admin.module.css';
import ListingToggle from '../ListingToggle';

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const listing = await prisma.listing.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, name: true, email: true, trustTier: true } },
            dropZone: { select: { id: true, name: true, city: true } },
            offers: {
                orderBy: { createdAt: 'desc' },
                take: 20,
                include: {
                    buyer: { select: { id: true, name: true } },
                },
            },
            _count: { select: { swipes: true, offers: true, matchesAsA: true, matchesAsB: true } },
        },
    });

    if (!listing) notFound();

    const images: Array<{ url: string }> = (() => {
        try { return JSON.parse(listing.images); } catch { return []; }
    })();

    const matchCount = listing._count.matchesAsA + listing._count.matchesAsB;

    return (
        <div>
            <Link href="/admin/listings" className={styles.backBtn}>← Back to Listings</Link>

            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{listing.title}</h1>
                <p className={styles.pageDesc}>
                    Listed by{' '}
                    <Link href={`/admin/users/${listing.user.id}`} style={{ color: 'var(--color-primary-light)' }}>
                        {listing.user.name}
                    </Link>
                    {' '}· {new Date(listing.createdAt).toLocaleDateString()}
                </p>
            </div>

            <div className={styles.detailGrid}>
                {/* Left — details card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Images */}
                    {images.length > 0 && (
                        <div className={styles.detailCard}>
                            <div className={styles.detailCardTitle}>Photos ({images.length})</div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                {images.map((img, i) => (
                                    <Image
                                        key={i}
                                        src={img.url}
                                        alt={`Photo ${i + 1}`}
                                        width={100}
                                        height={100}
                                        style={{ objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Listing details */}
                    <div className={styles.detailCard}>
                        <div className={styles.detailCardTitle}>Listing Details</div>

                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Status</span>
                            <span className={`${styles.badge} ${listing.isActive ? styles.badgeGreen : styles.badgeRed}`}>
                                {listing.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Category</span>
                            <span className={styles.detailVal}>{listing.category}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Brand</span>
                            <span className={styles.detailVal}>{listing.brand || '—'}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Size</span>
                            <span className={styles.detailVal}>{listing.size}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Condition</span>
                            <span className={styles.detailVal}>{listing.condition}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Gender</span>
                            <span className={styles.detailVal}>{listing.genderTarget}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Pricing</span>
                            <span className={styles.detailVal}>
                                {listing.price ? `${listing.currency} ${listing.price}` : listing.pricingType}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>City</span>
                            <span className={styles.detailVal}>{listing.city}, {listing.country}</span>
                        </div>
                        {listing.dropZone && (
                            <div className={styles.detailRow}>
                                <span className={styles.detailKey}>Drop Zone</span>
                                <Link href={`/admin/drop-zones/${listing.dropZone.id}`} className={styles.actionBtn} style={{ fontSize: '0.72rem' }}>
                                    {listing.dropZone.name}
                                </Link>
                            </div>
                        )}
                        {listing.description && (
                            <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--color-surface)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                {listing.description}
                            </div>
                        )}

                        {/* Engagement stats */}
                        <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
                            {[
                                { label: 'Swipes', value: listing._count.swipes },
                                { label: 'Offers', value: listing._count.offers },
                                { label: 'Matches', value: matchCount },
                            ].map(s => (
                                <div key={s.label} style={{ padding: '0.5rem', background: 'var(--color-surface)', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-light)' }}>{s.value}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Admin actions */}
                        <div className={styles.dangerZone} style={{ marginTop: '1rem' }}>
                            <div className={styles.dangerTitle}>Admin Actions</div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <ListingToggle listingId={listing.id} isActive={listing.isActive} />
                                <Link href={`/admin/users/${listing.user.id}`} className={styles.actionBtn}>
                                    View Owner →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right — offers table */}
                <div>
                    <div className={styles.tableWrap}>
                        <div className={styles.tableToolbar}>
                            <span className={styles.tableTitle}>Offers ({listing._count.offers})</span>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Buyer</th>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listing.offers.length === 0 && (
                                    <tr><td colSpan={6} className={styles.empty}>No offers yet.</td></tr>
                                )}
                                {listing.offers.map(o => (
                                    <tr key={o.id}>
                                        <td className={styles.tdPrimary}>
                                            <Link href={`/admin/users/${o.buyer.id}`} className={styles.actionBtn} style={{ fontSize: '0.72rem' }}>
                                                {o.buyer.name}
                                            </Link>
                                        </td>
                                        <td>
                                            <span className={`${styles.badge} ${o.offerType === 'OVERBID' ? styles.badgeGreen : o.offerType === 'UNDERBID' ? styles.badgeRed : styles.badgeGray}`}>
                                                {o.offerType}
                                            </span>
                                        </td>
                                        <td>{o.amount ? `${o.currency} ${o.amount}` : 'Swap'}</td>
                                        <td>
                                            <span className={`${styles.badge} ${o.status === 'accepted' ? styles.badgeGreen : o.status === 'declined' ? styles.badgeRed : styles.badgeGray}`}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <Link href={`/admin/offers/${o.id}`} className={styles.actionBtn}>View →</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
