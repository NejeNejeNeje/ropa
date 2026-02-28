import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function ListingNewLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    if (!session?.user) redirect('/login');
    return <>{children}</>;
}
