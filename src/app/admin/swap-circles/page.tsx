import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import styles from '../admin.module.css';

export default async function AdminSwapCirclesPage() {
    const circles = await prisma.swapCircle.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            host: { select: { id: true, name: true } },
            _count: { select: { rsvps: true } },
        },
    });

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Swap Circles</h1>
                <p className={styles.pageDesc}>{circles.length} community swap events</p>
            </div>

            <div className={styles.tableWrap}>
                <div className={styles.tableToolbar}>
                    <span className={styles.tableTitle}>All Swap Circles</span>
                </div>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Host</th>
                            <th>City</th>
                            <th>Venue</th>
                            <th>Date</th>
                            <th>RSVPs</th>
                            <th>Capacity</th>
                            <th>Full?</th>
                            <th>Past?</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {circles.length === 0 && (
                            <tr><td colSpan={10} className={styles.empty}>No swap circles found.</td></tr>
                        )}
                        {circles.map((c) => (
                            <tr key={c.id}>
                                <td className={styles.tdPrimary}>{c.title}</td>
                                <td>
                                    <Link href={`/admin/users/${c.host.id}`} className={styles.actionBtn} style={{ fontSize: '0.72rem' }}>
                                        {c.host.name}
                                    </Link>
                                </td>
                                <td>{c.city || '—'}</td>
                                <td>{c.venue || '—'}</td>
                                <td>{c.date ? new Date(c.date).toLocaleDateString() : '—'}</td>
                                <td>{c._count.rsvps}</td>
                                <td>{c.capacity}</td>
                                <td>
                                    <span className={`${styles.badge} ${c.isFull ? styles.badgeRed : styles.badgeGreen}`}>
                                        {c.isFull ? 'Full' : 'Open'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`${styles.badge} ${c.isPast ? styles.badgeGray : styles.badgeBlue}`}>
                                        {c.isPast ? 'Past' : 'Upcoming'}
                                    </span>
                                </td>
                                <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <Link href={`/admin/swap-circles/${c.id}`} className={styles.actionBtn}>View →</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
