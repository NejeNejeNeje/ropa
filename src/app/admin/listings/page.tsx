import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import styles from '../admin.module.css';
import ListingToggle from './ListingToggle';

export default async function AdminListingsPage() {
    const listings = await prisma.listing.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { id: true, name: true, email: true } },
        },
    });

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Listings</h1>
                <p className={styles.pageDesc}>{listings.length} total listings across all users</p>
            </div>

            <div className={styles.tableWrap}>
                <div className={styles.tableToolbar}>
                    <span className={styles.tableTitle}>All Listings</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Owner</th>
                            <th>Category</th>
                            <th>Size</th>
                            <th>Price</th>
                            <th>Condition</th>
                            <th>City</th>
                            <th>Active</th>
                            <th>Listed</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {listings.length === 0 && (
                            <tr><td colSpan={10} className={styles.empty}>No listings found.</td></tr>
                        )}
                        {listings.map((l) => (
                            <tr key={l.id}>
                                <td className={styles.tdPrimary}>{l.title}</td>
                                <td>
                                    <Link href={`/admin/users/${l.user.id}`} className={styles.actionBtn} style={{ fontSize: '0.72rem' }}>
                                        {l.user.name}
                                    </Link>
                                </td>
                                <td>{l.category}</td>
                                <td>{l.size || '—'}</td>
                                <td>{l.price ? `€${l.price}` : 'Free'}</td>
                                <td>{l.condition || '—'}</td>
                                <td>{l.city || '—'}</td>
                                <td>
                                    <span className={`${styles.badge} ${l.isActive ? styles.badgeGreen : styles.badgeRed}`}>
                                        {l.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>{new Date(l.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <ListingToggle listingId={l.id} isActive={l.isActive} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
