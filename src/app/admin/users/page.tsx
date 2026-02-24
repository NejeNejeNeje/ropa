import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import styles from '../admin.module.css';

export default async function AdminUsersPage() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            blocked: true,
            trustTier: true,
            karmaPoints: true,
            currentCity: true,
            country: true,
            totalTrades: true,
            createdAt: true,
            _count: { select: { listings: true, offersMade: true } },
        },
    });

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Users</h1>
                <p className={styles.pageDesc}>{users.length} registered users</p>
            </div>

            <div className={styles.tableWrap}>
                <div className={styles.tableToolbar}>
                    <span className={styles.tableTitle}>All Users</span>
                </div>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Trust</th>
                            <th>Karma</th>
                            <th>Location</th>
                            <th>Listings</th>
                            <th>Trades</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 && (
                            <tr><td colSpan={10} className={styles.empty}>No users found.</td></tr>
                        )}
                        {users.map((u) => (
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
                                <td>{u.karmaPoints}</td>
                                <td>{u.currentCity || '—'}{u.country ? `, ${u.country}` : ''}</td>
                                <td>{u._count.listings}</td>
                                <td>{u.totalTrades}</td>
                                <td>
                                    <span className={`${styles.badge} ${u.blocked ? styles.badgeRed : styles.badgeGreen}`}>
                                        {u.blocked ? 'Blocked' : 'Active'}
                                    </span>
                                </td>
                                <td>
                                    <Link href={`/admin/users/${u.id}`} className={styles.actionBtn}>
                                        View →
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
