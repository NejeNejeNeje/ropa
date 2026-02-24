import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import styles from '../../admin.module.css';
import BlockUserButton from './BlockUserButton';

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            listings: { orderBy: { createdAt: 'desc' }, take: 10 },
            offersMade: { orderBy: { createdAt: 'desc' }, take: 10, include: { listing: { select: { title: true } } } },
            offersReceived: { orderBy: { createdAt: 'desc' }, take: 10, include: { listing: { select: { title: true } } } },
            karmaEntries: { orderBy: { createdAt: 'desc' }, take: 5 },
            _count: { select: { listings: true, offersMade: true, offersReceived: true, matchesAsA: true, matchesAsB: true } },
        },
    });

    if (!user) notFound();

    const matchCount = user._count.matchesAsA + user._count.matchesAsB;

    return (
        <div>
            <Link href="/admin/users" className={styles.backBtn}>← Back to Users</Link>

            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{user.name}</h1>
                <p className={styles.pageDesc}>{user.email}</p>
            </div>

            <div className={styles.detailGrid}>
                {/* Profile card */}
                <div>
                    <div className={styles.detailCard}>
                        <div className={styles.userAvatar}>
                            {user.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div className={styles.detailCardTitle}>Profile</div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Role</span>
                            <span className={`${styles.badge} ${user.role === 'admin' ? styles.badgeYellow : styles.badgeGray}`}>{user.role}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Status</span>
                            <span className={`${styles.badge} ${user.blocked ? styles.badgeRed : styles.badgeGreen}`}>
                                {user.blocked ? 'Blocked' : 'Active'}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Trust Tier</span>
                            <span className={styles.detailVal}>{user.trustTier}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Karma</span>
                            <span className={styles.detailVal}>{user.karmaPoints} pts</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>City</span>
                            <span className={styles.detailVal}>{user.currentCity || '—'}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Country</span>
                            <span className={styles.detailVal}>{user.country || '—'}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Rating</span>
                            <span className={styles.detailVal}>{user.rating.toFixed(1)} ⭐</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Total Trades</span>
                            <span className={styles.detailVal}>{user.totalTrades}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Matches</span>
                            <span className={styles.detailVal}>{matchCount}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailKey}>Joined</span>
                            <span className={styles.detailVal}>{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                        {user.bio && (
                            <div className={styles.detailRow}>
                                <span className={styles.detailKey}>Bio</span>
                                <span className={styles.detailVal} style={{ maxWidth: 160, textAlign: 'right', fontSize: '0.75rem' }}>{user.bio}</span>
                            </div>
                        )}

                        {/* Danger zone — block/unblock */}
                        <div className={styles.dangerZone}>
                            <div className={styles.dangerTitle}>Admin Actions</div>
                            <BlockUserButton userId={user.id} blocked={user.blocked} userName={user.name} />
                        </div>
                    </div>
                </div>

                {/* Activity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Listings */}
                    <div className={styles.tableWrap}>
                        <div className={styles.tableToolbar}>
                            <span className={styles.tableTitle}>Listings ({user._count.listings})</span>
                        </div>
                        <table className={styles.dataTable}>
                            <thead>
                                <tr><th>Title</th><th>Category</th><th>Price</th><th>Status</th><th>Date</th></tr>
                            </thead>
                            <tbody>
                                {user.listings.length === 0 && <tr><td colSpan={5} className={styles.empty}>No listings.</td></tr>}
                                {user.listings.map((l) => (
                                    <tr key={l.id}>
                                        <td className={styles.tdPrimary}>{l.title}</td>
                                        <td>{l.category}</td>
                                        <td>{l.price ? `€${l.price}` : 'Free'}</td>
                                        <td><span className={`${styles.badge} ${l.isActive ? styles.badgeGreen : styles.badgeGray}`}>{l.isActive ? 'Active' : 'Inactive'}</span></td>
                                        <td>{new Date(l.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Offers made */}
                    <div className={styles.tableWrap}>
                        <div className={styles.tableToolbar}>
                            <span className={styles.tableTitle}>Offers Made ({user._count.offersMade})</span>
                        </div>
                        <table className={styles.dataTable}>
                            <thead>
                                <tr><th>Listing</th><th>Amount</th><th>Status</th><th>Date</th></tr>
                            </thead>
                            <tbody>
                                {user.offersMade.length === 0 && <tr><td colSpan={4} className={styles.empty}>No offers made.</td></tr>}
                                {user.offersMade.map((o) => (
                                    <tr key={o.id}>
                                        <td className={styles.tdPrimary}>{o.listing.title}</td>
                                        <td>{o.amount ? `€${o.amount}` : 'Swap'}</td>
                                        <td><span className={`${styles.badge} ${o.status === 'accepted' ? styles.badgeGreen :
                                            o.status === 'declined' ? styles.badgeRed : styles.badgeGray
                                            }`}>{o.status}</span></td>
                                        <td>{new Date(o.createdAt).toLocaleDateString()}</td>
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
