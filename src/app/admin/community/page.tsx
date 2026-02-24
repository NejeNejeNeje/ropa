import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import styles from '../admin.module.css';
import DeletePostButton from './DeletePostButton';

export default async function AdminCommunityPage() {
    const posts = await prisma.travelPost.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { id: true, name: true, email: true } },
        },
    });

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Community Posts</h1>
                <p className={styles.pageDesc}>{posts.length} total community posts</p>
            </div>

            <div className={styles.tableWrap}>
                <div className={styles.tableToolbar}>
                    <span className={styles.tableTitle}>All Posts</span>
                </div>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>Author</th>
                            <th>Caption</th>
                            <th>City</th>
                            <th>Likes</th>
                            <th>Tags</th>
                            <th>Posted</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.length === 0 && (
                            <tr><td colSpan={7} className={styles.empty}>No posts found.</td></tr>
                        )}
                        {posts.map((p) => (
                            <tr key={p.id} className={styles.clickableRow}>
                                <td>
                                    <Link href={`/admin/users/${p.user.id}`} className={styles.actionBtn} style={{ fontSize: '0.72rem' }}>
                                        {p.user.name}
                                    </Link>
                                </td>
                                <td className={styles.tdPrimary} style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {p.caption || '(no caption)'}
                                </td>
                                <td>{p.city || '—'}</td>
                                <td>{p.likes}</td>
                                <td>
                                    {(() => {
                                        try {
                                            const tags: string[] = JSON.parse(p.tags || '[]');
                                            return tags.slice(0, 3).map((t) => (
                                                <span key={t} className={`${styles.badge} ${styles.badgePurple}`} style={{ marginRight: 4 }}>{t}</span>
                                            ));
                                        } catch { return '—'; }
                                    })()}
                                </td>
                                <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <Link href={`/admin/community/${p.id}`} className={styles.actionBtn}>View</Link>
                                        <DeletePostButton postId={p.id} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
