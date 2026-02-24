import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import styles from '../../admin.module.css';

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const match = await prisma.match.findUnique({
        where: { id },
        include: {
            userA: true,
            userB: true,
            listingA: true,
            listingB: true,
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 20,
                include: { sender: { select: { name: true } } },
            },
        },
    });

    if (!match) return notFound();

    return (
        <div>
            <Link href="/admin/matches" className={styles.backBtn}>← Back to Matches</Link>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Match Details</h1>
                <p className={styles.pageDesc}>
                    {match.userA.name} ↔ {match.userB.name} · <span className={`${styles.badge} ${match.status === 'accepted' ? styles.badgeGreen : styles.badgeYellow}`}>{match.status}</span>
                </p>
            </div>

            <div className={styles.detailGrid}>
                {/* User A */}
                <div className={styles.detailCard}>
                    <div className={styles.detailCardTitle}>User A</div>
                    <div className={styles.detailRow}><span className={styles.detailKey}>Name</span><span className={styles.detailVal}>{match.userA.name}</span></div>
                    <div className={styles.detailRow}><span className={styles.detailKey}>Email</span><span className={styles.detailVal}>{match.userA.email}</span></div>
                    <div className={styles.detailRow}><span className={styles.detailKey}>Trust</span><span className={styles.detailVal}>{match.userA.trustTier}</span></div>
                    <div className={styles.detailRow}><span className={styles.detailKey}>Karma</span><span className={styles.detailVal}>{match.userA.karmaPoints}</span></div>
                    <Link href={`/admin/users/${match.userA.id}`} className={styles.actionBtn} style={{ marginTop: '0.75rem' }}>View Profile →</Link>
                </div>

                {/* User B */}
                <div className={styles.detailCard}>
                    <div className={styles.detailCardTitle}>User B</div>
                    <div className={styles.detailRow}><span className={styles.detailKey}>Name</span><span className={styles.detailVal}>{match.userB.name}</span></div>
                    <div className={styles.detailRow}><span className={styles.detailKey}>Email</span><span className={styles.detailVal}>{match.userB.email}</span></div>
                    <div className={styles.detailRow}><span className={styles.detailKey}>Trust</span><span className={styles.detailVal}>{match.userB.trustTier}</span></div>
                    <div className={styles.detailRow}><span className={styles.detailKey}>Karma</span><span className={styles.detailVal}>{match.userB.karmaPoints}</span></div>
                    <Link href={`/admin/users/${match.userB.id}`} className={styles.actionBtn} style={{ marginTop: '0.75rem' }}>View Profile →</Link>
                </div>

                {/* Listing A */}
                <div className={styles.detailCard}>
                    <div className={styles.detailCardTitle}>Listing A</div>
                    {match.listingA ? (
                        <>
                            <div className={styles.detailRow}><span className={styles.detailKey}>Title</span><span className={styles.detailVal}>{match.listingA.title}</span></div>
                            <div className={styles.detailRow}><span className={styles.detailKey}>Category</span><span className={styles.detailVal}>{match.listingA.category}</span></div>
                            <div className={styles.detailRow}><span className={styles.detailKey}>Size</span><span className={styles.detailVal}>{match.listingA.size || '—'}</span></div>
                            <Link href={`/admin/listings/${match.listingA.id}`} className={styles.actionBtn} style={{ marginTop: '0.75rem' }}>View Listing →</Link>
                        </>
                    ) : <p className={styles.empty}>No listing linked</p>}
                </div>

                {/* Listing B */}
                <div className={styles.detailCard}>
                    <div className={styles.detailCardTitle}>Listing B</div>
                    {match.listingB ? (
                        <>
                            <div className={styles.detailRow}><span className={styles.detailKey}>Title</span><span className={styles.detailVal}>{match.listingB.title}</span></div>
                            <div className={styles.detailRow}><span className={styles.detailKey}>Category</span><span className={styles.detailVal}>{match.listingB.category}</span></div>
                            <div className={styles.detailRow}><span className={styles.detailKey}>Size</span><span className={styles.detailVal}>{match.listingB.size || '—'}</span></div>
                            <Link href={`/admin/listings/${match.listingB.id}`} className={styles.actionBtn} style={{ marginTop: '0.75rem' }}>View Listing →</Link>
                        </>
                    ) : <p className={styles.empty}>No listing linked</p>}
                </div>
            </div>

            {/* Match Details */}
            <div className={styles.detailCard} style={{ marginBottom: '1.5rem' }}>
                <div className={styles.detailCardTitle}>Match Info</div>
                <div className={styles.detailRow}><span className={styles.detailKey}>Status</span><span className={styles.detailVal}>{match.status}</span></div>
                <div className={styles.detailRow}><span className={styles.detailKey}>Agreed Price</span><span className={styles.detailVal}>{match.agreedPrice ? `€${match.agreedPrice}` : 'Pure Swap'}</span></div>
                <div className={styles.detailRow}><span className={styles.detailKey}>Messages</span><span className={styles.detailVal}>{match.messages.length}</span></div>
                <div className={styles.detailRow}><span className={styles.detailKey}>Created</span><span className={styles.detailVal}>{new Date(match.createdAt).toLocaleString()}</span></div>
                <div className={styles.detailRow}><span className={styles.detailKey}>Updated</span><span className={styles.detailVal}>{new Date(match.updatedAt).toLocaleString()}</span></div>
            </div>

            {/* Recent Messages */}
            {match.messages.length > 0 && (
                <div className={styles.tableWrap}>
                    <div className={styles.tableToolbar}>
                        <span className={styles.tableTitle}>Recent Messages ({match.messages.length})</span>
                    </div>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Sender</th>
                                <th>Message</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {match.messages.map((msg) => (
                                <tr key={msg.id}>
                                    <td className={styles.tdPrimary}>{msg.sender.name}</td>
                                    <td style={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.body}</td>
                                    <td>{new Date(msg.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
