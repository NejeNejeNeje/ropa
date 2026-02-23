import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { status } = await req.json();

    const VALID = ['pending', 'accepted', 'declined', 'expired', 'countered'];
    if (!VALID.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const offer = await prisma.offer.update({
        where: { id },
        data: {
            status,
            acceptedAt: status === 'accepted' ? new Date() : undefined,
            declinedAt: status === 'declined' ? new Date() : undefined,
        },
    });

    return NextResponse.json(offer);
}
