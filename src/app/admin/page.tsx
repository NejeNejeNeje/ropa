import { prisma } from '@/lib/prisma';
import styles from './admin.module.css';

export default async function AdminOverview() {
    const userCount = await prisma.user.count();
    const listingCount = await prisma.listing.count();
    const offerCount = await prisma.offer.count();
    const matchCount = await prisma.match.count();
    const swapCircleCount = await prisma.swapCircle.count();
    const dropZoneCount = await prisma.dropZone.count();
    const karmaCount = await prisma.karmaEntry.count();

    const activeListings = await prisma.listing.count({ where: { isActive: true } });
    const acceptedOffers = await prisma.offer.count();

    const recentUsers = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: { id: true, name: true, email: true, role: true, createdAt: true, trustTier: true },
    });

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Dashboard Overview</h1>
                <p className={styles.pageDesc}>Platform health and key metrics at a glance.</p>
            </div>

            {/* Stats grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Total Users</div>
                    <div className={styles.statValue}>{userCount}</div>
                    <div className={styles.statSub}>Registered accounts</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Listings</div>
                    <div className={styles.statValue}>{listingCount}</div>
                    <div className={styles.statSub}>{activeListings} active</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Offers</div>
                    <div className={styles.statValue}>{offerCount}</div>
                    <div className={styles.statSub}>{acceptedOffers} accepted</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Matches</div>
                    <div className={styles.statValue}>{matchCount}</div>
                    <div className={styles.statSub}>Mutual swipe-rights</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Swap Circles</div>
                    <div className={styles.statValue}>{swapCircleCount}</div>
                    <div className={styles.statSub}>Community events</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Drop Zones</div>
                    <div className={styles.statValue}>{dropZoneCount}</div>
                    <div className={styles.statSub}>Physical swap shelves</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Karma Entries</div>
                    <div className={styles.statValue}>{karmaCount}</div>
                    <div className={styles.statSub}>Trust signals</div>
                </div>
            </div>

            {/* Recent users */}
            <div className={styles.tableWrap}>
                <div className={styles.tableToolbar}>
                    <span className={styles.tableTitle}>Recent Users</span>
                    <a href="/admin/users" className={styles.actionBtn}>View All →</a>
                </div>
                <table>
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
                            <tr key={u.id}>
                                <td className={styles.tdPrimary}>{u.name}</td>
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
        </div>
    );
}
