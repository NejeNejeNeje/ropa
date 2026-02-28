import webpush from 'web-push';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function getWebPush() {
    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT!,
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        process.env.VAPID_PRIVATE_KEY!,
    );
    return webpush;
}

export async function POST(req: Request) {
    const wp = getWebPush(); // ensure VAPID is set at runtime
    void wp; // configured for internal sendNotification use
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await req.json();

    // Store subscription on the user record
    await prisma.user.update({
        where: { id: (session.user as { id: string }).id },
        data: { pushSubscription: JSON.stringify(subscription) },
    });

    return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.user.update({
        where: { id: (session.user as { id: string }).id },
        data: { pushSubscription: null },
    });

    return NextResponse.json({ ok: true });
}
