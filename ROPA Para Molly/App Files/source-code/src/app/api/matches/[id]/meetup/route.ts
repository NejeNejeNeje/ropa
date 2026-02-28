import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

    const { id: matchId } = await params;
    const userId = (session.user as { id?: string }).id!;
    const body = await req.json();

    const { venue, address, city, lat, lng, date } = body as {
        venue: string;
        address: string;
        city: string;
        lat?: number;
        lng?: number;
        date: string;
    };

    if (!venue || !address || !city || !date) {
        return NextResponse.json({ error: 'venue, address, city and date are required' }, { status: 400 });
    }

    // Confirm user is part of this match
    const match = await prisma.match.findUnique({ where: { id: matchId }, select: { userAId: true, userBId: true } });
    if (!match || (match.userAId !== userId && match.userBId !== userId)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.match.update({
        where: { id: matchId },
        data: {
            meetupVenue: venue,
            meetupAddress: address,
            meetupCity: city,
            meetupLat: lat ?? null,
            meetupLng: lng ?? null,
            meetupDate: new Date(date),
            meetupStatus: 'proposed',
            meetupProposedBy: userId,
        },
    });

    return NextResponse.json(updated);
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

    const { id: matchId } = await params;
    const userId = (session.user as { id?: string }).id!;
    const { action } = await req.json() as { action: 'confirm' | 'cancel' };

    const match = await prisma.match.findUnique({
        where: { id: matchId },
        select: { userAId: true, userBId: true, meetupProposedBy: true, meetupStatus: true },
    });

    if (!match || (match.userAId !== userId && match.userBId !== userId)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (action === 'confirm' && match.meetupProposedBy === userId) {
        return NextResponse.json({ error: 'Only the other party can confirm' }, { status: 400 });
    }

    const updated = await prisma.match.update({
        where: { id: matchId },
        data: { meetupStatus: action === 'confirm' ? 'confirmed' : 'cancelled' },
    });

    return NextResponse.json(updated);
}
