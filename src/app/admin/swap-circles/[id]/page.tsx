import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import styles from '../../admin.module.css';
import CircleStatusButton from './CircleStatusButton';

export default async function SwapCircleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const circle = await prisma.swapCircle.findUnique({
        where: { id },
        include: {
            host: { select: { id: true, name: true, email: true, trustTier: true } },
            rsvps: {
                orderBy: { createdAt: 'asc' },
                include: { user: { select: { id: true, name: true, email: true, trustTier: true, currentCity: true } } },
            },
        },
    });

    if (!circle) notFound();

    const tags: string[] = (() => { try { return JSON.parse(circle.tags); } catch { return []; } })();
    const spotsLeft = circle.capacity - circle.rsvps.length;

    return (
        <div>
            <Link href="/admin/swap-circles" className={styles.backBtn}>← Back to Swap Circles</Link>

            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{circle.title}</h1>
                <p className={styles.pageDesc}>
                    {circle.city}, {circle.country} · {new Date(circle.date).toLocaleDateString()} at {circle.time}
                    {' '}·{' '}
                    <span className={`${styles.badge} ${circle.isPast ? styles.badgeGray : circle.isFull ? styles.badgeRed : styles.badgeGreen}`}>
                        {circle.isPast ? 'Past' : circle.isFull ? 'Full' : 'Open'}
                    </span>
                </p>
            </div>

            <div className={styles.detailGrid}>
                {/* Left card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {circle.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={circle.imageUrl} alt={circle.title} style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--color-border)', objectFit: 'cover', maxHeight: 200 }} />
                    )}
                    <div className={styles.detailCard}>
                        <div className={styles.detailCardTitle}>Event Details</div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Venue</span>
                            <span className={styles.detailVal}>{circle.venue}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Type</span>
                            <span className={styles.detailVal}>{circle.venueType}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Date</span>
                            <span className={styles.detailVal}>{new Date(circle.date).toLocaleDateString()}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Time</span>
                            <span className={styles.detailVal}>{circle.time}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Capacity</span>
                            <span className={styles.detailVal}>{circle.rsvps.length} / {circle.capacity}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Spots Left</span>
                            <span className={`${styles.badge} ${spotsLeft === 0 ? styles.badgeRed : styles.badgeGreen}`}>{spotsLeft}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Host</span>
                            <Link href={`/admin/users/${circle.host.id}`} className={styles.actionBtn} style={{ fontSize: '0.72rem' }}>
                                {circle.host.name} →
                            </Link>
                        </div>
                        {circle.description && (
                            <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--color-surface)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                {circle.description}
                            </div>
                        )}
                        {tags.length > 0 && (
                            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                {tags.map(tag => (
                                    <span key={tag} className={`${styles.badge} ${styles.badgeGray}`}>{tag}</span>
                                ))}
                            </div>
                        )}

                        <div className={styles.dangerZone} style={{ marginTop: '1rem' }}>
                            <div className={styles.dangerTitle}>Admin Actions</div>
                            <CircleStatusButton circleId={circle.id} isFull={circle.isFull} isPast={circle.isPast} />
                        </div>
                    </div>
                </div>

                {/* RSVPs table */}
                <div className={styles.tableWrap}>
                    <div className={styles.tableToolbar}>
                        <span className={styles.tableTitle}>RSVPs ({circle.rsvps.length})</span>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Trust</th>
                                <th>City</th>
                                <th>RSVP'd</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {circle.rsvps.length === 0 && (
                                <tr><td colSpan={7} className={styles.empty}>No RSVPs yet.</td></tr>
                            )}
                            {circle.rsvps.map((rsvp, i) => (
                                <tr key={rsvp.id}>
                                    <td style={{ color: 'var(--color-text-muted)' }}>{i + 1}</td>
                                    <td className={styles.tdPrimary}>{rsvp.user.name}</td>
                                    <td>{rsvp.user.email}</td>
                                    <td>
                                        <span className={`${styles.badge} ${rsvp.user.trustTier === 'gold' ? styles.badgeYellow : rsvp.user.trustTier === 'silver' ? styles.badgeBlue : styles.badgeGray}`}>
                                            {rsvp.user.trustTier}
                                        </span>
                                    </td>
                                    <td>{rsvp.user.currentCity || '—'}</td>
                                    <td>{new Date(rsvp.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <Link href={`/admin/users/${rsvp.user.id}`} className={styles.actionBtn}>View →</Link>
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
