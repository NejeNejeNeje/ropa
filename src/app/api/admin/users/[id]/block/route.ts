import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // Server-side auth guard
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Prevent self-blocking
    if (id === (session.user as { id?: string }).id) {
        return NextResponse.json({ error: 'Cannot block yourself' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id }, select: { blocked: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const updated = await prisma.user.update({
        where: { id },
        data: { blocked: !user.blocked },
    });

    return NextResponse.json({ blocked: updated.blocked });
}
