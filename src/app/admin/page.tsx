import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import styles from './admin.module.css';

export default async function AdminOverview() {
    const [userCount, listingCount, offerCount, matchCount, swapCircleCount, dropZoneCount, karmaCount, communityCount] = await Promise.all([
        prisma.user.count(),
        prisma.listing.count(),
        prisma.offer.count(),
        prisma.match.count(),
        prisma.swapCircle.count(),
        prisma.dropZone.count(),
        prisma.karmaEntry.count(),
        prisma.travelPost.count(),
    ]);

    const activeListings = await prisma.listing.count({ where: { isActive: true } });
    const pendingOffers = await prisma.offer.count({ where: { status: 'pending' } });
    const blockedUsers = await prisma.user.count({ where: { blocked: true } });

    const recentUsers = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, email: true, role: true, createdAt: true, trustTier: true },
    });

    const recentOffers = await prisma.offer.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
            buyer: { select: { id: true, name: true } },
            seller: { select: { id: true, name: true } },
            listing: { select: { title: true } },
        },
    });

    const recentMatches = await prisma.match.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
            userA: { select: { id: true, name: true } },
            userB: { select: { id: true, name: true } },
        },
    });

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Dashboard Overview</h1>
                <p className={styles.pageDesc}>Platform health and key metrics at a glance.</p>
            </div>

            {/* Stats grid — clickable cards */}
            <div className={styles.statsGrid}>
                <Link href="/admin/users" className={styles.statCard} style={{ textDecoration: 'none' }}>
                    <div className={styles.statLabel}>Total Users</div>
                    <div className={styles.statValue}>{userCount}</div>
                    <div className={styles.statSub}>{blockedUsers > 0 ? `${blockedUsers} blocked` : 'All active'}</div>
                </Link>
                <Link href="/admin/listings" className={styles.statCard} style={{ textDecoration: 'none' }}>
                    <div className={styles.statLabel}>Listings</div>
                    <div className={styles.statValue}>{listingCount}</div>
                    <div className={styles.statSub}>{activeListings} active</div>
                </Link>
                <Link href="/admin/offers" className={styles.statCard} style={{ textDecoration: 'none' }}>
                    <div className={styles.statLabel}>Offers</div>
                    <div className={styles.statValue}>{offerCount}</div>
                    <div className={styles.statSub}>{pendingOffers} pending</div>
                </Link>
                <Link href="/admin/matches" className={styles.statCard} style={{ textDecoration: 'none' }}>
                    <div className={styles.statLabel}>Matches</div>
                    <div className={styles.statValue}>{matchCount}</div>
                    <div className={styles.statSub}>Mutual swipe-rights</div>
                </Link>
                <Link href="/admin/swap-circles" className={styles.statCard} style={{ textDecoration: 'none' }}>
                    <div className={styles.statLabel}>Swap Circles</div>
                    <div className={styles.statValue}>{swapCircleCount}</div>
                    <div className={styles.statSub}>Community events</div>
                </Link>
                <Link href="/admin/drop-zones" className={styles.statCard} style={{ textDecoration: 'none' }}>
                    <div className={styles.statLabel}>Drop Zones</div>
                    <div className={styles.statValue}>{dropZoneCount}</div>
                    <div className={styles.statSub}>Physical swap shelves</div>
                </Link>
                <Link href="/admin/community" className={styles.statCard} style={{ textDecoration: 'none' }}>
                    <div className={styles.statLabel}>Community Posts</div>
                    <div className={styles.statValue}>{communityCount}</div>
                    <div className={styles.statSub}>Travel posts</div>
                </Link>
                <Link href="/admin/karma" className={styles.statCard} style={{ textDecoration: 'none' }}>
                    <div className={styles.statLabel}>Karma Entries</div>
                    <div className={styles.statValue}>{karmaCount}</div>
                    <div className={styles.statSub}>Trust signals</div>
                </Link>
            </div>

            {/* Recent Users */}
            <div className={styles.tableWrap}>
                <div className={styles.tableToolbar}>
                    <span className={styles.tableTitle}>Recent Users</span>
                    <Link href="/admin/users" className={styles.actionBtn}>View All →</Link>
                </div>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Trust Tier</th>
                            <th>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentUsers.map((u) => (
                            <tr key={u.id} className={styles.clickableRow}>
                                <td className={styles.tdPrimary}>
                                    <Link href={`/admin/users/${u.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{u.name}</Link>
                                </td>
                                <td>{u.email}</td>
                                <td>
                                    <span className={`${styles.badge} ${u.role === 'admin' ? styles.badgeYellow : styles.badgeGray}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td>
                                    <span className={`${styles.badge} ${u.trustTier === 'gold' ? styles.badgeYellow :
                                        u.trustTier === 'silver' ? styles.badgeBlue : styles.badgeGray
                                        }`}>{u.trustTier}</span>
                                </td>
                                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Recent Offers */}
            <div className={styles.tableWrap}>
                <div className={styles.tableToolbar}>
                    <span className={styles.tableTitle}>Recent Offers</span>
                    <Link href="/admin/offers" className={styles.actionBtn}>View All →</Link>
                </div>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>Listing</th>
                            <th>Buyer</th>
                            <th>Seller</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentOffers.map((o) => (
                            <tr key={o.id} className={styles.clickableRow}>
                                <td className={styles.tdPrimary}>{o.listing.title}</td>
                                <td>
                                    <Link href={`/admin/users/${o.buyer.id}`} className={styles.actionBtn} style={{ fontSize: '0.72rem' }}>
                                        {o.buyer.name}
                                    </Link>
                                </td>
                                <td>
                                    <Link href={`/admin/users/${o.seller.id}`} className={styles.actionBtn} style={{ fontSize: '0.72rem' }}>
                                        {o.seller.name}
                                    </Link>
                                </td>
                                <td>{o.amount ? `€${o.amount}` : '—'}</td>
                                <td>
                                    <span className={`${styles.badge} ${o.status === 'accepted' ? styles.badgeGreen :
                                        o.status === 'declined' ? styles.badgeRed :
                                            o.status === 'countered' ? styles.badgeBlue : styles.badgeYellow
                                        }`}>{o.status}</span>
                                </td>
                                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Recent Matches */}
            <div className={styles.tableWrap}>
                <div className={styles.tableToolbar}>
                    <span className={styles.tableTitle}>Recent Matches</span>
                    <Link href="/admin/matches" className={styles.actionBtn}>View All →</Link>
                </div>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>User A</th>
                            <th>User B</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentMatches.map((m) => (
                            <tr key={m.id} className={styles.clickableRow}>
                                <td className={styles.tdPrimary}>
                                    <Link href={`/admin/users/${m.userA.id}`} className={styles.actionBtn} style={{ fontSize: '0.72rem' }}>
                                        {m.userA.name}
                                    </Link>
                                </td>
                                <td className={styles.tdPrimary}>
                                    <Link href={`/admin/users/${m.userB.id}`} className={styles.actionBtn} style={{ fontSize: '0.72rem' }}>
                                        {m.userB.name}
                                    </Link>
                                </td>
                                <td>
                                    <span className={`${styles.badge} ${m.status === 'accepted' ? styles.badgeGreen :
                                        m.status === 'completed' ? styles.badgeBlue : styles.badgeYellow
                                        }`}>{m.status}</span>
                                </td>
                                <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
