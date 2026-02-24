import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import styles from '../admin.module.css';

export default async function AdminMatchesPage() {
    const matches = await prisma.match.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            userA: { select: { id: true, name: true, trustTier: true } },
            userB: { select: { id: true, name: true, trustTier: true } },
            listingA: { select: { id: true, title: true, category: true } },
            listingB: { select: { id: true, title: true, category: true } },
            _count: { select: { messages: true } },
        },
    });

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Matches</h1>
                <p className={styles.pageDesc}>{matches.length} total matches between users</p>
            </div>

            <div className={styles.tableWrap}>
                <div className={styles.tableToolbar}>
                    <span className={styles.tableTitle}>All Matches</span>
                </div>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>User A</th>
                            <th>User B</th>
                            <th>Listing A</th>
                            <th>Listing B</th>
                            <th>Price</th>
                            <th>Messages</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {matches.length === 0 && (
                            <tr><td colSpan={9} className={styles.empty}>No matches found.</td></tr>
                        )}
                        {matches.map((m) => (
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
                                <td>{m.listingA?.title || '—'}</td>
                                <td>{m.listingB?.title || '—'}</td>
                                <td>{m.agreedPrice ? `€${m.agreedPrice}` : 'Swap'}</td>
                                <td>{m._count.messages}</td>
                                <td>
                                    <span className={`${styles.badge} ${m.status === 'accepted' ? styles.badgeGreen :
                                        m.status === 'completed' ? styles.badgeBlue :
                                            m.status === 'cancelled' ? styles.badgeRed : styles.badgeYellow
                                        }`}>{m.status}</span>
                                </td>
                                <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <Link href={`/admin/matches/${m.id}`} className={styles.actionBtn}>View →</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
