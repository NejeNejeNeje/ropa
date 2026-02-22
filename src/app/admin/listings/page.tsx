import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import styles from '../admin.module.css';

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
                            <th>Status</th>
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
                                    <span className={`${styles.badge} ${l.status === 'active' ? styles.badgeGreen :
                                            l.status === 'removed' ? styles.badgeRed :
                                                l.status === 'swapped' ? styles.badgeBlue : styles.badgeGray
                                        }`}>{l.status}</span>
                                </td>
                                <td>{new Date(l.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <ListingStatusToggle listingId={l.id} status={l.status} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Inline client component for status toggle
function ListingStatusToggle({ listingId, status }: { listingId: string; status: string }) {
    if (status === 'active') {
        return (
            <form action={`/api/admin/listings/${listingId}/status`} method="POST">
                <input type="hidden" name="status" value="removed" />
                <button type="submit" className={`${styles.actionBtn} ${styles.actionBtnDanger}`}>
                    Remove
                </button>
            </form>
        );
    }
    if (status === 'removed') {
        return (
            <form action={`/api/admin/listings/${listingId}/status`} method="POST">
                <input type="hidden" name="status" value="active" />
                <button type="submit" className={`${styles.actionBtn} ${styles.actionBtnSuccess}`}>
                    Restore
                </button>
            </form>
        );
    }
    return <span className={styles.badgeGray} style={{ fontSize: '0.7rem', padding: '2px 6px' }}>{status}</span>;
}
