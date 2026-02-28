import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // Server-side auth guard
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const data: { isFull?: boolean; isPast?: boolean } = {};
    if (typeof body.isFull === 'boolean') data.isFull = body.isFull;
    if (typeof body.isPast === 'boolean') data.isPast = body.isPast;
    const circle = await prisma.swapCircle.update({ where: { id }, data });
    return NextResponse.json(circle);
}
