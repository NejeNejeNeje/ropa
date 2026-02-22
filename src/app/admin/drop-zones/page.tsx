import { prisma } from '@/lib/prisma';
import styles from '../admin.module.css';

export default async function AdminDropZonesPage() {
    const zones = await prisma.dropZone.findMany({
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Drop Zones</h1>
                <p className={styles.pageDesc}>{zones.length} physical swap shelves registered</p>
            </div>

            <div className={styles.tableWrap}>
                <div className={styles.tableToolbar}>
                    <span className={styles.tableTitle}>All Drop Zones</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>City</th>
                            <th>Country</th>
                            <th>Address</th>
                            <th>Active Listings</th>
                            <th>Hours</th>
                            <th>Partner Since</th>
                        </tr>
                    </thead>
                    <tbody>
                        {zones.length === 0 && (
                            <tr><td colSpan={8} className={styles.empty}>No drop zones found.</td></tr>
                        )}
                        {zones.map((z) => (
                            <tr key={z.id}>
                                <td className={styles.tdPrimary}>{z.name}</td>
                                <td>{z.type || '—'}</td>
                                <td>{z.city || '—'}</td>
                                <td>{z.country || '—'}</td>
                                <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {z.address || '—'}
                                </td>
                                <td>
                                    <span className={`${styles.badge} ${z.activeListings > 0 ? styles.badgeGreen : styles.badgeGray}`}>
                                        {z.activeListings}
                                    </span>
                                </td>
                                <td>{z.hours || '—'}</td>
                                <td>{new Date(z.partnerSince).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
