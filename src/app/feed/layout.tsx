/**
 * Server-side layout for all user-facing routes.
 * Runs before any client JS — redirects admins to /admin.
 * This is the correct architectural layer for role-based routing:
 * - No middleware bundle size limit
 * - Uses auth() directly with full Prisma access
 * - Executes on the server — cannot be bypassed by client
 */
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

// Force dynamic rendering — never serve from cache, always check auth
export const dynamic = 'force-dynamic';

export default async function UserRoutesLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;

    // Debug log — visible in Vercel Function logs
    console.log('[feed/layout] session user:', session?.user?.email, 'role:', role);

    // Admin has no business on user-facing pages — send to admin console
    if (session?.user && role === 'admin') {
        console.log('[feed/layout] REDIRECTING admin to /admin');
        redirect('/admin');
    }

    return <>{children}</>;
}

