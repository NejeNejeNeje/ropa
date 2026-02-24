import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import styles from '../../admin.module.css';
import DeletePostButton from '../DeletePostButton';

export default async function CommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const post = await prisma.travelPost.findUnique({
        where: { id },
        include: {
            user: true,
            linkedListing: { select: { id: true, title: true, category: true } },
        },
    });

    if (!post) return notFound();

    const tags: string[] = (() => {
        try { return JSON.parse(post.tags || '[]'); } catch { return []; }
    })();

    return (
        <div>
            <Link href="/admin/community" className={styles.backBtn}>← Back to Community</Link>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Post Detail</h1>
                <p className={styles.pageDesc}>Posted by {post.user.name} · {new Date(post.createdAt).toLocaleString()}</p>
            </div>

            <div className={styles.detailGrid}>
                {/* Post Content */}
                <div className={styles.detailCard}>
                    <div className={styles.detailCardTitle}>Content</div>
                    {post.imageUrl && (
                        <div style={{ marginBottom: '1rem', borderRadius: 8, overflow: 'hidden' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={post.imageUrl} alt="Post" style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }} />
                        </div>
                    )}
                    <p style={{ color: '#d1d5db', lineHeight: 1.6 }}>{post.caption || '(no caption)'}</p>
                    {tags.length > 0 && (
                        <div style={{ marginTop: '0.75rem', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {tags.map((t) => (
                                <span key={t} className={`${styles.badge} ${styles.badgePurple}`}>{t}</span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Metadata */}
                <div className={styles.detailCard}>
                    <div className={styles.detailCardTitle}>Details</div>
                    <div className={styles.detailRow}><span className={styles.detailKey}>Author</span><span className={styles.detailVal}>{post.user.name}</span></div>
                    <div className={styles.detailRow}><span className={styles.detailKey}>Email</span><span className={styles.detailVal}>{post.user.email}</span></div>
                    <div className={styles.detailRow}><span className={styles.detailKey}>City</span><span className={styles.detailVal}>{post.city || '—'}</span></div>
                    <div className={styles.detailRow}><span className={styles.detailKey}>Country</span><span className={styles.detailVal}>{post.country || '—'}</span></div>
                    <div className={styles.detailRow}><span className={styles.detailKey}>Likes</span><span className={styles.detailVal}>{post.likes}</span></div>
                    <div className={styles.detailRow}><span className={styles.detailKey}>Posted</span><span className={styles.detailVal}>{new Date(post.createdAt).toLocaleString()}</span></div>
                    {post.linkedListing && (
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Linked Listing</span>
                            <Link href={`/admin/listings/${post.linkedListing.id}`} className={styles.actionBtn} style={{ fontSize: '0.72rem' }}>
                                {post.linkedListing.title}
                            </Link>
                        </div>
                    )}
                    <Link href={`/admin/users/${post.user.id}`} className={styles.actionBtn} style={{ marginTop: '0.75rem' }}>View User →</Link>
                </div>
            </div>

            {/* Danger Zone */}
            <div className={styles.dangerZone}>
                <div className={styles.dangerZoneTitle}>Moderation</div>
                <p style={{ color: '#fca5a5', fontSize: '0.85rem', marginBottom: '0.75rem' }}>Remove this post if it violates community guidelines.</p>
                <DeletePostButton postId={post.id} />
            </div>
        </div>
    );
}
