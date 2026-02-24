import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/lib/auth';
import styles from './admin.module.css';
import AdminNav from './AdminNav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    // Auth guard — server-side, unfakeable
    if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
        redirect('/');
    }

    return (
        <div className={styles.shell}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <Image src="/ropa-logo.png" alt="ROPA" width={32} height={32} style={{ borderRadius: '50%' }} />
                    <div>
                        <span className={styles.sidebarTitle}>ROPA Admin</span>
                        <span className={styles.adminBadge}>ADMIN</span>
                    </div>
                </div>

                <AdminNav />

                <div className={styles.sidebarFooter}>
                    <Link href="/" className={styles.backLink}>
                        ← Back to Site
                    </Link>
                </div>
            </aside>

            {/* Main content */}
            <main className={styles.main}>{children}</main>
        </div>
    );
}
