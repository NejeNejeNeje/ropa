import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import styles from '../admin.module.css';

export default async function AdminKarmaPage() {
    const entries = await prisma.karmaEntry.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { id: true, name: true, email: true } },
        },
    });

    const totalPositive = entries.filter((e) => e.points > 0).length;
    const totalNegative = entries.filter((e) => e.points < 0).length;

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Karma Ledger</h1>
                <p className={styles.pageDesc}>{entries.length} karma entries — {totalPositive} positive, {totalNegative} negative</p>
            </div>

            <div className={styles.tableWrap}>
                <div className={styles.tableToolbar}>
                    <span className={styles.tableTitle}>All Karma Events</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Points</th>
                            <th>Action</th>
                            <th>Description</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.length === 0 && (
                            <tr><td colSpan={7} className={styles.empty}>No karma entries found.</td></tr>
                        )}
                        {entries.map((e) => (
                            <tr key={e.id}>
                                <td>
                                    <Link href={`/admin/users/${e.user.id}`} className={styles.actionBtn} style={{ fontSize: '0.72rem' }}>
                                        {e.user.name}
                                    </Link>
                                </td>
                                <td>{e.user.email}</td>
                                <td>
                                    <span className={`${styles.badge} ${e.points > 0 ? styles.badgeGreen : styles.badgeRed}`}>
                                        {e.points > 0 ? '+' : ''}{e.points}
                                    </span>
                                </td>
                                <td>{e.action}</td>
                                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {e.description || '—'}
                                </td>
                                <td>{new Date(e.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <Link href={`/admin/users/${e.user.id}`} className={styles.actionBtn}>
                                        View User →
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
