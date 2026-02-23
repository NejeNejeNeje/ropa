import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import styles from '../../admin.module.css';

export default async function DropZoneDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const zone = await prisma.dropZone.findUnique({
        where: { id },
        include: {
            listings: {
                orderBy: { createdAt: 'desc' },
                take: 30,
                include: { user: { select: { id: true, name: true } } },
            },
        },
    });

    if (!zone) notFound();

    const activeListings = zone.listings.filter(l => l.isActive);

    return (
        <div>
            <Link href="/admin/drop-zones" className={styles.backBtn}>← Back to Drop Zones</Link>

            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{zone.name}</h1>
                <p className={styles.pageDesc}>{zone.address} · {zone.city}, {zone.country}</p>
            </div>

            <div className={styles.detailGrid}>
                {/* Left card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {zone.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={zone.imageUrl} alt={zone.name} style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--color-border)', objectFit: 'cover', maxHeight: 180 }} />
                    )}
                    <div className={styles.detailCard}>
                        <div className={styles.detailCardTitle}>Zone Details</div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Type</span>
                            <span className={styles.detailVal}>{zone.type}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Hours</span>
                            <span className={styles.detailVal}>{zone.hours || '—'}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Active Listings</span>
                            <span className={`${styles.badge} ${activeListings.length > 0 ? styles.badgeGreen : styles.badgeGray}`}>
                                {activeListings.length}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Total Listings</span>
                            <span className={styles.detailVal}>{zone.listings.length}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Partner Since</span>
                            <span className={styles.detailVal}>{new Date(zone.partnerSince).toLocaleDateString()}</span>
                        </div>
                        {zone.description && (
                            <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--color-surface)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                {zone.description}
                            </div>
                        )}

                        {/* Quick stats */}
                        <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
                            {[
                                { label: 'Active', value: activeListings.length },
                                { label: 'Total', value: zone.listings.length },
                            ].map(s => (
                                <div key={s.label} style={{ padding: '0.5rem', background: 'var(--color-surface)', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-light)' }}>{s.value}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Listings table */}
                <div className={styles.tableWrap}>
                    <div className={styles.tableToolbar}>
                        <span className={styles.tableTitle}>Listings at this Drop Zone</span>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Owner</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {zone.listings.length === 0 && (
                                <tr><td colSpan={6} className={styles.empty}>No listings at this drop zone.</td></tr>
                            )}
                            {zone.listings.map(l => (
                                <tr key={l.id}>
                                    <td className={styles.tdPrimary}>{l.title}</td>
                                    <td>
                                        <Link href={`/admin/users/${l.user.id}`} className={styles.actionBtn} style={{ fontSize: '0.72rem' }}>
                                            {l.user.name}
                                        </Link>
                                    </td>
                                    <td>{l.category}</td>
                                    <td>{l.price ? `€${l.price}` : 'Free'}</td>
                                    <td>
                                        <span className={`${styles.badge} ${l.isActive ? styles.badgeGreen : styles.badgeRed}`}>
                                            {l.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <Link href={`/admin/listings/${l.id}`} className={styles.actionBtn}>View →</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
