import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => null);
    const formData = await req.formData().catch(() => null);
    const status = body?.status ?? formData?.get('status') ?? 'removed';

    const listing = await prisma.listing.update({
        where: { id },
        data: { status: status as string },
    });

    return NextResponse.json({ status: listing.status });
}
